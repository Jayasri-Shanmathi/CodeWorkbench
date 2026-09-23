import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

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
        Setting up your workbench...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
