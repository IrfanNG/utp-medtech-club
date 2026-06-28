import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import { getRepository } from "./supabaseRepository";
import type { SupabaseRepository } from "./supabaseRepository";
import type {
  AdminSession,
  ActivityEntry,
  AnalyticsSnapshot,
  CmsClient,
  CmsMedia,
  CmsProject,
  SiteSettings,
} from "./types";

interface CmsContextValue {
  repo: SupabaseRepository;
  /* data */
  projects: CmsProject[];
  clients: CmsClient[];
  settings: SiteSettings;
  media: CmsMedia[];
  activities: ActivityEntry[];
  analytics: AnalyticsSnapshot;
  auth: AdminSession | null;
  /* derived for public pages */
  publishedClients: CmsClient[];
  publishedProjects: CmsProject[];
  /* loading / error */
  loading: boolean;
  error: string | null;
  /* project CRUD */
  createProject: (p: Omit<CmsProject, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateProject: (id: string, patch: Partial<CmsProject>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  /* client CRUD */
  createClient: (c: Omit<CmsClient, "id">) => Promise<void>;
  updateClient: (id: string, patch: Partial<CmsClient>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  /* settings */
  updateSettings: (patch: Partial<SiteSettings>) => Promise<void>;
  /* media CRUD */
  addMedia: (m: CmsMedia) => Promise<void>;
  updateMedia: (id: string, patch: Partial<CmsMedia>) => Promise<void>;
  deleteMedia: (id: string) => Promise<void>;
  /* auth */
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  /* refresh */
  reload: () => Promise<void>;
}

const CmsContext = createContext<CmsContextValue | null>(null);

function uid(): string {
  return crypto.randomUUID();
}

export function CmsProvider({ children }: { children: ReactNode }) {
  const repo = useMemo(() => getRepository(), []);
  const [version, setVersion] = useState(0);

  const [projects, setProjects] = useState<CmsProject[]>([]);
  const [clients, setClients] = useState<CmsClient[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [media, setMedia] = useState<CmsMedia[]>([]);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [auth, setAuth] = useState<AdminSession | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot>(() => defaultAnalytics());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    try {
      setError(null);
      const [projectsData, clientsData, settingsData, mediaData, activitiesData, authData] =
        await Promise.all([
          repo.getProjects(),
          repo.getClients(),
          repo.getSettings(),
          repo.getMedia(),
          repo.getActivity(),
          repo.getAuth(),
        ]);
      setProjects(projectsData);
      setClients(clientsData);
      setSettings(settingsData);
      setMedia(mediaData);
      setActivities(activitiesData);
      setAuth(authData);
      const analyticsData = await repo.getAnalytics(projectsData, mediaData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [repo]);

  useEffect(() => {
    loadAll();
  }, [loadAll, version]);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadAll();
    });
    return () => listener?.subscription.unsubscribe();
  }, [loadAll]);

  const reload = useCallback(async () => {
    setLoading(true);
    setVersion((v) => v + 1);
  }, []);

  const defaultSettings: SiteSettings = {
    title: "UTP Medtech Club",
    tagline: "",
    contactEmail: "",
    phone: "",
    address: "",
    instagramUrl: "",
    linkedinUrl: "",
    youtubeUrl: "",
  };

  const currentSettings = settings ?? defaultSettings;

  const publishedClients = useMemo(
    () => clients.filter((c) => c.published).sort((a, b) => a.order - b.order),
    [clients],
  );

  const publishedProjects = useMemo(
    () => projects.filter((p) => p.status === "published"),
    [projects],
  );

  const createProject = useCallback(
    async (p: Omit<CmsProject, "id" | "createdAt" | "updatedAt">) => {
      const now = Date.now();
const project: CmsProject = {
  ...p,
  id: uid(),
  createdAt: now,
  updatedAt: now,
};
      const next = [...projects, project];
      await repo.saveProjects(next);
      await repo.addActivity({ type: "project", message: `Created project "${project.title}"` });
      await reload();
    },
    [repo, projects, reload],
  );

  const updateProject = useCallback(
    async (id: string, patch: Partial<CmsProject>) => {
      const next = projects.map((p) =>
        p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p,
      );
      await repo.saveProjects(next);
      const title = patch.title ?? projects.find((p) => p.id === id)?.title ?? "Untitled";
      await repo.addActivity({ type: "project", message: `Updated project "${title}"` });
      await reload();
    },
    [repo, projects, reload],
  );

  const deleteProject = useCallback(
    async (id: string) => {
      const target = projects.find((p) => p.id === id);
      const next = projects.filter((p) => p.id !== id);
      await repo.saveProjects(next);
      await repo.addActivity({
        type: "project",
        message: `Deleted project "${target?.title ?? "Untitled"}"`,
      });
      await reload();
    },
    [repo, projects, reload],
  );

  const createClient = useCallback(
    async (c: Omit<CmsClient, "id">) => {
      const client: CmsClient = { ...c, id: uid() };
      const next = [...clients, client];
      await repo.saveClients(next);
      await repo.addActivity({ type: "client", message: `Added client "${client.name}"` });
      await reload();
    },
    [repo, clients, reload],
  );

  const updateClient = useCallback(
    async (id: string, patch: Partial<CmsClient>) => {
      const next = clients.map((c) => (c.id === id ? { ...c, ...patch } : c));
      await repo.saveClients(next);
      const name = patch.name ?? clients.find((c) => c.id === id)?.name ?? "Client";
      await repo.addActivity({ type: "client", message: `Updated client "${name}"` });
      await reload();
    },
    [repo, clients, reload],
  );

  const deleteClient = useCallback(
    async (id: string) => {
      const target = clients.find((c) => c.id === id);
      const next = clients.filter((c) => c.id !== id);
      await repo.saveClients(next);
      await repo.addActivity({
        type: "client",
        message: `Deleted client "${target?.name ?? "Client"}"`,
      });
      await reload();
    },
    [repo, clients, reload],
  );

  const updateSettings = useCallback(
    async (patch: Partial<SiteSettings>) => {
      const next = { ...currentSettings, ...patch };
      await repo.saveSettings(next);
      await repo.addActivity({ type: "settings", message: "Updated site settings" });
      await reload();
    },
    [repo, currentSettings, reload],
  );

  const addMedia = useCallback(
    async (m: CmsMedia) => {
      const next = [...media, m];
      await repo.saveMedia(next);
      await repo.addActivity({ type: "media", message: `Uploaded media "${m.name}"` });
      await reload();
    },
    [repo, media, reload],
  );

  const updateMedia = useCallback(
    async (id: string, patch: Partial<CmsMedia>) => {
      const next = media.map((m) => (m.id === id ? { ...m, ...patch } : m));
      await repo.saveMedia(next);
      await reload();
    },
    [repo, media, reload],
  );

  const deleteMedia = useCallback(
    async (id: string) => {
      const target = media.find((m) => m.id === id);
      const next = media.filter((m) => m.id !== id);
      await repo.saveMedia(next);
      if (target && !target.builtin) {
        await repo.deleteMediaBlob(id);
      }
      if (target) {
        await repo.addActivity({ type: "media", message: `Deleted media "${target.name}"` });
      }
      await reload();
    },
    [repo, media, reload],
  );

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (signInError) return false;

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return false;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (!profile || profile.role !== "admin") {
        await supabase.auth.signOut();
        return false;
      }

      await repo.addActivity({ type: "auth", message: "Admin signed in" });
      await reload();
      return true;
    },
    [repo, reload],
  );

  const logout = useCallback(async () => {
    await repo.addActivity({ type: "auth", message: "Admin signed out" });
    await supabase.auth.signOut();
    setAuth(null);
    await reload();
  }, [repo, reload]);

  const value: CmsContextValue = {
    repo,
    projects,
    clients,
    settings: currentSettings,
    media,
    activities,
    analytics,
    auth,
    publishedClients,
    publishedProjects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    createClient,
    updateClient,
    deleteClient,
    updateSettings,
    addMedia,
    updateMedia,
    deleteMedia,
    login,
    logout,
    reload,
  };

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms(): CmsContextValue {
  const ctx = useContext(CmsContext);
  if (!ctx) throw new Error("useCms must be used within CmsProvider");
  return ctx;
}

function defaultAnalytics(): AnalyticsSnapshot {
  return {
    totalPageViews: 0,
    totalVisitors: 0,
    totalProjects: 0,
    totalImages: 0,
    totalVideos: 0,
    series: [],
    totalViews: 0,
    uniqueVisitors: 0,
    avgSessionDuration: "0m 0s",
    recentProjects: [],
    contentOverview: [],
  };
}
