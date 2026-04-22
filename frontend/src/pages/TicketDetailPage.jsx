import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../auth/AuthContext";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "../lib/api";

const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
const TECHNICIANS = [
  { id: "tech-sarah-wilson", name: "Sarah Wilson" },
  { id: "tech-mike-johnson", name: "Mike Johnson" },
  { id: "tech-emily-chen", name: "Emily Chen" }
];

function titleCase(value) {
  return String(value ?? "Not set")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function ticketNumber(ticket) {
  return ticket?.id ? `TKT-${ticket.id.slice(-6).toUpperCase()}` : "TKT-2026";
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function StatusPill({ value }) {
  return (
    <span className={`ticket-pill ticket-status-${String(value).toLowerCase().replaceAll("_", "-")}`}>
      {titleCase(value)}
    </span>
  );
}

function PriorityPill({ value }) {
  return (
    <span className={`ticket-pill ticket-priority-${String(value).toLowerCase()}`}>
      {titleCase(value)}
    </span>
  );
}

function initials(name) {
  return String(name ?? "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function CommentsPanel({ comments, currentUser, onAdd, onEdit, onDelete, busy }) {
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editDraft, setEditDraft] = useState("");

  return (
    <section className="ticket-panel">
      <div className="ticket-section-head">
        <div>
          <h3>Comments</h3>
          <p>{comments.length} update{comments.length === 1 ? "" : "s"} in this incident thread.</p>
        </div>
      </div>

      <div className="ticket-comment-box">
        <textarea
          rows="3"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add a comment for the reporter or technician..."
        />
        <button
          type="button"
          className="ticket-primary-button"
          disabled={busy || !draft.trim()}
          onClick={async () => {
            await onAdd(draft.trim());
            setDraft("");
          }}
        >
          Post Comment
        </button>
      </div>

      <div className="ticket-comments-list">
        {comments.length === 0 && <p className="ticket-empty">No comments yet.</p>}
        {comments.map((comment) => {
          const canChange = currentUser?.role === "ADMIN" || currentUser?.userId === comment.authorId;

          return (
            <article key={comment.id} className="ticket-comment">
              <div className="ticket-avatar">{initials(comment.authorName)}</div>
              <div>
                <div className="ticket-comment-meta">
                  <strong>{comment.authorName}</strong>
                  <span>{formatDate(comment.createdAt)}</span>
                </div>

                {editingId === comment.id ? (
                  <div className="ticket-comment-edit">
                    <textarea rows="3" value={editDraft} onChange={(event) => setEditDraft(event.target.value)} />
                    <div className="ticket-actions">
                      <button
                        type="button"
                        className="ticket-primary-button"
                        disabled={busy || !editDraft.trim()}
                        onClick={async () => {
                          await onEdit(comment.id, editDraft.trim());
                          setEditingId("");
                        }}
                      >
                        Save
                      </button>
                      <button type="button" className="ticket-secondary-button" onClick={() => setEditingId("")}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p>{comment.message}</p>
                )}

                {canChange && editingId !== comment.id && (
                  <div className="ticket-row-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditDraft(comment.message);
                      }}
                    >
                      Edit
                    </button>
                    <button type="button" onClick={() => onDelete(comment.id)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [status, setStatus] = useState("OPEN");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function loadTicket() {
    try {
      setLoading(true);
      const [ticketResult, commentResult] = await Promise.all([
        apiGet(`/api/tickets/${ticketId}`, user),
        apiGet(`/api/tickets/${ticketId}/comments`, user)
      ]);

      setTicket(ticketResult);
      setComments(commentResult);
      setStatus(ticketResult.status);
      setResolutionNotes(ticketResult.resolutionNotes ?? "");
      setRejectionReason(ticketResult.rejectionReason ?? "");
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTicket();
  }, [ticketId, user]);

  async function updateTicket(request) {
    try {
      setBusy(true);
      const updated = await request();
      setTicket(updated);
      setStatus(updated.status);
      setResolutionNotes(updated.resolutionNotes ?? "");
      setRejectionReason(updated.rejectionReason ?? "");
      setError("");
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleStatusUpdate() {
    await updateTicket(() =>
      apiPatch(
        `/api/tickets/${ticket.id}/status`,
        {
          status,
          resolutionNotes: resolutionNotes.trim() || null,
          rejectionReason: rejectionReason.trim() || null
        },
        user
      )
    );
  }

  async function handleAssign(technicianId) {
    const technician = TECHNICIANS.find((item) => item.id === technicianId);
    if (!technician) {
      return;
    }

    await updateTicket(() =>
      apiPatch(
        `/api/tickets/${ticket.id}/assign`,
        {
          technicianId: technician.id,
          technicianName: technician.name
        },
        user
      )
    );
  }

  async function handleAddComment(message) {
    try {
      setBusy(true);
      const created = await apiPost(`/api/tickets/${ticket.id}/comments`, { message }, user);
      setComments((current) => [...current, created]);
      setError("");
    } catch (commentError) {
      setError(commentError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleEditComment(commentId, message) {
    try {
      setBusy(true);
      const updated = await apiPut(`/api/tickets/${ticket.id}/comments/${commentId}`, { message }, user);
      setComments((current) => current.map((comment) => (comment.id === updated.id ? updated : comment)));
      setError("");
    } catch (commentError) {
      setError(commentError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteComment(commentId) {
    if (!window.confirm("Delete this comment?")) {
      return;
    }

    try {
      setBusy(true);
      await apiDelete(`/api/tickets/${ticket.id}/comments/${commentId}`, user);
      setComments((current) => current.filter((comment) => comment.id !== commentId));
      setError("");
    } catch (commentError) {
      setError(commentError.message);
    } finally {
      setBusy(false);
    }
  }

  const isAdmin = user?.role === "ADMIN";
  const canManage = isAdmin || user?.userId === ticket?.assignedTechnicianId;

  return (
    <section className="ticket-module">
      <PageHeader
        eyebrow=""
        title="Ticket Details"
        description="Review the incident, manage assignment, update status, and keep the comment thread current."
      />

      <button type="button" className="ticket-back-button" onClick={() => navigate("/tickets")}>
        Back to tickets
      </button>

      {error && <p className="state-text state-error">{error}</p>}
      {loading && <p className="state-text">Loading ticket...</p>}

      {!loading && ticket && (
        <div className="ticket-detail-layout">
          <section className="ticket-panel ticket-detail-main">
            <div className="ticket-detail-title">
              <span className="ticket-number">{ticketNumber(ticket)}</span>
              <h3>{titleCase(ticket.category)} incident at {ticket.location}</h3>
              <div className="ticket-badge-row">
                <StatusPill value={ticket.status} />
                <PriorityPill value={ticket.priority} />
              </div>
            </div>

            <div className="ticket-description-block">
              <h4>Description</h4>
              <p>{ticket.description}</p>
            </div>

            {ticket.attachmentUrls?.length > 0 && (
              <div className="ticket-description-block">
                <h4>Evidence and Attachments</h4>
                <div className="ticket-attachments">
                  {ticket.attachmentUrls.map((url) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer">
                      <img src={url} alt="Ticket attachment" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {(ticket.resolutionNotes || ticket.rejectionReason) && (
              <div className="ticket-note-grid">
                {ticket.resolutionNotes && (
                  <div>
                    <h4>Resolution Notes</h4>
                    <p>{ticket.resolutionNotes}</p>
                  </div>
                )}
                {ticket.rejectionReason && (
                  <div>
                    <h4>Rejection Reason</h4>
                    <p>{ticket.rejectionReason}</p>
                  </div>
                )}
              </div>
            )}

            <CommentsPanel
              comments={comments}
              currentUser={user}
              busy={busy}
              onAdd={handleAddComment}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
            />
          </section>

          <aside className="ticket-detail-sidebar">
            {canManage && (
              <section className="ticket-panel">
                <h3>Status Management</h3>
                <label className="ticket-field">
                  <span>Status</span>
                  <select value={status} onChange={(event) => setStatus(event.target.value)}>
                    {STATUSES.map((item) => (
                      <option key={item} value={item}>
                        {titleCase(item)}
                      </option>
                    ))}
                  </select>
                </label>

                {status === "RESOLVED" || status === "CLOSED" ? (
                  <label className="ticket-field">
                    <span>Resolution Notes</span>
                    <textarea
                      rows="4"
                      value={resolutionNotes}
                      onChange={(event) => setResolutionNotes(event.target.value)}
                      placeholder="Explain how the issue was resolved."
                    />
                  </label>
                ) : null}

                {status === "REJECTED" && (
                  <label className="ticket-field">
                    <span>Rejection Reason</span>
                    <textarea
                      rows="4"
                      value={rejectionReason}
                      onChange={(event) => setRejectionReason(event.target.value)}
                      placeholder="Explain why this ticket cannot proceed."
                    />
                  </label>
                )}

                <button type="button" className="ticket-primary-button" disabled={busy} onClick={handleStatusUpdate}>
                  Update Status
                </button>
              </section>
            )}

            {isAdmin && (
              <section className="ticket-panel">
                <h3>Assignment</h3>
                <label className="ticket-field">
                  <span>Technician</span>
                  <select value={ticket.assignedTechnicianId ?? ""} onChange={(event) => handleAssign(event.target.value)}>
                    <option value="">Unassigned</option>
                    {TECHNICIANS.map((technician) => (
                      <option key={technician.id} value={technician.id}>
                        {technician.name}
                      </option>
                    ))}
                  </select>
                </label>
              </section>
            )}

            <section className="ticket-panel ticket-facts">
              <h3>Details</h3>
              <dl>
                <div>
                  <dt>Location</dt>
                  <dd>{ticket.location}</dd>
                </div>
                <div>
                  <dt>Resource</dt>
                  <dd>{ticket.resourceId || "No resource linked"}</dd>
                </div>
                <div>
                  <dt>Reporter</dt>
                  <dd>{ticket.reporterName}</dd>
                </div>
                <div>
                  <dt>Preferred Contact</dt>
                  <dd>{ticket.preferredContact}</dd>
                </div>
                <div>
                  <dt>Technician</dt>
                  <dd>{ticket.assignedTechnicianName || "Unassigned"}</dd>
                </div>
                <div>
                  <dt>Created</dt>
                  <dd>{formatDate(ticket.createdAt)}</dd>
                </div>
                <div>
                  <dt>Updated</dt>
                  <dd>{formatDate(ticket.updatedAt)}</dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      )}
    </section>
  );
}
