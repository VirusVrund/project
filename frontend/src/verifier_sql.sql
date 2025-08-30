-- Add columns for verification flow to incidents table
alter table public.incidents
add column if not exists verifier_id uuid references auth.users(id),
add column if not exists verified_at timestamp with time zone,
add column if not exists verifier_notes text;
