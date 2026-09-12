import React, { useState } from "react";
import { useAuth } from "../../features/auth/AuthContext.js";
import { api } from "../../services/api.js";
import { Alert } from "../../components/ui/Alert.js";
import { User, Mail, Shield, Save } from "lucide-react";

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(null);
    setError(null);

    try {
      await api.auth.updateMe(name);
      await refreshUser();
      setSuccess("Profile updated successfully");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: "680px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>Your Profile</h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Manage your account settings and personal details.
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 style={{ fontSize: "1.15rem" }}>Account Information</h2>
        </div>

        <div className="card-body">
          {success && <Alert type="success" message={success} />}
          {error && <Alert type="danger" message={error} />}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Full Name
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="name"
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ paddingLeft: "2.5rem" }}
                />
                <User
                  size={18}
                  color="var(--color-muted)"
                  style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address (Read-only)
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  value={user?.email || ""}
                  disabled
                  style={{ paddingLeft: "2.5rem", backgroundColor: "var(--color-surface-subtle)" }}
                />
                <Mail
                  size={18}
                  color="var(--color-muted)"
                  style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}
                />
              </div>
              <span className="form-hint">Email address cannot be changed in the MVP release.</span>
            </div>

            <div className="form-group">
              <label className="form-label">System Role</label>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="badge badge-primary" style={{ padding: "0.4rem 0.85rem", fontSize: "0.85rem" }}>
                  <Shield size={14} /> {user?.role}
                </span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }} disabled={isSaving}>
              {isSaving ? <span className="spinner" /> : <><Save size={16} /> Save Changes</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
