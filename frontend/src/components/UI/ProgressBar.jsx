import "./UI.css";

export default function ProgressBar({ progress = 0, showText = true, className = "" }) {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className={`progress-bar-container ${className}`}>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showText && (
        <div className="progress-text">
          <span>Progress</span>
          <span>{clamped}%</span>
        </div>
      )}
    </div>
  );
}
