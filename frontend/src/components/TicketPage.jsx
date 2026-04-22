import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../auth/AuthContext";
import { apiGet } from "../lib/api";

const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

function titleCase(value) {
  return String(value ?? "Not set")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function ticketNumber(ticket, index = 0) {
  const suffix = String(index + 1).padStart(3, "0");
  return ticket.id ? `TKT-${ticket.id.slice(-6).toUpperCase()}` : `TKT-2026-${suffix}`;
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

export default function TicketsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTickets() {
      try {
        setLoading(true);
        const result = await apiGet("/api/tickets", user);
        setTickets(result);
        setError("");
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, [user]);

  const counts = useMemo(
    () =>
      STATUSES.reduce((summary, status) => {
        summary[status] = tickets.filter((ticket) => ticket.status === status).length;
        return summary;
      }, {}),
    [tickets]
  );

  const filteredTickets = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return tickets.filter((ticket, index) => {
      const matchesSearch =
        !query ||
        ticketNumber(ticket, index).toLowerCase().includes(query) ||
        ticket.location?.toLowerCase().includes(query) ||
        ticket.description?.toLowerCase().includes(query) ||
        ticket.category?.toLowerCase().includes(query) ||
        ticket.reporterName?.toLowerCase().includes(query) ||
        ticket.assignedTechnicianName?.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "ALL" || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === "ALL" || ticket.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  return (
    <section className="ticket-module">
      <PageHeader
        eyebrow=""
        title="Incident Ticketing"
        description="Create, triage, assign, and resolve campus maintenance incidents from one workspace."
      />

      {error && <p className="state-text state-error">{error}</p>}

      <div className="ticket-hero">
        <div>
          <p className="ticket-overline">Live operations desk</p>
          <h3>Maintenance tickets with priority, ownership, evidence, and comments.</h3>
        </div>
        <button type="button" className="ticket-primary-button" onClick={() => navigate("/tickets/new")}>
          + New Ticket
        </button>
      </div>

      <div className="ticket-stat-grid">
        {STATUSES.slice(0, 4).map((status) => (
          <article key={status} className="ticket-stat">
            <span>{titleCase(status)}</span>
            <strong>{counts[status] ?? 0}</strong>
          </article>
        ))}
      </div>

      <div className="ticket-panel ticket-toolbar">
        <label className="ticket-search">
          <span>Search</span>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by ticket, location, category, reporter, or description"
          />
        </label>

        <label className="ticket-filter">
          <span>Status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="ALL">All Status</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {titleCase(status)}
              </option>
            ))}
          </select>
        </label>

        <label className="ticket-filter">
          <span>Priority</span>
          <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
            <option value="ALL">All Priority</option>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {titleCase(priority)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && <p className="state-text">Loading tickets...</p>}

      <div className="ticket-list">
        {!loading && filteredTickets.length === 0 && (
          <article className="ticket-panel ticket-empty">No tickets match the current filters.</article>
        )}

        {filteredTickets.map((ticket, index) => (
          <article
            key={ticket.id}
            className="ticket-list-card"
            onClick={() => navigate(`/tickets/${ticket.id}`)}
          >
            <div className="ticket-list-main">
              <div className="ticket-badge-row">
                <span className="ticket-number">{ticketNumber(ticket, index)}</span>
                <StatusPill value={ticket.status} />
                <PriorityPill value={ticket.priority} />
              </div>
              <h3>{titleCase(ticket.category)} issue at {ticket.location}</h3>
              <p>{ticket.description}</p>
              <div className="ticket-meta-row">
                <span>Location: {ticket.location}</span>
                <span>Reporter: {ticket.reporterName}</span>
                <span>Technician: {ticket.assignedTechnicianName ?? "Unassigned"}</span>
                <span>Created: {formatDate(ticket.createdAt)}</span>
              </div>
            </div>

            {ticket.attachmentUrls?.length > 0 && (
              <div className="ticket-thumb-strip">
                {ticket.attachmentUrls.slice(0, 3).map((url) => (
                  <img key={url} src={url} alt="Ticket attachment preview" />
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
