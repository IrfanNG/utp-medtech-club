import type {
  AdminSession,
  ActivityEntry,
  AnalyticsSnapshot,
  ContactSubmission,
  CmsClient,
  CmsMedia,
  CmsProject,
  ContentStage,
  PageContentRow,
  PageKey,
  SiteSettings,
  SubmissionStatus,
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

  /* Page content */
  getPageContent(pageKey: PageKey, stage: ContentStage): Promise<PageContentRow | null>;
  savePageDraft(pageKey: PageKey, content: unknown): Promise<void>;
  publishPage(pageKey: PageKey): Promise<void>;
  getAllPageContent(stage: ContentStage): Promise<PageContentRow[]>;

  /* Contact submissions */
  getSubmissions(status?: SubmissionStatus): Promise<ContactSubmission[]>;
  getSubmission(id: string): Promise<ContactSubmission | null>;
  updateSubmission(id: string, patch: { status?: SubmissionStatus; adminNotes?: string }): Promise<void>;
  deleteSubmission(id: string): Promise<void>;
}
