export const PORTALS=['Student','Coordinator'];
export const portalAllows=(role,portal)=>portal==='Student'?['Student','Institution contact'].includes(role):portal==='Coordinator'?['Coordinator','Administrator','Approver','Management'].includes(role):false;
export const portalForRole=role=>['Student','Institution contact'].includes(role)?'Student':'Coordinator';
export function coordinatorSummary(data,now=new Date()){
 const today=new Date(now).toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'});
 return {total:data.events.length,drafts:data.events.filter(e=>e.status==='Draft').length,pending:data.events.filter(e=>['Pending','Under Review'].includes(e.status)).length,upcoming:data.events.filter(e=>e.status==='Published'&&e.date>=today).length,registrations:data.registrations.filter(r=>r.status==='Confirmed').length,participation:data.participation.length};
}
