import {isoDate} from '../model.mjs';

export const APPROVAL_TEST_SEED_ID = 'DUMMY-APPROVAL-SEED-20261117-v1';
export function buildApprovalTestEvents(organizerId,now=new Date()){
  if(!organizerId)throw new Error('An existing organizer is required.');
  const day=offset=>{const d=new Date(now);d.setDate(d.getDate()+offset);return isoDate(d)};
  return [
    ['01','Robotics Workshop','Workshop',13,30,'Dummy Lab A - testing only','Offline'],
    ['02','Career Guidance Webinar','Webinar',15,40,'Dummy online meeting - no real meeting link','Online'],
    ['03','Campus Visit','Campus visit',17,50,'Dummy campus reception - testing only','Offline'],
    ['04','School Outreach Session','School visit',19,60,'Dummy school auditorium - testing only','Offline']
  ].map(([n,title,category,offset,capacity,venue,mode])=>({
    id:'DUMMY-APPROVAL-20261117-'+n,
    title:'Dummy Test '+n+' - '+title,
    description:'Fictional event for practising approval and rejection in InstituteConnect. TEST DATA ONLY: no real activity, meeting or travel is scheduled.',
    category,date:day(offset),startTime:'10:00',endTime:'12:00',mode,venue,
    organizerId,status:'Pending',capacity,registrationStart:day(0),
    registrationEnd:day(10),registrationStartTime:'09:00',registrationEndTime:'17:00',
    eligibility:'All students',instructions:'TEST DATA ONLY. Approve or reject this dummy proposal to practise the workflow. Do not treat this as a real event.',
    institutionIds:[],contactIds:[],history:[],sample:true,
    createdAt:now.toISOString(),updatedAt:now.toISOString()
  }));
}
export function missingApprovalTestEvents(data,organizerId,now=new Date()){
  const candidates=buildApprovalTestEvents(organizerId,now);
  return candidates.filter(candidate=>!data.events.some(e=>e.id===candidate.id||e.title===candidate.title));
}
