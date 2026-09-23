import "./UI.css";

export function StatusBadge({ status = "in-progress", label }) {
  const isCompleted = status === "completed" || status === true;
  const text = label || (isCompleted ? "Completed" : "In Progress");
  const typeClass = isCompleted ? "completed" : "in-progress";

  return (
    <span className={`status-badge ${typeClass}`}>
      <span style={{ fontSize: "10px" }}>{isCompleted ? "✓" : "●"}</span>
      {text}
    </span>
  );
}

export function FlagBadge({ flag = "GENERAL" }) {
  const normalized = (flag || "GENERAL").toUpperCase();
  const flagClasses = {
    GENERAL: "flag-general",
    IDEA: "flag-idea",
    DECISION: "flag-decision",
    DISCARDED: "flag-discarded",
  };

  return (
    <span className={`flag-badge ${flagClasses[normalized] || "flag-general"}`}>
      {normalized}
    </span>
  );
}

export default StatusBadge;
