import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Petit garde-fou : si t'as pas de token, tu repars à la case départ (page de login)
// Simple mais efficace pour protéger les routes sensibles
function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    // BrowserRouter gère toute la navigation côté client
    // pas de rechargement de page, tout est fluide
    <BrowserRouter>
      <Routes>

        {/* Page d'accueil = login, logique */}
        <Route path="/" element={<Login />} />

        {/* --- ESPACE CLIENT --- */}
        {/* Le dashboard principal, accessible uniquement si connecté */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />

        {/* --- ESPACE ADMIN --- */}
        {/* Même principe, mais pour les admins — à terme on pourrait
            ajouter une vérification du rôle en plus du simple token */}
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminDashboard />
            </RequireAuth>
          }
        />

        {/* Filet de sécurité : toute URL inconnue ramène au login */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
