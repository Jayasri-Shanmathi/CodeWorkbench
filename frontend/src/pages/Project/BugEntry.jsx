import { useState, useEffect } from "react";
import { useOutletContext, useNavigate, useParams, Link } from "react-router-dom";
import Button from "../../components/UI/Button";
import ConfirmDialog from "../../components/UI/ConfirmDialog";
import api from "../../services/api";
import "./BugDiary.css";

export default function BugEntry() {
  const { project } = useOutletContext();
  const { bugId } = useParams();
  const navigate = useNavigate();

  const isEditing = Boolean(bugId && bugId !== "new");

  const formatTimestamp = (dateInput) => {
    const d = dateInput ? new Date(dateInput) : new Date();
    const datePart = d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const timePart = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${datePart} · ${timePart}`;
  };

  const [bugTitle, setBugTitle] = useState("");
  const [entryText, setEntryText] = useState("");
  const [solutionText, setSolutionText] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [entryTimestamp, setEntryTimestamp] = useState(() => formatTimestamp());
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditing || !project?.id) {
      return;
    }

    let ignore = false;
    const loadBug = async () => {
      try {
        const res = await api.get(`bugs/${project.id}/`);
        if (ignore) return;
        const found = res.data.find((b) => String(b.id) === String(bugId));
        if (found) {
          setBugTitle(found.bug);
          setEntryText(found.entry);
          setSolutionText(found.solution || "");
          setIsCompleted(found.is_completed);
          setExistingImages(found.images || []);
          setEntryTimestamp(formatTimestamp(found.created_at));
        } else {
          setError("Bug entry not found.");
        }
      } catch (err) {
        if (!ignore) {
          console.error("Error loading bug:", err);
          setError("Could not load this bug entry.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadBug();
    return () => {
      ignore = true;
    };
  }, [project?.id, bugId, isEditing]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setNewImageFiles((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setNewImagePreviews((prev) => [...prev, ...previews]);
  };

  const handleRemoveNewImage = (index) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bugTitle.trim() || !entryText.trim()) {
      setError("Please describe what broke and what happened.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      let savedBugId = bugId;

      if (isEditing) {
        await api.patch(`update_bug/${project.id}/${bugId}/`, {
          bug: bugTitle.trim(),
          entry: entryText.trim(),
          solution: solutionText.trim(),
          is_completed: isCompleted,
        });
      } else {
        const res = await api.post(`bugs/${project.id}/`, {
          bug: bugTitle.trim(),
          entry: entryText.trim(),
          solution: solutionText.trim(),
          is_completed: isCompleted,
        });
        savedBugId = res.data.id;
      }

      // Upload attached screenshots if any
      if (newImageFiles.length > 0) {
        for (const file of newImageFiles) {
          const formData = new FormData();
          formData.append("image", file);
          try {
            await api.post(
              `bugs/${project.id}/${savedBugId}/images/`,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );
          } catch (uploadErr) {
            console.error("Error uploading bug screenshot:", uploadErr);
          }
        }
      }

      navigate(`/projects/${project.id}/bugs`);
    } catch (err) {
      console.error("Error saving bug:", err);
      setError("Couldn't save this bug record. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`delete_bug/${project.id}/${bugId}/`);
      navigate(`/projects/${project.id}/bugs`);
    } catch (err) {
      console.error("Error deleting bug:", err);
      setError("Failed to delete bug entry.");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "60px 0",
          textAlign: "center",
          color: "var(--text-muted)",
          fontFamily: "var(--font-serif)",
        }}
      >
        Opening bug worksheet...
      </div>
    );
  }

  return (
    <div className="bugs-container">
      <div style={{ marginBottom: "16px" }}>
        <Link
          to={`/projects/${project.id}/bugs`}
          style={{
            fontSize: "13px",
            color: "var(--text-muted)",
            display: "inline-block",
            marginBottom: "8px",
          }}
        >
          ← Back to Bug Diary
        </Link>
      </div>

      {/* Debugging Worksheet inside Notebook */}
      <article className="bug-editor-page">
        <form onSubmit={handleSubmit}>
          {/* Header Bar */}
          <div className="editor-header-bar">
            <h2 className="editor-page-heading">
              {isEditing ? "EDIT BUG RECORD" : "RECORD A BUG"}
            </h2>
            <span className="editor-timestamp">{entryTimestamp}</span>
          </div>

          {/* WHAT BROKE? Title Input */}
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="bug-title"
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "1.5px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              WHAT BROKE? *
            </label>
            <input
              id="bug-title"
              type="text"
              className="notebook-title-input"
              placeholder="e.g. Why wasn't Gemini returning valid JSON? / API returns 500 on large payload"
              value={bugTitle}
              onChange={(e) => setBugTitle(e.target.value)}
              required
            />
          </div>

          {/* STATUS TOGGLE */}
          <div style={{ marginBottom: "24px" }}>
            <span
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "1.5px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              STATUS
            </span>
            <div className="bug-status-tabs">
              <button
                type="button"
                className={`bug-status-tab-btn ${!isCompleted ? "active" : ""}`}
                onClick={() => setIsCompleted(false)}
              >
                [ IN PROGRESS ]
              </button>
              <button
                type="button"
                className={`bug-status-tab-btn ${isCompleted ? "active" : ""}`}
                onClick={() => setIsCompleted(true)}
              >
                [ COMPLETED ]
              </button>
            </div>
          </div>

          {/* WHAT HAPPENED? Lined Writing Area */}
          <div className="notebook-writing-area">
            <label
              htmlFor="bug-entry"
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "1.5px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              WHAT HAPPENED? *
            </label>
            <textarea
              id="bug-entry"
              className="notebook-lined-textarea"
              placeholder="Describe the error, what you expected vs what actually happened, symptoms, stack traces..."
              value={entryText}
              onChange={(e) => setEntryText(e.target.value)}
              rows={7}
              required
            />
          </div>

          {/* SOLUTION Lined Writing Area */}
          <div className="notebook-writing-area">
            <label
              htmlFor="bug-solution"
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "1.5px",
                color: "var(--muted-green)",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              SOLUTION {isCompleted && "(HOW IT WAS FIXED)"}
            </label>
            <textarea
              id="bug-solution"
              className="notebook-lined-textarea"
              placeholder={
                isCompleted
                  ? "Explain what fixed it and what was learned..."
                  : "Leave blank if still working on it, or note candidate solutions..."
              }
              value={solutionText}
              onChange={(e) => setSolutionText(e.target.value)}
              rows={6}
            />
          </div>

          {/* Existing Attached Screenshots */}
          {existingImages.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <span
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                ATTACHED SCREENSHOTS
              </span>
              <div className="journal-images-grid">
                {existingImages.map((img) => (
                  <div key={img.id} className="notebook-image-frame">
                    <img
                      src={
                        img.image.startsWith("http")
                          ? img.image
                          : `http://localhost:8000${img.image}`
                      }
                      alt="Bug attachment"
                      className="notebook-image-thumb"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Image Upload Section */}
          <div className="editor-image-section">
            <span
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "1.5px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              IMAGES
            </span>
            <label htmlFor="bug-file-input" className="add-image-trigger">
              <span>+ Add images</span>
            </label>
            <input
              id="bug-file-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              style={{ display: "none" }}
            />

            {newImagePreviews.length > 0 && (
              <div className="editor-image-previews">
                {newImagePreviews.map((preview, i) => (
                  <div key={i} className="image-preview-card">
                    <img
                      src={preview}
                      alt="Upload preview"
                      className="preview-img"
                    />
                    <button
                      type="button"
                      className="preview-delete-btn"
                      onClick={() => handleRemoveNewImage(i)}
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p
              style={{
                color: "var(--terracotta)",
                marginBottom: "16px",
                fontSize: "14px",
              }}
            >
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="editor-actions">
            {isEditing && (
              <Button
                variant="ghost"
                type="button"
                style={{ color: "#C45548", marginRight: "auto" }}
                onClick={() => setShowDeleteConfirm(true)}
                disabled={saving || deleting}
              >
                Delete Bug
              </Button>
            )}
            <Button
              variant="ghost"
              type="button"
              onClick={() => navigate(`/projects/${project.id}/bugs`)}
              disabled={saving || deleting}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving || deleting}>
              {saving ? "Saving bug..." : "Save Bug"}
            </Button>
          </div>
        </form>
      </article>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete this bug record?"
        message="This will permanently remove this debugging record from your notebook. This cannot be undone."
        confirmLabel={deleting ? "Deleting..." : "Delete Bug"}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
