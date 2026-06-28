import type {
  AdminSession,
  ActivityEntry,
  AnalyticsSnapshot,
  CmsClient,
  CmsMedia,
  CmsProject,
  SiteSettings,
} from "./types";

export interface CmsRepository {
  /* ---- Projects ---- */
  getProjects(): CmsProject[];
  saveProjects(projects: CmsProject[]): void;

  /* ---- Clients ---- */
  getClients(): CmsClient[];
  saveClients(clients: CmsClient[]): void;

  /* ---- Settings ---- */
  getSettings(): SiteSettings;
  saveSettings(settings: SiteSettings): void;

  /* ---- Media metadata ---- */
  getMedia(): CmsMedia[];
  saveMedia(media: CmsMedia[]): void;

  /* ---- Media blobs (IndexedDB) ---- */
  getMediaBlob(id: string): Promise<Blob | null>;
  putMediaBlob(id: string, blob: Blob): Promise<void>;
  deleteMediaBlob(id: string): Promise<void>;

  /* ---- Auth ---- */
  getAuth(): AdminSession | null;
  saveAuth(session: AdminSession | null): void;

  /* ---- Analytics ---- */
  getAnalytics(
    projects: CmsProject[],
    media: CmsMedia[],
  ): AnalyticsSnapshot;

  /* ---- Activity ---- */
  getActivity(): ActivityEntry[];
  addActivity(entry: Omit<ActivityEntry, "id" | "timestamp">): void;
}