import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext.js";
import { Alert } from "../../components/ui/Alert.js";
import { Eye, EyeOff, LogIn, KeyRound } from "lucide-react";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const redirectUrl = queryParams.get("redirect") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate(redirectUrl);
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setEmail("admin@examcenter.internal");
    setPassword("AdminPassword123!");
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - var(--header-height) - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      <div className="card" style={{ maxWidth: "440px", width: "100%", padding: "2.5rem 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-primary-light)",
              color: "var(--color-primary)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem",
            }}
          >
            <LogIn size={24} />
          </div>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Sign in to ExamCenter</h1>
          <p style={{ fontSize: "0.9rem" }}>Enter your credentials to access exams and reports</p>
        </div>

        {error && <Alert type="danger" message={error} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ paddingRight: "2.5rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="btn btn-ghost btn-icon"
                style={{ position: "absolute", right: "4px", top: "50%", transform: "translateY(-50%)" }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }} disabled={loading}>
            {loading ? <span className="spinner" /> : "Sign In"}
          </button>
        </form>

        {/* Quick Demo Fill Helper */}
        <div
          style={{
            marginTop: "1.75rem",
            padding: "0.875rem",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--color-surface-subtle)",
            border: "1px dashed var(--color-border)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "var(--color-muted)", marginBottom: "0.5rem" }}>
            Testing credentials:
          </div>
          <button
            type="button"
            onClick={handleFillDemoAdmin}
            className="btn btn-secondary btn-sm"
            style={{ width: "100%", fontSize: "0.825rem", gap: "0.35rem" }}
          >
            <KeyRound size={14} /> Quick-fill Seeded Admin Account
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ fontWeight: "600" }}>
            Create one now
          </Link>
        </div>
      </div>
    </div>
  );
};
