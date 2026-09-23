import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import Button from "../UI/Button";
import "./AppLayout.css";

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <Link to="/home" className="app-header-brand">
          <div className="app-header-mark">⌘</div>
          <div>
            <h1 className="app-header-title">Code Workbench</h1>
            <p className="app-header-tagline">your little corner to build things</p>
          </div>
        </Link>

        <div className="app-header-user">
          <div className="user-pill">
            <span className="user-dot"></span>
            <span>{user?.username || "Developer"}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="app-main animate-fade-in">
        {children}
      </main>
    </div>
  );
}
