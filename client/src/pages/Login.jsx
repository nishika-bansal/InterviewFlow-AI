import { BrainCircuit, LogIn } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Alert from "../components/Alert.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-panel">
        <div className="auth-brand">
          <span className="brand-mark">IF</span>
          <div>
            <strong>InterviewFlow AI</strong>
            <small>Resume Analyzer + Interview Prep</small>
          </div>
        </div>
        <div className="auth-heading">
          <BrainCircuit size={34} />
          <h1>Login</h1>
        </div>

        <Alert type="error" message={error} />

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>
          <button className="primary-button" type="submit" disabled={loading}>
            <LogIn size={18} />
            <span>{loading ? "Signing in..." : "Sign in"}</span>
          </button>
        </form>

        <p className="auth-switch">
          New here? <Link to="/register">Create account</Link>
        </p>
      </section>
    </main>
  );
}
