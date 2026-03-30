import { useEffect, useState } from "react";

const initialLoginForm = {
  email: "",
  password: ""
};

const initialRegisterForm = {
  name: "",
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
  const [activeView, setActiveView] = useState("login");
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [token, setToken] = useState(() => localStorage.getItem("authToken") || "");
  const [userId, setUserId] = useState(() => localStorage.getItem("authUserId") || "");
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem("authUserEmail") || "");
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

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((currentValues) => ({
      ...currentValues,
      [name]: value
    }));
  };

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterForm((currentValues) => ({
      ...currentValues,
      [name]: value
    }));
  };

  const applyAuthResponse = (responseBody) => {
    localStorage.setItem("authToken", responseBody.token);
    localStorage.setItem("authUserId", String(responseBody.userId));
    localStorage.setItem("authUserEmail", responseBody.email);
    setToken(responseBody.token);
    setUserId(String(responseBody.userId));
    setUserEmail(responseBody.email);
  };

  const handleLoginSubmit = async (event) => {
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
        body: JSON.stringify(loginForm)
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

      applyAuthResponse(responseBody);
      setSuccessMessage("Logged in successfully.");
      setLoginForm(initialLoginForm);
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(registerForm)
      });

      const contentType = response.headers.get("content-type") || "";
      const responseBody = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        const message =
          typeof responseBody === "string"
            ? responseBody
            : responseBody.message || "Sign up failed";
        throw new Error(message);
      }

      applyAuthResponse(responseBody);
      setSuccessMessage("Account created successfully.");
      setRegisterForm(initialRegisterForm);
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
    localStorage.removeItem("authUserEmail");
    setToken("");
    setUserId("");
    setUserEmail("");
    setNotifications([]);
    setSuccessMessage("");
    setNotificationsError("");
    setErrorMessage("");
    setActiveView("login");
  };

  if (token && userId) {
    return (
      <main className="page">
        <section className="home-shell">
          <header className="hero-card">
            <div>
              <p className="eyebrow">VAAS</p>
              <h1>Welcome back</h1>
              <p className="subtitle">
                Signed in as <strong>{userEmail}</strong>
              </p>
            </div>

            <button type="button" className="secondary-button" onClick={handleLogout}>
              Log out
            </button>
          </header>

          <section className="demo-grid">
            <article className="info-card">
              <h2>Demo Home</h2>
              <p>
                This is a simple landing page for your frontend flow. You can use it as the
                starting point for dashboard cards, quick actions, or user-specific content.
              </p>
            </article>

            <article className="info-card">
              <h2>Account Snapshot</h2>
              <dl className="details-list">
                <div>
                  <dt>User ID</dt>
                  <dd>{userId}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>Authenticated</dd>
                </div>
              </dl>
            </article>
          </section>

          <section className="panel-card">
            <div className="panel-header">
              <div>
                <h2>Notifications</h2>
                <p className="subtitle">Recent updates for your account.</p>
              </div>
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
        </section>
      </main>
    );
  }

  return (
    <main className="page">
        <section className="auth-card">
          <div className="login-copy">
            <h1>{activeView === "login" ? "Login" : "Create account"}</h1>
            <p className="subtitle">
              {activeView === "login"
                ? "Use your account to access the demo home page."
                : "Create a user account and start adding data to your app."}
            </p>
          </div>

        <div className="auth-switch">
          <button
            type="button"
            className={`switch-button ${activeView === "login" ? "is-active" : ""}`}
            onClick={() => {
              setActiveView("login");
              setErrorMessage("");
              setSuccessMessage("");
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={`switch-button ${activeView === "signup" ? "is-active" : ""}`}
            onClick={() => {
              setActiveView("signup");
              setErrorMessage("");
              setSuccessMessage("");
            }}
          >
            Sign up
          </button>
        </div>

        {activeView === "login" ? (
          <form className="login-form" onSubmit={handleLoginSubmit}>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={loginForm.email}
                onChange={handleLoginChange}
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
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
        ) : (
          <form className="login-form" onSubmit={handleRegisterSubmit}>
            <label className="field">
              <span>Name</span>
              <input
                type="text"
                name="name"
                value={registerForm.name}
                onChange={handleRegisterChange}
                placeholder="Your full name"
                required
              />
            </label>

            <label className="field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={registerForm.email}
                onChange={handleRegisterChange}
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                value={registerForm.password}
                onChange={handleRegisterChange}
                placeholder="Minimum 8 characters"
                required
              />
              <small className="field-hint">
                Use at least 8 characters with one letter and one number.
              </small>
            </label>

            {errorMessage ? <p className="message error">{errorMessage}</p> : null}
            {successMessage ? <p className="message success">{successMessage}</p> : null}

            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Sign up"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
