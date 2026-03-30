import { useEffect, useState } from "react";

const initialForm = {
  email: "",
  password: ""
};

function formatTimestamp(value) {
  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export default function App() {
  const [formValues, setFormValues] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [token, setToken] = useState(() => localStorage.getItem("authToken") || "");
  const [userId, setUserId] = useState(() => localStorage.getItem("authUserId") || "");
  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const [activeNotificationId, setActiveNotificationId] = useState(null);

  useEffect(() => {
    if (!token || !userId) {
      return;
    }

    const loadNotifications = async () => {
      setIsLoadingNotifications(true);
      setNotificationsError("");

      try {
        const response = await fetch(`/notifications/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Could not load notifications.");
        }

        const responseBody = await response.json();
        setNotifications(responseBody);
      } catch (error) {
        setNotificationsError(error.message || "Could not load notifications.");
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    loadNotifications();
  }, [token, userId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formValues)
      });

      const contentType = response.headers.get("content-type") || "";
      const responseBody = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        const message =
          typeof responseBody === "string"
            ? responseBody
            : responseBody.message || "Login failed";
        throw new Error(message);
      }

      localStorage.setItem("authToken", responseBody.token);
      localStorage.setItem("authUserId", String(responseBody.userId));
      setToken(responseBody.token);
      setUserId(String(responseBody.userId));
      setSuccessMessage("Logged in successfully.");
      setFormValues(initialForm);
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    setActiveNotificationId(notificationId);
    setNotificationsError("");

    try {
      const response = await fetch(`/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Could not update notification.");
      }

      const updatedNotification = await response.json();
      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.id === updatedNotification.id ? updatedNotification : notification
        )
      );
    } catch (error) {
      setNotificationsError(error.message || "Could not update notification.");
    } finally {
      setActiveNotificationId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUserId");
    setToken("");
    setUserId("");
    setNotifications([]);
    setSuccessMessage("");
    setNotificationsError("");
  };

  if (token && userId) {
    return (
      <main className="page">
        <section className="panel-card">
          <div className="panel-header">
            <div>
              <p className="eyebrow">VAAS</p>
              <h1>Notifications</h1>
              <p className="subtitle">Recent updates for your account.</p>
            </div>

            <button type="button" className="secondary-button" onClick={handleLogout}>
              Log out
            </button>
          </div>

          {notificationsError ? <p className="message error">{notificationsError}</p> : null}

          {isLoadingNotifications ? (
            <p className="empty-state">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p className="empty-state">No notifications yet.</p>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <article
                  key={notification.id}
                  className={`notification-item ${notification.read ? "is-read" : ""}`}
                >
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    <p className="notification-time">{formatTimestamp(notification.timestamp)}</p>
                  </div>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleMarkAsRead(notification.id)}
                    disabled={notification.read || activeNotificationId === notification.id}
                  >
                    {notification.read
                      ? "Read"
                      : activeNotificationId === notification.id
                        ? "Saving..."
                        : "Mark as read"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="login-card">
        <div className="login-copy">
          <p className="eyebrow">VAAS</p>
          <h1>Login</h1>
          <p className="subtitle">Use your account to access the dashboard.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={formValues.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={formValues.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </label>

          {errorMessage ? <p className="message error">{errorMessage}</p> : null}
          {successMessage ? <p className="message success">{successMessage}</p> : null}

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}
