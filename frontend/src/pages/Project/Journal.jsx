import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import Button from "../../components/UI/Button";
import EmptyState from "../../components/UI/EmptyState";
import api from "../../services/api";
import "./Journal.css";

export default function Journal() {
  const { project } = useOutletContext();
  const navigate = useNavigate();

  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const fetchJournals = async () => {
      if (!project?.id) return;
      try {
        const res = await api.get(`journal/${project.id}/`);
        if (ignore) return;
        const sorted = [...res.data].sort((a, b) => {
          const bTime = new Date(b.created_at || b.date || 0).getTime();
          const aTime = new Date(a.created_at || a.date || 0).getTime();
          if (bTime !== aTime) {
            return bTime - aTime;
          }
          return (b.id || 0) - (a.id || 0);
        });
        setJournals(sorted);
      } catch (err) {
        console.error("Error fetching journals:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchJournals();
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
    <div className="journal-container">
      {/* Page Header */}
      <div className="journal-header">
        <div>
          <h2 className="journal-title">JOURNAL</h2>
          <p className="journal-subtitle">
            "thoughts, ideas & decisions while building"
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate(`/projects/${project.id}/journal/new`)}
        >
          + New Journal Entry
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
          Opening your notebook...
        </div>
      ) : journals.length === 0 ? (
        <EmptyState
          title="Your notebook is still empty."
          description="Start recording what you're building."
          actionLabel="+ New Journal Entry"
          onAction={() => navigate(`/projects/${project.id}/journal/new`)}
          icon="✎"
        />
      ) : (
        <div className="journal-tiles-list">
          {journals.map((entry) => (
            <article
              key={entry.id}
              className="journal-entry-tile"
              onClick={() => navigate(`/projects/${project.id}/journal/${entry.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/projects/${project.id}/journal/${entry.id}`);
                }
              }}
            >
              <span className="journal-entry-date">
                {formatDate(entry.created_at || entry.date)}
              </span>
              <h3 className="journal-entry-title">{entry.title}</h3>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
