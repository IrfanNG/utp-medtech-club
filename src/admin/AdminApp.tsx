import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useCms } from "../cms/CmsContext";
import { usePageTitle } from "../shared";
import { AdminLayout } from "./AdminLayout";
import { AdminLogin } from "./Login";
import { Dashboard } from "./Dashboard";
import { ProjectsAdmin } from "./ProjectsAdmin";
import { MediaAdmin } from "./MediaAdmin";
import { ClientsAdmin } from "./ClientsAdmin";
import { SettingsAdmin } from "./SettingsAdmin";
import { LandingEditor } from "./LandingEditor";
import { AboutEditor } from "./AboutEditor";
import { ServicesEditor } from "./ServicesEditor";
import { ContactEditor } from "./ContactEditor";
import { SubmissionsInbox } from "./SubmissionsInbox";

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
  "/admin/submissions": "Submissions — UTP Medtech Admin",
};

export function AdminApp({ path }: AdminAppProps) {
  const { auth, logout, loading } = useCms();

  const isResetRoute = path.startsWith("/admin/reset-password");

  usePageTitle(isResetRoute ? "Reset Password — UTP Medtech Admin" : (adminTitles[path] ?? "Admin — UTP Medtech Club"));

  useEffect(() => {
    if (loading) return;

    if (!auth && path !== "/admin/login" && !isResetRoute) {
      window.location.hash = "#/admin/login";
    }
    if (auth && path === "/admin/login") {
      window.location.hash = "#/admin";
    }
  }, [auth, path, loading, isResetRoute]);

  /* Password reset page */
  if (isResetRoute) {
    return <ResetPasswordPage />;
  }

  if (!auth && !loading) {
    return <AdminLogin />;
  }

  if (loading) {
    return (
      <div className="adm-loading-page">
        <div className="adm-loading-spinner" />
        <p>Loading CMS…</p>
      </div>
    );
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
    content = <LandingEditor />;
  } else if (path === "/admin/about-content") {
    content = <AboutEditor />;
  } else if (path === "/admin/services") {
    content = <ServicesEditor />;
  } else if (path === "/admin/contact-content") {
    content = <ContactEditor />;
  } else if (path === "/admin/submissions") {
    content = <SubmissionsInbox />;
  } else {
    content = <Dashboard />;
  }

  return (
    <AdminLayout currentPath={path} userEmail={auth?.email ?? ""} onLogout={logout}>
      {content}
    </AdminLayout>
  );
}

/* ---------- Password Reset Page ---------- */

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  usePageTitle("Reset Password — UTP Medtech Admin");

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;

    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) {
        setReady(true);
        return;
      }
      const { data: listener } = supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_IN" || event === "PASSWORD_RECOVERY") {
          if (!cancelled) setReady(true);
        }
      });
      unsub = listener?.subscription.unsubscribe;
      setTimeout(() => {
        if (!cancelled) {
          setTimedOut(true);
          setError("Could not verify recovery link. Make sure you used the link from the email.");
        }
      }, 8000);
    };

    check();
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const { error: updateErr } = await supabase.auth.updateUser({ password });
      if (updateErr) {
        setError(updateErr.message);
      } else {
        setSuccess(true);
        setTimeout(() => { window.location.hash = "#/admin/login"; }, 3000);
      }
    } catch {
      setError("Failed to update password.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="adm-login-page">
        <div className="adm-login-right" style={{ width: "100%" }}>
          <div className="adm-login-right-inner" style={{ maxWidth: 440, margin: "0 auto", textAlign: "center" }}>
            <h1 className="adm-login-heading">Password Updated</h1>
            <p className="adm-login-desc">Your password has been reset successfully. Redirecting to login…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="adm-login-page">
      <div className="adm-login-right" style={{ width: "100%" }}>
        <div className="adm-login-right-bg" />
        <div className="adm-login-right-inner" style={{ maxWidth: 440, margin: "0 auto" }}>
          <img src="/medtech-logo.avif" alt="UTP Medtech Club" className="adm-login-logo" />
          <h1 className="adm-login-heading">
            {timedOut ? "Link Expired or Invalid" : "Set New Password"}
          </h1>
          <p className="adm-login-desc">
            {timedOut
              ? "The recovery link could not be verified. Please request a new one."
              : ready
                ? "Enter your new password below."
                : "Verifying recovery link\u2026"}
          </p>
          <div className="adm-login-card">
            {!ready && !timedOut ? (
              <div className="adm-lf-loading-msg">
                Verifying recovery link…
              </div>
            ) : timedOut ? (
              <>
                {error && <div className="adm-lf-error" role="alert">{error}</div>}
                <a href="#/admin/login" className="adm-lf-submit" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
                  Back to Sign In
                </a>
              </>
            ) : (
              <form className="adm-login-form" onSubmit={handleSubmit} noValidate>
                <div className="adm-lf-field">
                  <label htmlFor="reset-pass">New Password</label>
                  <div className="adm-lf-input-wrap">
                    <input
                      id="reset-pass"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <div className="adm-lf-field">
                  <label htmlFor="reset-confirm">Confirm Password</label>
                  <div className="adm-lf-input-wrap">
                    <input
                      id="reset-confirm"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                {error && <div className="adm-lf-error" role="alert">{error}</div>}
                <button type="submit" className="adm-lf-submit" disabled={submitting}>
                  {submitting ? "Updating…" : "Update Password"}
                </button>
              </form>
            )}
          </div>
          <footer className="adm-login-footer" style={{ textAlign: "center" }}>
            <a href="#/admin/login" className="adm-login-back">Back to sign in</a>
          </footer>
        </div>
      </div>
    </div>
  );
}
