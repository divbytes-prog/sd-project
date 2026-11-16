// Demo authentication and process-local storage must never be a hosted fallback.
const configured = value => typeof value === 'string' && value.trim() !== '' &&
  !/YOUR_|dummy|GENERATE_A_RANDOM/i.test(value);
export const isLocalDemoEnabled = (env = process.env) =>
  env.NODE_ENV === 'development' && env.IC_ALLOW_LOCAL_DEMO === 'true' && !env.VERCEL;
export const hasDatabaseConfiguration = (env = process.env) => configured(env.DATABASE_URL);
export const hasAuthConfiguration = (env = process.env) =>
  configured(env.NEON_AUTH_BASE_URL) && configured(env.NEON_AUTH_COOKIE_SECRET) &&
  env.NEON_AUTH_COOKIE_SECRET.length >= 32;
export function authMode(env = process.env) {
  return hasAuthConfiguration(env) ? 'managed' : isLocalDemoEnabled(env) ? 'local-demo' : 'unavailable';
}
