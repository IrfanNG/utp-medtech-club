import { useState, useCallback } from "react";
import { useCms } from "../cms/CmsContext";
import { PageEditorLayout, TextField, ImagePicker, RepeatableSection } from "./PageEditorLayout";
import { safeParsePageContent, type AboutContent } from "../cms/pageSchemas";

type AboutTab = "hero" | "story" | "gallery_team";

export function AboutEditor() {
  const { pageContents, aboutContent } = useCms();
  const draftRaw = pageContents.about.draft?.content;
  const parsed = safeParsePageContent("about", draftRaw ?? aboutContent);
  const initial: AboutContent = parsed.success ? parsed.data : aboutContent;
  const [content, setContent] = useState<AboutContent>(initial);
  const [activeTab, setActiveTab] = useState<AboutTab>("hero");

  const update = useCallback(<K extends keyof AboutContent>(key: K, value: AboutContent[K]) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <PageEditorLayout
      pageKey="about"
      title="About Us Editor"
      draftContent={content}
      publishedContent={aboutContent}
    >
      <div className="adm-editor-tabs" role="tablist" aria-label="About editor sections">
        <button type="button" className={`adm-editor-tab ${activeTab === "hero" ? "active" : ""}`} onClick={() => setActiveTab("hero")}>
          <span>Hero</span>
          <small>Top section and featured image</small>
        </button>
        <button type="button" className={`adm-editor-tab ${activeTab === "story" ? "active" : ""}`} onClick={() => setActiveTab("story")}>
          <span>Story</span>
          <small>Introduction and philosophy</small>
        </button>
        <button type="button" className={`adm-editor-tab ${activeTab === "gallery_team" ? "active" : ""}`} onClick={() => setActiveTab("gallery_team")}>
          <span>Gallery & Team</span>
          <small>Images and people</small>
        </button>
      </div>

      <div className="adm-editor-tab-panel">
        {activeTab === "hero" && (
          <section className="adm-card adm-editor-card">
            <div className="adm-card-head">
              <div>
                <span className="adm-card-kicker">About page hero</span>
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

        {activeTab === "story" && (
          <>
            <section className="adm-card adm-editor-card">
              <div className="adm-card-head">
                <div>
                  <span className="adm-card-kicker">Brand story</span>
                  <h3>Introduction</h3>
                </div>
              </div>
              <div className="adm-form-grid-2">
                <TextField label="Eyebrow" value={content.introEyebrow} onChange={(v) => update("introEyebrow", v)} />
                <TextField label="Title" value={content.introTitle} onChange={(v) => update("introTitle", v)} />
              </div>
              <RepeatableSection
                title="Paragraphs"
                items={content.introParagraphs}
                addLabel="Add Paragraph"
                collapsible
                getItemSummary={(p, i) => `Paragraph ${i + 1} · ${p.slice(0, 60) || "Empty paragraph"}`}
                onAdd={() => update("introParagraphs", [...content.introParagraphs, ""])}
                onRemove={(i) => update("introParagraphs", content.introParagraphs.filter((_, idx) => idx !== i))}
                onMove={(i, dir) => {
                  const next = [...content.introParagraphs];
                  const t = next[i]; next[i] = next[i + dir]; next[i + dir] = t;
                  update("introParagraphs", next);
                }}
                renderItem={(p, i) => (
                  <TextField label={`Paragraph ${i + 1}`} value={p} onChange={(v) => { const next = [...content.introParagraphs]; next[i] = v; update("introParagraphs", next); }} multiline />
                )}
              />
            </section>

            <section className="adm-card adm-editor-card">
              <div className="adm-card-head">
                <div>
                  <span className="adm-card-kicker">Core values</span>
                  <h3>Philosophy</h3>
                </div>
              </div>
              <div className="adm-form-grid-2">
                <TextField label="Eyebrow" value={content.philosophyEyebrow} onChange={(v) => update("philosophyEyebrow", v)} />
                <TextField label="Title" value={content.philosophyTitle} onChange={(v) => update("philosophyTitle", v)} />
              </div>
              <RepeatableSection
                title="Paragraphs"
                items={content.philosophyParagraphs}
                addLabel="Add Paragraph"
                collapsible
                getItemSummary={(p, i) => `Paragraph ${i + 1} · ${p.slice(0, 60) || "Empty paragraph"}`}
                onAdd={() => update("philosophyParagraphs", [...content.philosophyParagraphs, ""])}
                onRemove={(i) => update("philosophyParagraphs", content.philosophyParagraphs.filter((_, idx) => idx !== i))}
                onMove={(i, dir) => {
                  const next = [...content.philosophyParagraphs];
                  const t = next[i]; next[i] = next[i + dir]; next[i + dir] = t;
                  update("philosophyParagraphs", next);
                }}
                renderItem={(p, i) => (
                  <TextField label={`Paragraph ${i + 1}`} value={p} onChange={(v) => { const next = [...content.philosophyParagraphs]; next[i] = v; update("philosophyParagraphs", next); }} multiline />
                )}
              />
            </section>
          </>
        )}

        {activeTab === "gallery_team" && (
          <>
            <section className="adm-card adm-editor-card adm-about-editor">
              <RepeatableSection
                title="Gallery Items"
                items={content.gallery}
                addLabel="Add Item"
                collapsible
                getItemSummary={(g) => `${g.label || "Untitled item"} · ${g.span === "wide" ? "Wide" : "Standard"}`}
                onAdd={() => update("gallery", [...content.gallery, { span: "", label: "", img: "", alt: "", slug: "", detailTitle: "", detailBody: "", detailGallery: [], detailVideo: "", detailCategory: "", detailDate: "", detailLocation: "" }])}
                onRemove={(i) => update("gallery", content.gallery.filter((_, idx) => idx !== i))}
                onMove={(i, dir) => {
                  const next = [...content.gallery];
                  const t = next[i]; next[i] = next[i + dir]; next[i + dir] = t;
                  update("gallery", next);
                }}
                renderItem={(g, i) => (
                  <div className="adm-about-item">
                    <div className="adm-item-grid adm-about-meta">
                      <TextField label="Label" value={g.label} onChange={(v) => { const next = [...content.gallery]; next[i] = { ...g, label: v }; update("gallery", next); }} />
                      <TextField label="Alt" value={g.alt} onChange={(v) => { const next = [...content.gallery]; next[i] = { ...g, alt: v }; update("gallery", next); }} />
                    </div>
                    <div className="adm-item-grid adm-about-gallery">
                      <div className="adm-field">
                        <label className="adm-field-label">Span</label>
                        <select className="adm-input" value={g.span} onChange={(e) => { const next = [...content.gallery]; next[i] = { ...g, span: e.target.value as "" | "wide" }; update("gallery", next); }}>
                          <option value="">Standard</option>
                          <option value="wide">Wide</option>
                        </select>
                      </div>
                      <ImagePicker label="Image" value={g.img} onChange={(v) => { const next = [...content.gallery]; next[i] = { ...g, img: v }; update("gallery", next); }} />
                    </div>

                    <div className="adm-detail-divider">
                      <span>Program Detail Page</span>
                    </div>

                    <div className="adm-item-grid adm-about-meta">
                      <TextField label="Slug (URL)" value={g.slug} onChange={(v) => { const next = [...content.gallery]; next[i] = { ...g, slug: v }; update("gallery", next); }} placeholder="auto-from-label" />
                      <TextField label="Detail Title" value={g.detailTitle} onChange={(v) => { const next = [...content.gallery]; next[i] = { ...g, detailTitle: v }; update("gallery", next); }} />
                    </div>
                    <TextField label="Detail Body" value={g.detailBody} onChange={(v) => { const next = [...content.gallery]; next[i] = { ...g, detailBody: v }; update("gallery", next); }} multiline rows={4} placeholder="Long-form description shown on the program detail page" />
                    <div className="adm-item-grid adm-about-meta">
                      <TextField label="Category" value={g.detailCategory} onChange={(v) => { const next = [...content.gallery]; next[i] = { ...g, detailCategory: v }; update("gallery", next); }} />
                      <TextField label="Date" value={g.detailDate} onChange={(v) => { const next = [...content.gallery]; next[i] = { ...g, detailDate: v }; update("gallery", next); }} />
                      <TextField label="Location" value={g.detailLocation} onChange={(v) => { const next = [...content.gallery]; next[i] = { ...g, detailLocation: v }; update("gallery", next); }} />
                    </div>
                    <RepeatableSection
                      title="Detail Gallery Images"
                      items={g.detailGallery}
                      addLabel="Add Image"
                      onAdd={() => { const next = [...content.gallery]; next[i] = { ...g, detailGallery: [...g.detailGallery, ""] }; update("gallery", next); }}
                      onRemove={(j) => { const next = [...content.gallery]; next[i] = { ...g, detailGallery: g.detailGallery.filter((_, idx) => idx !== j) }; update("gallery", next); }}
                      onMove={(j, dir) => {
                        const next = [...content.gallery];
                        const arr = [...g.detailGallery];
                        const t = arr[j]; arr[j] = arr[j + dir]; arr[j + dir] = t;
                        next[i] = { ...g, detailGallery: arr };
                        update("gallery", next);
                      }}
                      renderItem={(img, j) => (
                        <ImagePicker label={`Image ${j + 1}`} value={img} onChange={(v) => {
                          const next = [...content.gallery];
                          const arr = [...g.detailGallery];
                          arr[j] = v;
                          next[i] = { ...g, detailGallery: arr };
                          update("gallery", next);
                        }} />
                      )}
                    />
                    <TextField label="Detail Video URL" value={g.detailVideo} onChange={(v) => { const next = [...content.gallery]; next[i] = { ...g, detailVideo: v }; update("gallery", next); }} placeholder="https://…" />
                  </div>
                )}
              />
            </section>

            <section className="adm-card adm-editor-card adm-about-editor">
              <div className="adm-card-head">
                <div>
                  <span className="adm-card-kicker">People & leadership</span>
                  <h3>Team</h3>
                </div>
              </div>
              <div className="adm-form-grid-2">
                <TextField label="Eyebrow" value={content.teamEyebrow} onChange={(v) => update("teamEyebrow", v)} />
                <TextField label="Heading" value={content.teamHeading} onChange={(v) => update("teamHeading", v)} />
              </div>
              <RepeatableSection
                title="Team Members"
                items={content.team}
                addLabel="Add Member"
                collapsible
                getItemSummary={(m) => `${m.name || "Unnamed member"} · ${m.role || "No role"}`}
                onAdd={() => update("team", [...content.team, { name: "", role: "", dept: "", img: "", tier: 3 }])}
                onRemove={(i) => update("team", content.team.filter((_, idx) => idx !== i))}
                onMove={(i, dir) => {
                  const next = [...content.team];
                  const t = next[i]; next[i] = next[i + dir]; next[i + dir] = t;
                  update("team", next);
                }}
                renderItem={(m, i) => (
                  <div className="adm-about-item">
                    <div className="adm-item-grid adm-about-meta">
                      <TextField label="Name" value={m.name} onChange={(v) => { const next = [...content.team]; next[i] = { ...m, name: v }; update("team", next); }} />
                      <TextField label="Role" value={m.role} onChange={(v) => { const next = [...content.team]; next[i] = { ...m, role: v }; update("team", next); }} />
                    </div>
                    <div className="adm-item-grid adm-about-meta">
                      <TextField label="Department" value={m.dept} onChange={(v) => { const next = [...content.team]; next[i] = { ...m, dept: v }; update("team", next); }} />
                      <div className="adm-field">
                        <label className="adm-field-label">Tier</label>
                        <select className="adm-input" value={m.tier} onChange={(e) => { const next = [...content.team]; next[i] = { ...m, tier: Number(e.target.value) }; update("team", next); }}>
                          <option value={0}>0 — Manager</option>
                          <option value={1}>1 — President</option>
                          <option value={2}>2 — Vice President</option>
                          <option value={3}>3 — Member</option>
                        </select>
                      </div>
                    </div>
                    <ImagePicker label="Photo" value={m.img} onChange={(v) => { const next = [...content.team]; next[i] = { ...m, img: v }; update("team", next); }} />
                  </div>
                )}
              />
            </section>
          </>
        )}
      </div>
    </PageEditorLayout>
  );
}
