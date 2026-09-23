import { useState, useEffect } from "react";
import { useOutletContext, useNavigate, useParams, Link } from "react-router-dom";
import Button from "../../components/UI/Button";
import ConfirmDialog from "../../components/UI/ConfirmDialog";
import api from "../../services/api";
import "./Journal.css";

const FLAG_CHOICES = ["GENERAL", "IDEA", "DECISION", "DISCARDED"];

export default function JournalEntry() {
  const { project } = useOutletContext();
  const { journalId } = useParams();
  const navigate = useNavigate();

  const isEditing = Boolean(journalId && journalId !== "new");

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

  const [title, setTitle] = useState("");
  const [entryText, setEntryText] = useState("");
  const [flag, setFlag] = useState("GENERAL");
  const [entryTimestamp, setEntryTimestamp] = useState(() => formatTimestamp());
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");

  // Load entry if editing
  useEffect(() => {
    if (!isEditing || !project?.id) {
      return;
    }

    let ignore = false;
    const loadEntry = async () => {
      try {
        const res = await api.get(`journal/${project.id}/`);
        if (ignore) return;
        const found = res.data.find((j) => String(j.id) === String(journalId));
        if (found) {
          setTitle(found.title);
          setEntryText(found.entry);
          setFlag(found.flag || "GENERAL");
          setExistingImages(found.images || []);
          setEntryTimestamp(formatTimestamp(found.date || found.created_at));
        } else {
          setError("Journal entry not found.");
        }
      } catch (err) {
        if (!ignore) {
          console.error("Error loading journal entry:", err);
          setError("Could not load this entry.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadEntry();
    return () => {
      ignore = true;
    };
  }, [project?.id, journalId, isEditing]);

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
    if (!title.trim() || !entryText.trim()) {
      setError("Please provide both a title and some thoughts for your entry.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      let savedEntryId = journalId;

      if (isEditing) {
        await api.patch(`update_journal/${project.id}/${journalId}/`, {
          title: title.trim(),
          entry: entryText.trim(),
          flag,
        });
      } else {
        const res = await api.post(`journal/${project.id}/`, {
          title: title.trim(),
          entry: entryText.trim(),
          flag,
        });
        savedEntryId = res.data.id;
      }

      // Upload attached images if any
      if (newImageFiles.length > 0) {
        for (const file of newImageFiles) {
          const formData = new FormData();
          formData.append("image", file);
          try {
            await api.post(
              `journal/${project.id}/${savedEntryId}/images/`,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );
          } catch (uploadErr) {
            console.error("Error uploading journal image:", uploadErr);
          }
        }
      }

      navigate(`/projects/${project.id}/journal`);
    } catch (err) {
      console.error("Error saving journal entry:", err);
      setError("Couldn't save this entry. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`delete_journal/${project.id}/${journalId}/`);
      navigate(`/projects/${project.id}/journal`);
    } catch (err) {
      console.error("Error deleting journal entry:", err);
      setError("Failed to delete journal entry.");
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
        Opening your notebook page...
      </div>
    );
  }

  return (
    <div className="journal-container">
      <div style={{ marginBottom: "16px" }}>
        <Link
          to={`/projects/${project.id}/journal`}
          style={{
            fontSize: "13px",
            color: "var(--text-muted)",
            display: "inline-block",
            marginBottom: "8px",
          }}
        >
          ← Back to Journal
        </Link>
      </div>

      {/* Notebook Page Sheet */}
      <article className="journal-editor-page">
        <form onSubmit={handleSubmit}>
          {/* Header Bar: Heading & Timestamp */}
          <div className="editor-header-bar">
            <h2 className="editor-page-heading">
              {isEditing ? "EDIT JOURNAL ENTRY" : "NEW JOURNAL ENTRY"}
            </h2>
            <span className="editor-timestamp">{entryTimestamp}</span>
          </div>

          {/* Title Input */}
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="journal-title"
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
              Title
            </label>
            <input
              id="journal-title"
              type="text"
              className="notebook-title-input"
              placeholder="Give your note a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Note Type / Flag Selector */}
          <div className="editor-flag-group">
            <span className="editor-flag-label">NOTE TYPE / FLAG</span>
            <div className="flag-tabs">
              {FLAG_CHOICES.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`flag-tab-btn ${flag === f ? "selected" : ""}`}
                  onClick={() => setFlag(f)}
                >
                  [ {f} ]
                </button>
              ))}
            </div>
          </div>

          {/* Thoughts & Notes Ruled Writing Area */}
          <div className="notebook-writing-area">
            <label
              htmlFor="journal-body"
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
              Thoughts & Notes
            </label>
            <textarea
              id="journal-body"
              className="notebook-lined-textarea"
              placeholder="Start writing... Thoughts, decisions, trade-offs, observations, or ideas."
              value={entryText}
              onChange={(e) => setEntryText(e.target.value)}
              rows={11}
              required
            />
          </div>

          {/* Existing Attached Images */}
          {existingImages.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <span className="editor-flag-label">Attached Images</span>
              <div className="journal-images-grid">
                {existingImages.map((img) => (
                  <div key={img.id} className="notebook-image-frame">
                    <img
                      src={
                        img.image.startsWith("http")
                          ? img.image
                          : `http://localhost:8000${img.image}`
                      }
                      alt="Attached"
                      className="notebook-image-thumb"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Image Upload Section */}
          <div className="editor-image-section">
            <label htmlFor="journal-file-input" className="add-image-trigger">
              <span>+ Add images</span>
            </label>
            <input
              id="journal-file-input"
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

          {/* Form Actions */}
          <div className="editor-actions">
            {isEditing && (
              <Button
                variant="ghost"
                type="button"
                style={{ color: "#C45548", marginRight: "auto" }}
                onClick={() => setShowDeleteConfirm(true)}
                disabled={saving || deleting}
              >
                Delete Entry
              </Button>
            )}
            <Button
              variant="ghost"
              type="button"
              onClick={() => navigate(`/projects/${project.id}/journal`)}
              disabled={saving || deleting}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving || deleting}>
              {saving ? "Saving note..." : "Save Entry"}
            </Button>
          </div>
        </form>
      </article>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete this journal entry?"
        message="This will permanently tear this page from your engineering notebook. This cannot be undone."
        confirmLabel={deleting ? "Deleting..." : "Delete Entry"}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
