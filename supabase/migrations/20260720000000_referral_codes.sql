-- =====================================================================
-- UTP MedTech Club — Referral codes + submission snapshot
-- =====================================================================
-- - Create referral_codes lookup table (admin-only, RLS-protected).
-- - Add referral_owner_name snapshot column to contact_submissions so the
--   admin detail view can show who referred without a JOIN.
-- =====================================================================

-- 1. referral_codes table
-- =====================================================================
create table public.referral_codes (
  id           uuid primary key default gen_random_uuid(),
  code         text not null,                -- normalised lowercase
  display_code text not null,                -- original-case for display
  referrer_name text not null,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Fast lookup by normalised code (stored lowercase, unique on raw value)
create unique index referral_codes_code_idx
  on public.referral_codes (code);

-- RLS: admin read/write only
alter table public.referral_codes enable row level security;

create policy "Admins can manage referral codes"
  on public.referral_codes
  for all
  using (public.is_admin());

-- 2. Snapshot column on contact_submissions
-- =====================================================================
alter table public.contact_submissions
  add column if not exists referral_owner_name text not null default '';
