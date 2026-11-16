import {createNeonAuth} from '@neondatabase/auth/next/server';
import {handleLocalAuth, getLocalSession} from './local-auth-handler.js';
import {hasAuthConfiguration, isLocalDemoEnabled} from './runtime-config.mjs';

export const isNeonConfigured = hasAuthConfiguration();

export const auth = isNeonConfigured
  ? createNeonAuth({
      baseUrl: process.env.NEON_AUTH_BASE_URL,
      cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET, sessionDataTtl: 60 },
      logLevel: 'error'
    })
  : isLocalDemoEnabled() ? {
      getSession: getLocalSession,
      handler: () => ({
        GET: handleLocalAuth,
        POST: handleLocalAuth,
        PUT: handleLocalAuth,
        DELETE: handleLocalAuth,
        PATCH: handleLocalAuth
      })
    } : {
      getSession: async () => ({data: null}),
      handler: () => Object.fromEntries(['GET','POST','PUT','DELETE','PATCH'].map(method => [method, async () => Response.json({error:{message:'Authentication service is not configured.'}},{status:503,headers:{'Cache-Control':'no-store'}})]))
    };
