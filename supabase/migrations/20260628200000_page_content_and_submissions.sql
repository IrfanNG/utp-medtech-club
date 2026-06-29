-- =====================================================================
-- UTP MedTech Club — Page Content + Contact Submissions
-- =====================================================================

-- 1. Page content (draft + published stages)
-- =====================================================================
create table if not exists public.page_content (
  page_key    text not null check (page_key in ('landing', 'about', 'services', 'contact')),
  stage       text not null check (stage in ('draft', 'published')),
  content     jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  updated_by  text,
  primary key (page_key, stage)
);

-- 2. Contact submissions
-- =====================================================================
create table if not exists public.contact_submissions (
  id               uuid primary key default gen_random_uuid(),
  full_name        text not null,
  email            text not null,
  phone_area       text not null default '',
  phone_number     text not null default '',
  organisation     text not null default '',
  project          text not null default '',
  budget           text not null default '',
  request_types    text[] not null default '{}',
  request_type_other text not null default '',
  exemption        text not null default '',
  event_date       text not null default '',
  inquiry          text not null default '',
  hear_about       text not null default '',
  hear_about_other text not null default '',
  referral         text not null default '',
  promo            text not null default '',
  form_data        jsonb not null default '{}'::jsonb,
  attachment_path  text,
  status           text not null default 'new' check (status in ('new', 'in_progress', 'resolved', 'spam')),
  admin_notes      text not null default '',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- 3. Update activity_logs type constraint
-- =====================================================================
drop policy if exists activity_logs_select_admin on public.activity_logs;
drop policy if exists activity_logs_insert_admin on public.activity_logs;
drop policy if exists activity_logs_delete_admin on public.activity_logs;

alter table public.activity_logs drop constraint if exists activity_logs_type_check;
alter table public.activity_logs add constraint activity_logs_type_check
  check (type in ('project', 'media', 'client', 'settings', 'auth', 'content', 'inquiry'));

-- 4. Triggers for updated_at
-- =====================================================================
drop trigger if exists page_content_updated_at on public.page_content;
create trigger page_content_updated_at
  before update on public.page_content
  for each row execute function public.update_updated_at();

drop trigger if exists contact_submissions_updated_at on public.contact_submissions;
create trigger contact_submissions_updated_at
  before update on public.contact_submissions
  for each row execute function public.update_updated_at();

-- 5. RLS
-- =====================================================================
alter table public.page_content enable row level security;
alter table public.contact_submissions enable row level security;

-- Page content: public can read published, admin can read/write both
create policy "page_content_select_public" on public.page_content
  for select using (stage = 'published');
create policy "page_content_select_admin" on public.page_content
  for select using (public.is_admin());
create policy "page_content_insert_admin" on public.page_content
  for insert with check (public.is_admin());
create policy "page_content_update_admin" on public.page_content
  for update using (public.is_admin());

-- Contact submissions: admin-only
create policy "contact_submissions_select_admin" on public.contact_submissions
  for select using (public.is_admin());
create policy "contact_submissions_update_admin" on public.contact_submissions
  for update using (public.is_admin());
create policy "contact_submissions_delete_admin" on public.contact_submissions
  for delete using (public.is_admin());

-- Re-create activity log policies
create policy "activity_logs_select_admin" on public.activity_logs
  for select using (public.is_admin());
create policy "activity_logs_insert_admin" on public.activity_logs
  for insert with check (public.is_admin());
create policy "activity_logs_delete_admin" on public.activity_logs
  for delete using (public.is_admin());

-- 6. Storage bucket for contact attachments (private, admin-only)
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'contact-attachments',
  'contact-attachments',
  false,
  3145728,
  array['application/pdf']
)
on conflict (id) do nothing;

-- Storage RLS for contact-attachments (admin-only read)
create policy "contact_attachments_select_admin" on storage.objects
  for select using (bucket_id = 'contact-attachments' and public.is_admin());
create policy "contact_attachments_insert_auth" on storage.objects
  for insert with check (bucket_id = 'contact-attachments');
create policy "contact_attachments_delete_admin" on storage.objects
  for delete using (bucket_id = 'contact-attachments' and public.is_admin());

-- 7. Seed page content (draft + published from defaults)
-- =====================================================================

