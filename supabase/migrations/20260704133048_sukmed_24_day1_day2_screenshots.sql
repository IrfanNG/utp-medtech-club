-- =====================================================================
-- UTP MedTech Club — Add Day1/Day2 screenshots to Sukmed 24 detail gallery
-- =====================================================================
-- Locates the About gallery item with slug = 'sukmed-24' and replaces only
-- its detailGallery array, preserving the existing detailTitle/detailBody/
-- detailCategory/detailDate/detailLocation. Runs against both published
-- and draft. The item is located by slug (array-index agnostic).
-- =====================================================================

do $$
declare
  new_gallery jsonb;
  detail jsonb := jsonb_build_object(
    'detailGallery', jsonb_build_array(
      '/media/about/sukmed-24.jpg',
      '/media/about/sukmed-24/day1/day1-1.png',
      '/media/about/sukmed-24/day1/day1-2.png',
      '/media/about/sukmed-24/day1/day1-3.png',
      '/media/about/sukmed-24/day1/day1-4.png',
      '/media/about/sukmed-24/day1/day1-5.png',
      '/media/about/sukmed-24/day1/day1-6.png',
      '/media/about/sukmed-24/day1/day1-7.png',
      '/media/about/sukmed-24/day2/day2-1.png',
      '/media/about/sukmed-24/day2/day2-2.png',
      '/media/about/sukmed-24/day2/day2-3.png',
      '/media/about/sukmed-24/day2/day2-4.png',
      '/media/about/sukmed-24/day2/day2-5.png',
      '/media/about/sukmed-24/day2/day2-6.png',
      '/media/about/sukmed-24/day2/day2-7.png',
      '/media/about/sukmed-24/day2/day2-8.png'
    )
  );
begin
  -- Patch the detailGallery on every matching About gallery item (both stages).
  -- jsonb_set replaces only the nested detailGallery key; the rest of the
  -- gallery item (detailTitle, detailBody, etc.) is left as-is. The outer
  -- content->'gallery' array is rebuilt after patching the matching slot.
  with patched as (
    select
      stage,
      jsonb_agg(
        case
          when (g ->> 'slug') = 'sukmed-24'
            then g || detail
          else g
        end
      ) as new_gallery
    from public.page_content,
         jsonb_array_elements(content -> 'gallery') as g
    where page_key = 'about'
    group by stage
  )
  update public.page_content pc
    set content = jsonb_set(pc.content, '{gallery}', p.new_gallery),
        updated_at = now()
    from patched p
    where pc.page_key = 'about' and pc.stage = p.stage;
end
$$;