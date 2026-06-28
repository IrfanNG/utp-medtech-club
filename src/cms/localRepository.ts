import type {
  AdminSession,
  ActivityEntry,
  AnalyticsSnapshot,
  CmsClient,
  CmsMedia,
  CmsProject,
  SiteSettings,
} from "./types";
import type { CmsRepository, UploadResult } from "./repository";
import { seedClients, seedMedia, seedProjects, seedSettings } from "./seed";

/* ---------- localStorage keys ---------- */

const KEYS = {
  projects: "mtc.projects",
  clients: "mtc.clients",
  settings: "mtc.settings",
  media: "mtc.media",
  auth: "mtc.auth",
  activity: "mtc.activity",
  seeded: "mtc.seeded",
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full */
  }
}

/* ---------- IndexedDB helper ---------- */

const DB_NAME = "mtc-media-store";
const DB_STORE = "blobs";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/* ---------- Repository ---------- */

export class LocalRepository implements CmsRepository {

  constructor() {
    this.ensureSeed();
  }

  private ensureSeed(): void {
    if (!localStorage.getItem(KEYS.seeded)) {
      writeJson(KEYS.projects, seedProjects);
      writeJson(KEYS.clients, seedClients);
      writeJson(KEYS.settings, seedSettings);
      writeJson(KEYS.media, seedMedia);
      writeJson(KEYS.activity, []);
      localStorage.setItem(KEYS.seeded, "1");
    }
  }

  async getProjects(): Promise<CmsProject[]> {
    return readJson<CmsProject[]>(KEYS.projects, seedProjects);
  }

  async saveProjects(projects: CmsProject[]): Promise<void> {
    writeJson(KEYS.projects, projects);
  }

  async getClients(): Promise<CmsClient[]> {
    return readJson<CmsClient[]>(KEYS.clients, seedClients);
  }

  async saveClients(clients: CmsClient[]): Promise<void> {
    writeJson(KEYS.clients, clients);
  }

  async getSettings(): Promise<SiteSettings> {
    return readJson<SiteSettings>(KEYS.settings, seedSettings);
  }

  async saveSettings(settings: SiteSettings): Promise<void> {
    writeJson(KEYS.settings, settings);
  }

  async getMedia(): Promise<CmsMedia[]> {
    return readJson<CmsMedia[]>(KEYS.media, seedMedia);
  }

  async saveMedia(media: CmsMedia[]): Promise<void> {
    writeJson(KEYS.media, media);
  }

  async getMediaBlob(id: string): Promise<Blob | null> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readonly");
      const req = tx.objectStore(DB_STORE).get(id);
      req.onsuccess = () => resolve((req.result as Blob) ?? null);
      req.onerror = () => reject(req.error);
    });
  }

  async putMediaBlob(id: string, blob: Blob): Promise<UploadResult> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).put(blob, id);
      const url = URL.createObjectURL(blob);
      tx.oncomplete = () => resolve({ url, storagePath: id });
      tx.onerror = () => reject(tx.error);
    });
  }

  async deleteMediaBlob(id: string): Promise<void> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getAuth(): Promise<AdminSession | null> {
    return readJson<AdminSession | null>(KEYS.auth, null);
  }

  async saveAuth(session: AdminSession | null): Promise<void> {
    if (session) writeJson(KEYS.auth, session);
    else localStorage.removeItem(KEYS.auth);
  }

  async getAnalytics(projects: CmsProject[], media: CmsMedia[]): Promise<AnalyticsSnapshot> {
    const images = media.filter((m) => m.kind === "image").length;
    const videos = media.filter((m) => m.kind === "video").length;
    const published = projects.filter((p) => p.status === "published");
    const recent = published
      .slice()
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5);

    return {
      totalPageViews: 0,
      totalVisits: 0,
      totalProjects: projects.length,
      totalImages: images,
      totalVideos: videos,
      series: [],
      totalViews: 0,
      uniqueVisits: 0,
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
      analyticsError: "Analytics unavailable in local mode",
    };
  }

  async getActivity(): Promise<ActivityEntry[]> {
    return readJson<ActivityEntry[]>(KEYS.activity, []);
  }

  async addActivity(entry: Omit<ActivityEntry, "id" | "timestamp">): Promise<void> {
    const list = readJson<ActivityEntry[]>(KEYS.activity, []);
    const full: ActivityEntry = {
      ...entry,
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
    };
    list.unshift(full);
    writeJson(KEYS.activity, list.slice(0, 50));
  }
}

/* ---------- Singleton ---------- */

let repoInstance: LocalRepository | null = null;

export function getRepository(): LocalRepository {
  if (!repoInstance) repoInstance = new LocalRepository();
  return repoInstance;
}
