-- =====================================================================
-- UTP MedTech Club — Backfill full Sukmed 24 detail payload
-- =====================================================================
-- The original About seed (20260628200000) created gallery items with
-- only span/label/img/alt — no slug or any detail fields. Zod defaults
-- fill the missing fields with empty values, so /#/about/program/sukmed-24
-- resolves (via slugified label) but renders as a placeholder.
--
-- This migration locates the Sukmed 24 gallery item by its label (since
-- slug was absent from the seed) and overwrites the complete detail
-- payload in both published and draft, matching src/cms/defaultContent.ts.
-- =====================================================================

do $$
declare
  pub jsonb;
  drf jsonb;
  gallery jsonb;
  new_gallery jsonb;
  item jsonb;
  idx int;
  found_pub boolean := false;
  found_drf boolean := false;

  target_label text := 'SUKMED 24';
  detail jsonb := jsonb_build_object(
    'slug', 'sukmed-24',
    'detailTitle', 'Sukmed 2024',
    'detailBody', 'Sukmed is UTP''s annual sports and cultural festival. MedTech provided full event coverage including photography, videography and technical support across multiple venues over the multi-day event.',
    'detailGallery', jsonb_build_array(
      '/media/about/sukmed-24.jpg',
    ),
    'detailVideo', '',
    'detailCategory', 'Festival',
    'detailDate', '2024',
    'detailLocation', 'UTP Campus'
  );
begin
  -- ---- Published ----
  select content into pub from public.page_content
    where page_key = 'about' and stage = 'published';

  if pub is null then
    raise notice 'Published about content not found; skipping published.';
  else
    gallery := pub -> 'gallery';
    new_gallery := '[]'::jsonb;
    for idx in 0..jsonb_array_length(gallery) - 1 loop
      item := gallery -> idx;
      if (item ->> 'label') = target_label then
        item := item || detail;
        found_pub := true;
      end if;
      new_gallery := new_gallery || jsonb_build_array(item);
    end loop;

    if not found_pub then
      raise notice 'Sukmed 24 item not found in published gallery; no changes.';
    else
      pub := jsonb_set(pub, '{gallery}', new_gallery);
      update public.page_content set content = pub, updated_at = now()
        where page_key = 'about' and stage = 'published';
      raise notice 'Updated published about Sukmed 24 detail.';
    end if;
  end if;

  -- ---- Draft ----
  select content into drf from public.page_content
    where page_key = 'about' and stage = 'draft';

  if drf is null then
    raise notice 'Draft about content not found; skipping draft.';
  else
    gallery := drf -> 'gallery';
    new_gallery := '[]'::jsonb;
    for idx in 0..jsonb_array_length(gallery) - 1 loop
      item := gallery -> idx;
      if (item ->> 'label') = target_label then
        item := item || detail;
        found_drf := true;
      end if;
      new_gallery := new_gallery || jsonb_build_array(item);
    end loop;

    if not found_drf then
      raise notice 'Sukmed 24 item not found in draft gallery; no changes.';
    else
      drf := jsonb_set(drf, '{gallery}', new_gallery);
      update public.page_content set content = drf, updated_at = now()
        where page_key = 'about' and stage = 'draft';
      raise notice 'Updated draft about Sukmed 24 detail.';
    end if;
  end if;
end
$$;