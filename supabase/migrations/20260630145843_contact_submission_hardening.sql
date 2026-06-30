-- =====================================================================
-- UTP MedTech Club — Contact submission hardening (schema cleanup)
-- =====================================================================
-- - Promote idempotency_key out of form_data into a first-class indexed
--   column with a unique constraint so duplicate POSTs are blocked at the
--   DB level (the previous form_data-only approach was non-functional).
-- - Promote organisation_type and country_code out of form_data into real
--   columns so the admin repository no longer depends on loose jsonb reads
--   for important fields.
-- - Drop the vestigial promo column (never written since launch; always '' ).
-- - Add helpful indexes for the admin inbox / reporting queries.
-- - Backfill the new columns from existing form_data where possible so old
--   rows remain readable in the admin UI.
-- =====================================================================

-- 1. New columns
-- =====================================================================
alter table public.contact_submissions
  add column if not exists idempotency_key text,
  add column if not exists organisation_type text not null default 'UTP',
  add column if not exists country_code text not null default '+60';

-- 2. Backfill from existing form_data jsonb (best-effort, idempotent)
-- =====================================================================
update public.contact_submissions
  set idempotency_key = coalesce(form_data->>'idempotencyKey', idempotency_key)
  where form_data ? 'idempotencyKey';

update public.contact_submissions
  set organisation_type = coalesce(form_data->>'organisationType', organisation_type)
  where form_data ? 'organisationType';

update public.contact_submissions
  set country_code = coalesce(form_data->>'countryCode', phone_area, country_code)
  where form_data ? 'countryCode' or (phone_area is not null and phone_area <> '');

-- 3. Drop the vestigial promo column
-- =====================================================================
alter table public.contact_submissions drop column if exists promo;

-- 4. Indexes
-- =====================================================================
-- Unique constraint on idempotency_key (NULLs allowed so submissions without
-- a client key still insert; only non-null keys are enforced unique).
create unique index if not exists contact_submissions_idempotency_key_key
  on public.contact_submissions (idempotency_key)
  where idempotency_key is not null;

create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

create index if not exists contact_submissions_status_idx
  on public.contact_submissions (status);

create index if not exists contact_submissions_email_idx
  on public.contact_submissions (email);

-- 5. Strip the vestigial promo field config from contact page content
--    (the column is gone above; there is no longer any promo field to edit).
-- =====================================================================
update public.page_content
  set content = jsonb_set(content, '{fields}', (content -> 'fields') - 'promo')
  where page_key = 'contact';