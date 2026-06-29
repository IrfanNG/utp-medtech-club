import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useCms } from "../cms/CmsContext";
import { useToast } from "./AdminUI";
import { AdminIcon } from "./AdminIcons";
import type { PageKey } from "../cms/types";
import { safeParsePageContent } from "../cms/pageSchemas";

interface PageEditorLayoutProps {
  pageKey: PageKey;
  title: string;
  children: ReactNode;
  draftContent: unknown;
  publishedContent?: unknown;
}

export function PageEditorLayout({ pageKey, title, children, draftContent }: PageEditorLayoutProps) {
  const { savePageDraft, publishPage, pageContents } = useCms();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);
  const baselineRef = useRef(JSON.stringify(draftContent));
  const serializedDraft = JSON.stringify(draftContent);

  const draftRow = pageContents[pageKey]?.draft;
  const publishedRow = pageContents[pageKey]?.published;

  const handleSaveDraft = useCallback(async () => {
    setSaving(true);
    try {
      const parsed = safeParsePageContent(pageKey, draftContent);
      if (!parsed.success) {
        toast(`Validation error: ${parsed.error}`, "error");
        return;
      }
      await savePageDraft(pageKey, parsed.data);
      baselineRef.current = JSON.stringify(parsed.data);
      setDirty(false);
      dirtyRef.current = false;
      toast("Draft saved successfully", "success");
    } catch {
      toast("Failed to save draft", "error");
    } finally {
      setSaving(false);
    }
  }, [pageKey, draftContent, savePageDraft, toast]);

  const handlePublish = useCallback(async () => {
    setPublishing(true);
    try {
      const parsed = safeParsePageContent(pageKey, draftContent);
      if (!parsed.success) {
        toast(`Validation error: ${parsed.error}`, "error");
        setPublishing(false);
        return;
      }
      await savePageDraft(pageKey, parsed.data);
      await publishPage(pageKey);
      baselineRef.current = JSON.stringify(parsed.data);
      setDirty(false);
      dirtyRef.current = false;
      toast("Page published successfully", "success");
    } catch {
      toast("Failed to publish page", "error");
    } finally {
      setPublishing(false);
    }
  }, [pageKey, draftContent, savePageDraft, publishPage, toast]);

  const handlePreview = useCallback(() => {
    window.open(`#/admin/preview/${pageKey}`, "_blank");
  }, [pageKey]);

  useEffect(() => {
    setDirty(serializedDraft !== baselineRef.current);
  }, [serializedDraft]);

  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const formatDate = (ts: number | undefined) => {
    if (!ts) return "Never";
    return new Date(ts).toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short" });
  };

  return (
    <div className="adm-page">
      <div className="adm-page-head adm-editor-page-head">
        <div className="adm-editor-title">
          <div className="adm-editor-heading-row">
            <h1>{title}</h1>
            <span className={`adm-save-state ${dirty ? "dirty" : "saved"}`}>
              {dirty ? "Unsaved changes" : "All changes saved"}
            </span>
          </div>
          <p className="adm-editor-timestamps">
            Draft {formatDate(draftRow?.updatedAt)} <span>·</span> Published {formatDate(publishedRow?.updatedAt)}
          </p>
        </div>
        <div className="adm-editor-actions">
          <button type="button" className="adm-btn adm-btn-ghost" onClick={handlePreview} disabled={saving || publishing}>
            <AdminIcon.eye size={16} /> Preview Draft
          </button>
          <button type="button" className="adm-btn adm-btn-outline" onClick={handleSaveDraft} disabled={saving || publishing || !dirty}>
            {saving ? "Saving…" : "Save Draft"}
          </button>
          <button type="button" className="adm-btn adm-btn-primary" onClick={handlePublish} disabled={saving || publishing}>
            {publishing ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>
      <div className="adm-editor-body">
        {children}
      </div>
    </div>
  );
}

