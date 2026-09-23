import { useState, useEffect } from "react";
import { useParams, Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import api from "../../services/api";
import "./AppLayout.css";

export default function ProjectLayout() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    const fetchProject = async () => {
      try {
        const res = await api.get("project/");
        if (ignore) return;
        const found = res.data.find((p) => String(p.id) === String(projectId));
        if (!found) {
          setError("Project not found.");
        } else {
          setProject(found);
          // Update last_opened_at
          try {
            await api.patch(`update_project/${projectId}/`, {
              last_opened_at: new Date().toISOString(),
            });
          } catch {
            // Ignore last_opened_at error
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error("Error loading project:", err);
          setError("Could not open this project.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchProject();
    return () => {
      ignore = true;
    };
  }, [projectId, refreshKey]);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--cream)",
        color: "var(--muted-brown)",
        fontFamily: "var(--font-serif)",
        fontSize: "20px"
      }}>
        <div style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          border: "3px solid var(--border)",
          borderTopColor: "var(--muted-green)",
          animation: "spin 0.8s linear infinite",
          marginBottom: "16px"
        }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        Opening project...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--cream)",
        padding: "20px",
        textAlign: "center"
      }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", color: "var(--dark-green)", marginBottom: "12px" }}>
          {error || "Project not found"}
        </h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
          This project might have been moved or removed from your workbench.
        </p>
        <button
          onClick={() => navigate("/home")}
          style={{
            padding: "10px 20px",
            background: "var(--muted-green)",
            color: "#ffffff",
            border: "none",
            borderRadius: "4px",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Return to Workbench
        </button>
      </div>
    );
  }

  return (
    <div className="project-layout">
      {/* Mobile Drawer Toggle */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle Navigation"
      >
        ☰
      </button>

      {/* Backdrop for mobile */}
      <div
        className={`project-backdrop ${mobileMenuOpen ? "open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <Sidebar
        project={project}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Workspace Content */}
      <main className="project-content animate-fade-in">
        <Outlet context={{ project, setProject, reloadProject: () => setRefreshKey((k) => k + 1) }} />
      </main>
    </div>
  );
}
