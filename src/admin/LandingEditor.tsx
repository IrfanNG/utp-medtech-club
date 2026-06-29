import { useCallback, useState } from "react";
import { useCms } from "../cms/CmsContext";
import { PageEditorLayout, TextField, ImagePicker, RepeatableSection } from "./PageEditorLayout";
import { safeParsePageContent, type LandingContent } from "../cms/pageSchemas";

type EditorTab = "content" | "highlights" | "cta";

const tabs: Array<{ id: EditorTab; label: string; description: string }> = [
  { id: "content", label: "Main Content", description: "Hero, section titles and Why Choose Us" },
  { id: "highlights", label: "Highlights", description: "Statistics, features and testimonials" },
  { id: "cta", label: "Final CTA", description: "Closing message and campaign image" },
];

export function LandingEditor() {
  const { pageContents, landingContent } = useCms();
  const draftRaw = pageContents.landing.draft?.content;
  const parsed = safeParsePageContent("landing", draftRaw ?? landingContent);
  const initial: LandingContent = parsed.success ? parsed.data : landingContent;
  const [content, setContent] = useState<LandingContent>(initial);
  const [activeTab, setActiveTab] = useState<EditorTab>("content");

  const update = useCallback(<K extends keyof LandingContent>(key: K, value: LandingContent[K]) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <PageEditorLayout
      pageKey="landing"
      title="Landing Page Editor"
      draftContent={content}
      publishedContent={landingContent}
    >
      <div className="adm-editor-tabs" role="tablist" aria-label="Landing page editor sections">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`landing-tab-${tab.id}`}
            className={`adm-editor-tab ${activeTab === tab.id ? "active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`landing-panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.label}</span>
            <small>{tab.description}</small>
          </button>
        ))}
      </div>

      <div
        id={`landing-panel-${activeTab}`}
        className="adm-editor-tab-panel"
        role="tabpanel"
        aria-labelledby={`landing-tab-${activeTab}`}
      >
        {activeTab === "content" && (
          <>
            <section className="adm-card adm-editor-card">
              <div className="adm-card-head">
                <div>
                  <span className="adm-card-kicker">Above the fold</span>
                  <h3>Hero Section</h3>
                </div>
              </div>
              <div className="adm-editor-split">
                <div className="adm-editor-fields">
                  <TextField label="Eyebrow label" value={content.hero.eyebrow} onChange={(v) => update("hero", { ...content.hero, eyebrow: v })} />
                  <TextField label="Main title" value={content.hero.title} onChange={(v) => update("hero", { ...content.hero, title: v })} />
                  <TextField label="Description" value={content.hero.description} onChange={(v) => update("hero", { ...content.hero, description: v })} multiline rows={4} />
                </div>
                <ImagePicker label="Hero image" value={content.hero.image} onChange={(v) => update("hero", { ...content.hero, image: v })} featured />
              </div>
            </section>

            <section className="adm-card adm-editor-card">
              <div className="adm-card-head">
                <div>
                  <span className="adm-card-kicker">Landing navigation</span>
                  <h3>Section Headings</h3>
                </div>
                <p className="adm-card-sub">These labels appear directly on the public landing page.</p>
              </div>
              <div className="adm-heading-groups">
                <div className="adm-heading-group">
                  <strong>Clients</strong>
                  <TextField label="Strip heading" value={content.clientStripHeading} onChange={(v) => update("clientStripHeading", v)} />
                </div>
                <div className="adm-heading-group">
                  <strong>Services</strong>
                  <div className="adm-form-grid-2">
                    <TextField label="Eyebrow" value={content.servicesEyebrow} onChange={(v) => update("servicesEyebrow", v)} />
                    <TextField label="Heading" value={content.servicesHeading} onChange={(v) => update("servicesHeading", v)} />
                  </div>
                </div>
                <div className="adm-heading-group">
                  <strong>Projects</strong>
                  <div className="adm-form-grid-2">
                    <TextField label="Eyebrow" value={content.projectsEyebrow} onChange={(v) => update("projectsEyebrow", v)} />
                    <TextField label="Heading" value={content.projectsHeading} onChange={(v) => update("projectsHeading", v)} />
                  </div>
                </div>
                <div className="adm-heading-group">
                  <strong>Testimonials</strong>
                  <div className="adm-form-grid-2">
                    <TextField label="Eyebrow" value={content.testimonialsEyebrow} onChange={(v) => update("testimonialsEyebrow", v)} />
                    <TextField label="Heading" value={content.testimonialsHeading} onChange={(v) => update("testimonialsHeading", v)} />
                  </div>
                </div>
              </div>
            </section>

            <section className="adm-card adm-editor-card">
              <div className="adm-card-head">
                <div>
                  <span className="adm-card-kicker">Trust section</span>
                  <h3>Why Choose Us</h3>
                </div>
              </div>
              <div className="adm-editor-split">
                <div className="adm-editor-fields">
                  <TextField label="Eyebrow" value={content.whyEyebrow} onChange={(v) => update("whyEyebrow", v)} />
                  <TextField label="Heading" value={content.whyHeading} onChange={(v) => update("whyHeading", v)} />
                  <TextField label="Description" value={content.whyDescription} onChange={(v) => update("whyDescription", v)} multiline rows={4} />
                </div>
                <ImagePicker label="Section image" value={content.whyImage} onChange={(v) => update("whyImage", v)} featured />
              </div>
            </section>
          </>
        )}

        {activeTab === "highlights" && (
          <div className="adm-editor-stack">
            <section className="adm-card adm-editor-card">
              <RepeatableSection
                title="Statistics"
                items={content.stats}
                addLabel="Add statistic"
                onAdd={() => update("stats", [...content.stats, { num: "", plus: "+", label: "" }])}
                onRemove={(i) => update("stats", content.stats.filter((_, idx) => idx !== i))}
                onMove={(i, dir) => {
                  const next = [...content.stats];
                  const target = i + dir;
                  [next[i], next[target]] = [next[target], next[i]];
                  update("stats", next);
                }}
                renderItem={(stat, i) => (
                  <div className="adm-item-grid adm-stat-fields">
                    <TextField label="Number" value={stat.num} onChange={(v) => { const next = [...content.stats]; next[i] = { ...stat, num: v }; update("stats", next); }} />
                    <TextField label="Suffix" value={stat.plus} onChange={(v) => { const next = [...content.stats]; next[i] = { ...stat, plus: v }; update("stats", next); }} />
                    <TextField label="Label" value={stat.label} onChange={(v) => { const next = [...content.stats]; next[i] = { ...stat, label: v }; update("stats", next); }} />
                  </div>
                )}
              />
            </section>

            <section className="adm-card adm-editor-card">
              <RepeatableSection
                title="Features"
                items={content.features}
                addLabel="Add feature"
                onAdd={() => update("features", [...content.features, { title: "", desc: "" }])}
                onRemove={(i) => update("features", content.features.filter((_, idx) => idx !== i))}
                onMove={(i, dir) => {
                  const next = [...content.features];
                  const target = i + dir;
                  [next[i], next[target]] = [next[target], next[i]];
                  update("features", next);
                }}
                renderItem={(feature, i) => (
                  <div className="adm-item-grid adm-feature-fields">
                    <TextField label="Title" value={feature.title} onChange={(v) => { const next = [...content.features]; next[i] = { ...feature, title: v }; update("features", next); }} />
                    <TextField label="Description" value={feature.desc} onChange={(v) => { const next = [...content.features]; next[i] = { ...feature, desc: v }; update("features", next); }} multiline rows={2} />
                  </div>
                )}
              />
            </section>

            <section className="adm-card adm-editor-card">
              <RepeatableSection
                title="Testimonials"
                items={content.testimonials}
                addLabel="Add testimonial"
                onAdd={() => update("testimonials", [...content.testimonials, { quote: "", name: "", role: "", initials: "" }])}
                onRemove={(i) => update("testimonials", content.testimonials.filter((_, idx) => idx !== i))}
                onMove={(i, dir) => {
                  const next = [...content.testimonials];
                  const target = i + dir;
                  [next[i], next[target]] = [next[target], next[i]];
                  update("testimonials", next);
                }}
                renderItem={(testimonial, i) => (
                  <div className="adm-testimonial-fields">
                    <TextField label="Quote" value={testimonial.quote} onChange={(v) => { const next = [...content.testimonials]; next[i] = { ...testimonial, quote: v }; update("testimonials", next); }} multiline rows={2} />
                    <div className="adm-item-grid adm-testimonial-meta">
                      <TextField label="Name" value={testimonial.name} onChange={(v) => { const next = [...content.testimonials]; next[i] = { ...testimonial, name: v }; update("testimonials", next); }} />
                      <TextField label="Position / role" value={testimonial.role} onChange={(v) => { const next = [...content.testimonials]; next[i] = { ...testimonial, role: v }; update("testimonials", next); }} />
                      <TextField label="Initials" value={testimonial.initials} onChange={(v) => { const next = [...content.testimonials]; next[i] = { ...testimonial, initials: v }; update("testimonials", next); }} />
                    </div>
                  </div>
                )}
              />
            </section>
          </div>
        )}

        {activeTab === "cta" && (
          <section className="adm-card adm-editor-card">
            <div className="adm-card-head">
              <div>
                <span className="adm-card-kicker">Closing section</span>
                <h3>Final Call to Action</h3>
              </div>
            </div>
            <div className="adm-editor-split adm-cta-editor">
              <div className="adm-editor-fields">
                <TextField label="CTA title" value={content.cta.title} onChange={(v) => update("cta", { ...content.cta, title: v })} multiline rows={3} />
                <p className="adm-field-help">Buttons continue to use the existing Contact and Portfolio links.</p>
              </div>
              <ImagePicker label="Background image" value={content.cta.image} onChange={(v) => update("cta", { ...content.cta, image: v })} featured />
            </div>
          </section>
        )}
      </div>
    </PageEditorLayout>
  );
}
