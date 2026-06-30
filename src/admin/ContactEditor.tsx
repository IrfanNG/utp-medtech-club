import { useState, useCallback } from "react";
import { useCms } from "../cms/CmsContext";
import { PageEditorLayout, TextField, ImagePicker, RepeatableSection } from "./PageEditorLayout";
import { safeParsePageContent, type ContactContent } from "../cms/pageSchemas";

type ContactTab = "hero" | "form" | "options";

export function ContactEditor() {
  const { pageContents, contactContent } = useCms();
  const draftRaw = pageContents.contact.draft?.content;
  const parsed = safeParsePageContent("contact", draftRaw ?? contactContent);
  const initial: ContactContent = parsed.success ? parsed.data : contactContent;
  const [content, setContent] = useState<ContactContent>(initial);
  const [activeTab, setActiveTab] = useState<ContactTab>("hero");
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({});

  const update = useCallback(<K extends keyof ContactContent>(key: K, value: ContactContent[K]) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateField = useCallback((fieldKey: string, patch: Partial<ContactContent["fields"][string]>) => {
    setContent((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldKey]: { ...prev.fields[fieldKey as keyof typeof prev.fields], ...patch },
      },
    }));
  }, []);

  return (
    <PageEditorLayout
      pageKey="contact"
      title="Contact Page Editor"
      draftContent={content}
      publishedContent={contactContent}
    >
      <div className="adm-editor-tabs" role="tablist" aria-label="Contact editor sections">
        <button type="button" className={`adm-editor-tab ${activeTab === "hero" ? "active" : ""}`} onClick={() => setActiveTab("hero")}>
          <span>Hero</span>
          <small>Top section and hero image</small>
        </button>
        <button type="button" className={`adm-editor-tab ${activeTab === "form" ? "active" : ""}`} onClick={() => setActiveTab("form")}>
          <span>Form</span>
          <small>Settings and field controls</small>
        </button>
        <button type="button" className={`adm-editor-tab ${activeTab === "options" ? "active" : ""}`} onClick={() => setActiveTab("options")}>
          <span>Options</span>
          <small>Dropdown and selection lists</small>
        </button>
      </div>

      <div className="adm-editor-tab-panel">
        {activeTab === "hero" && (
          <section className="adm-card adm-editor-card">
            <div className="adm-card-head">
              <div>
                <span className="adm-card-kicker">Contact page hero</span>
                <h3>Hero Section</h3>
              </div>
            </div>
            <div className="adm-editor-split">
              <div className="adm-editor-fields">
                <TextField label="Eyebrow" value={content.heroEyebrow} onChange={(v) => update("heroEyebrow", v)} />
                <TextField label="Title" value={content.heroTitle} onChange={(v) => update("heroTitle", v)} multiline rows={3} />
                <TextField label="Description" value={content.heroDescription} onChange={(v) => update("heroDescription", v)} multiline rows={4} />
              </div>
              <ImagePicker label="Hero Image" value={content.heroImage} onChange={(v) => update("heroImage", v)} featured />
            </div>
          </section>
        )}

        {activeTab === "form" && (
          <>
            <section className="adm-card adm-editor-card">
              <div className="adm-card-head">
                <div>
                  <span className="adm-card-kicker">Form content</span>
                  <h3>Form Settings</h3>
                </div>
              </div>
              <div className="adm-editor-split">
                <div className="adm-editor-fields">
                  <TextField label="Form Title" value={content.formTitle} onChange={(v) => update("formTitle", v)} />
                  <TextField label="Form Intro" value={content.formIntro} onChange={(v) => update("formIntro", v)} multiline rows={4} />
                  <TextField label="Success Message" value={content.successMessage} onChange={(v) => update("successMessage", v)} multiline rows={4} />
                </div>
                <ImagePicker label="Mascot Image" value={content.mascotImage} onChange={(v) => update("mascotImage", v)} featured />
              </div>
            </section>

            <section className="adm-card adm-editor-card adm-contact-editor">
              <div className="adm-card-head">
                <div>
                  <span className="adm-card-kicker">Field controls</span>
                  <h3>Form Fields</h3>
                </div>
                <p className="adm-card-sub">Adjust labels, placeholders, and visibility for each field.</p>
              </div>
              {Object.entries(content.fields).map(([key, field]) => (
                <div key={key} className="adm-contact-field-card">
                  <button
                    type="button"
                    className={`adm-repeatable-toggle ${expandedFields[key] ? "expanded" : ""}`}
                    onClick={() => setExpandedFields((prev) => ({ ...prev, [key]: !prev[key] }))}
                    aria-expanded={!!expandedFields[key]}
                  >
                    <div className="adm-repeatable-summary">
                      <strong>{key}</strong>
                      <span>{field.label || "No label"} · {field.enabled ? "Visible" : "Hidden"} · {field.required ? "Required" : "Optional"}</span>
                    </div>
                    <span className="adm-repeatable-chevron">{expandedFields[key] ? "−" : "+"}</span>
                  </button>
                  {expandedFields[key] && (
                    <>
                      <div className="adm-item-grid adm-contact-field-grid">
                        <TextField label={`Label (${key})`} value={field.label} onChange={(v) => updateField(key, { label: v })} />
                        <TextField label={`Placeholder (${key})`} value={field.placeholder} onChange={(v) => updateField(key, { placeholder: v })} />
                      </div>
                      <div className="adm-item-grid adm-contact-toggle-grid">
                        <div className="adm-field">
                          <label className="adm-field-label">Required</label>
                          <label className="adm-checkbox">
                            <input type="checkbox" checked={field.required} onChange={(e) => updateField(key, { required: e.target.checked })} />
                            <span>Required</span>
                          </label>
                        </div>
                        <div className="adm-field">
                          <label className="adm-field-label">Enabled</label>
                          <label className="adm-checkbox">
                            <input type="checkbox" checked={field.enabled} onChange={(e) => updateField(key, { enabled: e.target.checked })} />
                            <span>Visible on form</span>
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </section>
          </>
        )}

        {activeTab === "options" && (
          <>
            <section className="adm-card adm-editor-card">
              <RepeatableSection
                title="Request Types"
                items={content.requestTypes}
                addLabel="Add Option"
                collapsible
                getItemSummary={(t) => t || "Empty option"}
                onAdd={() => update("requestTypes", [...content.requestTypes, ""])}
                onRemove={(i) => update("requestTypes", content.requestTypes.filter((_, idx) => idx !== i))}
                onMove={(i, dir) => {
                  const next = [...content.requestTypes];
                  const t = next[i]; next[i] = next[i + dir]; next[i + dir] = t;
                  update("requestTypes", next);
                }}
                renderItem={(t, i) => (
                  <TextField label={`Option ${i + 1}`} value={t} onChange={(v) => { const next = [...content.requestTypes]; next[i] = v; update("requestTypes", next); }} />
                )}
              />
            </section>

            <section className="adm-card adm-editor-card">
              <RepeatableSection
                title="Hear About Options"
                items={content.hearAboutOptions}
                addLabel="Add Option"
                collapsible
                getItemSummary={(o) => o || "Empty option"}
                onAdd={() => update("hearAboutOptions", [...content.hearAboutOptions, ""])}
                onRemove={(i) => update("hearAboutOptions", content.hearAboutOptions.filter((_, idx) => idx !== i))}
                onMove={(i, dir) => {
                  const next = [...content.hearAboutOptions];
                  const t = next[i]; next[i] = next[i + dir]; next[i + dir] = t;
                  update("hearAboutOptions", next);
                }}
                renderItem={(o, i) => (
                  <TextField label={`Option ${i + 1}`} value={o} onChange={(v) => { const next = [...content.hearAboutOptions]; next[i] = v; update("hearAboutOptions", next); }} />
                )}
              />
            </section>

            <section className="adm-card adm-editor-card">
              <RepeatableSection
                title="Exemption Options"
                items={content.exemptionOptions}
                addLabel="Add Option"
                collapsible
                getItemSummary={(o) => o || "Empty option"}
                onAdd={() => update("exemptionOptions", [...content.exemptionOptions, ""])}
                onRemove={(i) => update("exemptionOptions", content.exemptionOptions.filter((_, idx) => idx !== i))}
                onMove={(i, dir) => {
                  const next = [...content.exemptionOptions];
                  const t = next[i]; next[i] = next[i + dir]; next[i + dir] = t;
                  update("exemptionOptions", next);
                }}
                renderItem={(o, i) => (
                  <TextField label={`Option ${i + 1}`} value={o} onChange={(v) => { const next = [...content.exemptionOptions]; next[i] = v; update("exemptionOptions", next); }} />
                )}
              />
            </section>
          </>
        )}
      </div>
    </PageEditorLayout>
  );
}
