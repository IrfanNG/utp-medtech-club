import { useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";
import { useCms } from "../cms/CmsContext";
import { usePageTitle } from "../shared";

const ADMIN_EMAIL = "admin@utpmedtech.club";

export function AdminLogin() {
  usePageTitle("Admin Login — UTP Medtech Club");
  const { login } = useCms();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* Password reset state */
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const ok = await login(email, password);
      if (ok) {
        window.location.hash = "#/admin";
      } else {
        setError("Invalid email or password, or you do not have admin access.");
      }
    } catch {
      setError("An error occurred during sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetLoading(true);
    setError("");
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(
        resetEmail.trim().toLowerCase(),
        { redirectTo: `${window.location.origin}/#/admin/reset-password` },
      );
      if (resetErr) {
        setError(resetErr.message);
      } else {
        setResetSent(true);
      }
    } catch {
      setError("Failed to send reset email.");
    } finally {
      setResetLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail(ADMIN_EMAIL);
    setPassword("");
    setError("");
  };

  if (resetMode) {
    return (
      <div className="adm-login-page">
        <div className="adm-login-left">
          <img
            src="/media/portfolio/portfolio-hero.jpg"
            alt=""
            className="adm-login-bg-img"
          />
          <div className="adm-login-left-overlay" />
          <div className="adm-login-left-content">
            <div className="adm-login-left-accent" />
            <div className="adm-login-left-text">
              <span className="adm-login-left-line">CONTENT THAT CONNECTS.</span>
              <span className="adm-login-left-line accent">IMPACT THAT LASTS.</span>
              <span className="adm-login-left-sub">UTP MedTech Club Content</span>
              <span className="adm-login-left-sub">Management System</span>
            </div>
          </div>
        </div>
        <div className="adm-login-right">
          <div className="adm-login-right-bg" />
          <div className="adm-login-right-inner">
            <img
              src="/medtech-logo.avif"
              alt="UTP Medtech Club"
              className="adm-login-logo"
            />
            <h1 className="adm-login-heading">Reset Password</h1>
            <p className="adm-login-desc">Enter your email to receive a reset link.</p>
            <div className="adm-login-card">
              {resetSent ? (
                <div className="adm-lf-success-msg" role="alert">
                  Check your email for a password reset link.
                </div>
              ) : (
                <form className="adm-login-form" onSubmit={handleResetPassword} noValidate>
                  <div className="adm-lf-field">
                    <label htmlFor="reset-email">Email Address</label>
                    <div className="adm-lf-input-wrap">
                      <input
                        id="reset-email"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="admin@utpmedtech.club"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  {error && <div className="adm-lf-error" role="alert">{error}</div>}
                  <button
                    type="submit"
                    className="adm-lf-submit"
                    disabled={resetLoading}
                  >
                    {resetLoading ? "Sending…" : "Send Reset Link"}
                  </button>
                </form>
              )}
              <button
                type="button"
                className="adm-lf-back-link"
                onClick={() => { setResetMode(false); setResetSent(false); setError(""); }}
              >
                Back to sign in
              </button>
            </div>
            <footer className="adm-login-footer">
              <span>&copy; 2026 UTP MedTech Club. All rights reserved.</span>
              <a href="#/" className="adm-login-back">Back to website</a>
            </footer>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="adm-login-page">
      <div className="adm-login-left">
        <img
          src="/media/portfolio/portfolio-hero.jpg"
          alt=""
          className="adm-login-bg-img"
        />
        <div className="adm-login-left-overlay" />
        <div className="adm-login-left-content">
          <div className="adm-login-left-accent" />
          <div className="adm-login-left-text">
            <span className="adm-login-left-line">CONTENT THAT CONNECTS.</span>
            <span className="adm-login-left-line accent">IMPACT THAT LASTS.</span>
            <span className="adm-login-left-sub">UTP MedTech Club Content</span>
            <span className="adm-login-left-sub">Management System</span>
          </div>
        </div>
      </div>

      <div className="adm-login-right">
        <div className="adm-login-right-bg" />
        <div className="adm-login-right-inner">
          <img
            src="/medtech-logo.avif"
            alt="UTP Medtech Club"
            className="adm-login-logo"
          />

          <h1 className="adm-login-heading">Welcome back!</h1>
          <p className="adm-login-desc">Sign in to access the UTP MedTech Club CMS</p>

          <div className="adm-login-card">
            <form className="adm-login-form" onSubmit={handleSubmit} noValidate>
              <div className="adm-lf-field">
                <label htmlFor="login-email">Email Address</label>
                <div className="adm-lf-input-wrap">
                  <svg className="adm-lf-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 4l-10 8L2 4" />
                  </svg>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@utpmedtech.club"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="adm-lf-field">
                <label htmlFor="login-pass">Password</label>
                <div className="adm-lf-input-wrap">
                  <svg className="adm-lf-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="login-pass"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="adm-lf-eye"
                    onClick={() => setShowPass((s) => !s)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="adm-lf-row">
                <label className="adm-lf-check">
                  <input type="checkbox" defaultChecked />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="adm-lf-forgot"
                  onClick={() => setResetMode(true)}
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <div className="adm-lf-error" role="alert">{error}</div>
              )}

              <button
                type="submit"
                className="adm-lf-submit"
                disabled={loading}
              >
                {loading ? "Signing in\u2026" : "Sign In"}
              </button>
            </form>
          </div>

          <div className="adm-login-demo">
            <button type="button" className="adm-login-demo-btn" onClick={fillDemo}>
              Use demo credentials
            </button>
            <span className="adm-login-demo-note">
              Authenticated via Supabase Auth — no demo password.
            </span>
          </div>

          <footer className="adm-login-footer">
            <span>&copy; 2026 UTP MedTech Club. All rights reserved.</span>
            <a href="#/" className="adm-login-back">Back to website</a>
          </footer>
        </div>
      </div>
    </div>
  );
}
