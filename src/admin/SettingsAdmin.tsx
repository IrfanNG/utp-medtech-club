import { useState, type FormEvent } from "react";
import { useCms } from "../cms/CmsContext";
import { AdminIcon } from "./AdminIcons";
import { useToast } from "./AdminUI";

export function SettingsAdmin() {
  const { settings, updateSettings } = useCms();
  const { toast } = useToast();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail))
      errs.contactEmail = "Invalid email format";
    if (form.instagramUrl && !form.instagramUrl.startsWith("http")) errs.instagramUrl = "Must start with http";
    if (form.linkedinUrl && !form.linkedinUrl.startsWith("http")) errs.linkedinUrl = "Must start with http";
    if (form.youtubeUrl && !form.youtubeUrl.startsWith("http")) errs.youtubeUrl = "Must start with http";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      await updateSettings(form);
      toast("Settings saved", "success");
    } catch {
      toast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="adm-page">
      <div className="adm-page-head">
        <div>
          <h1>Settings</h1>
          <p>Configure your website's global settings.</p>
        </div>
      </div>

      <form className="adm-form adm-settings-form" onSubmit={handleSubmit} noValidate>
        <div className="adm-card adm-settings-section">
          <div className="adm-card-head">
            <h3>General</h3>
          </div>
          <div className="adm-form-row">
            <div className="adm-form-field">
              <label htmlFor="sf-title">Website Title <span className="adm-req">*</span></label>
              <input
                id="sf-title"
                type="text"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                aria-invalid={!!errors.title}
              />
              {errors.title && <span className="adm-field-error">{errors.title}</span>}
            </div>
            <div className="adm-form-field">
              <label htmlFor="sf-tagline">Tagline</label>
              <input
                id="sf-tagline"
                type="text"
                value={form.tagline}
                onChange={(e) => set("tagline", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="adm-card adm-settings-section">
          <div className="adm-card-head">
            <h3>Contact Information</h3>
          </div>
          <div className="adm-form-row">
            <div className="adm-form-field">
              <label htmlFor="sf-email">Contact Email</label>
              <input
                id="sf-email"
                type="email"
                value={form.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
                aria-invalid={!!errors.contactEmail}
              />
              {errors.contactEmail && <span className="adm-field-error">{errors.contactEmail}</span>}
            </div>
            <div className="adm-form-field">
              <label htmlFor="sf-phone">Phone Number</label>
              <input
                id="sf-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
          </div>
          <div className="adm-form-field">
            <label htmlFor="sf-address">Address</label>
            <textarea
              id="sf-address"
              rows={2}
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>
        </div>

        <div className="adm-card adm-settings-section">
          <div className="adm-card-head">
            <h3>Social Media</h3>
          </div>
          {(["instagramUrl", "linkedinUrl", "youtubeUrl"] as const).map((key) => {
            const labels: Record<string, string> = {
              instagramUrl: "Instagram URL",
              linkedinUrl: "LinkedIn URL",
              youtubeUrl: "YouTube URL",
            };
            return (
              <div className="adm-form-field" key={key}>
                <label htmlFor={`sf-${key}`}>{labels[key]}</label>
                <input
                  id={`sf-${key}`}
                  type="url"
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder="https://…"
                  aria-invalid={!!errors[key]}
                />
                {errors[key] && <span className="adm-field-error">{errors[key]}</span>}
              </div>
            );
          })}
        </div>

        <div className="adm-settings-actions">
          <a href="#/" className="adm-btn adm-btn-outline">
            <AdminIcon.eye size={18} /> Preview Site
          </a>
          <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
