-- =====================================================================
-- UTP MedTech Club — Complete CMS Schema + Seed (v2)
-- =====================================================================

-- 0. Extensions
-- =====================================================================
create extension if not exists "pgcrypto" with schema extensions;

-- 1. Profiles (extends auth.users)
-- =====================================================================
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

-- 2. Projects
-- =====================================================================
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique,
  category    text not null,
  year        text not null,
  location    text not null default '',
  short_desc  text not null,
  full_desc   text not null default '',
  cover_media text not null default '',
  cover_url   text not null default '',
  alt         text not null default '',
  featured    boolean not null default false,
  status      text not null default 'draft' check (status in ('draft', 'published')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 3. Clients
-- =====================================================================
create table if not exists public.clients (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  website_url   text not null default '',
  logo_media    text not null default '',
  published     boolean not null default true,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

-- 4. Media metadata
-- =====================================================================
create table if not exists public.media (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  kind          text not null check (kind in ('image', 'video')),
  mime_type     text not null default '',
  size          bigint not null default 0,
  url           text not null unique,
  builtin       boolean not null default false,
  storage_path  text,
  created_at    timestamptz not null default now()
);

-- 5. Site settings (single-row)
-- =====================================================================
create table if not exists public.site_settings (
  id             integer primary key default 1 check (id = 1),
  title          text not null default 'UTP Medtech Club',
  tagline        text not null default '',
  contact_email  text not null default '',
  phone          text not null default '',
  address        text not null default '',
  instagram_url  text not null default '',
  linkedin_url   text not null default '',
  youtube_url    text not null default '',
  updated_at     timestamptz not null default now()
);

-- 6. Activity logs
-- =====================================================================
create table if not exists public.activity_logs (
  id         uuid primary key default gen_random_uuid(),
  type       text not null check (type in ('project', 'media', 'client', 'settings', 'auth')),
  message    text not null,
  created_at timestamptz not null default now()
);

-- 7. Security definer helper (avoids RLS recursion — created AFTER tables)
-- =====================================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- 8. Auto-update trigger
-- =====================================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.update_updated_at();

drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.update_updated_at();

-- 9. Row-level security
-- =====================================================================
alter table public.profiles      enable row level security;
alter table public.projects      enable row level security;
alter table public.clients       enable row level security;
alter table public.media         enable row level security;
alter table public.site_settings enable row level security;
alter table public.activity_logs enable row level security;

-- Profiles
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_select_admin" on public.profiles
  for select using (public.is_admin());

-- Projects
create policy "projects_select_public" on public.projects
  for select using (status = 'published');
create policy "projects_select_admin" on public.projects
  for select using (public.is_admin());
create policy "projects_insert_admin" on public.projects
  for insert with check (public.is_admin());
create policy "projects_update_admin" on public.projects
  for update using (public.is_admin());
create policy "projects_delete_admin" on public.projects
  for delete using (public.is_admin());

-- Clients
create policy "clients_select_public" on public.clients
  for select using (published = true);
create policy "clients_select_admin" on public.clients
  for select using (public.is_admin());
create policy "clients_insert_admin" on public.clients
  for insert with check (public.is_admin());
create policy "clients_update_admin" on public.clients
  for update using (public.is_admin());
create policy "clients_delete_admin" on public.clients
  for delete using (public.is_admin());

-- Media
create policy "media_select_public" on public.media
  for select using (true);
create policy "media_insert_admin" on public.media
  for insert with check (public.is_admin());
create policy "media_update_admin" on public.media
  for update using (public.is_admin());
create policy "media_delete_admin" on public.media
  for delete using (public.is_admin());

-- Site settings
create policy "site_settings_select_public" on public.site_settings
  for select using (true);
create policy "site_settings_insert_admin" on public.site_settings
  for insert with check (public.is_admin());
create policy "site_settings_update_admin" on public.site_settings
  for update using (public.is_admin());

-- Activity logs
create policy "activity_logs_select_admin" on public.activity_logs
  for select using (public.is_admin());
create policy "activity_logs_insert_admin" on public.activity_logs
  for insert with check (public.is_admin());
create policy "activity_logs_delete_admin" on public.activity_logs
  for delete using (public.is_admin());

-- 10. Storage bucket for CMS media
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cms-media',
  'cms-media',
  true,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do nothing;

-- Storage RLS
create policy "cms_media_select_public" on storage.objects
  for select using (bucket_id = 'cms-media');
create policy "cms_media_insert_admin" on storage.objects
  for insert with check (
    bucket_id = 'cms-media' and public.is_admin()
  );
create policy "cms_media_update_admin" on storage.objects
  for update using (
    bucket_id = 'cms-media' and public.is_admin()
  );
create policy "cms_media_delete_admin" on storage.objects
  for delete using (
    bucket_id = 'cms-media' and public.is_admin()
  );

-- 11. Seed data (idempotent via unique constraints)
-- =====================================================================

-- Site settings
insert into public.site_settings (id, title, tagline, contact_email, phone, address, instagram_url, linkedin_url, youtube_url)
values (
  1,
  'UTP Medtech Club',
  'We Capture. We Create. We Deliver.',
  'hello@utpmedtech.my',
  '+60 3 0000 0000',
  'Universiti Teknologi PETRONAS, 32610 Seri Iskandar, Perak',
  'https://instagram.com/utpmedtechclub',
  'https://www.linkedin.com/company/utp-medtech/',
  'https://youtube.com/@medtechutp'
)
on conflict (id) do nothing;

-- Clients (unique on name)
insert into public.clients (name, website_url, logo_media, published, display_order)
values
  ('PETRONAS',         '', '', true, 0),
  ('UTP',              '', '', true, 1),
  ('TM',               '', '', true, 2),
  ('Yayasan PETRONAS', '', '', true, 3),
  ('MIDA',             '', '', true, 4),
  ('MDEC',             '', '', true, 5)
on conflict (name) do nothing;

-- Projects (unique on slug)
insert into public.projects (title, slug, category, year, location, short_desc, full_desc, cover_media, cover_url, alt, featured, status)
values
  (
    'PETRONAS Leadership Excellence Program 2024',
    'petronas-leadership-excellence-program-2024',
    'Corporate Event', '2024', 'Kuala Lumpur',
    'A leadership development program bringing together participants from across PETRONAS for an impactful 3-day experience.',
    'A leadership development program bringing together participants from across PETRONAS for an impactful 3-day experience filled with knowledge sharing, networking and team building. MedTech provided full technical crew, multi-camera live production and post-event highlight coverage.',
    '', '/media/project-1.jpg', 'Corporate conference audience in an auditorium',
    true, 'published'
  ),
  (
    'UTP Convocation Ceremony 2024',
    'utp-convocation-ceremony-2024',
    'Convocation', '2024', 'UTP Campus',
    'Graduation ceremony coverage for UTP''s annual convocation.',
    'Full multi-camera coverage of UTP''s 2024 convocation ceremony, including live streaming to remote audiences, photography and same-day highlight reels.',
    '', '/media/project-2.jpg', 'Graduation ceremony crowd in a hall',
    true, 'published'
  ),
  (
    'Yayasan PETRONAS Excellence Awards 2024',
    'yayasan-petronas-excellence-awards-2024',
    'Awards Night', '2024', 'Kuala Lumpur',
    'Awards night gala coverage with full AV and broadcast support.',
    'Complete production support for the Yayasan PETRONAS Excellence Awards including stage lighting, broadcast switchers, audio engineering and cinematic highlight production.',
    '', '/media/project-3.jpg', 'Awards night gala audience under stage lights',
    true, 'published'
  ),
  (
    'Sukmer Representative Council Summit 2024',
    'sukmer-representative-council-summit-2024',
    'Corporate', '2024', 'UTP Campus',
    'Sukmer summit event coverage.',
    'Photography and videography coverage of the Sukmer Representative Council Summit featuring keynotes, workshops and networking sessions.',
    '', '/media/about/sukmed-24.jpg', 'Sukmed summit event activities',
    false, 'published'
  ),
  (
    'Kembara Raya Community Program 2024',
    'kembara-raya-community-program-2024',
    'Community', '2024', 'Perak',
    'Community road trip documentation and coverage.',
    'A community road trip program capturing cultural moments and community engagement across multiple stops in Perak.',
    '', '/media/about/kembara-raya-24.jpg', 'Kembara Raya community road trip',
    false, 'published'
  ),
  (
    'Sony Videography Workshop',
    'sony-videography-workshop',
    'Workshop', '2024', 'UTP Campus',
    'Hands-on Sony camera workshop session.',
    'An immersive videography workshop led with Sony camera equipment, covering composition, lighting and workflow techniques.',
    '', '/media/about/sony-workshop.jpg', 'Sony camera workshop session',
    false, 'published'
  ),
  (
    'Kaki Photo 2025',
    'kaki-photo-2025',
    'Community', '2025', 'UTP Campus',
    'Photography community meetup.',
    'A gathering of photography enthusiasts sharing techniques, gear and creative ideas during the Kaki Photo 2025 meetup.',
    '', '/media/about/kaki-photo-2025.jpg', 'Kaki Photo 2025 meetup',
    false, 'published'
  ),
  (
    'SEA Awards 2024',
    'sea-awards-2024',
    'Festival', '2024', 'Kuala Lumpur',
    'SEA Awards ceremony production.',
    'Full event production support for SEA Awards 2024 including red carpet, stage show and backstage coverage.',
    '', '/media/about/sea-awards-2024.jpg', 'SEA Awards 2024 ceremony',
    false, 'published'
  ),
  (
    'Cybergen 2025',
    'cybergen-2025',
    'Workshop', '2025', 'UTP Campus',
    'Cybergen 2025 technology event.',
    'A technology-centered workshop event featuring coding challenges, tech talks and innovative student projects.',
    '', '/media/about/cybergen-2025.jpg', 'Cybergen 2025 event',
    false, 'published'
  ),
  (
    'Brother & Sister 2.0',
    'brother-and-sister-2',
    'Live Streaming', '2024', 'UTP Campus',
    'Live-streamed programme production.',
    'A mentorship programme live-streamed to UTP students with multi-camera switching and professional audio mixing.',
    '', '/media/about/brother-sister-2.jpg', 'Brother and Sister 2.0 programme',
    false, 'published'
  )
on conflict (slug) do nothing;

-- Built-in media records (unique on url)
insert into public.media (name, kind, mime_type, size, url, builtin, storage_path)
values
  ('hero.jpg',                'image', 'image/jpeg', 0, '/media/hero.jpg',                               true, null),
  ('project-1.jpg',           'image', 'image/jpeg', 0, '/media/project-1.jpg',                          true, null),
  ('project-2.jpg',           'image', 'image/jpeg', 0, '/media/project-2.jpg',                          true, null),
  ('project-3.jpg',           'image', 'image/jpeg', 0, '/media/project-3.jpg',                          true, null),
  ('photography.jpg',         'image', 'image/jpeg', 0, '/media/photography.jpg',                        true, null),
  ('videography.jpg',         'image', 'image/jpeg', 0, '/media/videography.jpg',                        true, null),
  ('technical.jpg',           'image', 'image/jpeg', 0, '/media/technical.jpg',                          true, null),
  ('graphic-design.jpg',      'image', 'image/jpeg', 0, '/media/graphic-design.jpg',                     true, null),
  ('streaming.jpg',           'image', 'image/jpeg', 0, '/media/streaming.jpg',                          true, null),
  ('marketing.jpg',           'image', 'image/jpeg', 0, '/media/marketing.jpg',                          true, null),
  ('why-crew.jpg',            'image', 'image/jpeg', 0, '/media/why-crew.jpg',                           true, null),
  ('cta-crowd.jpg',           'image', 'image/jpeg', 0, '/media/cta-crowd.jpg',                          true, null),
  ('about-hero.jpg',          'image', 'image/jpeg', 0, '/media/about/about-hero.jpg',                   true, null),
  ('oweek-may-25.jpg',        'image', 'image/jpeg', 0, '/media/about/oweek-may-25.jpg',                 true, null),
  ('sony-workshop.jpg',       'image', 'image/jpeg', 0, '/media/about/sony-workshop.jpg',                true, null),
  ('sukmed-24.jpg',           'image', 'image/jpeg', 0, '/media/about/sukmed-24.jpg',                    true, null),
  ('kaki-photo-2025.jpg',     'image', 'image/jpeg', 0, '/media/about/kaki-photo-2025.jpg',              true, null),
  ('kembara-raya-24.jpg',     'image', 'image/jpeg', 0, '/media/about/kembara-raya-24.jpg',              true, null),
  ('sea-awards-2024.jpg',     'image', 'image/jpeg', 0, '/media/about/sea-awards-2024.jpg',              true, null),
  ('cybergen-2025.jpg',       'image', 'image/jpeg', 0, '/media/about/cybergen-2025.jpg',                true, null),
  ('brother-sister-2.jpg',    'image', 'image/jpeg', 0, '/media/about/brother-sister-2.jpg',             true, null),
  ('bootcamp-2024.jpg',       'image', 'image/jpeg', 0, '/media/about/bootcamp-2024.jpg',                true, null),
  ('cultra-2024.jpg',         'image', 'image/jpeg', 0, '/media/about/cultra-2024.jpg',                  true, null),
  ('portfolio-hero.jpg',      'image', 'image/jpeg', 0, '/media/portfolio/portfolio-hero.jpg',           true, null),
  ('contact-hero.jpg',        'image', 'image/jpeg', 0, '/media/contact/contact-hero.jpg',               true, null),
  ('norkamar-faridatul.jpg',  'image', 'image/jpeg', 0, '/media/team/norkamar-faridatul.jpg',            true, null),
  ('ahmad-ilman.jpg',         'image', 'image/jpeg', 0, '/media/team/ahmad-ilman.jpg',                   true, null),
  ('ahmad-ashraf.jpg',        'image', 'image/jpeg', 0, '/media/team/ahmad-ashraf.jpg',                  true, null),
  ('aqryf-syah.jpg',          'image', 'image/jpeg', 0, '/media/team/aqryf-syah.jpg',                    true, null),
  ('nur-hidayah.jpg',         'image', 'image/jpeg', 0, '/media/team/nur-hidayah.jpg',                   true, null),
  ('zafira-agnia.jpg',        'image', 'image/jpeg', 0, '/media/team/zafira-agnia.jpg',                  true, null),
  ('muzzammil-ikhwan.jpg',    'image', 'image/jpeg', 0, '/media/team/muzzammil-ikhwan.jpg',              true, null),
  ('zal-hasmi.jpg',           'image', 'image/jpeg', 0, '/media/team/zal-hasmi.jpg',                     true, null)
on conflict (url) do nothing;
