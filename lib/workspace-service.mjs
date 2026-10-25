import {PORTALS,portalAllows} from '../portal.mjs';
import {Workspace,canManage,canReport,ROLES} from '../model.mjs';
import {ServiceError} from './errors.mjs';
export {ServiceError} from './errors.mjs';
import {reviewRegistrationRequest} from './registration-requests.mjs';
import {registrationStatus} from '../registration.mjs';
export function authorizePortal(user,portal){if(portal===null||portal===undefined)return;if(!PORTALS.includes(portal))throw new ServiceError('Choose Student, Outreach Coordinator or Approver.',400,'INVALID_PORTAL');if(!portalAllows(user.role,portal))throw new ServiceError(`This account does not have access to the ${portal} portal. Ask an administrator to assign the appropriate role.`,403,'PORTAL_MISMATCH')}
const deny=()=>{throw new ServiceError('Your account cannot perform this action.',403,'FORBIDDEN')};
const fields=(value,allowed)=>{if(!value||typeof value!=='object'||Array.isArray(value))throw new ServiceError('Invalid form data.');for(const key of Object.keys(value)){if(!allowed.includes(key))throw new ServiceError('Unexpected form field.');const v=value[key];if(typeof v==='string'&&v.length>10000)throw new ServiceError('A form field is too long.');if(v!==null&&!['string','number','boolean'].includes(typeof v)&&!Array.isArray(v))throw new ServiceError('Invalid form value.')}return Object.fromEntries(allowed.filter(k=>Object.hasOwn(value,k)).map(k=>[k,value[k]]))};
const draftFields=['title','description','category','date','startTime','endTime','mode','venue','capacity','registrationStart','registrationEnd','eligibility','instructions','institutionIds','contactIds'];
export function authorizeAction(user,action,args={}){
 if(action==='reviewRegistration'&&!['Approver','Administrator'].includes(user.role))deny();
 if(action==='transition'){if(['approve','reject','startReview'].includes(args.action)){if(!['Approver','Administrator'].includes(user.role))deny()}else if(!canManage(user))deny()}
 const manage=['saveEvent','transitionManage','saveInstitution','saveContact','setPrimaryContact','updatePublishedEvent','recordParticipation','recordOutcome','reminders'];
 if(manage.includes(action)&&!canManage(user))deny();
 if(['updateUser','updateConfiguration','backup'].includes(action)&&user.role!=='Administrator')deny();
 if(['register','cancelRegistration'].includes(action)&&!['Student','Institution contact'].includes(user.role))deny();
}
export function executeAction(data,userId,action,args,clock=()=>new Date()){
 const s=new Workspace(data,clock),u=s.user(userId);authorizeAction(u,action,args);if(u.role==='Coordinator'&&['recordParticipation','recordOutcome','reminders'].includes(action)){const event=s.event(args.id||args.values?.eventId);if(event.organizerId!==u.id)deny()}let result=null;
 switch(action){
  case 'saveEvent':{const v=fields(args.values,draftFields);if(v.institutionIds!==undefined&&(!Array.isArray(v.institutionIds)||v.institutionIds.length>100||v.institutionIds.some(id=>!data.institutions.some(i=>i.id===id))))throw new ServiceError('Choose valid target institutions.');if(v.category&&!['Workshop','Campus visit','School visit','Webinar','Recruitment drive','Other'].includes(v.category))throw new ServiceError('Choose a valid category.');if(v.mode&&!['Offline','Online','Hybrid'].includes(v.mode))throw new ServiceError('Choose a valid mode.');for(const k of ['date','registrationStart','registrationEnd'])if(v[k]&&(!/^\d{4}-\d{2}-\d{2}$/.test(v[k])||!Number.isFinite(Date.parse(v[k]))||new Date(v[k]).toISOString().slice(0,10)!==v[k]))throw new ServiceError('Enter valid dates.');for(const k of ['startTime','endTime'])if(v[k]&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(v[k]))throw new ServiceError('Enter valid times.');if(args.submit!==undefined&&typeof args.submit!=='boolean')throw new ServiceError('Invalid submission choice.');const targets=v.institutionIds??(args.id?s.event(args.id).institutionIds:[]);const contacts=v.contactIds??(args.id?s.event(args.id).contactIds:[]);if(contacts!==undefined&&(!Array.isArray(contacts)||contacts.length>100||contacts.some(id=>!data.contacts.some(c=>c.id===id&&(!targets.length||targets.includes(c.institutionId))))))throw new ServiceError('Choose contacts belonging to the target institutions.');if(args.submit){const candidate=structuredClone(data),draft=new Workspace(candidate,clock);result=draft.saveEvent(u.id,v,args.id);draft.transition(u.id,result.id,'submit');Object.assign(data,candidate)}else result=s.saveEvent(u.id,v,args.id);break}
  case 'transition':if(!['submit','startReview','approve','reject','publish','cancel','complete'].includes(args.action))throw new ServiceError('Invalid event action.');result=s.transition(u.id,args.id,args.action,String(args.comments??''));break;
  case 'updatePublishedEvent':result=s.updatePublishedEvent(u.id,args.id,fields(args.values,['date','startTime','endTime','venue','instructions']));break;
  case 'reviewRegistration':result=reviewRegistrationRequest(data,u.id,args,clock);break;
  case 'register':result=s.register(u.id,args.id);break;
  case 'cancelRegistration':s.cancelRegistration(u.id,args.id);break;
  case 'saveInstitution':{const v=fields(args.values,['name','type','region','status']);if(!['School','College','Other'].includes(v.type)||!['New lead','In conversation','Active partner','Inactive'].includes(v.status))throw new ServiceError('Choose a valid institution type and relationship.');result=s.saveInstitution(u.id,v,args.id);break}
  case 'saveContact':result=s.saveContact(u.id,fields(args.values,['institutionId','name','designation','email','phone']),args.id);break;
  case 'setPrimaryContact':s.setPrimaryContact(u.id,args.institutionId,args.contactId);break;
  case 'recordParticipation':s.recordParticipation(u.id,fields(args.values,['eventId','userId','activity','status']));break;
  case 'recordOutcome':if(args.values?.followUpRequired!==undefined&&typeof args.values.followUpRequired!=='boolean')throw new ServiceError('Choose whether follow-up is required.');s.recordOutcome(u.id,fields(args.values,['eventId','institutionsEngaged','participantsReached','leads','feedback','followUp','followUpRequired','notes']));break;
  case 'updateUser':{const v=fields(args.values,['role','status','institutionId']);if(v.role==='Institution contact'&&!data.institutions.some(i=>i.id===v.institutionId))throw new ServiceError('Institution contacts must be linked to an institution.');if(v.institutionId&&!data.institutions.some(i=>i.id===v.institutionId))throw new ServiceError('Choose a valid institution.');s.updateUser(u.id,args.id,v);break}
  case 'updateProfile':result=s.updateProfile(u.id,fields(args.values,['name','phone','level']));break;
  case 'updateConfiguration':s.updateConfiguration(u.id,fields(args.values,['defaultCapacity','defaultMode']));break;
  case 'reminders':result=s.reminders(u.id,args.id);break;
  case 'readNotification':{const n=data.notifications.find(n=>n.id===args.id&&n.userId===u.id);if(!n)throw new ServiceError('Notification not found.',404);n.read=true;break}
  case 'readAllNotifications':data.notifications.filter(n=>n.userId===u.id).forEach(n=>n.read=true);break;
  default:throw new ServiceError('Unknown workspace operation.');
 }
 return result;
}
export function projectState(data,userId){
 const s=new Workspace(data),u=s.user(userId),staff=canManage(u),manager=u.role==='Management',reviewer=u.role==='Approver',reporter=canReport(u);
 const managed=e=>u.role!=='Coordinator'||e.organizerId===u.id;
 const events=s.visibleEvents(u).filter(managed).map(e=>({...e,registrationCount:s.count(e.id),history:staff||manager||reviewer?e.history:[]}));
 const eventIds=new Set(events.map(e=>e.id));
 const registrations=(staff||manager?data.registrations.filter(r=>eventIds.has(r.eventId)):data.registrations.filter(r=>r.userId===u.id)).map(r=>({...r,status:registrationStatus(r),reviewerName:data.users.find(x=>x.id===r.reviewedBy)?.name||null}));
 const neededIds=new Set([u.id,...registrations.map(r=>r.userId),...events.map(e=>e.organizerId),...events.flatMap(e=>e.history.map(h=>h.by))]);
 const users=data.users.filter(x=>(staff&&u.role!=='Coordinator')||manager||neededIds.has(x.id)).map(x=>x.id===u.id||staff?{...x}:{id:x.id,name:manager&&['Student','Institution contact'].includes(x.role)?'Participant':x.name,role:x.role,status:x.status});
 return {version:2,users,events,registrations,
 institutions:data.institutions.map(i=>staff||(u.role==='Institution contact'&&i.id===u.institutionId)?{...i}:{id:i.id,name:i.name}),
 contacts:data.contacts.filter(c=>staff||(u.role==='Institution contact'&&c.institutionId===u.institutionId)),
 participation:reporter?data.participation.filter(p=>eventIds.has(p.eventId)):s.visibleParticipation(u.id),
 outcomes:reporter?data.outcomes.filter(o=>eventIds.has(o.eventId)):[],
 notifications:data.notifications.filter(n=>n.userId===u.id),
 audit:u.role==='Administrator'?data.audit:[],settings:{...data.settings}};
}
