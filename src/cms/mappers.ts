import type {
  CmsClient,
  CmsMedia,
  CmsProject,
} from "./types";

/* ---------- DB row → domain model mappers ---------- */

export function mapProject(row: Record<string, unknown>): CmsProject {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    category: row.category as string,
    year: row.year as string,
    location: (row.location as string) ?? "",
    shortDesc: row.short_desc as string,
    fullDesc: (row.full_desc as string) ?? "",
    coverMedia: (row.cover_media as string) ?? "",
    coverUrl: (row.cover_url as string) ?? "",
    alt: (row.alt as string) ?? "",
    featured: row.featured as boolean,
    status: (row.status as "draft" | "published"),
    createdAt: new Date(row.created_at as string).getTime(),
    updatedAt: new Date(row.updated_at as string).getTime(),
  };
}

export function mapClient(row: Record<string, unknown>): CmsClient {
  return {
    id: row.id as string,
    name: row.name as string,
    websiteUrl: (row.website_url as string) ?? "",
    logoMedia: (row.logo_media as string) ?? "",
    published: row.published as boolean,
    order: (row.display_order as number) ?? 0,
  };
}

export function mapMedia(row: Record<string, unknown>): CmsMedia {
  return {
    id: row.id as string,
    name: row.name as string,
    kind: row.kind as "image" | "video",
    mimeType: (row.mime_type as string) ?? "",
    size: (row.size as number) ?? 0,
    url: row.url as string,
    storagePath: (row.storage_path as string) ?? undefined,
    uploadedAt: new Date(row.created_at as string).getTime(),
    builtin: row.builtin as boolean,
  };
}
