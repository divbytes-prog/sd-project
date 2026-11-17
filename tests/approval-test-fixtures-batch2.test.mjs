import test from 'node:test';
import assert from 'node:assert/strict';
import {buildApprovalTestEvents as first,APPROVAL_TEST_SEED_ID as firstMarker} from '../db/approval-test-fixtures.mjs';
import {buildApprovalTestEvents,missingApprovalTestEvents,APPROVAL_TEST_SEED_ID} from '../db/approval-test-fixtures-batch2.mjs';
const now=new Date('2026-11-17T10:00:00+05:30');
test('second dummy batch adds four distinct pending proposals without colliding with the first batch',()=>{
 const existing=first('U1',now),next=buildApprovalTestEvents('U1',now);
 assert.notEqual(APPROVAL_TEST_SEED_ID,firstMarker);
 assert.equal(next.length,4);assert.equal(new Set([...existing,...next].map(e=>e.id)).size,8);
 assert.ok(next.every(e=>e.status==='Pending'&&e.sample&&e.registrationEnd<e.date));
 assert.ok(next.every(e=>!existing.some(old=>old.title===e.title)));
});
test('second dummy batch preserves old decisions and is idempotent after its own review',()=>{
 const old=first('U1',now);old[0].status='Approved';old[1].status='Rejected';
 const data={events:old};const before=structuredClone(data);
 const added=missingApprovalTestEvents(data,'U1',now);
 assert.equal(added.length,4);assert.deepEqual(data,before);
 data.events.push(...added);added[0].status='Approved';
 assert.equal(missingApprovalTestEvents(data,'U1',now).length,0);
 assert.equal(old[0].status,'Approved');assert.equal(old[1].status,'Rejected');
});
