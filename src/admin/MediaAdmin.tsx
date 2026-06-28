import { useCallback, useMemo, useRef, useState } from "react";
import { useCms } from "../cms/CmsContext";
import type { CmsMedia, MediaKind } from "../cms/types";
import { AdminIcon } from "./AdminIcons";
import { ConfirmDialog, EmptyState, useToast } from "./AdminUI";

export function MediaAdmin() {
  const { media, addMedia, updateMedia, deleteMedia, repo } = useCms();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | MediaKind>("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<CmsMedia | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CmsMedia | null>(null);
  const [renaming, setRenaming] = useState<CmsMedia | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return media.filter((m) => {
      const kindOk = kindFilter === "all" || m.kind === kindFilter;
      const qOk = q === "" || m.name.toLowerCase().includes(q);
      return kindOk && qOk;
    });
  }, [media, search, kindFilter]);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setUploading(true);
      try {
        for (const file of Array.from(files)) {
          const id = `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          const kind: MediaKind = file.type.startsWith("video") ? "video" : "image";
          await repo.putMediaBlob(id, file);
          const objUrl = URL.createObjectURL(file);
          const record: CmsMedia = {
            id,
            name: file.name,
            kind,
            mimeType: file.type || "application/octet-stream",
            size: file.size,
            url: objUrl,
            uploadedAt: Date.now(),
            builtin: false,
          };
          addMedia(record);
        }
        toast(`${files.length} file${files.length > 1 ? "s" : ""} uploaded`, "success");
      } catch {
        toast("Upload failed", "error");
      } finally {
        setUploading(false);
      }
    },
    [repo, addMedia, toast],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (!deleteTarget.builtin) {
      await deleteMedia(deleteTarget.id);
    } else {
      updateMedia(deleteTarget.id, { });
      toast("Built-in media cannot be deleted from the library.", "info");
      setDeleteTarget(null);
      return;
    }
    toast(`Media “${deleteTarget.name}” deleted`, "success");
    setDeleteTarget(null);
  };

  const startRename = (m: CmsMedia) => {
    setRenaming(m);
    setRenameValue(m.name);
  };

  const confirmRename = () => {
    if (!renaming) return;
    updateMedia(renaming.id, { name: renameValue.trim() || renaming.name });
    toast("Media renamed", "success");
    setRenaming(null);
  };

  const totalImages = media.filter((m) => m.kind === "image").length;
  const totalVideos = media.filter((m) => m.kind === "video").length;

  return (
    <div className="adm-page">
      <div className="adm-page-head">
        <div>
          <h1>Media Library</h1>
          <p>{media.length} files · {totalImages} images · {totalVideos} videos</p>
        </div>
      </div>

      {/* Upload zone */}
      <div
        className={`adm-dropzone ${dragActive ? "active" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <AdminIcon.upload size={32} />
        <p>{uploading ? "Uploading…" : "Drag and drop files here, or click to browse"}</p>
        <span className="adm-dropzone-sub">Supports images and videos</span>
      </div>

      {/* Toolbar */}
      <div className="adm-toolbar">
        <div className="adm-toolbar-left">
          <div className="adm-btn-group">
            {(["all", "image", "video"] as const).map((k) => (
              <button
                key={k}
                className={`adm-chip ${kindFilter === k ? "active" : ""}`}
                onClick={() => setKindFilter(k)}
              >
                {k === "all" ? "All" : k.charAt(0).toUpperCase() + k.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="adm-toolbar-right">
          <div className="adm-input-wrap">
            <AdminIcon.search size={16} />
            <input
              type="text"
              placeholder="Search media…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search media"
            />
          </div>
          <div className="adm-view-toggle">
            <button
              className={view === "grid" ? "active" : ""}
              onClick={() => setView("grid")}
              aria-label="Grid view"
            >
              <AdminIcon.grid size={18} />
            </button>
            <button
              className={view === "list" ? "active" : ""}
              onClick={() => setView("list")}
              aria-label="List view"
            >
              <AdminIcon.list size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Media grid/list */}
      {filtered.length === 0 ? (
        <div className="adm-table-card">
          <EmptyState
            icon={AdminIcon.media({ size: 48 })}
            title="No media found"
            message="Upload files or try adjusting your filters."
          />
        </div>
      ) : view === "grid" ? (
        <div className="adm-media-grid">
          {filtered.map((m) => (
            <div className="adm-media-card" key={m.id} onClick={() => setPreview(m)}>
              <div className="adm-media-thumb">
                {m.kind === "image" ? (
                  <img src={m.url} alt={m.name} loading="lazy" />
                ) : (
                  <div className="adm-media-video">
                    <AdminIcon.video size={32} />
                  </div>
                )}
                {m.builtin && <span className="adm-media-builtin">Built-in</span>}
              </div>
              <div className="adm-media-info">
                <span className="adm-media-name" title={m.name}>{m.name}</span>
                <span className="adm-media-meta">{formatSize(m.size)} · {formatDate(m.uploadedAt)}</span>
              </div>
              <div className="adm-media-actions" onClick={(e) => e.stopPropagation()}>
                <button className="adm-icon-btn" onClick={() => startRename(m)} aria-label="Rename">
                  <AdminIcon.edit size={16} />
                </button>
                <button
                  className={`adm-icon-btn ${m.builtin ? "disabled" : "danger"}`}
                  onClick={() => setDeleteTarget(m)}
                  aria-label="Delete"
                  disabled={m.builtin}
                >
                  <AdminIcon.trash size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="adm-table-card">
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="adm-media-row" onClick={() => setPreview(m)}>
                    <td>
                      {m.kind === "image" ? (
                        <img src={m.url} alt={m.name} className="adm-thumb" loading="lazy" />
                      ) : (
                        <div className="adm-thumb adm-thumb-video"><AdminIcon.video size={20} /></div>
                      )}
                    </td>
                    <td>
                      <strong>{m.name}</strong>
                      {m.builtin && <span className="adm-tag" style={{ marginLeft: 6 }}>Built-in</span>}
                    </td>
                    <td>{m.kind}</td>
                    <td>{formatSize(m.size)}</td>
                    <td>{formatDate(m.uploadedAt)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="adm-row-actions">
                        <button className="adm-icon-btn" onClick={() => startRename(m)} aria-label="Rename">
                          <AdminIcon.edit size={16} />
                        </button>
                        <button
                          className={`adm-icon-btn ${m.builtin ? "disabled" : "danger"}`}
                          onClick={() => setDeleteTarget(m)}
                          disabled={m.builtin}
                          aria-label="Delete"
                        >
                          <AdminIcon.trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <div className="adm-modal-overlay" onClick={() => setPreview(null)}>
          <div className="adm-modal adm-modal-lg adm-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2>{preview.name}</h2>
              <button className="adm-modal-close" onClick={() => setPreview(null)} aria-label="Close">
                <AdminIcon.close size={20} />
              </button>
            </div>
            <div className="adm-modal-body adm-preview-body">
              {preview.kind === "image" ? (
                <img src={preview.url} alt={preview.name} />
              ) : (
                <video src={preview.url} controls />
              )}
              <div className="adm-preview-meta">
                <div><span>Type</span><strong>{preview.mimeType}</strong></div>
                <div><span>Size</span><strong>{formatSize(preview.size)}</strong></div>
                <div><span>Uploaded</span><strong>{formatDate(preview.uploadedAt)}</strong></div>
                <div><span>URL</span><code>{preview.url.slice(0, 60)}{preview.url.length > 60 ? "…" : ""}</code></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rename modal */}
      {renaming && (
        <div className="adm-modal-overlay" onClick={() => setRenaming(null)}>
          <div className="adm-modal adm-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2>Rename Media</h2>
              <button className="adm-modal-close" onClick={() => setRenaming(null)} aria-label="Close">
                <AdminIcon.close size={20} />
              </button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-form-field">
                <label htmlFor="rename-input">Name</label>
                <input
                  id="rename-input"
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-ghost" onClick={() => setRenaming(null)}>Cancel</button>
              <button className="adm-btn adm-btn-primary" onClick={confirmRename}>Rename</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={deleteTarget?.builtin ? "Built-in Media" : "Delete Media"}
        message={
          deleteTarget?.builtin
            ? "Built-in media files cannot be deleted. They are part of the website's original assets."
            : `Are you sure you want to delete “${deleteTarget?.name}”?`
        }
        confirmLabel={deleteTarget?.builtin ? "OK" : "Delete"}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        danger={!deleteTarget?.builtin}
      />
    </div>
  );
}

/* ---------- helpers ---------- */

function formatSize(bytes: number): string {
  if (!bytes || bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(ts: number): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
}

