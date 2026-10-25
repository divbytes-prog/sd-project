import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import pg from 'pg';
const {Pool}=pg;
export async function runIntegration(base){
 if(process.env.IC_RUN_INTEGRATION_TESTS!=='true'||!process.env.MIGRATION_DATABASE_URL)throw new Error('An isolated verification database is required.');
 const db=new Pool({connectionString:process.env.MIGRATION_DATABASE_URL,max:4});
 const stamp=randomUUID().slice(0,8),checks=[];
 function passed(name){checks.push(name);console.log('PASS:',name)}
 class Account{
  constructor(){this.cookies=new Map()}
  async request(path,body){const response=await fetch(base+path,{method:body?'POST':'GET',headers:{Origin:base,...(this.portal?{'X-Institute-Portal':this.portal}:{}),...(body?{'Content-Type':'application/json'}:{}),Cookie:[...this.cookies].map(([k,v])=>k+'='+v).join('; ')},body:body?JSON.stringify(body):undefined});for(const c of response.headers.getSetCookie()){const [pair]=c.split(';'),i=pair.indexOf('=');this.cookies.set(pair.slice(0,i),pair.slice(i+1))}const data=await response.json();return {response,data}}
  async mutate(action,args,requestId=randomUUID()){return this.request('/api/workspace',{action,args,requestId})}
 }
 async function account(label){const jar=new Account(),email=`${label}-${stamp}@instituteconnect.test`,password=randomBytes(24).toString('base64url');const result=await jar.request('/api/auth/sign-up/email',{email,password,name:'Verification '+label});assert.equal(result.response.status,200,'Managed sign-up must succeed');const uid=result.data.user?.id;assert.ok(uid,'Signup must return a user');return {jar,email,password,uid}}
 try{
  const health=await fetch(base+'/api/health');assert.equal(health.status,200);passed('shared database health');
  const anon=await new Account().request('/api/workspace');assert.equal(anon.response.status,401);passed('unauthenticated API access denied');
  const owner=await account('owner'),a=await account('student-a'),b=await account('student-b'),coordinator=await account('coordinator'),approver=await account('approver'),approver2=await account('approver-two');
  const unverified=await owner.jar.request('/api/workspace');assert.equal(unverified.data.code,'EMAIL_VERIFICATION_REQUIRED');passed('unverified email denied');
  // Only the isolated test branch receives verified fixture identities; no real inbox is bypassed.
  await db.query('UPDATE neon_auth."user" SET "emailVerified"=true WHERE id::text=ANY($1::text[])',[[owner.uid,a.uid,b.uid,coordinator.uid,approver.uid,approver2.uid]]);
  let r=await owner.jar.request('/api/workspace');assert.equal(r.response.status,200);assert.equal(r.data.state.users.find(u=>u.id===owner.uid).role,'Student');
  // The production owner bootstrap is separately constrained to the configured verified email.
  // Promote this fresh .test fixture through the isolated database to exercise all administrative APIs.
  const fixture=(await db.query('SELECT data FROM instituteconnect.workspace WHERE id=true')).rows[0].data;fixture.users.find(u=>u.id===owner.uid).role='Administrator';
  await db.query('UPDATE instituteconnect.workspace SET data=$1::jsonb WHERE id=true',[JSON.stringify(fixture)]);
  assert.equal((await owner.jar.request('/api/workspace')).data.state.users.find(u=>u.id===owner.uid).role,'Administrator');passed('verified account restoration and server role lookup');
  await a.jar.request('/api/workspace');await b.jar.request('/api/workspace');
  const forged=await a.jar.mutate('updateConfiguration',{values:{defaultCapacity:999,defaultMode:'Offline'}});assert.equal(forged.response.status,403);passed('student role escalation denied');
  const date=new Date();date.setDate(date.getDate()+10);const day=date.toISOString().slice(0,10),today=new Date().toISOString().slice(0,10);
  const values={title:'Concurrency verification '+stamp,description:'Isolated test fixture',category:'Workshop',date:day,startTime:'10:00',endTime:'12:00',mode:'Offline',venue:'Verification hall',capacity:1,registrationStart:today,registrationEnd:day,eligibility:'All students',instructions:'Test fixture only',institutionIds:[]};
  const draft=await owner.jar.mutate('saveEvent',{values});assert.equal(draft.response.status,200);const eid=draft.data.result.id;
  const early=await owner.jar.mutate('transition',{id:eid,action:'publish'});assert.equal(early.response.status,400);
  for(const action of ['submit','approve','publish'])assert.equal((await owner.jar.mutate('transition',{id:eid,action})).response.status,200);
  passed('server-enforced event approval lifecycle');
  await coordinator.jar.request('/api/workspace');
  assert.equal((await owner.jar.mutate('updateUser',{id:coordinator.uid,values:{role:'Coordinator',status:'Active',institutionId:''}})).response.status,200);
  for(const reviewer of [approver,approver2]){await reviewer.jar.request('/api/workspace');assert.equal((await owner.jar.mutate('updateUser',{id:reviewer.uid,values:{role:'Approver',status:'Active',institutionId:''}})).response.status,200);reviewer.jar.portal='Approver'}
  owner.jar.portal='Coordinator';a.jar.portal='Student';b.jar.portal='Student';coordinator.jar.portal='Coordinator';
  const mismatch=new Account();mismatch.cookies=new Map(a.jar.cookies);mismatch.portal='Coordinator';assert.equal((await mismatch.request('/api/workspace')).data.code,'PORTAL_MISMATCH');passed('student portal selection cannot grant coordinator access');
  const incomplete=await coordinator.jar.mutate('saveEvent',{values:{title:'Coordinator draft '+stamp,capacity:3},submit:false});assert.equal(incomplete.response.status,200);const cid=incomplete.data.result.id;
  assert.equal((await coordinator.jar.mutate('transition',{id:cid,action:'publish'})).response.status,400);
  assert.equal((await a.jar.mutate('register',{id:cid})).response.status,400);
  const submitted=await coordinator.jar.mutate('saveEvent',{id:cid,values:{...values,title:'Coordinator workshop '+stamp,capacity:3,contactIds:[]},submit:true});assert.equal(submitted.response.status,200);assert.equal(submitted.data.result.status,'Pending');passed('coordinator saves a draft and submits a complete proposal without publishing');
  assert.equal((await coordinator.jar.mutate('transition',{id:cid,action:'approve'})).response.status,403);
  assert.equal((await coordinator.jar.mutate('transition',{id:cid,action:'startReview'})).response.status,403);
  assert.equal((await owner.jar.mutate('transition',{id:cid,action:'startReview'})).response.status,200);
  const reviewing=(await coordinator.jar.request('/api/workspace')).data.state.events.find(e=>e.id===cid);assert.equal(reviewing.status,'Under Review');
  assert.equal((await owner.jar.mutate('transition',{id:cid,action:'approve'})).response.status,200);
  assert.equal((await coordinator.jar.mutate('transition',{id:cid,action:'publish'})).response.status,200);
  const cidRegistration=await a.jar.mutate('register',{id:cid});assert.equal(cidRegistration.response.status,200);assert.equal(cidRegistration.data.result.status,'Pending');const approvalKey=randomUUID();const accepted=await approver.jar.mutate('reviewRegistration',{id:cidRegistration.data.result.id,decision:'accept'},approvalKey);assert.equal(accepted.response.status,200);assert.equal(accepted.data.result.status,'Approved');const replay=await approver.jar.mutate('reviewRegistration',{id:cidRegistration.data.result.id,decision:'accept'},approvalKey);assert.equal(replay.data.result.reviewedAt,accepted.data.result.reviewedAt);passed('authorized reviewer approves a student request after approved event publication');
  assert.equal((await a.jar.request('/api/workspace?view=registration-requests')).response.status,403);assert.equal((await coordinator.jar.request('/api/workspace?view=registration-requests')).response.status,403);assert.equal((await coordinator.jar.mutate('reviewRegistration',{id:cidRegistration.data.result.id,decision:'reject'})).response.status,403);assert.equal((await approver.jar.mutate('saveEvent',{values:{title:'Forbidden',capacity:1}})).response.status,403);passed('approver queue and decisions deny students and coordinators without granting event management');
  const queue=await approver.jar.request('/api/workspace?view=registration-requests&status=Approved&eventId='+cid+'&perPage=5');assert.equal(queue.response.status,200);assert.equal(queue.data.requests.items[0].registration.status,'Approved');assert.equal(queue.data.requests.items[0].student.email,a.email);assert.equal(queue.data.requests.items[0].student.phone,undefined);assert.ok(queue.data.requests.counts.total>=queue.data.requests.total);passed('approver queue uses real records, scoped fields and server pagination');
  const own=(await coordinator.jar.request('/api/workspace')).data.state;assert.ok(own.events.every(e=>e.organizerId===coordinator.uid));assert.ok(own.registrations.every(r=>r.eventId===cid));assert.ok(!own.events.some(e=>e.id===eid));
  assert.equal((await coordinator.jar.mutate('reminders',{id:eid})).response.status,403);passed('coordinator event and participant access is scoped on the server');

  const submissions=await Promise.all([a.jar.mutate('register',{id:eid}),b.jar.mutate('register',{id:eid})]);assert.ok(submissions.every(r=>r.response.status===200&&r.data.result.status==='Pending'));passed('student submissions are persisted pending approval without reserving places');
  const race=await Promise.all([approver.jar.mutate('reviewRegistration',{id:submissions[0].data.result.id,decision:'accept'}),approver2.jar.mutate('reviewRegistration',{id:submissions[1].data.result.id,decision:'accept'})]);assert.equal(race.filter(r=>r.response.status===200).length,1);assert.equal(race.filter(r=>r.response.status===409).length,1);passed('concurrent approvals for the last place cannot overbook');
  const winner=race[0].response.status===200?a:b,loser=winner===a?b:a,losingRequest=race[0].response.status===200?submissions[1]:submissions[0];
  const rejected=await approver.jar.mutate('reviewRegistration',{id:losingRequest.data.result.id,decision:'reject',reason:'No remaining places'});assert.equal(rejected.response.status,200);const declined=(await loser.jar.request('/api/workspace')).data.state.registrations.find(r=>r.id===losingRequest.data.result.id);assert.equal(declined.status,'Rejected');assert.equal(declined.rejectionReason,'No remaining places');assert.ok(declined.reviewedBy&&declined.reviewedAt);passed('rejection and decision metadata persist in the student view');
  const stale=(await b.jar.mutate('register',{id:cid})).data.result;const decisions=await Promise.all([approver.jar.mutate('reviewRegistration',{id:stale.id,decision:'accept'}),approver2.jar.mutate('reviewRegistration',{id:stale.id,decision:'reject'})]);assert.equal(decisions.filter(r=>r.response.status===200).length,1);assert.equal(decisions.filter(r=>r.response.status===409).length,1);passed('two reviewers cannot silently overwrite a completed decision');
  const duplicate=await winner.jar.mutate('register',{id:eid});assert.equal(duplicate.response.status,400);passed('duplicate registration denied');
  const otherDevice=new Account();const signin=await otherDevice.request('/api/auth/sign-in/email',{email:winner.email,password:winner.password});assert.equal(signin.response.status,200);const state=(await otherDevice.request('/api/workspace')).data;assert.ok(state.state.registrations.some(r=>r.eventId===eid&&r.status==='Approved'));assert.equal(state.state.contacts.length,0);assert.equal(state.state.audit.length,0);passed('independent device sees persisted registration with private records excluded');
  const registration=state.state.registrations.find(r=>r.eventId===eid);assert.equal((await loser.jar.mutate('cancelRegistration',{id:registration.id})).response.status,400);passed('another user cannot cancel the registration');
  const logi=await owner.jar.mutate('updatePublishedEvent',{id:eid,values:{venue:'Updated verification hall'}});assert.equal(logi.response.status,200);const updated=(await otherDevice.request('/api/workspace')).data;assert.ok(updated.state.notifications.some(n=>n.type==='Event update'));passed('event update notification persists across devices');
  const key=randomUUID(),command={values:{name:'Fixture '+stamp,type:'School',region:'Verification',status:'New lead'}};const first=await owner.jar.mutate('saveInstitution',command,key),second=await owner.jar.mutate('saveInstitution',command,key);assert.equal(first.data.result.id,second.data.result.id);passed('replayed requests are idempotent');
  const csrf=await fetch(base+'/api/workspace',{method:'POST',headers:{Origin:'https://untrusted.example','Content-Type':'application/json',Cookie:[...owner.jar.cookies].map(([k,v])=>k+'='+v).join('; ')},body:JSON.stringify({action:'readAllNotifications',args:{},requestId:randomUUID()})});assert.equal(csrf.status,403);passed('cross-origin mutation denied');
  const oldCookies=new Map(otherDevice.cookies);await otherDevice.request('/api/auth/sign-out',{});otherDevice.cookies=oldCookies;assert.equal((await otherDevice.request('/api/workspace')).response.status,401);passed('signed-out session cannot be replayed');
  const reader=(await owner.jar.request('/api/workspace')).data.state;assert.ok(reader.audit.length>0);passed('administrative actions have central audit records');
  const runtime=new Pool({connectionString:process.env.DATABASE_URL,max:1});try{await assert.rejects(()=>runtime.query("UPDATE instituteconnect.audit SET message='tampered'"));passed('runtime database role cannot rewrite audit records');assert.equal(Number((await runtime.query("SELECT count(*) AS n FROM instituteconnect.registration_index WHERE event_id=$1 AND status IN ('Approved','Confirmed')",[eid])).rows[0].n),1);await assert.rejects(()=>runtime.query("INSERT INTO instituteconnect.registration_index(id,event_id,user_id,status,recorded_at) VALUES($1,$2,$3,'Approved',now())",['overflow-'+stamp,eid,loser.uid]),e=>e.code==='23514');await assert.rejects(()=>runtime.query("INSERT INTO instituteconnect.registration_index(id,event_id,user_id,status,recorded_at) VALUES($1,$2,$3,'Pending',now())",['duplicate-'+stamp,eid,winner.uid]),e=>e.code==='23505');passed('database constraints independently protect approved capacity and active request uniqueness')}finally{await runtime.end()}
  console.log(JSON.stringify({integrationChecks:checks.length,status:'passed',checks}));
 }finally{await db.end()}
}