-- Landing
insert into public.page_content (page_key, stage, content)
values ('landing', 'published', jsonb_build_object(
  'hero', jsonb_build_object(
    'eyebrow', 'We Capture. We Create. We Deliver.',
    'title', 'Bringing Moments to Life.',
    'description', 'UTP MedTech Crew is a multimedia production studio crafting photography, videography, live streaming and end-to-end event solutions for leading organizations across Malaysia and beyond.',
    'image', '/media/hero.jpg'
  ),
  'clientStripHeading', 'Trusted by leading organizations',
  'servicesEyebrow', 'What we do',
  'servicesHeading', 'Our Services',
  'projectsEyebrow', 'Selected work',
  'projectsHeading', 'Featured Projects',
  'stats', jsonb_build_array(
    jsonb_build_object('num', '500', 'plus', '+', 'label', 'Events Covered'),
    jsonb_build_object('num', '100', 'plus', '+', 'label', 'Clients'),
    jsonb_build_object('num', '3000', 'plus', '+', 'label', 'Projects Completed'),
    jsonb_build_object('num', '25', 'plus', '+', 'label', 'Years of Experience')
  ),
  'whyEyebrow', 'Why choose us',
  'whyHeading', 'Why Leading Organizations Trust MedTech',
  'whyDescription', 'For over two decades we have powered high-stakes productions — from leadership summits to national convocations — with a crew obsessed with craft and reliability.',
  'whyImage', '/media/why-crew.jpg',
  'features', jsonb_build_array(
    jsonb_build_object('title', 'Professional Crew', 'desc', 'Experienced directors, DPs and operators on every shoot.'),
    jsonb_build_object('title', 'Modern Equipment', 'desc', 'Cinema cameras, broadcast switchers & pro audio rig.'),
    jsonb_build_object('title', 'Creative Storytelling', 'desc', 'Concept-led narratives that resonate with audiences.'),
    jsonb_build_object('title', 'Reliable Execution', 'desc', 'On-time, on-budget delivery with backup redundancy.')
  ),
  'testimonialsEyebrow', 'Client voices',
  'testimonialsHeading', 'Trusted by Clients, Proven by Results',
  'testimonials', jsonb_build_array(
    jsonb_build_object('quote', 'MedTech delivered beyond our expectations. The footage and live stream quality elevated our entire program.', 'name', 'Aishah Rahman', 'role', 'Event Lead, PETRONAS', 'initials', 'AR'),
    jsonb_build_object('quote', 'Professional, reliable and creative. They handled a complex multi-day convocation flawlessly.', 'name', 'Hazwan Ismail', 'role', 'Director, UTP Affairs', 'initials', 'HI'),
    jsonb_build_object('quote', 'From concept to final cut, the crew brought energy and polish to every single frame.', 'name', 'Mei Ling Tan', 'role', 'Brand Manager, MDEC', 'initials', 'ML')
  ),
  'cta', jsonb_build_object('title', 'Let''s Create Something Extraordinary Together.', 'image', '/media/cta-crowd.jpg')
))
on conflict (page_key, stage) do nothing;

-- Copy published to draft
insert into public.page_content (page_key, stage, content)
select page_key, 'draft', content from public.page_content where page_key = 'landing' and stage = 'published'
on conflict (page_key, stage) do nothing;

