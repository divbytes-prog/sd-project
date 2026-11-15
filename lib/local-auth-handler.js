import {cookies} from 'next/headers';

export const localSessions = new Map();

const demoUsers = [
  { id: 'U1', name: 'Divyansh Singh', email: 'coordinator@demo.instituteconnect.test', role: 'Coordinator' },
  { id: 'U2', name: 'Dr. Meera Sharma', email: 'approver@demo.instituteconnect.test', role: 'Approver' },
  { id: 'U3', name: 'Aarav Mehta', email: 'student@demo.instituteconnect.test', role: 'Student' },
  { id: 'U4', name: 'Riya Verma', email: 'institution@demo.instituteconnect.test', role: 'Institution contact', institutionId: 'I1' },
  { id: 'U5', name: 'Ansh Mathur', email: 'admin@demo.instituteconnect.test', role: 'Administrator' },
  { id: 'U6', name: 'Prof. Arjun Rao', email: 'management@demo.instituteconnect.test', role: 'Management' }
];

export async function getLocalSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ic_local_session')?.value;
    if (!token || !localSessions.has(token)) {
      return { data: null };
    }
    const user = localSessions.get(token);
    return {
      data: {
        user,
        session: { id: token, userId: user.id }
      }
    };
  } catch {
    return { data: null };
  }
}

export async function handleLocalAuth(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const cookieStore = await cookies();

  // GET /api/auth/get-session or /session
  if ((path.endsWith('/get-session') || path.endsWith('/session')) && request.method === 'GET') {
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
      const portal = request.headers.get('x-institute-portal');
      const matched = demoUsers.find(u => u.email.toLowerCase() === email || u.role.toLowerCase() === email.split('@')[0]);
      const defaultRole = portal === 'Coordinator' ? 'Coordinator' : portal === 'Approver' ? 'Approver' : email.includes('admin') ? 'Administrator' : 'Student';
      const name = matched?.name || (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1));
      const token = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      const user = {
        id: matched?.id || ('U-' + Buffer.from(email).toString('hex').slice(0, 10)),
        name,
        email: matched?.email || email,
        role: matched?.role || defaultRole,
        institutionId: matched?.institutionId || null,
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
      const portal = request.headers.get('x-institute-portal');
      const defaultRole = portal === 'Coordinator' ? 'Coordinator' : portal === 'Approver' ? 'Approver' : email.includes('admin') ? 'Administrator' : 'Student';
      const token = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      const user = {
        id: 'U-' + Buffer.from(email).toString('hex').slice(0, 10),
        name,
        email,
        role: defaultRole,
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
