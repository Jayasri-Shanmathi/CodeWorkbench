import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AppLayout from "../components/Layout/AppLayout";
import Button from "../components/UI/Button";
import api from "../services/api";
import "./NewProject.css";

export default function NewProject() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState("");
  const [techStack, setTechStack] = useState("");

  const [features, setFeatures] = useState([]);
  const [newFeatureText, setNewFeatureText] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddFeature = (e) => {
    e.preventDefault();
    if (!newFeatureText.trim()) return;
    setFeatures([...features, newFeatureText.trim()]);
    setNewFeatureText("");
  };

  const handleRemoveFeature = (index) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please give your project a title.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Create the project
      const projectRes = await api.post("project/", {
        title: title.trim(),
        description: description.trim(),
        objectives: objectives.trim(),
        tech_stack: techStack.trim(),
        last_opened_at: new Date().toISOString(),
      });

      const newProjectId = projectRes.data.id;

      // 2. Add features if any
      for (const feat of features) {
        try {
          await api.post(`features/${newProjectId}/`, {
            feature: feat,
            is_completed: false,
          });
        } catch (fErr) {
          console.error("Error creating feature:", fErr);
        }
      }

      navigate(`/projects/${newProjectId}`);
    } catch (err) {
      console.error("Error creating project:", err);
      setError("Couldn't save this project. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="new-project-container">
        <div className="new-project-header">
          <Link to="/home" style={{ fontSize: "13.5px", color: "var(--text-muted)", display: "inline-block", marginBottom: "8px" }}>
            ← Back to Workbench
          </Link>
          <h2 className="new-project-title">Start something new.</h2>
          <p className="new-project-subtitle">
            Set up the foundation for your next idea.
          </p>
        </div>

        <div className="new-project-sheet">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label className="form-label" htmlFor="project-title">
                Project title *
              </label>
              <input
                id="project-title"
                type="text"
                className="form-input"
                placeholder="e.g. Invoice Extraction, Terminal CLI, Cozy Blog..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <label className="form-label" htmlFor="project-tech">
                Tech stack
              </label>
              <input
                id="project-tech"
                type="text"
                className="form-input"
                placeholder="e.g. React · FastAPI · PostgreSQL · Gemini"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
              />
            </div>

            <div className="form-row">
              <label className="form-label" htmlFor="project-desc">
                Description
              </label>
              <textarea
                id="project-desc"
                className="form-textarea"
                placeholder="A brief overview of what you're building..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="form-row">
              <label className="form-label" htmlFor="project-objectives">
                Objectives
              </label>
              <textarea
                id="project-objectives"
                className="form-textarea"
                placeholder="What are the key goals and milestones for this project?"
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                rows={3}
              />
            </div>

            {/* Features Checklist Builder */}
            <div className="features-section">
              <div className="features-header">
                <h3 className="features-title">Features Checklist</h3>
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  {features.length} feature{features.length === 1 ? "" : "s"} planned
                </span>
              </div>

              <div className="feature-input-row">
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Upload invoice, Extract OCR, Validate fields..."
                  value={newFeatureText}
                  onChange={(e) => setNewFeatureText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddFeature(e);
                    }
                  }}
                />
                <Button variant="secondary" onClick={handleAddFeature}>
                  + Add
                </Button>
              </div>

              {features.length > 0 && (
                <div className="feature-items-list">
                  {features.map((feat, idx) => (
                    <div key={idx} className="feature-item-row">
                      <span className="feature-item-text">
                        <span style={{ color: "var(--muted-brown)" }}>☐</span>
                        {feat}
                      </span>
                      <button
                        type="button"
                        className="feature-remove-btn"
                        onClick={() => handleRemoveFeature(idx)}
                        title="Remove feature"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <p style={{ color: "var(--terracotta)", marginBottom: "18px", fontSize: "14px" }}>
                {error}
              </p>
            )}

            <div className="form-actions">
              <Button variant="ghost" onClick={() => navigate("/home")}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? "Setting up..." : "Create Project"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
