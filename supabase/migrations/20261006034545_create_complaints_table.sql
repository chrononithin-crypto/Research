/*
# Create complaints table for SafeTrack

1. New Tables
- `complaints`
  - `id` (uuid, primary key)
  - `case_id` (text, unique, human-readable case identifier like ST-2026-XXXX)
  - `name` (text, nullable — submitter name, optional)
  - `contact` (text, nullable — contact details, optional)
  - `description` (text, not null — complaint description)
  - `status` (text, not null, default 'Received' — one of: Received, Under Review, Follow-Up Required, Action Taken, Closed)
  - `attachment_url` (text, nullable — URL/path to uploaded supporting document)
  - `attachment_name` (text, nullable — original filename of attachment)
  - `last_updated_at` (timestamptz, default now — used to detect stale complaints needing follow-up)
  - `created_at` (timestamptz, default now)

2. Security
- Enable RLS on `complaints`.
- Allow anon + authenticated CRUD — this is a public complaint portal with no sign-in, so all data is intentionally shared/public.
*/

CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id text UNIQUE NOT NULL,
  name text,
  contact text,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'Received',
  attachment_url text,
  attachment_name text,
  last_updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_complaints" ON complaints;
CREATE POLICY "anon_select_complaints" ON complaints FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_complaints" ON complaints;
CREATE POLICY "anon_insert_complaints" ON complaints FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_complaints" ON complaints;
CREATE POLICY "anon_update_complaints" ON complaints FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_complaints" ON complaints;
CREATE POLICY "anon_delete_complaints" ON complaints FOR DELETE
TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_complaints_case_id ON complaints(case_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_last_updated ON complaints(last_updated_at);
