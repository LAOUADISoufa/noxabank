import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/admin-dashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // On récupère les infos de l'utilisateur connecté depuis le localStorage
  // Valeurs par défaut au cas où quelque chose manquerait
  const fullName = localStorage.getItem("fullName") || "Noxa Admin";
  const role = (localStorage.getItem("role") || "client").toLowerCase();

  // Garde de sécurité côté frontend : un client qui taperait /admin dans l'URL
  // est immédiatement redirigé vers son propre dashboard — pas de visite surprise
  // Note : ça reste une protection UI, la vraie sécurité doit être côté API
  useEffect(() => {
    if (role !== "admin") navigate("/dashboard");
  }, [role, navigate]);

  return (
    <div className="adb">
      <div className="adb-wrapper">

        {/* -------- SIDEBAR -------- */}
        <aside className="adb-sb">

          {/* Logo + nom de l'admin connecté */}
          <div className="adb-brand">
            <div className="adb-title">NOXABANK</div>
            <div className="adb-sub">{fullName}</div>
          </div>

          {/* Navigation principale — les items sont statiques pour l'instant,
              à connecter aux vraies routes/pages plus tard */}
          <nav className="adb-nav">
            <div className="adb-item active">Dashboard</div>
            <div className="adb-item">Manage Clients</div>
            <div className="adb-item">Manage Bank Accounts</div>
            <div className="adb-item">Supervise Operations</div>
            <div className="adb-item">Manage Client Profile</div>
            <div className="adb-item">Global Access</div>
          </nav>

          {/* Logout en bas de sidebar : on nettoie tout le localStorage
              puis on force un redirect dur vers le login */}
          <div className="adb-bottom">
            <button
              className="adb-logout"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("fullName");
                localStorage.removeItem("role");
                // window.location.href plutôt que navigate() pour forcer
                // un vrai rechargement et vider l'état React proprement
                window.location.href = "/";
              }}
            >
              Logout
            </button>
          </div>
        </aside>

        {/* -------- CONTENU PRINCIPAL -------- */}
        <main className="adb-main">

          {/* Barre du haut : titre, barre de recherche, infos utilisateur */}
          <header className="adb-topbar">
            <h2>Admin Dashboard</h2>

            <div className="adb-search">
              <input placeholder="Search..." />
              <span className="adb-search-icon">🔍</span>
            </div>

            {/* Mini profil en haut à droite */}
            <div className="adb-user">
              <div className="adb-avatar" />
              <div>
                <div className="adb-name">{fullName}</div>
                <div className="adb-role">Admin</div>
              </div>
            </div>
          </header>

          {/* Zone de contenu principale — vide pour l'instant, 
              c'est ici que viendront les stats, tableaux, graphiques... */}
          <div className="adb-content" />

        </main>
      </div>
    </div>
  );
}
