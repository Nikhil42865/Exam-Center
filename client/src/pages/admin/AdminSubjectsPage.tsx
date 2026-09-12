import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/api.js";
import { SubjectDto, CreateSubjectDto } from "@examcenter/contracts";
import { Modal } from "../../components/ui/Modal.js";
import { Alert } from "../../components/ui/Alert.js";
import { PlusCircle, Edit, Trash2, Power, BookMarked, Search } from "lucide-react";

export const AdminSubjectsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectDto | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch subjects
  const { data: subjects, isLoading } = useQuery({
    queryKey: ["admin-subjects"],
    queryFn: () => api.subjects.getAdminSubjects(),
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setIsActive(true);
    setFormError(null);
    setIsSubmitting(false);
    setEditingSubject(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (subject: SubjectDto) => {
    setEditingSubject(subject);
    setName(subject.name);
    setDescription(subject.description || "");
    setIsActive(subject.isActive);
    setFormError(null);
    setIsCreateOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (editingSubject) {
        await api.subjects.updateSubject(editingSubject.id, {
          name,
          description,
          isActive,
        });
      } else {
        await api.subjects.createSubject({
          name,
          description,
          isActive,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["admin-subjects"] });
      setIsCreateOpen(false);
      resetForm();
    } catch (err: any) {
      setFormError(err.message || "Failed to save subject");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOrDeactivate = async (subject: SubjectDto) => {
    const confirmMsg =
      (subject.examCount || 0) > 0
        ? `"${subject.name}" is referenced by ${subject.examCount} exam(s). It cannot be deleted, but it will be deactivated. Proceed?`
        : `Are you sure you want to delete "${subject.name}"?`;

    if (window.confirm(confirmMsg)) {
      try {
        await api.subjects.deleteSubject(subject.id);
        queryClient.invalidateQueries({ queryKey: ["admin-subjects"] });
      } catch (err: any) {
        alert(err.message || "Action failed");
      }
    }
  };

  const filtered = subjects?.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="page-container">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>Subject Management</h1>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Create academic domains and subject categories for examinations.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary">
          <PlusCircle size={18} /> Add New Subject
        </button>
      </div>

      {/* Filter / Search */}
      <div style={{ marginBottom: "1.5rem", maxWidth: "340px", position: "relative" }}>
        <input
          type="text"
          className="form-input"
          placeholder="Filter subjects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: "2.25rem" }}
        />
        <Search
          size={16}
          color="var(--color-muted)"
          style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}
        />
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-responsive">
          {isLoading ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <div className="spinner spinner-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-muted)" }}>
              No subjects found. Click "Add New Subject" to create one.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject Name</th>
                  <th>Slug</th>
                  <th>Description</th>
                  <th>Exams Count</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => (
                  <tr key={sub.id}>
                    <td style={{ fontWeight: "600" }}>{sub.name}</td>
                    <td style={{ color: "var(--color-muted)", fontSize: "0.85rem" }}>{sub.slug}</td>
                    <td style={{ maxWidth: "300px", color: "var(--color-text-secondary)" }}>
                      {sub.description || "—"}
                    </td>
                    <td>
                      <span className="badge badge-muted">{sub.examCount || 0} exams</span>
                    </td>
                    <td>
                      {sub.isActive ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-danger">Disabled</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => handleOpenEdit(sub)}
                          className="btn btn-secondary btn-icon"
                          title="Edit Subject"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteOrDeactivate(sub)}
                          className="btn btn-ghost btn-icon"
                          title="Delete / Deactivate"
                        >
                          <Trash2 size={15} color="var(--color-danger)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={editingSubject ? "Edit Subject" : "Create New Subject"}
      >
        {formError && <Alert type="danger" message={formError} />}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label" htmlFor="sub-name">
              Subject Name *
            </label>
            <input
              id="sub-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Computer Networks, Biochemistry"
              required
              minLength={2}
              maxLength={80}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="sub-desc">
              Description (Optional)
            </label>
            <textarea
              id="sub-desc"
              className="form-textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the subject domain..."
              maxLength={1000}
            />
          </div>

          <div className="form-group">
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ width: "16px", height: "16px" }}
              />
              <span style={{ fontSize: "0.9rem", fontWeight: "500" }}>
                Active (Candidate catalog will show tests under this subject)
              </span>
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <span className="spinner" /> : editingSubject ? "Save Changes" : "Create Subject"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
