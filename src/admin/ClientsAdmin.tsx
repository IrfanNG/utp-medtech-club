import { useMemo, useState, type FormEvent } from "react";
import { useCms } from "../cms/CmsContext";
import type { CmsClient } from "../cms/types";
import { AdminIcon } from "./AdminIcons";
import { ConfirmDialog, EmptyState, Modal, useToast } from "./AdminUI";

export function ClientsAdmin() {
  const { clients, createClient, updateClient, deleteClient } = useCms();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CmsClient | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CmsClient | null>(null);
  const [saving, setSaving] = useState(false);

  const sorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...clients]
      .sort((a, b) => a.order - b.order)
      .filter((c) => q === "" || c.name.toLowerCase().includes(q));
  }, [clients, search]);

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (c: CmsClient) => {
    setEditing(c);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteClient(deleteTarget.id);
      toast(`Client "${deleteTarget.name}" deleted`, "success");
    } catch {
      toast("Failed to delete client", "error");
    }
    setDeleteTarget(null);
  };

  const handleSubmit = async (data: Omit<CmsClient, "id">) => {
    setSaving(true);
    try {
      if (editing) {
        await updateClient(editing.id, data);
        toast(`Client "${data.name}" updated`, "success");
      } else {
        await createClient(data);
        toast(`Client "${data.name}" added`, "success");
      }
      setModalOpen(false);
    } catch {
      toast("Failed to save client", "error");
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (c: CmsClient) => {
    try {
      await updateClient(c.id, { published: !c.published });
      toast(`${c.name} ${c.published ? "hidden" : "published"}`, "info");
    } catch {
      toast("Failed to toggle visibility", "error");
    }
  };

  const moveOrder = async (c: CmsClient, dir: -1 | 1) => {
    const list = [...clients].sort((a, b) => a.order - b.order);
    const idx = list.findIndex((x) => x.id === c.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= list.length) return;
    const swapTarget = list[swapIdx];
    try {
      await updateClient(c.id, { order: swapTarget.order });
      await updateClient(swapTarget.id, { order: c.order });
    } catch {
      toast("Failed to reorder", "error");
    }
  };

  return (
    <div className="adm-page">
      <div className="adm-page-head">
        <div>
          <h1>Clients</h1>
          <p>Manage the organizations shown on your website.</p>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={openNew}>
          <AdminIcon.plus size={18} /> Add Client
        </button>
      </div>

      <div className="adm-toolbar">
        <div className="adm-toolbar-right">
          <div className="adm-input-wrap">
            <AdminIcon.search size={16} />
            <input
              type="text"
              placeholder="Search clients…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search clients"
            />
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="adm-table-card">
          <EmptyState
            icon={AdminIcon.clients({ size: 48 })}
            title="No clients found"
            message="Add your first client to display on the website."
            action={
              <button className="adm-btn adm-btn-primary" onClick={openNew}>
                <AdminIcon.plus size={18} /> Add Client
              </button>
            }
          />
        </div>
      ) : (
        <div className="adm-table-card">
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Name</th>
                  <th>Website</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c, i) => (
                  <tr key={c.id}>
                    <td>
                      <div className="adm-order-controls">
                        <button
                          className="adm-icon-btn sm"
                          onClick={() => moveOrder(c, -1)}
                          disabled={i === 0}
                          aria-label="Move up"
                        >
                          <AdminIcon.chevronUp size={14} />
                        </button>
                        <span className="adm-order-num">{c.order}</span>
                        <button
                          className="adm-icon-btn sm"
                          onClick={() => moveOrder(c, 1)}
                          disabled={i === sorted.length - 1}
                          aria-label="Move down"
                        >
                          <AdminIcon.chevronUp size={14} style={{ transform: "rotate(180deg)" }} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="adm-client-name">
                        <span className="adm-client-circle">{c.name.slice(0, 2)}</span>
                        <strong>{c.name}</strong>
                      </div>
                    </td>
                    <td>
                      {c.websiteUrl ? (
                        <a href={c.websiteUrl} target="_blank" rel="noreferrer" className="adm-link">
                          {c.websiteUrl.replace(/^https?:\/\//, "").slice(0, 30)}
                        </a>
                      ) : (
                        <span className="adm-muted">—</span>
                      )}
                    </td>
                    <td>
                      <button
                        className={`adm-status adm-status-${c.published ? "published" : "draft"}`}
                        onClick={() => togglePublished(c)}
                      >
                        {c.published ? "Visible" : "Hidden"}
                      </button>
                    </td>
                    <td>
                      <div className="adm-row-actions">
                        <button className="adm-icon-btn" onClick={() => openEdit(c)} aria-label="Edit">
                          <AdminIcon.edit size={16} />
                        </button>
                        <button className="adm-icon-btn danger" onClick={() => setDeleteTarget(c)} aria-label="Delete">
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Client" : "Add Client"}
        size="md"
        footer={
          <>
            <button className="adm-btn adm-btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" form="client-form" className="adm-btn adm-btn-primary" disabled={saving}>
              {saving ? "Saving…" : editing ? "Save Changes" : "Add Client"}
            </button>
          </>
        }
      >
        <ClientForm
          key={editing?.id ?? "new"}
          initial={editing}
          nextOrder={Math.max(...clients.map((c) => c.order), -1) + 1}
          onSubmit={handleSubmit}
          saving={saving}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Client"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

/* ---------- Client Form ---------- */

function ClientForm({
  initial,
  nextOrder,
  onSubmit,
  saving,
}: {
  initial: CmsClient | null;
  nextOrder: number;
  onSubmit: (data: Omit<CmsClient, "id">) => void;
  saving: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(initial?.websiteUrl ?? "");
  const [logoMedia, setLogoMedia] = useState(initial?.logoMedia ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);
  const [order, setOrder] = useState(initial?.order ?? nextOrder);
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Client name is required");
      return;
    }
    setError("");
    onSubmit({
      name: name.trim(),
      websiteUrl: websiteUrl.trim(),
      logoMedia: logoMedia.trim(),
      published,
      order,
    });
  };

  return (
    <form id="client-form" onSubmit={handleSubmit} className="adm-form" noValidate>
      <div className="adm-form-field">
        <label htmlFor="cf-name">Client Name <span className="adm-req">*</span></label>
        <input
          id="cf-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          aria-invalid={!!error}
        />
        {error && <span className="adm-field-error">{error}</span>}
      </div>

      <div className="adm-form-row">
        <div className="adm-form-field">
          <label htmlFor="cf-website">Website URL</label>
          <input
            id="cf-website"
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </div>
        <div className="adm-form-field">
          <label htmlFor="cf-logo">Logo Media</label>
          <input
            id="cf-logo"
            type="text"
            value={logoMedia}
            onChange={(e) => setLogoMedia(e.target.value)}
            placeholder="Media ID (optional)"
          />
        </div>
      </div>

      <div className="adm-form-row">
        <div className="adm-form-field">
          <label htmlFor="cf-order">Display Order</label>
          <input
            id="cf-order"
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
        </div>
        <div className="adm-form-field adm-checkbox-field">
          <label className="adm-check-wrap">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            <span>Visible on website</span>
          </label>
        </div>
      </div>
      {saving && <span className="adm-hidden" />}
    </form>
  );
}
