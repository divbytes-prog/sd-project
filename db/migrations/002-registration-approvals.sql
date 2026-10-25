-- Additive migration. Confirmed rows are legacy-approved places and are retained.
-- Run all statements in one transaction on the intended InstituteConnect branch.
ALTER TABLE instituteconnect.registration_index
 ADD COLUMN IF NOT EXISTS reviewed_by text,
 ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
 ADD COLUMN IF NOT EXISTS rejection_reason text;
CREATE UNIQUE INDEX IF NOT EXISTS one_active_registration_request
 ON instituteconnect.registration_index(event_id,user_id)
 WHERE status IN ('Pending','Approved','Confirmed');
CREATE INDEX IF NOT EXISTS registration_review_queue
 ON instituteconnect.registration_index(status,recorded_at DESC);
CREATE OR REPLACE FUNCTION instituteconnect.check_registration_capacity() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE allowed integer; occupied integer;
BEGIN
 IF NEW.status IN ('Approved','Confirmed') THEN
  SELECT capacity INTO allowed FROM instituteconnect.event_index WHERE id=NEW.event_id FOR UPDATE;
  SELECT count(*) INTO occupied FROM instituteconnect.registration_index
   WHERE event_id=NEW.event_id AND status IN ('Approved','Confirmed') AND id<>NEW.id;
  IF occupied>=allowed THEN RAISE EXCEPTION 'Event capacity reached' USING ERRCODE='23514'; END IF;
 END IF;
 RETURN NEW;
END $$;
INSERT INTO instituteconnect.audit(id,actor_id,actor_name,message)
 VALUES('MIGRATION-registration-approval-v2','system','System','Enabled pending registration requests and approver decisions. Legacy confirmed registrations remain approved places.')
 ON CONFLICT(id) DO NOTHING;
