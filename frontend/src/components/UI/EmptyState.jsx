import Button from "./Button";
import "./UI.css";

export default function EmptyState({
  title = "Your workbench is empty.",
  description = "Every project starts somewhere.",
  actionLabel,
  onAction,
  icon = "⌘",
}) {
  return (
    <div className="empty-state-container animate-fade-in">
      <div className="empty-state-mark">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
