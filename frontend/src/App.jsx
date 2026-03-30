import { useState } from "react";

const initialForm = {
  email: "",
  password: ""
};

export default function App() {
  const [formValues, setFormValues] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
      setSuccessMessage("Logged in successfully.");
      setFormValues(initialForm);
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
