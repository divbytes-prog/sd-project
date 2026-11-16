import test from 'node:test';
import assert from 'node:assert/strict';
import {authMode,isLocalDemoEnabled,hasDatabaseConfiguration} from '../lib/runtime-config.mjs';
test('production without managed auth stays unavailable even with a demo opt-in',()=>{
  assert.equal(authMode({NODE_ENV:'production',IC_ALLOW_LOCAL_DEMO:'true'}),'unavailable');
});
test('local demonstration requires an explicit development opt-in',()=>{
  assert.equal(authMode({NODE_ENV:'development'}),'unavailable');
  assert.equal(authMode({NODE_ENV:'development',IC_ALLOW_LOCAL_DEMO:'true'}),'local-demo');
});
test('a Vercel environment can never enable local demo authentication',()=>{
  assert.equal(isLocalDemoEnabled({NODE_ENV:'development',IC_ALLOW_LOCAL_DEMO:'true',VERCEL:'1'}),false);
});
test('configured managed auth takes precedence over a local demo flag',()=>{
  assert.equal(authMode({NODE_ENV:'development',IC_ALLOW_LOCAL_DEMO:'true',NEON_AUTH_BASE_URL:'https://example.test/auth',NEON_AUTH_COOKIE_SECRET:'x'.repeat(32)}),'managed');
});
test('placeholder authentication values and short secrets are rejected',()=>{
  for(const env of [
    {NEON_AUTH_BASE_URL:'https://YOUR_AUTH_HOST/auth',NEON_AUTH_COOKIE_SECRET:'x'.repeat(32)},
    {NEON_AUTH_BASE_URL:'https://example.test/auth',NEON_AUTH_COOKIE_SECRET:'GENERATE_A_RANDOM_SECRET_OF_AT_LEAST_32_CHARACTERS'},
    {NEON_AUTH_BASE_URL:'https://example.test/auth',NEON_AUTH_COOKIE_SECRET:'short'}
  ]) assert.equal(authMode(env),'unavailable');
});
test('database placeholders never count as shared persistence',()=>{
  assert.equal(hasDatabaseConfiguration({}),false);
  assert.equal(hasDatabaseConfiguration({DATABASE_URL:'postgres://u:p@YOUR_POOLED_HOST/db'}),false);
  assert.equal(hasDatabaseConfiguration({DATABASE_URL:'postgres://u:p@example.test/db'}),true);
});
