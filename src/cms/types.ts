/* ---------- CMS domain models ---------- */

export type PublicationStatus = "draft" | "published";
export type MediaKind = "image" | "video";

export interface CmsProject {
  id: string;
  title: string;
  slug: string;
  category: string;
  year: string;
  location: string;
  shortDesc: string;
  fullDesc: string;
  coverMedia: string;
  coverUrl: string;
  alt: string;
  featured: boolean;
  status: PublicationStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CmsMedia {
  id: string;
  name: string;
  kind: MediaKind;
  mimeType: string;
  size: number;
  url: string;
  storagePath?: string;
  uploadedAt: number;
  builtin: boolean;
}

export interface CmsClient {
  id: string;
  name: string;
  websiteUrl: string;
  logoMedia: string;
  published: boolean;
  order: number;
}

export interface SiteSettings {
  title: string;
  tagline: string;
  contactEmail: string;
  phone: string;
  address: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
}

export interface AnalyticsPoint {
  date: string;
  views: number;
  visits: number;
}

export interface ContentSlice {
  label: string;
  value: number;
  color: string;
}

export interface ActivityEntry {
  id: string;
  type: "project" | "media" | "client" | "settings" | "auth";
  message: string;
  timestamp: number;
}

export interface AnalyticsSnapshot {
  totalPageViews: number;
  totalVisits: number;
  totalProjects: number;
  totalImages: number;
  totalVideos: number;
  series: AnalyticsPoint[];
  totalViews: number;
  uniqueVisits: number;
  recentProjects: { title: string; status: string; date: string }[];
  contentOverview: ContentSlice[];
  analyticsError?: string;
}

export interface AdminSession {
  email: string;
  loginAt: number;
}