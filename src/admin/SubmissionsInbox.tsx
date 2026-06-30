import { useState, useMemo } from "react";
import { useCms } from "../cms/CmsContext";
import { AdminIcon } from "./AdminIcons";
import { Modal, ConfirmDialog, useToast } from "./AdminUI";
import type { ContactSubmission, SubmissionStatus } from "../cms/types";

export function SubmissionsInbox() {
  const { submissions, updateSubmission, deleteSubmission, getAttachmentUrl } = useCms();
  const { toast } = useToast();
  const [filter, setFilter] = useState<SubmissionStatus | "all">("all");
  const [selected, setSelected] = useState<ContactSubmission | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ContactSubmission | null>(null);
  const [saving, setSaving] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachmentLoading, setAttachmentLoading] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "all") return submissions;
    return submissions.filter((s) => s.status === filter);
  }, [submissions, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: submissions.length, new: 0, in_progress: 0, resolved: 0, spam: 0 };
    for (const s of submissions) {
      c[s.status] = (c[s.status] ?? 0) + 1;
    }
    return c;
  }, [submissions]);

  const openDetail = (s: ContactSubmission) => {
    setSelected(s);
    setAdminNotes(s.adminNotes);
    setAttachmentUrl(null);
    setAttachmentUrlState(s);
  };

  const setAttachmentUrlState = async (s: ContactSubmission) => {
    if (!s.attachmentPath) {
      setAttachmentUrl(null);
      return;
    }
    setAttachmentLoading(true);
    try {
      const url = await getAttachmentUrl(s.attachmentPath);
      setAttachmentUrl(url);
    } catch {
      setAttachmentUrl(null);
    } finally {
      setAttachmentLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateSubmission(selected.id, { adminNotes });
      toast("Notes updated", "success");
    } catch {
      toast("Failed to save notes", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (id: string, status: SubmissionStatus) => {
    try {
      await updateSubmission(id, { status });
      toast(`Marked as ${status}`, "success");
    } catch {
      toast("Failed to update status", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSubmission(deleteTarget.id);
      toast("Submission deleted", "success");
      if (selected?.id === deleteTarget.id) setSelected(null);
    } catch {
      toast("Failed to delete submission", "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  const statusLabels: Record<SubmissionStatus, string> = {
    new: "New",
    in_progress: "In Progress",
    resolved: "Resolved",
    spam: "Spam",
  };

  const statusColors: Record<SubmissionStatus, string> = {
    new: "#3b82f6",
    in_progress: "#f59e0b",
    resolved: "#22c55e",
    spam: "#ef4444",
  };

  return (
    <div className="adm-page">
      <div className="adm-page-head">
        <div>
          <h1>Contact Submissions</h1>
          <p>Review enquiries, update progress, and keep internal notes organised.</p>
        </div>
      </div>

      <div className="adm-inbox-filters">
        {(["all", "new", "in_progress", "resolved", "spam"] as const).map((f) => (
          <button
            key={f}
            className={`adm-btn adm-btn-sm ${filter === f ? "adm-btn-primary" : "adm-btn-ghost"}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : statusLabels[f]}
            <span className="adm-badge">{counts[f]}</span>
          </button>
        ))}
      </div>

      <div className="adm-card adm-table-card">
        {filtered.length === 0 ? (
          <div className="adm-empty">
            <AdminIcon.inbox size={48} />
            <h3>No submissions</h3>
            <p>No contact form submissions match this filter.</p>
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Organisation</th>
                  <th>Project</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className={selected?.id === s.id ? "adm-row-selected" : ""}>
                    <td>
                      <span
                        className="adm-status-dot"
                        style={{ background: statusColors[s.status] }}
                        title={statusLabels[s.status]}
                      />
                    </td>
                    <td>
                      <strong>{s.fullName}</strong>
                      <span className="adm-table-sub">{statusLabels[s.status]}</span>
                    </td>
                    <td>{s.email}</td>
                    <td>{s.organisation || "—"}</td>
                    <td>{s.project || "—"}</td>
                    <td className="adm-muted">{new Date(s.createdAt).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td>
                      <div className="adm-row-actions">
                        <button className="adm-icon-btn" onClick={() => openDetail(s)} title="View details">
                          <AdminIcon.eye size={16} />
                        </button>
                        <button className="adm-icon-btn adm-icon-btn-danger" onClick={() => setDeleteTarget(s)} title="Delete">
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

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Submission Details" size="lg">
        {selected && (
          <div className="adm-submission-detail">
            <div className="adm-detail-grid">
              <div className="adm-detail-field">
                <label>Status</label>
                <div className="adm-detail-status-actions">
                  {(["new", "in_progress", "resolved", "spam"] as const).map((st) => (
                    <button
                      key={st}
                      className={`adm-btn adm-btn-sm ${selected.status === st ? "adm-btn-primary" : "adm-btn-ghost"}`}
                      onClick={() => handleStatus(selected.id, st)}
                    >
                      {statusLabels[st]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="adm-detail-field">
                <label>Submitted</label>
                <span>{new Date(selected.createdAt).toLocaleString("en-MY", { dateStyle: "full", timeStyle: "short" })}</span>
              </div>
              <div className="adm-detail-field">
                <label>Name</label>
                <span>{selected.fullName}</span>
              </div>
              <div className="adm-detail-field">
                <label>Email</label>
                <a href={`mailto:${selected.email}`}>{selected.email}</a>
              </div>
              <div className="adm-detail-field">
                <label>Organisation Type</label>
                <span>{selected.organisationType || "—"}</span>
              </div>
              <div className="adm-detail-field">
                <label>Phone</label>
                <span>{selected.countryCode ? `${selected.countryCode} ${selected.phoneNumber}` : selected.phoneNumber || "—"}</span>
              </div>
              <div className="adm-detail-field">
                <label>Organisation</label>
                <span>{selected.organisation || "—"}</span>
              </div>
              <div className="adm-detail-field">
                <label>Project Name</label>
                <span>{selected.project || "—"}</span>
              </div>
              <div className="adm-detail-field">
                <label>Budget</label>
                <span>{selected.budget || "—"}</span>
              </div>
              <div className="adm-detail-field">
                <label>Request Types</label>
                <span>{selected.requestTypes.join(", ") || "—"}</span>
              </div>
              {selected.requestTypeOther && (
                <div className="adm-detail-field">
                  <label>Other Request</label>
                  <span>{selected.requestTypeOther}</span>
                </div>
              )}
              <div className="adm-detail-field">
                <label>Exemption</label>
                <span>{selected.exemption || "—"}</span>
              </div>
              <div className="adm-detail-field">
                <label>Event Date</label>
                <span>{selected.eventDate || "—"}</span>
              </div>
              <div className="adm-detail-field">
                <label>Hear About</label>
                <span>{selected.hearAbout || "—"}</span>
              </div>
              {selected.hearAboutOther && (
                <div className="adm-detail-field">
                  <label>Other Source</label>
                  <span>{selected.hearAboutOther}</span>
                </div>
              )}
              <div className="adm-detail-field">
                <label>Referral Code</label>
                <span>{selected.referral || "—"}</span>
              </div>
              {selected.attachmentPath && (
                <div className="adm-detail-field">
                  <label>Attachment</label>
                  {attachmentLoading ? (
                    <span className="adm-muted">Preparing download…</span>
                  ) : attachmentUrl ? (
                    <a href={attachmentUrl} target="_blank" rel="noopener noreferrer">View file</a>
                  ) : (
                    <span className="adm-muted">File unavailable</span>
                  )}
                </div>
              )}
              <div className="adm-detail-field adm-detail-full">
                <label>Inquiry</label>
                <p className="adm-detail-inquiry">{selected.inquiry || "—"}</p>
              </div>
              <div className="adm-detail-field adm-detail-full">
                <label>Admin Notes</label>
                <textarea
                  className="adm-input adm-textarea"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="Add internal notes..."
                />
                <div className="adm-detail-notes-actions">
                  <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving…" : "Save Notes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Submission"
        message={`Are you sure you want to delete the submission from "${deleteTarget?.fullName ?? "Unknown"}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
