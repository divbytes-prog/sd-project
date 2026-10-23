import {isoDate} from '../model.mjs';

// Additional fictional records for an academic presentation; no Auth identities.
export function buildProfessorSamples(now=new Date()) {
 const day=n=>{const d=new Date(now);d.setDate(d.getDate()+n);return isoDate(d)};
 const stamp=(n,time='15:00')=>`${day(n)}T${time}:00+05:30`;
 const institutions=[
  ['SAMPLE-I6','Sample · Riverdale Science School','School','Jodhpur, Rajasthan','Active partner'],
  ['SAMPLE-I7','Sample · Aravali Junior College','College','Alwar, Rajasthan','In conversation'],
  ['SAMPLE-I8','Sample · Lotus Valley School','School','Bikaner, Rajasthan','Active partner'],
  ['SAMPLE-I9','Sample · Discovery Learning Centre','Other','Sikar, Rajasthan','New lead'],
  ['SAMPLE-I10','Sample · Blue Ridge Academy','School','Bharatpur, Rajasthan','Inactive'],
  ['SAMPLE-I11','Sample · Pioneer Science College','College','Tonk, Rajasthan','Active partner'],
  ['SAMPLE-I12','Sample · Bright Futures School','School','Bundi, Rajasthan','In conversation'],
 ].map(([id,name,type,region,status],i)=>({id,name,type,region,status,primaryContactId:`SAMPLE-C${i+6}`,sample:true}));
 const contacts=institutions.map((i,n)=>({id:`SAMPLE-C${n+6}`,institutionId:i.id,name:`Sample ${['Nisha Sharma','Kabir Sethi','Meera Joshi','Dev Patel','Tara Sinha','Ishaan Verma','Pooja Nair'][n]}`,designation:n%2?'Principal':'Science department head',email:`contact${n+6}@example.test`,phone:'',sample:true}));
 for(let n=13;n<=16;n++)contacts.push({id:`SAMPLE-C${n}`,institutionId:`SAMPLE-I${n-12}`,name:`Sample ${['Ritika Sen','Aman Gupta','Sara Bhatia','Vihaan Rao'][n-13]}`,designation:'Assistant career counsellor',email:`contact${n}@example.test`,phone:'',sample:true});
 const names=['Aditi Sharma','Kabir Jain','Mehak Sethi','Rohan Gupta','Isha Verma','Dhruv Rao','Tara Joshi','Arnav Singh','Sana Kapoor','Vivaan Shah','Anika Patel','Reyansh Mehta','Zoya Khan','Atharv Nair','Myra Sinha','Dev Bhatia','Navya Sen','Ishaan Das'];
 const users=names.map((name,n)=>({id:`SAMPLE-U-presenter-${n+1}`,name:`Sample ${name}`,email:`participant${n+1}@example.test`,role:'Student',status:'Inactive',institutionId:`SAMPLE-I${n%12+1}`,level:['Class 10','Class 11','Class 12','Undergraduate'][n%4],phone:'',sample:true}));
 const specs=[
  [9,'Robotics foundations: school workshop','Workshop',-80,'Completed',40,['SAMPLE-I1','SAMPLE-I6']],
  [10,'Discover the campus and engineering labs','Campus visit',-60,'Completed',50,['SAMPLE-I2','SAMPLE-I8']],
  [11,'Science outreach roadshow','School visit',-40,'Completed',60,['SAMPLE-I3','SAMPLE-I11']],
  [12,'Engineering admissions and careers webinar','Webinar',-21,'Completed',100,['SAMPLE-I4','SAMPLE-I12']],
  [13,'Design thinking and innovation studio','Workshop',-14,'Completed',30,['SAMPLE-I5','SAMPLE-I7']],
  [14,'Approved: school counsellor campus visit','Campus visit',25,'Approved',35,['SAMPLE-I6']],
  [15,'Approved: coding for sustainable cities','Workshop',32,'Approved',45,['SAMPLE-I8','SAMPLE-I11']],
  [16,'Review proposal: regional school outreach','School visit',37,'Pending',75,['SAMPLE-I7','SAMPLE-I9']],
  [17,'Draft: student innovation showcase','Recruitment drive',42,'Draft',90,[]],
  [18,'Cancelled: outdoor science exploration','School visit',5,'Cancelled',25,['SAMPLE-I10']],
  [19,'Upcoming registration: university pathways','Webinar',35,'Published',120,[]],
  [20,'Practical AI lab: limited seats','Workshop',3,'Published',12,[]],
 ];
 const events=specs.map(([n,title,category,offset,status,capacity,institutionIds])=>({
  id:`SAMPLE-E${n}`,title:`Sample · ${title}`,category,date:day(offset),status,capacity,institutionIds,
  organizerId:'SAMPLE-U-coordinator',description:`Fictional sample ${category.toLowerCase()} for the professor walkthrough. Participants explore engineering concepts, meet faculty and complete a guided activity. These records illustrate the project workflow and do not represent a real scheduled event.`,
  startTime:'10:00',endTime:'13:00',mode:category==='Webinar'?'Online':n===15?'Hybrid':'Offline',venue:category==='Webinar'?'Sample online session — meeting link pending':n===11?'Sample · Northstar Science College auditorium':'Sample · Engineering outreach laboratory, Jaipur',
  registrationStart:day(n===19?25:offset<0?offset-20:-5),registrationEnd:day(offset-1),eligibility:'All students',instructions:'Sample: bring a notebook, arrive 15 minutes early and follow the coordinator’s activity briefing. Confirm real arrangements before travelling.',sample:true,
  history:['Completed','Approved','Published','Cancelled'].includes(status)?[{id:`SAMPLE-E${n}-approval`,decision:'Approved',by:'SAMPLE-U-approver',date:stamp(offset<0?offset-22:-8,'09:00'),comments:'Sample review: activity plan, venue and participant capacity checked.'}]:[],
 }));
 const registrations=[],participation=[],outcomes=[];
 let r=6,p=3;
 for(let eventNumber=9;eventNumber<=13;eventNumber++){
  const spec=specs.find(s=>s[0]===eventNumber),offset=spec[3];
  for(let n=0;n<10;n++){
   const participant=users[(n+(eventNumber-9)*2)%users.length];
   registrations.push({id:`SAMPLE-R${r++}`,eventId:`SAMPLE-E${eventNumber}`,userId:participant.id,status:'Confirmed',date:stamp(offset-5,'09:00'),sample:true});
   participation.push({id:`SAMPLE-P${p++}`,eventId:`SAMPLE-E${eventNumber}`,userId:participant.id,institutionId:participant.institutionId,activity:`Sample ${['robotics build session','campus lab tour','science activity','career Q&A','design challenge'][eventNumber-9]}`,status:n===9?'Absent':n===8?'Excused':'Present',date:stamp(offset),sample:true});
  }
  outcomes.push({id:`SAMPLE-O${eventNumber-7}`,eventId:`SAMPLE-E${eventNumber}`,institutionsEngaged:8,leads:[6,8,5,7,9][eventNumber-9],feedback:['Sample: students enjoyed programming the robot sensors; teachers requested an advanced session.','Sample: laboratory visits increased interest in engineering; counsellors praised the student ambassadors.','Sample: hands-on science experiments worked well; allow more time for questions next time.','Sample: the online Q&A clarified programme choices; share a recording and admissions guide.','Sample: teams presented thoughtful prototypes; faculty recommended a follow-up design challenge.'][eventNumber-9],followUp:['Sample: send a robotics resource pack and arrange a second workshop.','Sample: share programme brochures and schedule a counsellor call.','Sample: coordinate a school science-club activity next month.','Sample: distribute the session recording and answer remaining questions.','Sample: invite shortlisted teams to the next innovation showcase.'][eventNumber-9],date:stamp(offset+1),sample:true});
 }
 for(const [eventId,count,status] of [['SAMPLE-E20',11,'Confirmed'],['SAMPLE-E18',4,'Event cancelled'],['SAMPLE-E2',5,'Confirmed'],['SAMPLE-E3',4,'Confirmed']]){
  for(let n=0;n<count;n++)registrations.push({id:`SAMPLE-R${r++}`,eventId,userId:users[n].id,status,date:stamp(-1,'09:00'),sample:true});
 }
 return {users,institutions,contacts,events,registrations,participation,outcomes};
}
