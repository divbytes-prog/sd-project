import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSampleData,mergeSampleData} from '../db/sample-data.mjs';
import {Workspace} from '../model.mjs';
const now=new Date('2026-10-23T12:00:00Z');
test('sample records have consistent links and constrained event occupancy',()=>{
 const sample=buildSampleData(now);const data={...sample,notifications:[],audit:[]};const s=new Workspace(data,()=>now);
 for(const e of sample.events){assert.ok(sample.users.some(u=>u.id===e.organizerId));assert.ok(s.count(e.id)<=e.capacity);if(e.status==='Published')assert.equal(e.history[0].decision,'Approved')}
 for(const c of sample.contacts)assert.ok(sample.institutions.some(i=>i.id===c.institutionId));
 for(const p of sample.participation){assert.ok(sample.registrations.some(r=>r.eventId===p.eventId&&r.userId===p.userId));const e=sample.events.find(e=>e.id===p.eventId);assert.ok(new Date(p.date)>=new Date(`${e.date}T${e.endTime}:00+05:30`));}
 assert.equal(s.registrationState('SAMPLE-E1'),'Registration open');assert.equal(s.registrationState('SAMPLE-E4'),'Full');assert.equal(s.registrationState('SAMPLE-E8'),'Event ended');
});
test('sample identities are clearly labelled, inactive and contain no credentials',()=>{
 for(const u of buildSampleData(now).users){assert.equal(u.status,'Inactive');assert.equal(u.sample,true);assert.ok(u.email.endsWith('@example.test'));assert.ok(u.name.startsWith('Sample'));assert.equal(u.password,undefined);assert.notEqual(u.role,'Administrator')}
});
test('seeding twice is idempotent and preserves real and edited sample records',()=>{
 const sample=buildSampleData(now),real={id:'real-user',name:'Existing account',role:'Administrator',status:'Active'};
 const original={users:[real],events:[{...sample.events[0],title:'User edited sample title'}],settings:{defaultCapacity:75},audit:[]};
 const once=mergeSampleData(original,sample),twice=mergeSampleData(once,sample);
 assert.deepEqual(twice,once);assert.deepEqual(once.users[0],real);assert.equal(once.events[0].title,'User edited sample title');assert.equal(once.settings.defaultCapacity,75);assert.equal(original.users.length,1);
});

test('professor dataset includes approval, waiting, full, cancelled and last-seat examples',()=>{
 const data={...buildSampleData(now),notifications:[],audit:[]},s=new Workspace(data,()=>now);
 for(const status of ['Draft','Pending','Approved','Rejected','Published','Completed','Cancelled'])assert.ok(data.events.some(e=>e.status===status));
 assert.equal(s.registrationState('SAMPLE-E19'),'Opens soon');
 assert.equal(s.registrationState('SAMPLE-E18'),'Cancelled');
 assert.equal(s.event('SAMPLE-E20').capacity-s.count('SAMPLE-E20'),1);
 for(const r of data.registrations.filter(r=>r.eventId==='SAMPLE-E18'))assert.equal(r.status,'Event cancelled');
 assert.equal(new Set(data.registrations.filter(r=>r.status==='Confirmed').map(r=>r.eventId+':'+r.userId)).size,data.registrations.filter(r=>r.status==='Confirmed').length);
});
