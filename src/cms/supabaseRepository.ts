import { supabase } from "../lib/supabase";
import type {
  ActivityEntry,
  AdminSession,
  AnalyticsPoint,
  AnalyticsSnapshot,
  CmsClient,
  CmsMedia,
  CmsProject,
  SiteSettings,
} from "./types";
import type { CmsRepository, UploadResult } from "./repository";
import { mapProject, mapClient, mapMedia } from "./mappers";

type Row = Record<string, unknown>;

/* ---------- Repository ---------- */

export class SupabaseRepository implements CmsRepository {

  /* ---- Projects ---- */

  async getProjects(): Promise<CmsProject[]> {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Row[] | null ?? []).map(mapProject);
  }

  async saveProjects(projects: CmsProject[]): Promise<void> {
    const incoming = new Set(projects.map((p) => p.id));
    const { data: existing } = await supabase
      .from("projects")
      .select("id");
    const dbIds = ((existing as Row[] | null) ?? []).map((r) => r.id as string);
    const toDelete = dbIds.filter((id) => !incoming.has(id));
    if (toDelete.length > 0) {
      const { error } = await supabase
        .from("projects")
        .delete()
        .in("id", toDelete);
      if (error) throw error;
    }

    for (const p of projects) {
      const exists = await supabase
        .from("projects")
        .select("id")
        .eq("id", p.id)
        .single();
      if (exists.data) {
        const { error } = await supabase
          .from("projects")
          .update({
            title: p.title,
            slug: p.slug,
            category: p.category,
            year: p.year,
            location: p.location,
            short_desc: p.shortDesc,
            full_desc: p.fullDesc,
            cover_media: p.coverMedia,
            cover_url: p.coverUrl,
            alt: p.alt,
            featured: p.featured,
            status: p.status,
          } as never)
          .eq("id", p.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("projects").insert({
          id: p.id,
          title: p.title,
          slug: p.slug,
          category: p.category,
          year: p.year,
          location: p.location,
          short_desc: p.shortDesc,
          full_desc: p.fullDesc,
          cover_media: p.coverMedia,
          cover_url: p.coverUrl,
          alt: p.alt,
          featured: p.featured,
          status: p.status,
          created_at: new Date(p.createdAt).toISOString(),
          updated_at: new Date(p.updatedAt).toISOString(),
        } as never);
        if (error) throw error;
      }
    }
  }

  /* ---- Clients ---- */

  async getClients(): Promise<CmsClient[]> {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return (data as Row[] | null ?? []).map(mapClient);
  }

  async saveClients(clients: CmsClient[]): Promise<void> {
    const incoming = new Set(clients.map((c) => c.id));
    const { data: existing } = await supabase
      .from("clients")
      .select("id");
    const dbIds = ((existing as Row[] | null) ?? []).map((r) => r.id as string);
    const toDelete = dbIds.filter((id) => !incoming.has(id));
    if (toDelete.length > 0) {
      const { error } = await supabase
        .from("clients")
        .delete()
        .in("id", toDelete);
      if (error) throw error;
    }

    for (const c of clients) {
      const exists = await supabase
        .from("clients")
        .select("id")
        .eq("id", c.id)
        .single();
      if (exists.data) {
        const { error } = await supabase
          .from("clients")
          .update({
            name: c.name,
            website_url: c.websiteUrl,
            logo_media: c.logoMedia,
            published: c.published,
            display_order: c.order,
          } as never)
          .eq("id", c.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("clients").insert({
          id: c.id,
          name: c.name,
          website_url: c.websiteUrl,
          logo_media: c.logoMedia,
          published: c.published,
          display_order: c.order,
        } as never);
        if (error) throw error;
      }
    }
  }

  /* ---- Settings ---- */

  async getSettings(): Promise<SiteSettings> {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (error) throw error;
    const row = data as Row;
    return {
      title: row.title as string,
      tagline: row.tagline as string,
      contactEmail: row.contact_email as string,
      phone: row.phone as string,
      address: row.address as string,
      instagramUrl: row.instagram_url as string,
      linkedinUrl: row.linkedin_url as string,
      youtubeUrl: row.youtube_url as string,
    };
  }

  async saveSettings(settings: SiteSettings): Promise<void> {
    const { error } = await supabase
      .from("site_settings")
      .upsert({
        id: 1,
        title: settings.title,
        tagline: settings.tagline,
        contact_email: settings.contactEmail,
        phone: settings.phone,
        address: settings.address,
        instagram_url: settings.instagramUrl,
        linkedin_url: settings.linkedinUrl,
        youtube_url: settings.youtubeUrl,
      } as never);
    if (error) throw error;
  }

  /* ---- Media metadata ---- */

  async getMedia(): Promise<CmsMedia[]> {
    const { data, error } = await supabase
      .from("media")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Row[] | null ?? []).map(mapMedia);
  }

  async saveMedia(media: CmsMedia[]): Promise<void> {
    const nonBuiltin = media.filter((m) => !m.builtin);
    const existingIds = new Set(
      ((
        await supabase
          .from("media")
          .select("id")
          .eq("builtin", false)
      ).data as Row[] | null)?.map((r) => r.id as string) ?? [],
    );

    const toInsert = nonBuiltin.filter((m) => !existingIds.has(m.id));
    const toUpdate = nonBuiltin.filter((m) => existingIds.has(m.id));
    const toDelete = [...existingIds].filter(
      (id) => !nonBuiltin.some((m) => m.id === id),
    );

    for (const id of toDelete) {
      const { error } = await supabase.from("media").delete().eq("id", id);
      if (error) throw error;
    }

    for (const m of toUpdate) {
      const { error } = await supabase
        .from("media")
        .update({
          name: m.name,
          kind: m.kind,
          mime_type: m.mimeType,
          size: m.size,
          url: m.url,
          storage_path: m.storagePath ?? null,
        } as never)
        .eq("id", m.id);
      if (error) throw error;
    }

    if (toInsert.length > 0) {
      const rows = toInsert.map((m) => ({
        id: m.id,
        name: m.name,
        kind: m.kind,
        mime_type: m.mimeType,
        size: m.size,
        url: m.url,
        builtin: false,
        storage_path: m.storagePath ?? null,
        created_at: new Date(m.uploadedAt).toISOString(),
      }));
      const { error } = await supabase.from("media").insert(rows as never[]);
      if (error) throw error;
    }
  }

  /* ---- Media blobs (Supabase Storage) ---- */

  async getMediaBlob(id: string): Promise<Blob | null> {
    const { data } = await supabase.storage.from("cms-media").download(id);
    return data;
  }

  async putMediaBlob(id: string, blob: Blob): Promise<UploadResult> {
    const path = id;
    const { error } = await supabase.storage
      .from("cms-media")
      .upload(path, blob, {
        upsert: true,
        contentType: blob.type || "application/octet-stream",
      });
    if (error) throw error;
    const { data: urlData } = supabase.storage
      .from("cms-media")
      .getPublicUrl(path);
    return { url: urlData.publicUrl, storagePath: path };
  }

  async deleteMediaBlob(id: string): Promise<void> {
    const { error } = await supabase.storage.from("cms-media").remove([id]);
    if (error) throw error;
  }

  /* ---- Auth ---- */

  async getAuth(): Promise<AdminSession | null> {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) return null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.session.user.id)
      .single();
    const p = profile as Row | null;
    if (!p || p.role !== "admin") return null;
    return {
      email: data.session.user.email ?? "",
      loginAt: Date.now(),
    };
  }

  async saveAuth(session: AdminSession | null): Promise<void> {
    if (!session) {
      await supabase.auth.signOut();
    }
  }

  /* ---- Analytics ---- */

  private async fetchSeries(): Promise<{ series: AnalyticsPoint[]; error?: string }> {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      const res = await fetch("/api/analytics", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        return {
          series: [],
          error: "Analytics endpoint unavailable locally. Use `npm run dev` (port 8080) to test analytics, or configure Pages Functions in production.",
        };
      }
      if (res.status === 503) {
        return { series: [], error: "Cloudflare analytics not configured. Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_TAG in Pages env vars." };
      }
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        return { series: [], error: body.error || `Analytics error (${res.status})` };
      }
      const body = (await res.json()) as { series?: AnalyticsPoint[] };
      return { series: body.series ?? [] };
    } catch (err) {
      return { series: [], error: String(err) };
    }
  }

  async getAnalytics(
    projects: CmsProject[],
    media: CmsMedia[],
  ): Promise<AnalyticsSnapshot> {
    const { series, error } = await this.fetchSeries();

    const totalViews = series.reduce((s, p) => s + p.views, 0);
    const uniqueVisits = series.reduce((s, p) => s + p.visits, 0);
    const images = media.filter((m) => m.kind === "image").length;
    const videos = media.filter((m) => m.kind === "video").length;
    const published = projects.filter((p) => p.status === "published");
    const recent = published
      .slice()
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5);

    return {
      totalPageViews: totalViews,
      totalVisits: uniqueVisits,
      totalProjects: projects.length,
      totalImages: images,
      totalVideos: videos,
      series,
      totalViews,
      uniqueVisits,
      recentProjects: recent.map((p) => ({
        title: p.title,
        status: p.status,
        date: new Date(p.updatedAt).toLocaleDateString("en-MY", {
          day: "numeric",
          month: "short",
        }),
      })),
      contentOverview: [
        { label: "Published", value: published.length, color: "#ff1a0f" },
        { label: "Drafts", value: projects.length - published.length, color: "#e2e8f0" },
      ],
      analyticsError: error || (series.length === 0 ? "No analytics data available yet. Data appears within 24 hours of enabling Cloudflare Web Analytics." : undefined),
    };
  }

  /* ---- Activity ---- */

  async getActivity(): Promise<ActivityEntry[]> {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return ((data as Row[] | null) ?? []).map((row) => ({
      id: row.id as string,
      type: row.type as ActivityEntry["type"],
      message: row.message as string,
      timestamp: new Date(row.created_at as string).getTime(),
    }));
  }

  async addActivity(
    entry: Omit<ActivityEntry, "id" | "timestamp">,
  ): Promise<void> {
    await supabase.from("activity_logs").insert({
      type: entry.type,
      message: entry.message,
    } as never);
  }
}

/* ---------- Singleton ---------- */

let repoInstance: SupabaseRepository | null = null;

export function getRepository(): SupabaseRepository {
  if (!repoInstance) repoInstance = new SupabaseRepository();
  return repoInstance;
}
