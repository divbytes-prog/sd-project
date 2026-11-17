import {buildApprovalTestEvents as buildFirstBatch} from './approval-test-fixtures.mjs';

// A separate marker adds a second batch without resetting any earlier decisions.
export const APPROVAL_TEST_SEED_ID = 'DUMMY-APPROVAL-SEED-20261117-v2';
export function buildApprovalTestEvents(organizerId,now=new Date()){
  const details=[
    ['05','Coding Basics Workshop','Workshop','Dummy computer lab - testing only','Offline'],
    ['06','Engineering Careers Webinar','Webinar','Dummy online meeting - no real meeting link','Online'],
    ['07','Science Laboratory Visit','Campus visit','Dummy science laboratory - testing only','Offline'],
    ['08','School Innovation Session','School visit','Dummy innovation classroom - testing only','Offline']
  ];
  return buildFirstBatch(organizerId,now).map((event,index)=>{
    const [number,title,category,venue,mode]=details[index];
    return {...event,id:'DUMMY-APPROVAL-20261117-'+number,title:'Dummy Test '+number+' - '+title,category,venue,mode};
  });
}
export function missingApprovalTestEvents(data,organizerId,now=new Date()){
  return buildApprovalTestEvents(organizerId,now).filter(candidate=>
    !data.events.some(e=>e.id===candidate.id||e.title===candidate.title));
}
