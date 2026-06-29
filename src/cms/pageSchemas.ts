import { z } from "zod";

/* ================================================================
 * Page content schemas — typed JSON stored in page_content table
 * ================================================================ */

/* ---- Landing ---- */

export const landingHeroSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  description: z.string(),
  image: z.string(),
});

export const landingStatSchema = z.object({
  num: z.string(),
  plus: z.string().default("+"),
  label: z.string(),
});

export const landingFeatureSchema = z.object({
  title: z.string(),
  desc: z.string(),
});

export const landingTestimonialSchema = z.object({
  quote: z.string(),
  name: z.string(),
  role: z.string(),
  initials: z.string(),
});

export const landingCtaSchema = z.object({
  title: z.string(),
  image: z.string(),
});

export const landingContentSchema = z.object({
  hero: landingHeroSchema,
  clientStripHeading: z.string(),
  servicesEyebrow: z.string(),
  servicesHeading: z.string(),
  projectsEyebrow: z.string(),
  projectsHeading: z.string(),
  stats: z.array(landingStatSchema),
  whyEyebrow: z.string(),
  whyHeading: z.string(),
  whyDescription: z.string(),
  whyImage: z.string(),
  features: z.array(landingFeatureSchema),
  testimonialsEyebrow: z.string(),
  testimonialsHeading: z.string(),
  testimonials: z.array(landingTestimonialSchema),
  cta: landingCtaSchema,
});

/* ---- About ---- */

export const aboutGalleryItemSchema = z.object({
  span: z.enum(["", "wide"]).default(""),
  label: z.string(),
  img: z.string(),
  alt: z.string(),
  slug: z.string().default(""),
  detailTitle: z.string().default(""),
  detailBody: z.string().default(""),
  detailGallery: z.array(z.string()).default([]),
  detailVideo: z.string().default(""),
  detailCategory: z.string().default(""),
  detailDate: z.string().default(""),
  detailLocation: z.string().default(""),
});

export const aboutTeamMemberSchema = z.object({
  name: z.string(),
  role: z.string(),
  dept: z.string().default(""),
  img: z.string(),
  tier: z.number().int().min(0).max(5),
});

export const aboutContentSchema = z.object({
  heroEyebrow: z.string(),
  heroTitle: z.string(),
  heroDescription: z.string(),
  heroImage: z.string(),
  introEyebrow: z.string(),
  introTitle: z.string(),
  introParagraphs: z.array(z.string()),
  philosophyEyebrow: z.string(),
  philosophyTitle: z.string(),
  philosophyParagraphs: z.array(z.string()),
  gallery: z.array(aboutGalleryItemSchema),
  teamEyebrow: z.string(),
  teamHeading: z.string(),
  team: z.array(aboutTeamMemberSchema),
});

/* ---- Services ---- */

export const serviceCardSchema = z.object({
  title: z.string(),
  desc: z.string(),
  images: z.array(z.string()).length(2),
  alt: z.string(),
  visible: z.boolean().default(true),
  order: z.number().int().min(0),
  detailTitle: z.string().default(""),
  detailBody: z.string().default(""),
  detailGallery: z.array(z.string()).default([]),
  detailHighlights: z.array(z.string()).default([]),
  detailCta: z.string().default(""),
  detailVideo: z.string().default(""),
});

export const servicesContentSchema = z.object({
  eyebrow: z.string(),
  heading: z.string(),
  services: z.array(serviceCardSchema),
});

/* ---- Contact ---- */

export const contactFieldSchema = z.object({
  label: z.string(),
  placeholder: z.string().default(""),
  required: z.boolean().default(true),
  enabled: z.boolean().default(true),
});

export const contactContentSchema = z.object({
  heroEyebrow: z.string(),
  heroTitle: z.string(),
  heroDescription: z.string(),
  heroImage: z.string(),
  formTitle: z.string(),
  formIntro: z.string(),
  mascotImage: z.string(),
  successMessage: z.string(),
  fields: z.record(z.string(), contactFieldSchema),
  requestTypes: z.array(z.string()),
  hearAboutOptions: z.array(z.string()),
  exemptionOptions: z.array(z.string()),
});

/* ---- Aggregate ---- */

export const pageContentSchemas = {
  landing: landingContentSchema,
  about: aboutContentSchema,
  services: servicesContentSchema,
  contact: contactContentSchema,
} as const;

export type PageKey = keyof typeof pageContentSchemas;
export type LandingContent = z.infer<typeof landingContentSchema>;
export type AboutContent = z.infer<typeof aboutContentSchema>;
export type ServicesContent = z.infer<typeof servicesContentSchema>;
export type ContactContent = z.infer<typeof contactContentSchema>;
export type AboutGalleryItem = z.infer<typeof aboutGalleryItemSchema>;
export type ServiceCard = z.infer<typeof serviceCardSchema>;

export type PageContent = LandingContent | AboutContent | ServicesContent | ContactContent;

export function parsePageContent<K extends PageKey>(
  key: K,
  data: unknown,
): (typeof pageContentSchemas)[K]["_output"] {
  return pageContentSchemas[key].parse(data);
}

export function safeParsePageContent<K extends PageKey>(
  key: K,
  data: unknown,
): { success: true; data: (typeof pageContentSchemas)[K]["_output"] } | { success: false; error: string } {
  const result = pageContentSchemas[key].safeParse(data);
  if (result.success) return { success: true, data: result.data };
  return { success: false, error: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") };
}
