import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import "./Sidebar.css";

export default function Sidebar({ project, isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Overview", path: `/projects/${project?.id}` },
    { label: "Journal", path: `/projects/${project?.id}/journal` },
    { label: "Bug Diary", path: `/projects/${project?.id}/bugs` },
    { label: "System Architecture", path: `/projects/${project?.id}/architecture` },
    { label: "Database Schema", path: `/projects/${project?.id}/database-schema` },
  ];

  return (
    <>
      <aside className={`sidebar-container ${isOpen ? "open" : ""}`}>
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="sidebar-brand-mark">⌘</div>
            <div className="sidebar-brand-text">CODE WORKBENCH</div>
          </div>
          <Link to="/home" className="sidebar-back-link" onClick={onClose}>
            ← All Projects
          </Link>
        </div>

        <div className="sidebar-divider" />

        <div className="sidebar-project-section">
          <div className="sidebar-project-label">PROJECT</div>
          <h2 className="sidebar-project-title">{project?.title || "Loading..."}</h2>

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === `/projects/${project?.id}`}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? "active" : ""}`
                }
                onClick={onClose}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <span>●</span>
            <span>{user?.username || "Developer"}</span>
          </div>
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