/* ---------- Reusable form controls ---------- */

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}) {
  const id = useId();
  return (
    <div className="adm-field">
      <label className="adm-field-label" htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          id={id}
          className="adm-input adm-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows ?? 3}
        />
      ) : (
        <input
          id={id}
          className="adm-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

export function ImagePicker({
  label,
  value,
  onChange,
  featured = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  featured?: boolean;
}) {
  const { media } = useCms();
  const images = media.filter((m) => m.kind === "image");
  const id = useId();
  const selected = images.find((image) => image.url === value);
  return (
    <div className={`adm-field adm-image-field ${featured ? "featured" : ""}`}>
      <label className="adm-field-label" htmlFor={id}>{label}</label>
      <div className="adm-image-picker">
        <div className="adm-image-preview-wrap">
          {value ? (
            <img src={value} alt={`${label} preview`} className="adm-image-preview" />
          ) : (
            <div className="adm-image-empty"><AdminIcon.image size={24} /><span>No image selected</span></div>
          )}
        </div>
        <div className="adm-image-select-row">
          <AdminIcon.image size={16} />
          <select id={id} className="adm-input" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">— Select image —</option>
          {images.map((m) => (
            <option key={m.id} value={m.url}>{m.name}</option>
          ))}
          </select>
          <span className="adm-image-name">{selected?.name ?? "Custom image"}</span>
        </div>
      </div>
    </div>
  );
}

export function RepeatableSection<T>({
  title,
  items,
  onAdd,
  onRemove,
  onMove,
  renderItem,
  addLabel,
  collapsible = false,
  getItemSummary,
}: {
  title: string;
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove: (index: number, dir: -1 | 1) => void;
  renderItem: (item: T, index: number) => ReactNode;
  addLabel: string;
  collapsible?: boolean;
  getItemSummary?: (item: T, index: number) => ReactNode;
}) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const previousLengthRef = useRef(items.length);

  useEffect(() => {
    if (collapsible && items.length > previousLengthRef.current) {
      setExpandedItems((prev) => ({ ...prev, [items.length - 1]: true }));
    }
    previousLengthRef.current = items.length;
  }, [items.length, collapsible]);

  const toggleItem = (index: number) => {
    setExpandedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="adm-repeatable-section">
      <div className="adm-section-head">
        <h3>{title}</h3>
        <button className="adm-btn adm-btn-sm adm-btn-primary" onClick={onAdd}>
          <AdminIcon.plus size={14} /> {addLabel}
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="adm-repeatable-item">
          <div className="adm-repeatable-controls">
            <span className="adm-item-number" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
            <button className="adm-icon-btn" onClick={() => onMove(i, -1)} disabled={i === 0} aria-label="Move up">
              <AdminIcon.chevronUp size={14} />
            </button>
            <button className="adm-icon-btn" onClick={() => onMove(i, 1)} disabled={i === items.length - 1} aria-label="Move down">
              <AdminIcon.chevronUp size={14} style={{ transform: "rotate(180deg)" }} />
            </button>
          </div>
          <div className="adm-repeatable-body">
            {collapsible && (
              <button
                type="button"
                className={`adm-repeatable-toggle ${expandedItems[i] ? "expanded" : ""}`}
                onClick={() => toggleItem(i)}
                aria-expanded={!!expandedItems[i]}
              >
                <div className="adm-repeatable-summary">
                  <strong>Item {i + 1}</strong>
                  <span>{getItemSummary ? getItemSummary(item, i) : `Configure item ${i + 1}`}</span>
                </div>
                <AdminIcon.chevronUp size={14} style={{ transform: expandedItems[i] ? "rotate(0deg)" : "rotate(180deg)" }} />
              </button>
            )}
            {(!collapsible || expandedItems[i]) && renderItem(item, i)}
          </div>
          <button className="adm-item-delete" onClick={() => onRemove(i)} aria-label={`Remove item ${i + 1}`}>
            <AdminIcon.trash size={14} /> <span>Delete</span>
          </button>
        </div>
      ))}
      {items.length === 0 && <p className="adm-muted">No items yet. Click "{addLabel}" to add one.</p>}
    </div>
  );
}
