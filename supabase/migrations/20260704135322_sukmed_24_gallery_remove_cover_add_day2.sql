-- =====================================================================
-- UTP MedTech Club — Sukmed 24 gallery: remove cover, add Day2 9-10
-- =====================================================================
-- Replaces the sukmed-24 detailGallery with the final 19-image set:
--   2 schedule + 7 Day1 + 10 Day2 (cover removed; hero shows it already).
-- Locates the item by slug in both published and draft; only detailGallery
-- is replaced, all other detail fields are preserved.
-- =====================================================================

do $$
declare
  detail jsonb := jsonb_build_object(
    'detailGallery', jsonb_build_array(
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
      '/media/about/sukmed-24/day2/day2-8.png',
      '/media/about/sukmed-24/day2/day2-9.png',
      '/media/about/sukmed-24/day2/day2-10.png'
    )
  );
begin
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