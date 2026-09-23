import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import Button from "../../components/UI/Button";
import EmptyState from "../../components/UI/EmptyState";
import api from "../../services/api";
import "./BugDiary.css";

export default function BugDiary() {
  const { project } = useOutletContext();
  const navigate = useNavigate();

  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const fetchBugs = async () => {
      if (!project?.id) return;
      try {
        const res = await api.get(`bugs/${project.id}/`);
        if (ignore) return;
        const sorted = [...res.data].sort((a, b) => {
          const bTime = new Date(b.created_at || 0).getTime();
          const aTime = new Date(a.created_at || 0).getTime();
          if (bTime !== aTime) {
            return bTime - aTime;
          }
          return (b.id || 0) - (a.id || 0);
        });
        setBugs(sorted);
      } catch (err) {
        console.error("Error fetching bugs:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchBugs();
    return () => {
      ignore = true;
    };
  }, [project?.id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d
      .toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
      .toUpperCase();
  };

  return (
    <div className="bugs-container">
      {/* Page Header */}
      <div className="bugs-header">
        <div>
          <h2 className="bugs-title">BUG DIARY</h2>
          <p className="bugs-subtitle">
            "things that broke · things I learned"
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate(`/projects/${project.id}/bugs/new`)}
        >
          + Record Bug
        </Button>
      </div>

      {loading ? (
        <div
          style={{
            padding: "60px 0",
            textAlign: "center",
            color: "var(--text-muted)",
            fontFamily: "var(--font-serif)",
            fontSize: "18px",
          }}
        >
          Opening your debugging diary...
        </div>
      ) : bugs.length === 0 ? (
        <EmptyState
          title="Nothing has broken yet."
          description="Hopefully."
          actionLabel="+ Record Bug"
          onAction={() => navigate(`/projects/${project.id}/bugs/new`)}
          icon="⚡"
        />
      ) : (
        <div className="bugs-tiles-list">
          {bugs.map((bug) => (
            <article
              key={bug.id}
              className="bug-entry-tile"
              onClick={() => navigate(`/projects/${project.id}/bugs/${bug.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/projects/${project.id}/bugs/${bug.id}`);
                }
              }}
            >
              <span className="bug-entry-date">
                {formatDate(bug.created_at)}
              </span>
              <h3 className="bug-entry-title">{bug.bug}</h3>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