-- About
insert into public.page_content (page_key, stage, content)
values ('about', 'published', jsonb_build_object(
  'heroEyebrow', 'ABOUT US',
  'heroTitle', 'The Core Strength
Of The Organization',
  'heroDescription', 'We are a student-driven multimedia and event production team from Universiti Teknologi PETRONAS. Driven by passion, creativity and commitment, we transform ideas into impactful visual experiences and deliver excellence in every production.',
  'heroImage', '/media/about/about-hero.jpg',
  'introEyebrow', 'About Us',
  'introTitle', 'Introduction',
  'introParagraphs', jsonb_build_array(
    'We are a passionate group of students united by our love for multimedia and event production. Through teamwork, creativity and hands-on experience, we continue to grow, learn and deliver productions that leave a lasting impact. Every project we take on is a step towards excellence and a reflection of who we are.',
    'Driven by a shared vision and supported by strong values, we strive to create meaningful experiences and memories for every client and every audience.'
  ),
  'philosophyEyebrow', 'About Us',
  'philosophyTitle', 'Our Philosophy',
  'philosophyParagraphs', jsonb_build_array(
    'We believe in teamwork, continuous improvement and giving our best in every project we handle. We don''t just capture moments — we create experiences that last and stories that connect people to what truly matters.'
  ),
  'gallery', jsonb_build_array(
    jsonb_build_object('span', 'wide', 'label', 'O''WEEK MAY 25', 'img', '/media/about/oweek-may-25.jpg', 'alt', 'Orientation week May 2025 event photo'),
    jsonb_build_object('span', '', 'label', 'SONY WORKSHOP', 'img', '/media/about/sony-workshop.jpg', 'alt', 'Sony camera workshop session'),
    jsonb_build_object('span', '', 'label', 'SUKMED 24', 'img', '/media/about/sukmed-24.jpg', 'alt', 'Sukmed 2024 event activities'),
    jsonb_build_object('span', 'wide', 'label', 'KAKI PHOTO 2025', 'img', '/media/about/kaki-photo-2025.jpg', 'alt', 'Kaki Photo 2025 meetup'),
    jsonb_build_object('span', '', 'label', 'KEMBARA RAYA 24', 'img', '/media/about/kembara-raya-24.jpg', 'alt', 'Kembara Raya 2024 road trip'),
    jsonb_build_object('span', 'wide', 'label', 'SEA AWARDS 2024', 'img', '/media/about/sea-awards-2024.jpg', 'alt', 'SEA Awards 2024 ceremony'),
    jsonb_build_object('span', '', 'label', 'CYBERGEN 2025', 'img', '/media/about/cybergen-2025.jpg', 'alt', 'Cybergen 2025 event'),
    jsonb_build_object('span', 'wide', 'label', 'BROTHER & SISTER 2.0', 'img', '/media/about/brother-sister-2.jpg', 'alt', 'Brother and Sister 2.0 programme'),
    jsonb_build_object('span', '', 'label', 'BOOTCAMP 2024', 'img', '/media/about/bootcamp-2024.jpg', 'alt', 'MedTech bootcamp 2024 training'),
    jsonb_build_object('span', 'wide', 'label', 'CULTRA 2024', 'img', '/media/about/cultra-2024.jpg', 'alt', 'Cultra 2024 cultural festival')
  ),
  'teamEyebrow', 'The people behind the lens',
  'teamHeading', 'OUR TEAM',
  'team', jsonb_build_array(
    jsonb_build_object('name', 'Norkamar Faridatul Salwa Binti Kamarudin', 'role', 'Manager (ICT Security & Governance)', 'dept', 'Digital Innovation & Technology', 'img', '/media/team/norkamar-faridatul.jpg', 'tier', 0),
    jsonb_build_object('name', 'Ahmad Ilman Hakim Bin Jasmin', 'role', 'President of MedTech', 'dept', '', 'img', '/media/team/ahmad-ilman.jpg', 'tier', 1),
    jsonb_build_object('name', 'Ahmad Ashraf Bin Fauzi', 'role', 'Vice President', 'dept', 'Business', 'img', '/media/team/ahmad-ashraf.jpg', 'tier', 2),
    jsonb_build_object('name', 'Aqryf Syah Bin Azrul Syahrin', 'role', 'Vice President', 'dept', 'Development', 'img', '/media/team/aqryf-syah.jpg', 'tier', 2),
    jsonb_build_object('name', 'Nur Hidayah Binti Zakaria', 'role', 'Secretary I', 'dept', '', 'img', '/media/team/nur-hidayah.jpg', 'tier', 3),
    jsonb_build_object('name', 'Zafira Agnia Damiat', 'role', 'Secretary II', 'dept', '', 'img', '/media/team/zafira-agnia.jpg', 'tier', 3),
    jsonb_build_object('name', 'Muzzammil Ikhwan Bin Rasit', 'role', 'Treasurer I', 'dept', '', 'img', '/media/team/muzzammil-ikhwan.jpg', 'tier', 3),
    jsonb_build_object('name', 'Muhammad Zal Hasmi Bin Mat Zaidi', 'role', 'Treasurer II', 'dept', '', 'img', '/media/team/zal-hasmi.jpg', 'tier', 3)
  )
))
on conflict (page_key, stage) do nothing;

insert into public.page_content (page_key, stage, content)
select page_key, 'draft', content from public.page_content where page_key = 'about' and stage = 'published'
on conflict (page_key, stage) do nothing;

-- Services
insert into public.page_content (page_key, stage, content)
values ('services', 'published', jsonb_build_object(
  'eyebrow', 'What we do',
  'heading', 'Our Services',
  'services', jsonb_build_array(
    jsonb_build_object('title', 'Photography Services', 'desc', 'Coverage for convocation, wedding shoots, events, and campaigns.', 'images', jsonb_build_array('/media/photography.jpg', '/media/project-1.jpg'), 'alt', 'Close-up of a professional camera lens', 'visible', true, 'order', 0),
    jsonb_build_object('title', 'Videography Services', 'desc', 'Storytelling through current-trend video editing, shooting, and full video production.', 'images', jsonb_build_array('/media/videography.jpg', '/media/hero.jpg'), 'alt', 'Camera operator filming on a cinema camera', 'visible', true, 'order', 1),
    jsonb_build_object('title', 'Technical Services', 'desc', 'Event management, venue technical support, halls/venues support, audio/visual/lighting.', 'images', jsonb_build_array('/media/technical.jpg', '/media/project-2.jpg'), 'alt', 'Audio mixing console and production equipment', 'visible', true, 'order', 2),
    jsonb_build_object('title', 'Design Services', 'desc', 'Apparel, posters, logos, banners, lanyards, shirts, and visual identity.', 'images', jsonb_build_array('/media/graphic-design.jpg', '/media/marketing.jpg'), 'alt', 'Graphic design workstation with screen', 'visible', true, 'order', 3),
    jsonb_build_object('title', 'Website Services', 'desc', 'Web design/development, maintenance, optimization, and digital presence.', 'images', jsonb_build_array('/media/streaming.jpg', '/media/project-3.jpg'), 'alt', 'Live streaming control desk with monitors', 'visible', true, 'order', 4)
  )
))
on conflict (page_key, stage) do nothing;

