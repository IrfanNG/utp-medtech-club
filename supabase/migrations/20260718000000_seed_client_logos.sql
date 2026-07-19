-- Update seed client logos without overwriting existing CMS uploads
UPDATE public.clients
SET logo_media = CASE name
  WHEN 'PETRONAS'         THEN '/media/clients/petronas.svg'
  WHEN 'UTP'              THEN '/media/clients/utp.png'
  WHEN 'TM'               THEN '/media/clients/tm.webp'
  WHEN 'Yayasan PETRONAS' THEN '/media/clients/yayasan-petronas.png'
  WHEN 'MIDA'             THEN '/media/clients/mida.png'
  WHEN 'MDEC'             THEN '/media/clients/mdec.svg'
  ELSE logo_media
END
WHERE logo_media = '' OR logo_media IS NULL;
