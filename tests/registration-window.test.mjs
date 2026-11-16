import test from 'node:test';
import assert from 'node:assert/strict';
import {Workspace,seed} from '../model.mjs';
import {executeAction} from '../lib/workspace-service.mjs';
import {registrationWindowState,registrationPeriodError} from '../lib/registration-window.mjs';
const date='2026-11-24T12:00:00+05:30';
const values={title:'Timed outreach',description:'Boundary test',category:'Workshop',date:'2026-11-30',startTime:'10:00',endTime:'12:00',mode:'Offline',venue:'LNMIIT',capacity:120,registrationStart:'2026-11-20',registrationEnd:'2026-11-27',registrationStartTime:'09:00',registrationEndTime:'17:00',eligibility:'All students',instructions:'Bring ID',institutionIds:[],contactIds:[]};
function fixture(now=date){
  const data=seed(new Date(now));
  data.events.push({...values,id:'TIMED',status:'Published',organizerId:'U1',history:[]});
  return {data,ws:new Workspace(data,()=>new Date(now))};
}
test('live saveEvent action accepts and persists registration clock fields',()=>{
  const data=seed(new Date(date));
  const e=executeAction(data,'U1','saveEvent',{values,submit:true},()=>new Date(date));
  assert.equal(e.registrationStartTime,'09:00');
  assert.equal(e.registrationEndTime,'17:00');
  assert.equal(e.status,'Pending');
});
test('TC-014 live registration path rejects one minute before opening',()=>{
  const {data,ws}=fixture('2026-11-20T08:59:00+05:30');
  assert.equal(ws.registrationState('TIMED'),'Opens soon');
  assert.throws(()=>executeAction(data,'U3','register',{id:'TIMED'},ws.clock),/closed/);
  assert.equal(data.registrations.filter(r=>r.eventId==='TIMED').length,0);
});
test('TC-015 live registration path rejects one minute after closure',()=>{
  const {data,ws}=fixture('2026-11-27T17:01:00+05:30');
  assert.equal(ws.registrationState('TIMED'),'Registration closed');
  assert.throws(()=>executeAction(data,'U3','register',{id:'TIMED'},ws.clock),/closed/);
  assert.equal(data.registrations.filter(r=>r.eventId==='TIMED').length,0);
});
test('live registration during the configured window preserves participation-review workflow',()=>{
  const {data,ws}=fixture();
  assert.equal(ws.registrationState('TIMED'),'Registration open');
  const r=executeAction(data,'U3','register',{id:'TIMED'},ws.clock);
  assert.equal(r.status,'Pending');
  assert.equal(data.registrations.filter(x=>x.eventId==='TIMED').length,1);
});
test('invalid same-day registration time ordering is rejected before draft mutation',()=>{
  const data=seed(new Date(date));new Workspace(data);const before=structuredClone(data);
  assert.throws(()=>executeAction(data,'U1','saveEvent',{values:{...values,registrationEnd:'2026-11-20',registrationEndTime:'08:59'}},()=>new Date(date)),/must not precede/);
  assert.deepEqual(data,before);
});
test('date-only legacy events retain their full closing day',()=>{
  const e={...values,registrationStartTime:'',registrationEndTime:''};
  assert.equal(registrationWindowState(e,new Date('2026-11-27T23:59:00+05:30')),'open');
  assert.equal(registrationWindowState(e,new Date('2026-11-28T00:00:00+05:30')),'closed');
});
test('API field validation rejects impossible clock input',()=>{
  const data=seed(new Date(date));
  assert.throws(()=>executeAction(data,'U1','saveEvent',{values:{...values,registrationStartTime:'25:00'}},()=>new Date(date)),/valid times/);
});
test('invalid calendar data fails closed without throwing a parser exception',()=>{
  const e={...values,registrationStart:'2026-99-99'};
  assert.match(registrationPeriodError(e),/valid registration dates/);
  assert.equal(registrationWindowState(e,new Date(date)),'closed');
});
