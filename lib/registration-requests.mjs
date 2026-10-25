import {Workspace,eventHasEnded} from '../model.mjs';
import {registrationStatus,isReviewableRole} from '../registration.mjs';
import {ServiceError} from './errors.mjs';
const deny=()=>{throw new ServiceError('Only an authorized approver can review participation requests.',403,'FORBIDDEN')};
function requireReviewer(data,userId){const s=new Workspace(data),user=s.user(userId);if(!isReviewableRole(user.role))deny();return {s,user}}
export function reviewRegistrationRequest(data,userId,args,clock=()=>new Date()){
 const {user}=requireReviewer(data,userId),s=new Workspace(data,clock);
 if(typeof args.id!=='string'||!args.id||args.id.length>200)throw new ServiceError('Choose a valid registration request.');
 if(!['accept','reject'].includes(args.decision))throw new ServiceError('Choose Accept or Reject.');
 if(args.reason!==undefined&&(typeof args.reason!=='string'||args.reason.length>2000))throw new ServiceError('A rejection reason must be text of at most 2000 characters.');
 const r=data.registrations.find(r=>r.id===args.id);if(!r)throw new ServiceError('Registration request not found.',404,'NOT_FOUND');
 if(registrationStatus(r)!=='Pending')throw new ServiceError('This request is no longer pending. Refresh to see the current decision.',409,'STALE_REQUEST');
 const e=s.event(r.eventId);if(args.decision==='accept'&&(e.status!=='Published'||eventHasEnded(e,clock())))throw new ServiceError('Only requests for published events that have not ended can be reviewed.',409,'EVENT_UNAVAILABLE');
 if(args.decision==='accept'&&s.count(e.id)>=e.capacity)throw new ServiceError('This event has reached capacity. The request remains pending.',409,'CAPACITY_REACHED');
 r.status=args.decision==='accept'?'Approved':'Rejected';r.reviewedBy=user.id;r.reviewedAt=clock().toISOString();r.rejectionReason=args.decision==='reject'?(args.reason||'').trim():'';
 s.notify(r.userId,`Registration ${r.status.toLowerCase()}: ${e.title}.${r.rejectionReason?' Reason: '+r.rejectionReason:''}`,r.status==='Approved'?'Registration approved':'Registration rejected');
 s.log(user,`${r.status} participation request ${r.id} for ${e.title}${r.rejectionReason?': '+r.rejectionReason:''}`);
 return {...r};
}
export function registrationRequestPage(data,userId,query={}){
 requireReviewer(data,userId);
 const status=query.status||'All',search=String(query.search||'').trim(),eventId=query.eventId||'All';
 const number=(v,fallback,max)=>{if(v===undefined||v===null||v==='')return fallback;if(!/^\d+$/.test(String(v))||Number(v)<1||Number(v)>max)throw new ServiceError('Invalid pagination parameters.');return Number(v)};
 const page=number(query.page,1,100000),perPage=number(query.perPage,15,50);
 if(!['All','Pending','Approved','Rejected'].includes(status)||search.length>200)throw new ServiceError('Invalid request filters.');
 if(eventId!=='All'&&!data.events.some(e=>e.id===eventId))throw new ServiceError('Event not found.',404,'NOT_FOUND');
 const requests=data.registrations.filter(r=>['Pending','Approved','Rejected'].includes(registrationStatus(r)));
 const counts={total:requests.length,pending:0,approved:0,rejected:0};for(const r of requests)counts[registrationStatus(r).toLowerCase()]++;
 const filtered=requests.filter(r=>{const student=data.users.find(u=>u.id===r.userId),e=data.events.find(e=>e.id===r.eventId);return e&&student&&(status==='All'||registrationStatus(r)===status)&&(eventId==='All'||r.eventId===eventId)&&`${student.name} ${student.email} ${student.id} ${e.title} ${r.id}`.toLowerCase().includes(search.toLowerCase())}).sort((a,b)=>String(b.date).localeCompare(String(a.date))||a.id.localeCompare(b.id));
 const totalPages=Math.max(1,Math.ceil(filtered.length/perPage)),currentPage=Math.min(page,totalPages);
 const items=filtered.slice((currentPage-1)*perPage,currentPage*perPage).map(r=>{
  const u=data.users.find(u=>u.id===r.userId),e=data.events.find(e=>e.id===r.eventId);
  return {registration:{...r,status:registrationStatus(r)},student:{id:u.id,name:u.name,email:u.email,level:u.level,institutionName:data.institutions.find(i=>i.id===u.institutionId)?.name||'Independent'},event:{id:e.id,title:e.title,date:e.date,startTime:e.startTime,endTime:e.endTime,venue:e.venue,mode:e.mode,status:e.status,capacity:e.capacity,approvedCount:new Workspace(data).count(e.id)},reviewerName:data.users.find(u=>u.id===r.reviewedBy)?.name||null};
 });
 return {items,counts,total:filtered.length,page:currentPage,perPage,totalPages};
}
