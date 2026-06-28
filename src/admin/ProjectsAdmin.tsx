import { useMemo, useState, type FormEvent } from "react";
import { useCms } from "../cms/CmsContext";
import type { CmsProject, PublicationStatus } from "../cms/types";
import { AdminIcon } from "./AdminIcons";
import { ConfirmDialog, EmptyState, Modal, useToast } from "./AdminUI";

const allCategories = [
  "All Projects",
  "Corporate",
  "Corporate Event",
  "Convocation",
  "Workshop",
  "Community",
  "Live Streaming",
  "Festival",
  "Live Streaming Event",
  "Behind The Scenes",
  "Awards Night",
];

const statusFilters: ("all" | PublicationStatus)[] = ["all", "published", "draft"];

export function ProjectsAdmin() {
  const { projects, media, createProject, updateProject, deleteProject } = useCms();
  const { toast } = useToast();

  const [filter, setFilter] = useState<string>("All Projects");
  const [statusFilter, setStatusFilter] = useState<"all" | PublicationStatus>("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CmsProject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CmsProject | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      const catOk = filter === "All Projects" || p.category === filter;
      const statusOk = statusFilter === "all" || p.status === statusFilter;
      const qOk = q === "" || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.year.includes(q);
      return catOk && statusOk && qOk;
    });
  }, [projects, filter, statusFilter, search]);

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (p: CmsProject) => {
    setEditing(p);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProject(deleteTarget.id);
      toast(`Project "${deleteTarget.title}" deleted`, "success");
    } catch {
      toast("Failed to delete project", "error");
    }
    setDeleteTarget(null);
  };

  const handleSubmit = async (data: Omit<CmsProject, "id" | "createdAt" | "updatedAt">) => {
    setSaving(true);
    try {
      if (editing) {
        await updateProject(editing.id, data);
        toast(`Project "${data.title}" updated`, "success");
      } else {
        await createProject(data);
        toast(`Project "${data.title}" created`, "success");
      }
      setModalOpen(false);
    } catch {
      toast("Failed to save project", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleFeatured = async (p: CmsProject) => {
    try {
      await updateProject(p.id, { featured: !p.featured });
      toast(`${p.title} ${p.featured ? "unfeatured" : "featured"}`, "info");
    } catch {
      toast("Failed to toggle featured", "error");
    }
  };

  const toggleStatus = async (p: CmsProject) => {
    const next: PublicationStatus = p.status === "published" ? "draft" : "published";
    try {
      await updateProject(p.id, { status: next });
      toast(`${p.title} → ${next}`, "info");
    } catch {
      toast("Failed to toggle status", "error");
    }
  };

  return (
    <div className="adm-page">
      <div className="adm-page-head">
        <div>
          <h1>Projects</h1>
          <p>Manage your portfolio projects.</p>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={openNew}>
          <AdminIcon.plus size={18} /> New Project
        </button>
      </div>

      <div className="adm-toolbar">
        <div className="adm-toolbar-left">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="adm-select" aria-label="Category filter">
            {allCategories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <div className="adm-btn-group">
            {statusFilters.map((s) => (
              <button
                key={s}
                className={`adm-chip ${statusFilter === s ? "active" : ""}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="adm-toolbar-right">
          <div className="adm-input-wrap">
            <AdminIcon.search size={16} />
            <input
              type="text"
              placeholder="Search projects…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search projects"
            />
          </div>
        </div>
      </div>

      <div className="adm-table-card">
        {filtered.length === 0 ? (
          <EmptyState
            icon={AdminIcon.projects({ size: 48 })}
            title="No projects found"
            message="Try adjusting your filters or create a new project."
            action={
              <button className="adm-btn adm-btn-primary" onClick={openNew}>
                <AdminIcon.plus size={18} /> New Project
              </button>
            }
          />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Cover</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <img src={p.coverUrl} alt={p.alt} className="adm-thumb" />
                    </td>
                    <td>
                      <strong>{p.title}</strong>
                      <span className="adm-table-sub">{p.location || "—"}</span>
                    </td>
                    <td><span className="adm-tag">{p.category}</span></td>
                    <td>{p.year}</td>
                    <td>
                      <button
                        className={`adm-status adm-status-${p.status}`}
                        onClick={() => toggleStatus(p)}
                        title="Click to toggle"
                      >
                        {p.status}
                      </button>
                    </td>
                    <td>
                      <button
                        className={`adm-star-btn ${p.featured ? "active" : ""}`}
                        onClick={() => toggleFeatured(p)}
                        aria-label={p.featured ? "Unfeature" : "Feature"}
                      >
                        <AdminIcon.star size={18} />
                      </button>
                    </td>
                    <td>
                      <div className="adm-row-actions">
                        <button className="adm-icon-btn" onClick={() => openEdit(p)} aria-label="Edit">
                          <AdminIcon.edit size={16} />
                        </button>
                        <button className="adm-icon-btn danger" onClick={() => setDeleteTarget(p)} aria-label="Delete">
                          <AdminIcon.trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Project" : "New Project"}
        size="lg"
        footer={
          <>
            <button className="adm-btn adm-btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button
              type="submit"
              form="project-form"
              className="adm-btn adm-btn-primary"
              disabled={saving}
            >
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Project"}
            </button>
          </>
        }
      >
        <ProjectForm
          key={editing?.id ?? "new"}
          initial={editing}
          media={media}
          onSubmit={handleSubmit}
          saving={saving}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

/* ---------- Project Form ---------- */

function ProjectForm({
  initial,
  media,
  onSubmit,
  saving,
}: {
  initial: CmsProject | null;
  media: { id: string; url: string; name: string; kind: string }[];
  onSubmit: (data: Omit<CmsProject, "id" | "createdAt" | "updatedAt">) => void;
  saving: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [category, setCategory] = useState(initial?.category ?? "Corporate");
  const [year, setYear] = useState(initial?.year ?? String(new Date().getFullYear()));
  const [location, setLocation] = useState(initial?.location ?? "");
  const [shortDesc, setShortDesc] = useState(initial?.shortDesc ?? "");
  const [fullDesc, setFullDesc] = useState(initial?.fullDesc ?? "");
  const [coverMedia, setCoverMedia] = useState(initial?.coverMedia ?? initial?.coverUrl ?? "");
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl ?? "");
  const [alt, setAlt] = useState(initial?.alt ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [status, setStatus] = useState<PublicationStatus>(initial?.status ?? "draft");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoSlug, setAutoSlug] = useState(!initial);

  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const imageMedia = media.filter((m) => m.kind === "image");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required";
    const finalSlug = slug || slugify(title);
    if (!finalSlug) errs.slug = "Slug is required";
    if (!category.trim()) errs.category = "Category is required";
    if (!year.trim()) errs.year = "Year is required";
    if (!shortDesc.trim()) errs.shortDesc = "Short description is required";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const resolvedCover = coverUrl || coverMedia || "/media/project-1.jpg";

    onSubmit({
      title: title.trim(),
      slug: finalSlug,
      category: category.trim(),
      year: year.trim(),
      location: location.trim(),
      shortDesc: shortDesc.trim(),
      fullDesc: fullDesc.trim(),
      coverMedia: coverMedia,
      coverUrl: resolvedCover,
      alt: alt.trim() || title.trim(),
      featured,
      status,
    });
  };

  return (
    <form id="project-form" onSubmit={handleSubmit} className="adm-form" noValidate>
      <div className="adm-form-row">
        <div className="adm-form-field">
          <label htmlFor="pf-title">Title <span className="adm-req">*</span></label>
          <input
            id="pf-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (autoSlug) setSlug(slugify(e.target.value));
            }}
            aria-invalid={!!errors.title}
          />
          {errors.title && <span className="adm-field-error">{errors.title}</span>}
        </div>
        <div className="adm-form-field">
          <label htmlFor="pf-slug">Slug <span className="adm-req">*</span></label>
          <input
            id="pf-slug"
            type="text"
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setAutoSlug(false); }}
            aria-invalid={!!errors.slug}
          />
          {errors.slug && <span className="adm-field-error">{errors.slug}</span>}
        </div>
      </div>

      <div className="adm-form-row">
        <div className="adm-form-field">
          <label htmlFor="pf-category">Category <span className="adm-req">*</span></label>
          <input
            id="pf-category"
            type="text"
            list="pf-categories"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-invalid={!!errors.category}
          />
          <datalist id="pf-categories">
            {allCategories.filter((c) => c !== "All Projects").map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          {errors.category && <span className="adm-field-error">{errors.category}</span>}
        </div>
        <div className="adm-form-field">
          <label htmlFor="pf-year">Year <span className="adm-req">*</span></label>
          <input
            id="pf-year"
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            aria-invalid={!!errors.year}
          />
          {errors.year && <span className="adm-field-error">{errors.year}</span>}
        </div>
        <div className="adm-form-field">
          <label htmlFor="pf-location">Location</label>
          <input
            id="pf-location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>

      <div className="adm-form-field">
        <label htmlFor="pf-short">Short Description <span className="adm-req">*</span></label>
        <input
          id="pf-short"
          type="text"
          value={shortDesc}
          onChange={(e) => setShortDesc(e.target.value)}
          maxLength={180}
          aria-invalid={!!errors.shortDesc}
        />
        {errors.shortDesc && <span className="adm-field-error">{errors.shortDesc}</span>}
      </div>

      <div className="adm-form-field">
        <label htmlFor="pf-full">Full Description</label>
        <textarea
          id="pf-full"
          rows={4}
          value={fullDesc}
          onChange={(e) => setFullDesc(e.target.value)}
        />
      </div>

      <div className="adm-form-row">
        <div className="adm-form-field">
          <label htmlFor="pf-cover">Cover Media</label>
          <select
            id="pf-cover"
            value={coverMedia}
            onChange={(e) => {
              setCoverMedia(e.target.value);
              if (e.target.value) setCoverUrl(e.target.value);
            }}
          >
            <option value="">Custom URL or none</option>
            {imageMedia.map((m) => (
              <option key={m.id} value={m.url}>{m.name}</option>
            ))}
          </select>
        </div>
        <div className="adm-form-field">
          <label htmlFor="pf-cover-url">Cover URL</label>
          <input
            id="pf-cover-url"
            type="text"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="/media/project-1.jpg"
          />
        </div>
      </div>

      {(coverUrl || coverMedia) && (
        <div className="adm-cover-preview">
          <img src={coverUrl || coverMedia} alt="Cover preview" />
        </div>
      )}

      <div className="adm-form-field">
        <label htmlFor="pf-alt">Alt Text</label>
        <input
          id="pf-alt"
          type="text"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
        />
      </div>

      <div className="adm-form-row">
        <div className="adm-form-field">
          <label htmlFor="pf-status">Status</label>
          <select
            id="pf-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as PublicationStatus)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="adm-form-field adm-checkbox-field">
          <label className="adm-check-wrap">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            <span>Featured project</span>
          </label>
        </div>
      </div>
      {saving && <span className="adm-hidden" />}
    </form>
  );
}
