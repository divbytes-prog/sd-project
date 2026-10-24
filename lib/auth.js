import {createNeonAuth} from '@neondatabase/auth/next/server';
import {cookies} from 'next/headers';

export const isNeonConfigured = Boolean(
  process.env.NEON_AUTH_BASE_URL &&
  !process.env.NEON_AUTH_BASE_URL.includes('YOUR_AUTH_HOST') &&
  !process.env.NEON_AUTH_BASE_URL.includes('dummy') &&
  process.env.NEON_AUTH_COOKIE_SECRET &&
  process.env.NEON_AUTH_COOKIE_SECRET.length >= 32
);

export const localSessions = new Map();

const realAuth = isNeonConfigured
  ? createNeonAuth({
      baseUrl: process.env.NEON_AUTH_BASE_URL,
      cookies: {secret: process.env.NEON_AUTH_COOKIE_SECRET, sessionDataTtl: 60},
      logLevel: 'error'
    })
  : null;

export const auth = realAuth || {
  async getSession() {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('ic_local_session')?.value;
      if (!token || !localSessions.has(token)) return { data: null, error: null };
      const user = localSessions.get(token);
      return { data: { user, session: { id: token, userId: user.id } }, error: null };
    } catch {
      return { data: null, error: null };
    }
  }
};

