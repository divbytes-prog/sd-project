import {isoDate} from '../model.mjs';

// These are workspace illustrations, never managed Auth accounts.
export function buildSampleData(now = new Date()) {
  const day = offset => { const d = new Date(now); d.setDate(d.getDate() + offset); return isoDate(d); };
  const stamp = offset => `${day(offset)}T09:00:00+05:30`;
  const users = [
    ['coordinator', 'Sample outreach coordinator', 'Coordinator', null],
    ['approver', 'Sample event reviewer', 'Approver', null],
    ['student-a', 'Sample student Aarav', 'Student', null],
    ['student-b', 'Sample student Siya', 'Student', null],
    ['contact', 'Sample school counsellor', 'Institution contact', 'SAMPLE-I1'],
  ].map(([key,name,role,institutionId]) => ({id:`SAMPLE-U-${key}`,name,role,institutionId,email:`${key}@example.test`,status:'Inactive',phone:'',level:'Class 12',sample:true}));
  const institutions = [
    ['SAMPLE-I1','Sample · Sunrise Senior Secondary School','School','Jaipur, Rajasthan','Active partner'],
    ['SAMPLE-I2','Sample · Green Valley Public School','School','Ajmer, Rajasthan','Active partner'],
    ['SAMPLE-I3','Sample · Northstar Science College','College','Kota, Rajasthan','In conversation'],
    ['SAMPLE-I4','Sample · Horizon Academy','School','Udaipur, Rajasthan','New lead'],
    ['SAMPLE-I5','Sample · Future Path Education Centre','Other','Jaipur, Rajasthan','New lead'],
  ].map(([id,name,type,region,status],i)=>({id,name,type,region,status,primaryContactId:`SAMPLE-C${i+1}`,sample:true}));
  const contacts = institutions.map((institution,i)=>({id:`SAMPLE-C${i+1}`,institutionId:institution.id,name:['Sample Neha Kapoor','Sample Arjun Mehta','Sample Kavya Rao','Sample Rohan Shah','Sample Ananya Jain'][i],designation:i===2?'Outreach liaison':'Career counsellor',email:`counsellor${i+1}@example.test`,phone:'',sample:true}));
  const specs = [
    ['SAMPLE-E1','Sample · Explore engineering: campus open day','Campus visit',7,'Published',60],
    ['SAMPLE-E2','Sample · Build your first robot','Workshop',12,'Published',30],
    ['SAMPLE-E3','Sample · Engineering pathways webinar','Webinar',18,'Published',100],
    ['SAMPLE-E4','Sample · Small-group design lab (full)','Workshop',10,'Published',2],
    ['SAMPLE-E5','Sample · Science on wheels proposal','School visit',22,'Pending',80],
    ['SAMPLE-E6','Sample · Innovation challenge draft','Workshop',28,'Draft',50],
    ['SAMPLE-E7','Sample · Career discovery: revise proposal','School visit',30,'Rejected',40],
    ['SAMPLE-E8','Sample · Completed engineering discovery day','Workshop',-7,'Completed',40],
  ];
  const events=specs.map(([id,title,category,offset,status,capacity])=>({
    id,title,category,status,capacity,date:day(offset),startTime:'10:00',endTime:'13:00',
    organizerId:'SAMPLE-U-coordinator',description:'Fictional sample event for exploring the outreach workflow. Meet faculty, explore engineering pathways and take part in a practical activity. Replace these illustrative details before organizing a real event.',
    mode:category==='Webinar'?'Online':'Offline',venue:category==='Webinar'?'Sample online meeting — link to be added':'Sample venue · Outreach centre, Jaipur',
    registrationStart:day(offset<0?-20:-1),registrationEnd:day(offset-1),eligibility:'All students',instructions:'Sample instructions: arrive 15 minutes early with your school ID. Contact the real event organizer before planning a visit.',
    institutionIds:[],sample:true,
    history:['Published','Completed'].includes(status)?[{id:`${id}-approval`,decision:'Approved',by:'SAMPLE-U-approver',date:stamp(offset<0?-15:-2),comments:'Illustrative approval for a fictional sample event.'}]:status==='Rejected'?[{id:`${id}-rejection`,decision:'Rejected',by:'SAMPLE-U-approver',date:stamp(-1),comments:'Sample revision: clarify the activity plan and transport arrangements.'}]:[],
  }));
  const registrations=[
    ['SAMPLE-R1','SAMPLE-E1','SAMPLE-U-student-a',-1],
    ['SAMPLE-R2','SAMPLE-E4','SAMPLE-U-student-a',-1],
    ['SAMPLE-R3','SAMPLE-E4','SAMPLE-U-student-b',-1],
    ['SAMPLE-R4','SAMPLE-E8','SAMPLE-U-student-a',-12],
    ['SAMPLE-R5','SAMPLE-E8','SAMPLE-U-contact',-12],
  ].map(([id,eventId,userId,offset])=>({id,eventId,userId,date:stamp(offset),status:'Confirmed',sample:true}));
  const participation=[
    {id:'SAMPLE-P1',eventId:'SAMPLE-E8',userId:'SAMPLE-U-student-a',institutionId:null,activity:'Sample engineering lab tour',status:'Present',date:`${day(-7)}T15:00:00+05:30`,sample:true},
    {id:'SAMPLE-P2',eventId:'SAMPLE-E8',userId:'SAMPLE-U-contact',institutionId:'SAMPLE-I1',activity:'Sample school counsellor briefing',status:'Present',date:`${day(-7)}T15:00:00+05:30`,sample:true},
  ];
  const outcomes=[{id:'SAMPLE-O1',eventId:'SAMPLE-E8',institutionsEngaged:1,leads:2,feedback:'Sample feedback: participants enjoyed the hands-on activities and asked about engineering programmes.',followUp:'Sample follow-up: share programme information and invite the school to a future visit.',date:stamp(-6),sample:true}];
  return {users,institutions,contacts,events,registrations,participation,outcomes};
}

export function mergeSampleData(data, sample) {
  const result=structuredClone(data);
  for(const [key,records] of Object.entries(sample)) {
    const ids=new Set((result[key]??[]).map(record=>record.id));
    result[key]=[...(result[key]??[]),...structuredClone(records.filter(record=>!ids.has(record.id)))];
  }
  return result;
}
