CREATE SCHEMA IF NOT EXISTS instituteconnect AUTHORIZATION ic_owner;
CREATE TABLE IF NOT EXISTS instituteconnect.workspace (
 id boolean PRIMARY KEY DEFAULT true CHECK(id),
 version bigint NOT NULL DEFAULT 1,
 data jsonb NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS instituteconnect.audit (
 id text PRIMARY KEY,
 actor_id text NOT NULL,
 actor_name text NOT NULL,
 message text NOT NULL,
 recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS instituteconnect.event_index (
 id text PRIMARY KEY,
 capacity integer NOT NULL CHECK(capacity>0),
 status text NOT NULL
);
CREATE TABLE IF NOT EXISTS instituteconnect.registration_index (
 id text PRIMARY KEY,
 event_id text NOT NULL REFERENCES instituteconnect.event_index(id),
 user_id text NOT NULL,
 status text NOT NULL,
 recorded_at timestamptz NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS one_confirmed_registration
 ON instituteconnect.registration_index(event_id,user_id) WHERE status='Confirmed';
CREATE INDEX IF NOT EXISTS event_registration_lookup ON instituteconnect.registration_index(event_id,status);
CREATE TABLE IF NOT EXISTS instituteconnect.rate_limits (
 key text PRIMARY KEY,
 window_start timestamptz NOT NULL,
 hits integer NOT NULL
);
CREATE TABLE IF NOT EXISTS instituteconnect.requests (
 user_id text NOT NULL,
 request_id uuid NOT NULL,
 payload_hash text NOT NULL,
 result jsonb,
 recorded_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,request_id)
);
CREATE OR REPLACE FUNCTION instituteconnect.check_registration_capacity() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE allowed integer; occupied integer;
BEGIN
 IF NEW.status='Confirmed' THEN
  SELECT capacity INTO allowed FROM instituteconnect.event_index WHERE id=NEW.event_id FOR UPDATE;
  SELECT count(*) INTO occupied FROM instituteconnect.registration_index
   WHERE event_id=NEW.event_id AND status='Confirmed' AND id<>NEW.id;
  IF occupied>=allowed THEN RAISE EXCEPTION 'Event capacity reached' USING ERRCODE='23514'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE OR REPLACE TRIGGER protect_capacity BEFORE INSERT OR UPDATE ON instituteconnect.registration_index
 FOR EACH ROW EXECUTE FUNCTION instituteconnect.check_registration_capacity();
INSERT INTO instituteconnect.workspace(id,data) VALUES(true,
'{"version":2,"users":[],"events":[],"institutions":[],"contacts":[],"registrations":[],"participation":[],"outcomes":[],"notifications":[],"audit":[],"settings":{"defaultCapacity":120,"defaultMode":"Offline"}}'::jsonb)
ON CONFLICT(id) DO NOTHING;
