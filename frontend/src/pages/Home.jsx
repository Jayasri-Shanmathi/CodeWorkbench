import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/Layout/AppLayout";
import PaperCard from "../components/UI/PaperCard";
import Button from "../components/UI/Button";
import ProgressBar from "../components/UI/ProgressBar";
import StatusBadge from "../components/UI/StatusBadge";
import EmptyState from "../components/UI/EmptyState";
import api from "../services/api";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    const fetchProjects = async () => {
      try {
        const res = await api.get("project/");
        if (!ignore) {
          setProjects(res.data);
          setError("");
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        if (!ignore) {
          setError("Your workbench hit a small snag while loading projects.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchProjects();
    return () => {
      ignore = true;
    };
  }, [refreshTrigger]);

  // Sort projects:
  // RULE 1: Completed projects go to the bottom
  // RULE 2: In-progress projects sorted by last_opened_at DESC (most recently opened first)
  // RULE 3: Completed projects sorted by last_opened_at DESC (or created_at DESC)
  const sortedProjects = [...projects].sort((a, b) => {
    const aCompleted = (a.progress || 0) >= 100;
    const bCompleted = (b.progress || 0) >= 100;

    // RULE 1 — Completed projects go to the bottom
    if (aCompleted !== bCompleted) {
      return aCompleted ? 1 : -1;
    }

    // RULE 2 & 3 — Sort by last_opened_at DESC
    const aOpened = a.last_opened_at ? new Date(a.last_opened_at).getTime() : 0;
    const bOpened = b.last_opened_at ? new Date(b.last_opened_at).getTime() : 0;

    if (aOpened !== bOpened) {
      return bOpened - aOpened;
    }

    // Fall back to created_at DESC
    const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bCreated - aCreated;
  });

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <AppLayout>
      <div className="home-container">
        <div className="home-top-bar">
          <div>
            <h2 className="home-heading">My Projects</h2>
            <p className="home-subtitle">
              {projects.length > 0
                ? `${projects.length} project${projects.length === 1 ? "" : "s"} on your workbench`
                : "Your personal workspace to think, plan, and build"}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate("/projects/new")}
          >
            + New Project
          </Button>
        </div>

        {loading ? (
          <div style={{
            padding: "60px 0",
            textAlign: "center",
            color: "var(--text-muted)",
            fontFamily: "var(--font-serif)",
            fontSize: "18px"
          }}>
            Opening your workbench...
          </div>
        ) : error ? (
          <div style={{
            padding: "40px",
            textAlign: "center",
            background: "var(--paper)",
            border: "1px solid var(--border)",
            borderRadius: "4px"
          }}>
            <p style={{ color: "var(--terracotta)", marginBottom: "16px", fontSize: "16px" }}>{error}</p>
            <Button variant="secondary" onClick={() => setRefreshTrigger((k) => k + 1)}>
              Try again
            </Button>
          </div>
        ) : sortedProjects.length === 0 ? (
          <EmptyState
            title="Your workbench is empty."
            description="Every project starts somewhere. Sit down, pick a stack, and start building."
            actionLabel="Build your first project"
            onAction={() => navigate("/projects/new")}
          />
        ) : (
          <div className="projects-grid">
            {sortedProjects.map((project) => {
              const isCompleted = project.progress >= 100;
              return (
                <PaperCard
                  key={project.id}
                  className={`project-card ${isCompleted ? "completed" : ""}`}
                  hasFold={true}
                  interactive={true}
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div className="project-card-header">
                    <h3 className="project-card-title">{project.title}</h3>
                    <StatusBadge
                      status={isCompleted ? "completed" : "in-progress"}
                    />
                  </div>

                  {project.tech_stack && (
                    <div className="project-card-tech">
                      {project.tech_stack}
                    </div>
                  )}

                  <p className="project-card-desc">
                    {project.description || "No description provided."}
                  </p>

                  <div className="project-card-footer">
                    <ProgressBar progress={project.progress || 0} />
                    <div className="project-card-meta">
                      <span>Created {formatDate(project.created_at)}</span>
                      {project.last_opened_at && (
                        <span>Opened {formatDate(project.last_opened_at)}</span>
                      )}
                    </div>
                  </div>
                </PaperCard>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
