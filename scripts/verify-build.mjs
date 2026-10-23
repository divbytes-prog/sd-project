if(process.env.IC_RUN_INTEGRATION_TESTS!=='true')process.exit(0);
const {spawn}=await import('node:child_process');
const {runIntegration}=await import('./verify-integration.mjs');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','4174'],{stdio:['ignore','pipe','pipe'],env:{...process.env,PORT:'4174'}});
let logs='';server.stdout.on('data',c=>{logs=(logs+c.toString()).slice(-16000)});server.stderr.on('data',c=>{logs=(logs+c.toString()).slice(-16000)});
try{let ready=false;for(let i=0;i<40;i++){try{const r=await fetch('http://localhost:4174/');if(r.ok){ready=true;break}}catch{}await new Promise(resolve=>setTimeout(resolve,500))}if(!ready)throw new Error('Verification server did not become ready.');await runIntegration('http://localhost:4174');console.log('INSTITUTECONNECT_INTEGRATION_VERIFIED');}catch(e){console.error('Integration verification failed:',e.message);process.exitCode=1}finally{server.kill('SIGTERM')}
