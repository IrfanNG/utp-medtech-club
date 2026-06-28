import type {
  AdminSession,
  ActivityEntry,
  AnalyticsSnapshot,
  CmsClient,
  CmsMedia,
  CmsProject,
  SiteSettings,
} from "./types";

export interface UploadResult {
  url: string;
  storagePath: string;
}

export interface CmsRepository {
  getProjects(): Promise<CmsProject[]>;
  saveProjects(projects: CmsProject[]): Promise<void>;

  getClients(): Promise<CmsClient[]>;
  saveClients(clients: CmsClient[]): Promise<void>;

  getSettings(): Promise<SiteSettings>;
  saveSettings(settings: SiteSettings): Promise<void>;

  getMedia(): Promise<CmsMedia[]>;
  saveMedia(media: CmsMedia[]): Promise<void>;

  getMediaBlob(id: string): Promise<Blob | null>;
  putMediaBlob(id: string, blob: Blob): Promise<UploadResult>;
  deleteMediaBlob(id: string): Promise<void>;

  getAuth(): Promise<AdminSession | null>;
  saveAuth(session: AdminSession | null): Promise<void>;

  getAnalytics(
    projects: CmsProject[],
    media: CmsMedia[],
  ): Promise<AnalyticsSnapshot>;

  getActivity(): Promise<ActivityEntry[]>;
  addActivity(entry: Omit<ActivityEntry, "id" | "timestamp">): Promise<void>;
}
