-- =====================================================================
-- UTP MedTech Club — Add Sukmed 24 schedule images to detail gallery
-- =====================================================================
-- Updates the published (and draft) About page_content so the
-- /#/about/program/sukmed-24 detail gallery shows the two new schedule
-- images alongside the existing cover image. Robust to gallery ordering
-- changes: the item is located by its `slug` field, not array index.
-- =====================================================================

do $$
declare
  pub jsonb;
  drf jsonb;
  gallery jsonb;
  new_gallery jsonb;
  item jsonb;
  idx int;
begin
  -- ---- Published ----
  select content into pub from public.page_content
    where page_key = 'about' and stage = 'published';
  if pub is null then
    raise notice 'Published about content not found; skipping.';
  else
    gallery := pub -> 'gallery';
    new_gallery := '[]'::jsonb;
    for idx in 0..jsonb_array_length(gallery) - 1 loop
      item := gallery -> idx;
      if (item ->> 'slug') = 'sukmed-24' then
        item := jsonb_set(item, '{detailGallery}',
          jsonb_build_array(
            '/media/about/sukmed-24.jpg',
          ));
      end if;
      new_gallery := new_gallery || jsonb_build_array(item);
    end loop;
    pub := jsonb_set(pub, '{gallery}', new_gallery);

    update public.page_content set content = pub, updated_at = now()
      where page_key = 'about' and stage = 'published';
  end if;

  -- ---- Draft (mirror published) ----
  select content into drf from public.page_content
    where page_key = 'about' and stage = 'draft';
  if drf is null then
    raise notice 'Draft about content not found; skipping.';
  else
    gallery := drf -> 'gallery';
    new_gallery := '[]'::jsonb;
    for idx in 0..jsonb_array_length(gallery) - 1 loop
      item := gallery -> idx;
      if (item ->> 'slug') = 'sukmed-24' then
        item := jsonb_set(item, '{detailGallery}',
          jsonb_build_array(
            '/media/about/sukmed-24.jpg',
          ));
      end if;
      new_gallery := new_gallery || jsonb_build_array(item);
    end loop;
    drf := jsonb_set(drf, '{gallery}', new_gallery);

    update public.page_content set content = drf, updated_at = now()
      where page_key = 'about' and stage = 'draft';
  end if;
end
$$;