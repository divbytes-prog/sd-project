import {createNeonAuth} from '@neondatabase/auth/next/server';

export const isNeonConfigured = Boolean(
  process.env.NEON_AUTH_BASE_URL &&
  !process.env.NEON_AUTH_BASE_URL.includes('YOUR_AUTH_HOST') &&
  !process.env.NEON_AUTH_BASE_URL.includes('dummy') &&
  process.env.NEON_AUTH_COOKIE_SECRET &&
  process.env.NEON_AUTH_COOKIE_SECRET.length >= 32
);

const unavailable=()=>Response.json({error:{message:'Managed authentication is not configured.'}},{status:503});
export const auth=isNeonConfigured?createNeonAuth({baseUrl:process.env.NEON_AUTH_BASE_URL,cookies:{secret:process.env.NEON_AUTH_COOKIE_SECRET,sessionDataTtl:60},logLevel:'error'}):{getSession:async()=>{throw new Error('Managed authentication is not configured.')},handler:()=>({GET:unavailable,POST:unavailable,PUT:unavailable,DELETE:unavailable,PATCH:unavailable})};
