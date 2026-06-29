import { useState, useCallback } from "react";
import { useCms } from "../cms/CmsContext";
import { PageEditorLayout, TextField, ImagePicker, RepeatableSection } from "./PageEditorLayout";
import { safeParsePageContent, type ServicesContent } from "../cms/pageSchemas";

export function ServicesEditor() {
  const { pageContents, servicesContent } = useCms();
  const draftRaw = pageContents.services.draft?.content;
  const parsed = safeParsePageContent("services", draftRaw ?? servicesContent);
  const initial: ServicesContent = parsed.success ? parsed.data : servicesContent;
  const [content, setContent] = useState<ServicesContent>(initial);

  const update = useCallback(<K extends keyof ServicesContent>(key: K, value: ServicesContent[K]) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <PageEditorLayout
      pageKey="services"
      title="Services Editor"
      draftContent={content}
      publishedContent={servicesContent}
    >
      <section className="adm-card adm-editor-card">
        <div className="adm-card-head">
          <div>
            <span className="adm-card-kicker">Services page intro</span>
            <h3>Section Headings</h3>
          </div>
          <p className="adm-card-sub">These appear above the service cards on the public services section.</p>
        </div>
        <div className="adm-form-grid-2">
          <TextField label="Eyebrow" value={content.eyebrow} onChange={(v) => update("eyebrow", v)} />
          <TextField label="Heading" value={content.heading} onChange={(v) => update("heading", v)} />
        </div>
      </section>

      <section className="adm-card adm-editor-card adm-service-editor">
        <RepeatableSection
          title="Services"
          items={content.services}
          addLabel="Add Service"
          collapsible
          getItemSummary={(s) => `${s.title || "Untitled service"} · ${s.visible ? "Visible" : "Hidden"}`}
          onAdd={() => update("services", [...content.services, { title: "", desc: "", images: ["", ""], alt: "", visible: true, order: content.services.length, detailTitle: "", detailBody: "", detailGallery: [], detailHighlights: [], detailCta: "", detailVideo: "" }])}
          onRemove={(i) => update("services", content.services.filter((_, idx) => idx !== i))}
          onMove={(i, dir) => {
            const next = [...content.services];
            const t = next[i]; next[i] = next[i + dir]; next[i + dir] = t;
            update("services", next.map((s, idx) => ({ ...s, order: idx })));
          }}
          renderItem={(s, i) => (
            <div className="adm-service-item">
              <div className="adm-item-grid adm-service-meta">
                <TextField label="Title" value={s.title} onChange={(v) => { const next = [...content.services]; next[i] = { ...s, title: v }; update("services", next); }} />
                <div className="adm-field">
                  <label className="adm-field-label">Visible</label>
                  <label className="adm-checkbox adm-service-visibility">
                    <input
                      type="checkbox"
                      checked={s.visible}
                      onChange={(e) => { const next = [...content.services]; next[i] = { ...s, visible: e.target.checked }; update("services", next); }}
                    />
                    <span>Show on site</span>
                  </label>
                </div>
              </div>
              <TextField label="Description" value={s.desc} onChange={(v) => { const next = [...content.services]; next[i] = { ...s, desc: v }; update("services", next); }} multiline />
              <TextField label="Alt Text" value={s.alt} onChange={(v) => { const next = [...content.services]; next[i] = { ...s, alt: v }; update("services", next); }} />
              <div className="adm-item-grid adm-service-images">
                <ImagePicker label="Image 1" value={s.images[0]} onChange={(v) => { const next = [...content.services]; next[i] = { ...s, images: [v, s.images[1]] }; update("services", next); }} />
                <ImagePicker label="Image 2" value={s.images[1]} onChange={(v) => { const next = [...content.services]; next[i] = { ...s, images: [s.images[0], v] }; update("services", next); }} />
              </div>

              <div className="adm-detail-divider">
                <span>Modal Detail Content</span>
              </div>

              <TextField label="Detail Title" value={s.detailTitle} onChange={(v) => { const next = [...content.services]; next[i] = { ...s, detailTitle: v }; update("services", next); }} />
              <TextField label="Detail Body" value={s.detailBody} onChange={(v) => { const next = [...content.services]; next[i] = { ...s, detailBody: v }; update("services", next); }} multiline rows={4} placeholder="Long-form description shown in the service detail modal" />

              <RepeatableSection
                title="Detail Gallery Images"
                items={s.detailGallery}
                addLabel="Add Image"
                onAdd={() => { const next = [...content.services]; next[i] = { ...s, detailGallery: [...s.detailGallery, ""] }; update("services", next); }}
                onRemove={(j) => { const next = [...content.services]; next[i] = { ...s, detailGallery: s.detailGallery.filter((_, idx) => idx !== j) }; update("services", next); }}
                onMove={(j, dir) => {
                  const next = [...content.services];
                  const arr = [...s.detailGallery];
                  const t = arr[j]; arr[j] = arr[j + dir]; arr[j + dir] = t;
                  next[i] = { ...s, detailGallery: arr };
                  update("services", next);
                }}
                renderItem={(img, j) => (
                  <ImagePicker label={`Image ${j + 1}`} value={img} onChange={(v) => {
                    const next = [...content.services];
                    const arr = [...s.detailGallery];
                    arr[j] = v;
                    next[i] = { ...s, detailGallery: arr };
                    update("services", next);
                  }} />
                )}
              />

              <RepeatableSection
                title="Detail Highlights"
                items={s.detailHighlights}
                addLabel="Add Highlight"
                onAdd={() => { const next = [...content.services]; next[i] = { ...s, detailHighlights: [...s.detailHighlights, ""] }; update("services", next); }}
                onRemove={(j) => { const next = [...content.services]; next[i] = { ...s, detailHighlights: s.detailHighlights.filter((_, idx) => idx !== j) }; update("services", next); }}
                onMove={(j, dir) => {
                  const next = [...content.services];
                  const arr = [...s.detailHighlights];
                  const t = arr[j]; arr[j] = arr[j + dir]; arr[j + dir] = t;
                  next[i] = { ...s, detailHighlights: arr };
                  update("services", next);
                }}
                renderItem={(hl, j) => (
                  <TextField label={`Highlight ${j + 1}`} value={hl} onChange={(v) => {
                    const next = [...content.services];
                    const arr = [...s.detailHighlights];
                    arr[j] = v;
                    next[i] = { ...s, detailHighlights: arr };
                    update("services", next);
                  }} />
                )}
              />

              <div className="adm-item-grid adm-service-meta">
                <TextField label="Detail CTA" value={s.detailCta} onChange={(v) => { const next = [...content.services]; next[i] = { ...s, detailCta: v }; update("services", next); }} placeholder="e.g. Book a Session" />
                <TextField label="Detail Video URL" value={s.detailVideo} onChange={(v) => { const next = [...content.services]; next[i] = { ...s, detailVideo: v }; update("services", next); }} placeholder="https://…" />
              </div>
            </div>
          )}
        />
      </section>
    </PageEditorLayout>
  );
}
