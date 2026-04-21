// frontend/src/pages/AdminBookingsPage.jsx
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../auth/AuthContext";
import { apiGet, apiPatch } from "../lib/api";

export default function AdminBookingsPage() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [reviewReason, setReviewReason] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const endpoint = useMemo(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.append("status", statusFilter);
    if (dateFilter) params.append("bookingDate", dateFilter);
    const query = params.toString();
    return query ? `/api/bookings?${query}` : "/api/bookings";
  }, [statusFilter, dateFilter]);

  useEffect(() => {
    loadBookings();
    loadSummary();
  }, [endpoint]);

  async function loadBookings() {
    try {
      setLoading(true);
      const payload = await apiGet(endpoint, user);
      setBookings(Array.isArray(payload) ? payload : []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadSummary() {
    try {
      const payload = await apiGet("/api/bookings/summary", user);
      setSummary(payload);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleReview(bookingId, decision) {
    try {
      setError("");
      setMessage("");
      setFieldErrors((current) => ({
        ...current,
        [bookingId]: ""
      }));

      if (decision === "REJECTED" && !(reviewReason[bookingId] ?? "").trim()) {
        setFieldErrors((current) => ({
          ...current,
          [bookingId]: "Reason is required when rejecting a booking."
        }));
        return;
      }

      await apiPatch(
        `/api/bookings/${bookingId}/review`,
        {
          decision,
          reason: reviewReason[bookingId] ?? ""
        },
        user
      );

      setMessage(`Booking ${decision.toLowerCase()} successfully.`);
      await loadBookings();
      await loadSummary();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCancel(bookingId) {
    const confirmed = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await apiPatch(`/api/bookings/${bookingId}/cancel`, undefined, user);

      setMessage("Booking cancelled successfully.");
      await loadBookings();
      await loadSummary();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <PageHeader
        eyebrow=""
        title="Admin booking approvals"
        description="Review booking requests, apply filters, approve or reject with reasons, and manage booking status."
      />

      <div className="booking-summary-grid">
        <div className="summary-card"><h4>Total</h4><p>{summary.total}</p></div>
        <div className="summary-card"><h4>Pending</h4><p>{summary.pending}</p></div>
        <div className="summary-card"><h4>Approved</h4><p>{summary.approved}</p></div>
        <div className="summary-card"><h4>Rejected</h4><p>{summary.rejected}</p></div>
        <div className="summary-card"><h4>Cancelled</h4><p>{summary.cancelled}</p></div>
      </div>

      <div className="admin-bookings-toolbar">
        <label className="field admin-bookings-filter">
          <span>Status filter</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </label>

        <label className="field admin-bookings-filter">
          <span>Date filter</span>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </label>
      </div>

      {message ? <p className="form-message form-message-success">{message}</p> : null}
      {error ? <p className="form-message form-message-error">{error}</p> : null}
      {loading ? <p className="state-text">Loading bookings...</p> : null}

      <div className="stack-list">
        {!loading && bookings.length === 0 ? (
          <p className="state-text">No bookings found.</p>
        ) : null}

        {bookings.map((booking) => (
          <article key={booking.id} className="stack-card admin-booking-card">
            <div className="stack-head">
              <div>
                <h3>{booking.resourceName}</h3>
                <p>{booking.bookingDate} | {booking.startTime} - {booking.endTime}</p>
              </div>
              <StatusBadge value={booking.status} />
            </div>

            <p className="stack-copy">{booking.purpose}</p>

            <div className="stack-meta">
              <span>Requester: {booking.requesterName}</span>
              <span>Attendees: {booking.expectedAttendees}</span>
              <span>Reviewed by: {booking.reviewedBy ?? "Not reviewed yet"}</span>
            </div>

            {booking.decisionReason ? (
              <p className="booking-reason">
                <strong>Reason:</strong> {booking.decisionReason}
              </p>
            ) : null}

            {booking.status === "PENDING" ? (
              <div className="admin-booking-actions">
                <label className="field">
                  <span>Review reason</span>
                  <textarea
                    className="booking-review-textarea"
                    placeholder="Required for rejection, optional for approval"
                    value={reviewReason[booking.id] ?? ""}
                    onChange={(event) =>
                      setReviewReason((current) => ({
                        ...current,
                        [booking.id]: event.target.value
                      }))
                    }
                  />
                  {fieldErrors[booking.id] ? (
                    <p className="field-error">{fieldErrors[booking.id]}</p>
                  ) : null}
                </label>

                <div className="admin-booking-button-row">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleReview(booking.id, "APPROVED")}
                  >
                    Approve
                  </button>

                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => handleReview(booking.id, "REJECTED")}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ) : null}

            {(booking.status === "PENDING" || booking.status === "APPROVED") ? (
              <div className="admin-booking-cancel-row">
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => handleCancel(booking.id)}
                >
                  Cancel booking
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}