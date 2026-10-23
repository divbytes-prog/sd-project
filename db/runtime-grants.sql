-- Run as the database owner in the dedicated instituteconnect database.
-- Create ic_web separately as a LOGIN role with a generated password and NO
-- privileged role memberships. Never use a Neon superuser role at runtime.
GRANT CONNECT ON DATABASE instituteconnect TO ic_web;
GRANT USAGE ON SCHEMA instituteconnect TO ic_web;
GRANT SELECT, UPDATE ON instituteconnect.workspace TO ic_web;
GRANT SELECT, INSERT ON instituteconnect.audit TO ic_web;
GRANT SELECT, INSERT, UPDATE ON instituteconnect.event_index,
 instituteconnect.registration_index, instituteconnect.rate_limits,
 instituteconnect.requests TO ic_web;
-- Intentionally no UPDATE/DELETE grant on audit and no access to neon_auth.
