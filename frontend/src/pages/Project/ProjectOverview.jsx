import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import ProgressBar from "../../components/UI/ProgressBar";
import StatusBadge from "../../components/UI/StatusBadge";
import Button from "../../components/UI/Button";
import api from "../../services/api";
import "./ProjectOverview.css";

export default function ProjectOverview() {
  const { project, reloadProject } = useOutletContext();

  const [features, setFeatures] = useState([]);
  const [journalCount, setJournalCount] = useState(0);
  const [openBugsCount, setOpenBugsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [newFeature, setNewFeature] = useState("");
  const [addingFeature, setAddingFeature] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    const loadData = async () => {
      if (!project?.id) return;
      try {
        const [featRes, jRes, bRes] = await Promise.all([
          api.get(`features/${project.id}/`),
          api.get(`journal/${project.id}/`),
          api.get(`bugs/${project.id}/`),
        ]);
        if (ignore) return;
        setFeatures(featRes.data);
        setJournalCount(jRes.data.length);
        setOpenBugsCount(bRes.data.filter((b) => !b.is_completed).length);
      } catch (err) {
        console.error("Error loading overview data:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadData();
    return () => {
      ignore = true;
    };
  }, [project?.id, refreshKey]);

  const handleToggleFeature = async (featureId, currentStatus) => {
    try {
      // Optimistic update
      setFeatures((prev) =>
        prev.map((f) =>
          f.id === featureId ? { ...f, is_completed: !currentStatus } : f
        )
      );

      await api.patch(`update_feature/${project.id}/${featureId}/`, {
        is_completed: !currentStatus,
      });

      // Reload project to update progress bar across workspace
      reloadProject();
    } catch (err) {
      console.error("Error toggling feature:", err);
      setRefreshKey((k) => k + 1);
    }
  };

  const handleAddFeature = async (e) => {
    e.preventDefault();
    if (!newFeature.trim()) return;

    try {
      setAddingFeature(true);
      const res = await api.post(`features/${project.id}/`, {
        feature: newFeature.trim(),
        is_completed: false,
      });
      setFeatures((prev) => [...prev, res.data]);
      setNewFeature("");
      reloadProject();
    } catch (err) {
      console.error("Error adding feature:", err);
    } finally {
      setAddingFeature(false);
    }
  };

  const handleDeleteFeature = async (featureId) => {
    try {
      setFeatures((prev) => prev.filter((f) => f.id !== featureId));
      await api.delete(`delete_feature/${project.id}/${featureId}/`);
      reloadProject();
    } catch (err) {
      console.error("Error deleting feature:", err);
      setRefreshKey((k) => k + 1);
    }
  };

  const completedCount = features.filter((f) => f.is_completed).length;
  const totalCount = features.length;
  const calculatedProgress =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isCompleted = calculatedProgress >= 100 && totalCount > 0;

  return (
    <div className="project-overview-container">
      {/* Project Hero Header */}
      <section className="project-hero">
        <div className="project-hero-top">
          <h1 className="project-hero-title">{project.title}</h1>
          <StatusBadge status={isCompleted ? "completed" : "in-progress"} />
        </div>

        {project.tech_stack && (
          <div className="project-hero-tech">{project.tech_stack}</div>
        )}

        <p className="project-hero-desc">
          {project.description || "No description written yet."}
        </p>

        <div className="project-hero-progress-wrap">
          <ProgressBar progress={calculatedProgress} />
        </div>
      </section>

      {/* Stats Cards */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Features</div>
          <div className="stat-value">{totalCount}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value">{completedCount}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Journal Entries</div>
          <div className="stat-value">{journalCount}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Open Bugs</div>
          <div className="stat-value">{openBugsCount}</div>
        </div>
      </section>

      {/* Objectives & Features Grid */}
      <div className="overview-grid">
        {/* Objectives */}
        <div className="overview-section-card">
          <h2 className="section-card-title">
            <span>Objectives</span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Target goals</span>
          </h2>

          <div className="objectives-text">
            {project.objectives || (
              <span style={{ color: "var(--text-subtle)", fontStyle: "italic" }}>
                No objectives defined yet for this project.
              </span>
            )}
          </div>
        </div>

        {/* Features Checklist */}
        <div className="overview-section-card">
          <h2 className="section-card-title">
            <span>Features Checklist</span>
            <span style={{ fontSize: "12.5px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              {completedCount} / {totalCount} done
            </span>
          </h2>

          {loading ? (
            <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Loading features...</p>
          ) : (
            <div className="features-checklist">
              {features.length === 0 ? (
                <p style={{ color: "var(--text-subtle)", fontStyle: "italic", margin: "8px 0" }}>
                  No features added yet. Add what you plan to build below.
                </p>
              ) : (
                features.map((feat) => (
                  <div
                    key={feat.id}
                    className={`feature-check-item ${feat.is_completed ? "completed" : ""}`}
                  >
                    <label className="feature-check-label">
                      <input
                        type="checkbox"
                        className="feature-checkbox"
                        checked={feat.is_completed}
                        onChange={() =>
                          handleToggleFeature(feat.id, feat.is_completed)
                        }
                      />
                      <span className="feature-text">{feat.feature}</span>
                    </label>

                    <button
                      type="button"
                      className="feature-remove-btn"
                      onClick={() => handleDeleteFeature(feat.id)}
                      title="Delete feature"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}

              {/* Add feature inline form */}
              <form onSubmit={handleAddFeature} className="add-feature-inline">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add a new feature..."
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  type="submit"
                  disabled={addingFeature || !newFeature.trim()}
                >
                  + Add
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
