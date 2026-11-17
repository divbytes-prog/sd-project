// Explicitly authorized one-time dummy seed. Uses only the existing restricted
// runtime connection; never prints credentials, users or other workspace data.
// A permanent audit marker prevents recreation after approval/rejection/deletion.
import {pool,transaction} from '../lib/database.js';
import {APPROVAL_TEST_SEED_ID,buildApprovalTestEvents,missingApprovalTestEvents} from '../db/approval-test-fixtures.mjs';

if(process.env.VERCEL_ENV!=='production'){
  console.log('Dummy approval seed skipped outside production.');
}else{
  try{
    const result=await transaction(async db=>{
      const row=(await db.query('SELECT data FROM instituteconnect.workspace WHERE id=true FOR UPDATE')).rows[0];
      if(!row)throw new Error('The workspace must already be initialized.');
      const data=row.data;
      if(!Array.isArray(data.events)||!Array.isArray(data.users))throw new Error('Invalid workspace data.');
      const marker=(await db.query('SELECT id FROM instituteconnect.audit WHERE id=$1',[APPROVAL_TEST_SEED_ID])).rows[0];
      const organizer=data.users.find(u=>u.status==='Active'&&u.role==='Coordinator'&&!u.sample)||
        data.users.find(u=>u.status==='Active'&&u.role==='Administrator'&&!u.sample);
      if(!organizer)throw new Error('An existing active coordinator or administrator is required.');
      const now=new Date();
      const added=marker?[]:missingApprovalTestEvents(data,organizer.id,now);
      if(!marker){
        for(const event of added){
          data.events.unshift(event);
          await db.query('INSERT INTO instituteconnect.event_index(id,capacity,status) VALUES($1,$2,$3) ON CONFLICT(id) DO NOTHING',[event.id,event.capacity,event.status]);
        }
        if(added.length)await db.query('UPDATE instituteconnect.workspace SET data=$1::jsonb,version=version+1,updated_at=now() WHERE id=true',[JSON.stringify(data)]);
        await db.query('INSERT INTO instituteconnect.audit(id,actor_id,actor_name,message) VALUES($1,$2,$3,$4) ON CONFLICT(id) DO NOTHING',
          [APPROVAL_TEST_SEED_ID,organizer.id,'System','Added four clearly labelled dummy event proposals for user-requested approval testing. Existing records and decisions preserved.']);
      }
      const candidates=buildApprovalTestEvents(organizer.id,now);
      return {created:added.length,alreadySeeded:Boolean(marker),events:candidates.flatMap(candidate=>{
        const e=data.events.find(e=>e.id===candidate.id||e.title===candidate.title);
        return e?[{id:e.id,title:e.title,status:e.status}]:[];
      })};
    });
    console.log('APPROVAL_DUMMY_SEED '+JSON.stringify(result));
  }catch(error){
    console.error('Dummy approval seed failed; transaction rolled back.');
    process.exitCode=1;
  }finally{await pool.end()}
}
