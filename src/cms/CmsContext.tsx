import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getRepository } from "./localRepository";
import type { LocalRepository } from "./localRepository";
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
  repo: LocalRepository;
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
  /* project CRUD */
  createProject: (p: Omit<CmsProject, "id" | "createdAt" | "updatedAt">) => void;
  updateProject: (id: string, patch: Partial<CmsProject>) => void;
  deleteProject: (id: string) => void;
  /* client CRUD */
  createClient: (c: Omit<CmsClient, "id">) => void;
  updateClient: (id: string, patch: Partial<CmsClient>) => void;
  deleteClient: (id: string) => void;
  /* settings */
  updateSettings: (patch: Partial<SiteSettings>) => void;
  /* media CRUD */
  addMedia: (m: CmsMedia) => void;
  updateMedia: (id: string, patch: Partial<CmsMedia>) => void;
  deleteMedia: (id: string) => Promise<void>;
  /* auth */
  login: (email: string, password: string) => boolean;
  logout: () => void;
  /* refresh */
  reload: () => void;
}

const CmsContext = createContext<CmsContextValue | null>(null);

const DEMO_EMAIL = "admin@utpmedtech.club";
const DEMO_PASSWORD = "medtech-demo";

let idCounter = 0;
function uid(prefix: string): string {
  idCounter++;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

export function CmsProvider({ children }: { children: ReactNode }) {
  const repo = useMemo(() => getRepository(), []);
  const [version, setVersion] = useState(0);

  const [projects, setProjects] = useState<CmsProject[]>(() => repo.getProjects());
  const [clients, setClients] = useState<CmsClient[]>(() => repo.getClients());
  const [settings, setSettings] = useState<SiteSettings>(() => repo.getSettings());
  const [media, setMedia] = useState<CmsMedia[]>(() => repo.getMedia());
  const [activities, setActivities] = useState<ActivityEntry[]>(() => repo.getActivity());
  const [auth, setAuth] = useState<AdminSession | null>(() => repo.getAuth());

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    setProjects(repo.getProjects());
    setClients(repo.getClients());
    setSettings(repo.getSettings());
    setMedia(repo.getMedia());
    setActivities(repo.getActivity());
  }, [repo, version]);

  const publishedClients = useMemo(
    () => clients.filter((c) => c.published).sort((a, b) => a.order - b.order),
    [clients],
  );

  const publishedProjects = useMemo(
    () => projects.filter((p) => p.status === "published"),
    [projects],
  );

  const createProject = useCallback(
    (p: Omit<CmsProject, "id" | "createdAt" | "updatedAt">) => {
      const now = Date.now();
      const project: CmsProject = { ...p, id: uid("proj"), createdAt: now, updatedAt: now };
      const next = [...repo.getProjects(), project];
      repo.saveProjects(next);
      repo.addActivity({ type: "project", message: `Created project “${project.title}”` });
      reload();
    },
    [repo, reload],
  );

  const updateProject = useCallback(
    (id: string, patch: Partial<CmsProject>) => {
      const list = repo.getProjects();
      const next = list.map((p) =>
        p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p,
      );
      repo.saveProjects(next);
      repo.addActivity({ type: "project", message: `Updated project “${patch.title ?? list.find((p) => p.id === id)?.title ?? "Untitled"}”` });
      reload();
    },
    [repo, reload],
  );

  const deleteProject = useCallback(
    (id: string) => {
      const list = repo.getProjects();
      const target = list.find((p) => p.id === id);
      const next = list.filter((p) => p.id !== id);
      repo.saveProjects(next);
      repo.addActivity({ type: "project", message: `Deleted project “${target?.title ?? "Untitled"}”` });
      reload();
    },
    [repo, reload],
  );

  const createClient = useCallback(
    (c: Omit<CmsClient, "id">) => {
      const client: CmsClient = { ...c, id: uid("client") };
      const next = [...repo.getClients(), client];
      repo.saveClients(next);
      repo.addActivity({ type: "client", message: `Added client “${client.name}”` });
      reload();
    },
    [repo, reload],
  );

  const updateClient = useCallback(
    (id: string, patch: Partial<CmsClient>) => {
      const list = repo.getClients();
      const next = list.map((c) => (c.id === id ? { ...c, ...patch } : c));
      repo.saveClients(next);
      repo.addActivity({ type: "client", message: `Updated client “${patch.name ?? list.find((c) => c.id === id)?.name ?? "Client"}”` });
      reload();
    },
    [repo, reload],
  );

  const deleteClient = useCallback(
    (id: string) => {
      const list = repo.getClients();
      const target = list.find((c) => c.id === id);
      const next = list.filter((c) => c.id !== id);
      repo.saveClients(next);
      repo.addActivity({ type: "client", message: `Deleted client “${target?.name ?? "Client"}”` });
      reload();
    },
    [repo, reload],
  );

  const updateSettings = useCallback(
    (patch: Partial<SiteSettings>) => {
      const current = repo.getSettings();
      const next = { ...current, ...patch };
      repo.saveSettings(next);
      repo.addActivity({ type: "settings", message: "Updated site settings" });
      reload();
    },
    [repo, reload],
  );

  const addMedia = useCallback(
    (m: CmsMedia) => {
      const next = [...repo.getMedia(), m];
      repo.saveMedia(next);
      repo.addActivity({ type: "media", message: `Uploaded media “${m.name}”` });
      reload();
    },
    [repo, reload],
  );

  const updateMedia = useCallback(
    (id: string, patch: Partial<CmsMedia>) => {
      const list = repo.getMedia();
      const next = list.map((m) => (m.id === id ? { ...m, ...patch } : m));
      repo.saveMedia(next);
      reload();
    },
    [repo, reload],
  );

  const deleteMedia = useCallback(
    async (id: string) => {
      const list = repo.getMedia();
      const target = list.find((m) => m.id === id);
      const next = list.filter((m) => m.id !== id);
      repo.saveMedia(next);
      await repo.deleteMediaBlob(id);
      if (target) repo.addActivity({ type: "media", message: `Deleted media “${target.name}”` });
      reload();
    },
    [repo, reload],
  );

  const login = useCallback(
    (email: string, password: string): boolean => {
      if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
        const session: AdminSession = { email: DEMO_EMAIL, loginAt: Date.now() };
        repo.saveAuth(session);
        repo.addActivity({ type: "auth", message: "Admin signed in" });
        setAuth(session);
        return true;
      }
      return false;
    },
    [repo],
  );

  const logout = useCallback(() => {
    repo.saveAuth(null);
    repo.addActivity({ type: "auth", message: "Admin signed out" });
    setAuth(null);
  }, [repo]);

  const analytics = useMemo(
    () => repo.getAnalytics(projects, media),
    [repo, projects, media],
  );

  const value: CmsContextValue = {
    repo,
    projects,
    clients,
    settings,
    media,
    activities,
    analytics,
    auth,
    publishedClients,
    publishedProjects,
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