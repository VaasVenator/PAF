import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../auth/AuthContext";
import { apiPatch } from "../lib/api";
import { useApi } from "../hooks/useApi";

export default function NotificationsPage() {
  const { user } = useAuth();
  const { data, loading, error } = useApi("/api/notifications");
  const [notifications, setNotifications] = useState([]);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setNotifications(Array.isArray(data) ? data : []);
  }, [data]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  async function handleMarkAsRead(notificationId) {
    try {
      setBusyId(notificationId);
      const updated = await apiPatch(`/api/notifications/${notificationId}/read`, {}, user);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId ? updated : notification
        )
      );
      setMessage("Notification marked as read.");
    } finally {
      setBusyId("");
    }
  }

  async function handleMarkAllAsRead() {
    const unreadNotifications = notifications.filter((notification) => !notification.read);
    if (!unreadNotifications.length) {
      return;
    }

    setBusyId("ALL");
    try {
      const updatedNotifications = await Promise.all(
        unreadNotifications.map((notification) =>
          apiPatch(`/api/notifications/${notification.id}/read`, {}, user)
        )
      );
      const byId = new Map(updatedNotifications.map((notification) => [notification.id, notification]));
      setNotifications((current) =>
        current.map((notification) => byId.get(notification.id) ?? notification)
      );
      setMessage("All notifications marked as read.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <section>
      <PageHeader
        eyebrow=""
        title="Notification center"
        description="Track booking decisions, ticket updates, and new comments with a clear in-app notification feed."
      />

      <div className="booking-toolbar">
        <div className="stack-meta">
          <span>Total notifications: {notifications.length}</span>
          <span>Unread: {unreadCount}</span>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={handleMarkAllAsRead}
          disabled={busyId === "ALL" || unreadCount === 0}
        >
          Mark all as read
        </button>
      </div>

      {message ? <p className="form-message form-message-success">{message}</p> : null}
      {loading && <p className="state-text">Loading notifications...</p>}
      {error && <p className="state-text state-error">{error}</p>}

      <div className="stack-list">
        {notifications.map((notification) => (
          <article
            key={notification.id}
            className={`stack-card ${notification.read ? "" : "notification-unread"}`}
          >
            <div className="stack-head">
              <div>
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
              </div>
              <StatusBadge value={notification.read ? "READ" : "NEW"} />
            </div>

            <div className="stack-meta">
              <span>{notification.type}</span>
              <span>{new Date(notification.createdAt).toLocaleString()}</span>
              {notification.referenceId ? <span>Reference: {notification.referenceId}</span> : null}
            </div>

            {!notification.read ? (
              <div className="resource-card-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => handleMarkAsRead(notification.id)}
                  disabled={busyId === notification.id}
                >
                  {busyId === notification.id ? "Updating..." : "Mark as read"}
                </button>
              </div>
            ) : null}
          </article>
        ))}

        {!loading && notifications.length === 0 ? (
          <p className="state-text">No notifications available yet.</p>
        ) : null}
      </div>
    </section>
  );
}
