import {createNeonAuth} from '@neondatabase/auth/next/server';
import {handleLocalAuth, getLocalSession} from './local-auth-handler.js';

export const isNeonConfigured = Boolean(
  process.env.NEON_AUTH_BASE_URL &&
  !process.env.NEON_AUTH_BASE_URL.includes('YOUR_AUTH_HOST') &&
  !process.env.NEON_AUTH_BASE_URL.includes('dummy') &&
  process.env.NEON_AUTH_COOKIE_SECRET &&
  process.env.NEON_AUTH_COOKIE_SECRET.length >= 32
);

export const auth = isNeonConfigured
  ? createNeonAuth({
      baseUrl: process.env.NEON_AUTH_BASE_URL,
      cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET, sessionDataTtl: 60 },
      logLevel: 'error'
    })
  : {
      getSession: getLocalSession,
      handler: () => ({
        GET: handleLocalAuth,
        POST: handleLocalAuth,
        PUT: handleLocalAuth,
        DELETE: handleLocalAuth,
        PATCH: handleLocalAuth
      })
    };
