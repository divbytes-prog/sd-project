import {cookies} from 'next/headers';
import {localSessions} from './auth.js';

export async function handleLocalAuth(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const cookieStore = await cookies();

  // GET /api/auth/get-session
  if (path.endsWith('/get-session') && request.method === 'GET') {
    const token = cookieStore.get('ic_local_session')?.value;
    if (!token || !localSessions.has(token)) {
      return Response.json({ data: null, error: null });
    }
    const user = localSessions.get(token);
    return Response.json({
      data: {
        user,
        session: { id: token, userId: user.id }
      },
      error: null
    });
  }

  // POST /api/auth/sign-in/email
  if (path.endsWith('/sign-in/email') && request.method === 'POST') {
    try {
      const body = await request.json();
      const email = String(body.email || '').trim().toLowerCase();
      const name = email.split('@')[0];
      const token = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      const user = {
        id: 'U-' + Buffer.from(email).toString('hex').slice(0, 10),
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email,
        emailVerified: true
      };
      localSessions.set(token, user);

      const headers = new Headers();
      headers.append('Set-Cookie', `ic_local_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
      return Response.json({
        data: {
          user,
          session: { id: token, userId: user.id }
        },
        error: null
      }, { headers });
    } catch {
      return Response.json({ error: { message: 'Invalid sign-in request.' } }, { status: 400 });
    }
  }

  // POST /api/auth/sign-up/email
  if (path.endsWith('/sign-up/email') && request.method === 'POST') {
    try {
      const body = await request.json();
      const email = String(body.email || '').trim().toLowerCase();
      const name = String(body.name || email.split('@')[0]).trim();
      const token = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      const user = {
        id: 'U-' + Buffer.from(email).toString('hex').slice(0, 10),
        name,
        email,
        emailVerified: true
      };
      localSessions.set(token, user);

      const headers = new Headers();
      headers.append('Set-Cookie', `ic_local_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
      return Response.json({
        data: {
          user,
          session: { id: token, userId: user.id }
        },
        error: null
      }, { headers });
    } catch {
      return Response.json({ error: { message: 'Invalid sign-up request.' } }, { status: 400 });
    }
  }

  // POST /api/auth/sign-out
  if (path.endsWith('/sign-out') && request.method === 'POST') {
    const token = cookieStore.get('ic_local_session')?.value;
    if (token) localSessions.delete(token);
    const headers = new Headers();
    headers.append('Set-Cookie', `ic_local_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
    return Response.json({ data: { success: true }, error: null }, { headers });
  }

  // POST /api/auth/email-otp/verify-email
  if (path.endsWith('/email-otp/verify-email')) {
    return Response.json({ data: { success: true }, error: null });
  }

  // POST /api/auth/email-otp/send-verification-otp
  if (path.endsWith('/email-otp/send-verification-otp')) {
    return Response.json({ data: { success: true }, error: null });
  }

  return Response.json({ data: null, error: null });
}
