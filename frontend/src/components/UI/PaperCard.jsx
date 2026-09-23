import "./UI.css";

export default function PaperCard({
  children,
  className = "",
  hasFold = false,
  interactive = false,
  onClick,
  ...props
}) {
  return (
    <div
      className={`paper-card-container ${interactive ? "interactive" : ""} ${className}`}
      onClick={onClick}
      {...props}
    >
      {hasFold && <div className="paper-card-fold" />}
      {children}
    </div>
  );
}
