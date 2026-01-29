import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/admin-dashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const fullName = localStorage.getItem("fullName") || "Noxa Admin";
  const role = (localStorage.getItem("role") || "client").toLowerCase();

  // ✅ Protection : si pas admin => dehors
  useEffect(() => {
    if (role !== "admin") navigate("/dashboard");
  }, [role, navigate]);

  return (
    <div className="adb">
      <div className="adb-wrapper">
        <aside className="adb-sb">
          <div className="adb-brand">
            <div className="adb-title">NOXABANK</div>
            <div className="adb-sub">{fullName}</div>
          </div>

          <nav className="adb-nav">
            <div className="adb-item active">Dashboard</div>
            <div className="adb-item">Manage Clients</div>
            <div className="adb-item">Manage Bank Accounts</div>
            <div className="adb-item">Supervise Operations</div>
            <div className="adb-item">Manage Client Profile</div>
            <div className="adb-item">Global Access</div>
          </nav>

          <div className="adb-bottom">
            <button
              className="adb-logout"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("fullName");
                localStorage.removeItem("role");
                window.location.href = "/";
              }}
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="adb-main">
          <header className="adb-topbar">
            <h2>Admin Dashboard</h2>

            <div className="adb-search">
              <input placeholder="Search..." />
              <span className="adb-search-icon">🔍</span>
            </div>

            <div className="adb-user">
              <div className="adb-avatar" />
              <div>
                <div className="adb-name">{fullName}</div>
                <div className="adb-role">Admin</div>
              </div>
            </div>
          </header>

          <div className="adb-content" />
        </main>
      </div>
    </div>
  );
}
