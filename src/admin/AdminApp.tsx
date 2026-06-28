import { useEffect } from "react";
import { useCms } from "../cms/CmsContext";
import { usePageTitle } from "../shared";
import { AdminLayout } from "./AdminLayout";
import { AdminIcon } from "./AdminIcons";
import { AdminLogin } from "./Login";
import { Dashboard } from "./Dashboard";
import { ProjectsAdmin } from "./ProjectsAdmin";
import { MediaAdmin } from "./MediaAdmin";
import { ClientsAdmin } from "./ClientsAdmin";
import { SettingsAdmin } from "./SettingsAdmin";
import { ComingSoon } from "./ComingSoon";

interface AdminAppProps {
  path: string;
}

const adminTitles: Record<string, string> = {
  "/admin": "Dashboard — UTP Medtech Admin",
  "/admin/projects": "Projects — UTP Medtech Admin",
  "/admin/media": "Media Library — UTP Medtech Admin",
  "/admin/clients": "Clients — UTP Medtech Admin",
  "/admin/settings": "Settings — UTP Medtech Admin",
  "/admin/landing": "Landing Page — UTP Medtech Admin",
  "/admin/about-content": "About Us — UTP Medtech Admin",
  "/admin/services": "Services — UTP Medtech Admin",
  "/admin/contact-content": "Contact — UTP Medtech Admin",
};

export function AdminApp({ path }: AdminAppProps) {
  const { auth, logout } = useCms();

  usePageTitle(adminTitles[path] ?? "Admin — UTP Medtech Club");

  useEffect(() => {
    if (!auth && path !== "/admin/login") {
      window.location.hash = "#/admin/login";
    }
    if (auth && path === "/admin/login") {
      window.location.hash = "#/admin";
    }
  }, [auth, path]);

  if (!auth) {
    return <AdminLogin />;
  }

  let content: React.ReactNode;

  if (path === "/admin" || path === "/admin/") {
    content = <Dashboard />;
  } else if (path === "/admin/projects") {
    content = <ProjectsAdmin />;
  } else if (path === "/admin/media") {
    content = <MediaAdmin />;
  } else if (path === "/admin/clients") {
    content = <ClientsAdmin />;
  } else if (path === "/admin/settings") {
    content = <SettingsAdmin />;
  } else if (path === "/admin/landing") {
    content = <ComingSoon title="Landing Page Editor" icon={AdminIcon.pages({ size: 48 })} description="Drag-and-drop section ordering and content editing for the home page." />;
  } else if (path === "/admin/about-content") {
    content = <ComingSoon title="About Us Editor" icon={AdminIcon.about({ size: 48 })} description="Edit the about page hero, gallery, team members, and philosophy content." />;
  } else if (path === "/admin/services") {
    content = <ComingSoon title="Services Editor" icon={AdminIcon.services({ size: 48 })} description="Manage service panels, descriptions, images, and ordering." />;
  } else if (path === "/admin/contact-content") {
    content = <ComingSoon title="Contact Page Editor" icon={AdminIcon.contact({ size: 48 })} description="Configure the contact form fields, hero content, and clients section." />;
  } else {
    content = <Dashboard />;
  }

  return (
    <AdminLayout currentPath={path} userEmail={auth.email} onLogout={logout}>
      {content}
    </AdminLayout>
  );
}