insert into public.page_content (page_key, stage, content)
select page_key, 'draft', content from public.page_content where page_key = 'services' and stage = 'published'
on conflict (page_key, stage) do nothing;

-- Contact
insert into public.page_content (page_key, stage, content)
values ('contact', 'published', jsonb_build_object(
  'heroEyebrow', 'CONTACT US',
  'heroTitle', 'LET''S CREATE
SOMETHING AMAZING.',
  'heroDescription', 'We are more than happy to hear any comments or inquiries from you. Fill in the form below and our team will get back to you as soon as possible.',
  'heroImage', '/media/contact/contact-hero.jpg',
  'formTitle', 'MEDTECH SERVICE INQUIRY',
  'formIntro', 'We are more than happy to hear any comments or inquiries from you. Should you need more information and assistance from us, feel free to fill in the forms below. You may contact us to book our services for technical crew assistance for events in Universiti Teknologi PETRONAS or even do photo and/or video coverage of your memorable occasions via the form below.',
  'mascotImage', '/media/contact/mattek.png',
  'successMessage', 'Thank you. Your inquiry has been received.',
  'fields', jsonb_build_object(
    'fullName', jsonb_build_object('label', 'Full Name', 'placeholder', 'Enter your full name', 'required', true, 'enabled', true),
    'email', jsonb_build_object('label', 'Email', 'placeholder', 'example@utp.edu.my', 'required', true, 'enabled', true),
    'phone', jsonb_build_object('label', 'Phone Number', 'placeholder', '012 3456789', 'required', true, 'enabled', true),
    'organisation', jsonb_build_object('label', 'Organisation', 'placeholder', 'Example: UTP MEDTECH Club / UTP ConvFest', 'required', true, 'enabled', true),
    'project', jsonb_build_object('label', 'Name of Project', 'placeholder', 'Example: Iftar Perdana, CONVOFest', 'required', true, 'enabled', true),
    'budget', jsonb_build_object('label', 'Budget Range', 'placeholder', 'Example: RM800, RM3k', 'required', true, 'enabled', true),
    'requestType', jsonb_build_object('label', 'Type of Request', 'placeholder', '', 'required', true, 'enabled', true),
    'exemption', jsonb_build_object('label', 'If your event is during weekdays, are exemption letters provided?', 'placeholder', '', 'required', false, 'enabled', true),
    'eventDate', jsonb_build_object('label', 'Date of Event / Expected Deadline', 'placeholder', '', 'required', true, 'enabled', true),
    'inquiry', jsonb_build_object('label', 'Inquiry', 'placeholder', 'Enter your inquiry here...', 'required', true, 'enabled', true),
    'attachment', jsonb_build_object('label', 'File attachment', 'placeholder', '', 'required', false, 'enabled', true),
    'hearAbout', jsonb_build_object('label', 'Where did you hear about us?', 'placeholder', '', 'required', true, 'enabled', true),
    'referral', jsonb_build_object('label', 'Insert your referral code', 'placeholder', 'Referral code (optional)', 'required', false, 'enabled', true),
    'promo', jsonb_build_object('label', 'Insert your promo code', 'placeholder', 'Promo code (optional)', 'required', false, 'enabled', true)
  ),
  'requestTypes', jsonb_build_array(
    'Technical - Crew Service', 'Video - Editing', 'Photo - Event/Convo',
    'Design - Printings (banner/t-shirt/lanyard)', 'Technical - Multi Camera Production',
    'Video - Shooting', 'Design - Digital Posters/Logo', 'Other'
  ),
  'hearAboutOptions', jsonb_build_array(
    'Instagram', 'TikTok', 'LinkedIn', 'Website',
    'MEDTECH Booth (Hari Kantri/CAVE)', 'Friends', 'Other'
  ),
  'exemptionOptions', jsonb_build_array('Yes', 'No', 'Not applicable')
))
on conflict (page_key, stage) do nothing;

insert into public.page_content (page_key, stage, content)
select page_key, 'draft', content from public.page_content where page_key = 'contact' and stage = 'published'
on conflict (page_key, stage) do nothing;
