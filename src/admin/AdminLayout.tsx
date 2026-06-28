import { useEffect, useState, type ReactNode } from "react";
import { AdminIcon } from "./AdminIcons";

export interface SidebarItem {
  label: string;
  href: string;
  icon: (p: { size?: number }) => ReactNode;
  badge?: string;
  soon?: boolean;
}

export const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", href: "#/admin", icon: AdminIcon.dashboard },
  { label: "Landing Page", href: "#/admin/landing", icon: AdminIcon.pages, soon: true },
  { label: "About Us", href: "#/admin/about-content", icon: AdminIcon.about, soon: true },
  { label: "Services", href: "#/admin/services", icon: AdminIcon.services, soon: true },
  { label: "Projects", href: "#/admin/projects", icon: AdminIcon.projects },
  { label: "Contact", href: "#/admin/contact-content", icon: AdminIcon.contact, soon: true },
  { label: "Clients", href: "#/admin/clients", icon: AdminIcon.clients },
  { label: "Media Library", href: "#/admin/media", icon: AdminIcon.media },
  { label: "Settings", href: "#/admin/settings", icon: AdminIcon.settings },
];

interface AdminLayoutProps {
  currentPath: string;
  children: ReactNode;
  userEmail: string;
  onLogout: () => void;
}

export function AdminLayout({ currentPath, children, userEmail, onLogout }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
    setProfileOpen(false);
  }, [currentPath]);

  const isActive = (href: string) => {
    const path = href.replace("#", "");
    if (path === "/admin") return currentPath === "/admin";
    return currentPath.startsWith(path);
  };

  return (
    <div className="adm-shell">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="adm-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`adm-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="adm-sidebar-brand">
          <img src="/medtech-logo.avif" alt="UTP Medtech Club" className="adm-sidebar-logo" />
        </div>
        <nav className="adm-sidebar-nav">
          {sidebarItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`adm-nav-item ${isActive(item.href) ? "active" : ""}`}
            >
              <span className="adm-nav-icon">{item.icon({ size: 20 })}</span>
              <span className="adm-nav-label">{item.label}</span>
              {item.soon && <span className="adm-nav-soon">Soon</span>}
            </a>
          ))}
        </nav>
        <div className="adm-sidebar-footer">
          <a href="#/" className="adm-view-site">
            <AdminIcon.eye size={16} /> View Site
          </a>
          <button className="adm-logout-btn" onClick={onLogout}>
            <AdminIcon.logout size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="adm-main">
        {/* Topbar */}
        <header className="adm-topbar">
          <button className="adm-burger" onClick={() => setSidebarOpen((o) => !o)} aria-label="Toggle sidebar">
            <span /><span /><span />
          </button>
          <div className="adm-topbar-search">
            <AdminIcon.search size={18} />
            <input type="text" placeholder="Search…" aria-label="Search" />
          </div>
          <div className="adm-topbar-right">
            <button className="adm-topbar-btn" aria-label="Notifications">
              <AdminIcon.bell size={20} />
              <span className="adm-badge-dot" />
            </button>
            <div className="adm-profile-wrap">
              <button className="adm-profile-btn" onClick={() => setProfileOpen((o) => !o)}>
                <span className="adm-avatar">A</span>
                <span className="adm-profile-name">{userEmail}</span>
                <AdminIcon.chevronUp size={14} />
              </button>
              {profileOpen && (
                <div className="adm-profile-menu">
                  <div className="adm-profile-head">
                    <span className="adm-avatar lg">A</span>
                    <div>
                      <strong>Admin</strong>
                      <span>{userEmail}</span>
                    </div>
                  </div>
                  <button onClick={onLogout} className="adm-profile-action">
                    <AdminIcon.logout size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="adm-content">{children}</main>
      </div>
    </div>
  );
}