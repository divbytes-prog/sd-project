import test from 'node:test';
import assert from 'node:assert/strict';
import {buildApprovalTestEvents,missingApprovalTestEvents} from '../db/approval-test-fixtures.mjs';
import {Workspace,seed} from '../model.mjs';
const now=new Date('2026-11-17T10:00:00+05:30');
test('exactly four clearly fictional approval proposals have valid dates and capacity',()=>{
 const events=buildApprovalTestEvents('U1',now);
 assert.equal(events.length,4);assert.equal(new Set(events.map(e=>e.id)).size,4);
 for(const e of events){
  assert.equal(e.status,'Pending');assert.equal(e.sample,true);assert.match(e.title,/^Dummy Test/);
  assert.match(e.description,/TEST DATA ONLY/);assert.ok(e.registrationEnd<e.date);
  assert.equal(e.organizerId,'U1');assert.deepEqual(e.history,[]);assert.ok(e.capacity>0);
 }
});
test('seeding is additive and does not alter existing events',()=>{
 const existing={id:'REAL-EVENT',title:'Existing event',status:'Published'};
 const data={events:[existing]};const before=structuredClone(data);
 const missing=missingApprovalTestEvents(data,'U1',now);
 assert.equal(missing.length,4);assert.deepEqual(data,before);
});
test('a second seed cannot duplicate or reset reviewed dummy events',()=>{
 const events=buildApprovalTestEvents('U1',now);events[0].status='Approved';events[1].status='Rejected';
 assert.equal(missingApprovalTestEvents({events},'U1',now).length,0);
 assert.equal(events[0].status,'Approved');assert.equal(events[1].status,'Rejected');
});
test('an event already submitted through the form is not duplicated by title',()=>{
 const events=buildApprovalTestEvents('U1',now);
 const existing={...events[0],id:'UI-CREATED-EVENT'};
 const remaining=missingApprovalTestEvents({events:[existing]},'U1',now);
 assert.equal(remaining.length,3);assert.ok(remaining.every(e=>e.title!==existing.title));
});
test('all dummy proposals work with the real event approval and rejection rules',()=>{
 const data=seed(now);data.events.push(...buildApprovalTestEvents('U1',now));
 const ws=new Workspace(data,()=>now);
 ws.transition('U2','DUMMY-APPROVAL-20261117-01','approve');
 assert.equal(ws.event('DUMMY-APPROVAL-20261117-01').status,'Approved');
 assert.throws(()=>ws.transition('U2','DUMMY-APPROVAL-20261117-02','reject',''),/reason/);
 ws.transition('U2','DUMMY-APPROVAL-20261117-02','reject','Dummy test rejection');
 assert.equal(ws.event('DUMMY-APPROVAL-20261117-02').status,'Rejected');
});
