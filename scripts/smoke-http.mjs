import assert from 'node:assert/strict';
const base = new URL(process.argv[2] || 'http://127.0.0.1:4173');
const unconfigured = process.argv.includes('--unconfigured');
const observations = [];
async function check(name,path,expected,options={}) {
  const response = await fetch(new URL(path,base),{redirect:'manual',signal:AbortSignal.timeout(30000),...options});
  assert.equal(response.status,expected,name);
  observations.push({name,status:response.status,expected});
  if(path==='/api/health') {
    const body=await response.json();
    assert.equal(body.status,unconfigured?'unavailable':'ok');
  }
  return response;
}
await check('page renders','/',200);
await check('configured dependency health','/api/health',unconfigured?503:200);
await check('workspace requires authentication','/api/workspace',401);
await check('cross-origin mutation denied','/api/workspace',403,{method:'POST',headers:{origin:'https://foreign.invalid','content-type':'application/json'},body:'{}'});
await check('non-JSON mutation denied','/api/workspace',415,{method:'POST',headers:{origin:base.origin,'content-type':'text/plain'},body:'{}'});
if(unconfigured){
  const response=await check('missing auth does not enable demo sign-in','/api/auth/sign-in/email',503,{method:'POST',headers:{origin:base.origin,'content-type':'application/json'},body:JSON.stringify({email:'admin@demo.instituteconnect.test',password:'invalid'})});
  assert.equal(response.headers.get('set-cookie'),null,'Unavailable auth must not mint a session.');
}
console.log(JSON.stringify({scope:unconfigured?'isolated production build without secrets':'deployed unauthenticated HTTP smoke',observations},null,2));
