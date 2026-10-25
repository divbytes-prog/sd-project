import {isApprovedRegistration} from './registration.mjs';
export const PORTALS=['Student','Coordinator','Approver'];
export const portalAllows=(role,portal)=>portal==='Student'?['Student','Institution contact'].includes(role):portal==='Coordinator'?['Coordinator','Administrator','Management'].includes(role):portal==='Approver'?['Approver','Administrator'].includes(role):false;
export const portalForRole=role=>['Student','Institution contact'].includes(role)?'Student':role==='Approver'?'Approver':'Coordinator';
export function coordinatorSummary(data,now=new Date()){
 const today=new Date(now).toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'});
 return {total:data.events.length,drafts:data.events.filter(e=>e.status==='Draft').length,pending:data.events.filter(e=>['Pending','Under Review'].includes(e.status)).length,upcoming:data.events.filter(e=>e.status==='Published'&&e.date>=today).length,registrations:data.registrations.filter(r=>isApprovedRegistration(r)).length,participation:data.participation.length};
}
