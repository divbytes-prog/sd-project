import {createHash} from 'node:crypto';
import {transaction} from './database.js';
import {Workspace} from '../model.mjs';
import {ServiceError,executeAction,projectState,authorizeAction} from './workspace-service.mjs';
const S='instituteconnect';
export async function workspaceRequest(identity,operation=null){
 if(!identity?.id)throw new ServiceError('Please sign in to continue.',401,'UNAUTHENTICATED');
 if(!identity.emailVerified)throw new ServiceError('Verify your email address to access the workspace.',403,'EMAIL_VERIFICATION_REQUIRED');
 return transaction(async db=>{
  const rateKey=identity.id+':'+(operation?'write':'read'),cap=operation?90:180;
  const r=await db.query(`INSERT INTO ${S}.rate_limits(key,window_start,hits) VALUES($1,now(),1) ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN ${S}.rate_limits.window_start<now()-interval '1 minute' THEN 1 ELSE ${S}.rate_limits.hits+1 END,window_start=CASE WHEN ${S}.rate_limits.window_start<now()-interval '1 minute' THEN now() ELSE ${S}.rate_limits.window_start END RETURNING hits`,[rateKey]);
  if(r.rows[0].hits>cap)throw new ServiceError('Please wait a minute before trying again.',429,'RATE_LIMITED');
  const row=(await db.query(`SELECT data,version FROM ${S}.workspace WHERE id=true FOR UPDATE`)).rows[0];
  if(!row)throw new ServiceError('The workspace is not initialized.',503,'NOT_READY');
  const data=row.data;new Workspace(data);let u=data.users.find(x=>x.id===identity.id),changed=false;
  if(!u){const ownerEmail=process.env.IC_OWNER_EMAIL?.toLowerCase();u={id:identity.id,name:identity.name||identity.email,email:identity.email,role:ownerEmail&&identity.email.toLowerCase()===ownerEmail?'Administrator':'Student',status:'Active',level:'Class 12',phone:'',institutionId:null};data.users.push(u);new Workspace(data).log(u,'Created verified workspace account.');changed=true}
  if(u.status!=='Active')throw new ServiceError('This account is inactive. Contact your administrator.',403,'ACCOUNT_INACTIVE');
  let result=null;
  if(operation){
   if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(operation.requestId||''))throw new ServiceError('A valid request identifier is required.');
   authorizeAction(u,operation.action,operation.args);
   const hash=createHash('sha256').update(JSON.stringify([operation.action,operation.args])).digest('hex');
   const previous=(await db.query(`SELECT payload_hash,result FROM ${S}.requests WHERE user_id=$1 AND request_id=$2`,[u.id,operation.requestId])).rows[0];
   if(previous){if(previous.payload_hash!==hash)throw new ServiceError('This request identifier was already used.',409);result=previous.result}
   else{result=executeAction(data,u.id,operation.action,operation.args||{});changed=true;await db.query(`INSERT INTO ${S}.requests(user_id,request_id,payload_hash,result) VALUES($1,$2,$3,$4::jsonb)`,[u.id,operation.requestId,hash,JSON.stringify(result??null)])}
  }
  if(changed){
   // The locked workspace row serializes read/validate/write across every instance.
   // SQL registration indexes add independent uniqueness and capacity protection.
   for(const e of data.events)await db.query(`INSERT INTO ${S}.event_index(id,capacity,status) VALUES($1,$2,$3) ON CONFLICT(id) DO UPDATE SET capacity=EXCLUDED.capacity,status=EXCLUDED.status`,[e.id,e.capacity,e.status]);
   for(const registration of data.registrations)await db.query(`INSERT INTO ${S}.registration_index(id,event_id,user_id,status,recorded_at) VALUES($1,$2,$3,$4,$5) ON CONFLICT(id) DO UPDATE SET status=EXCLUDED.status,recorded_at=EXCLUDED.recorded_at`,[registration.id,registration.eventId,registration.userId,registration.status,registration.date]);
   for(const a of data.audit)await db.query(`INSERT INTO ${S}.audit(id,actor_id,actor_name,message,recorded_at) VALUES($1,$2,$3,$4,$5)`,[a.id,u.id,a.by,a.message,a.date]);
   data.audit=[];
   await db.query(`UPDATE ${S}.workspace SET data=$1::jsonb,version=version+1,updated_at=now() WHERE id=true`,[JSON.stringify(data)]);
  }
  if(u.role==='Administrator')data.audit=(await db.query(`SELECT id,actor_name AS by,message,recorded_at AS date FROM ${S}.audit ORDER BY recorded_at DESC LIMIT 250`)).rows.map(x=>({...x,date:x.date.toISOString()}));
  return {state:projectState(data,u.id),userId:u.id,result,revision:Number(row.version)+(changed?1:0)};
 });
}
