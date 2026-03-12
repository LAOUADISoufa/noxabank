import "../styles/login.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// URL de base de l'API auth — à mettre dans un .env en production
const API = "http://localhost:5200/api/auth";

export default function Login() {
  const navigate = useNavigate();

  // Bascule entre le formulaire Sign In et Sign Up
  const [isSignUp, setIsSignUp] = useState(false);

  // Système de messages universels : une seule bannière pour tout gérer
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info"); // info | error | success

  // --- Champs du formulaire Sign Up ---
  const [suFullName, setSuFullName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPhone, setSuPhone] = useState("");
  const [suAddress, setSuAddress] = useState("");
  const [suBirthDate, setSuBirthDate] = useState("");
  const [suPassport, setSuPassport] = useState("");
  const [suPassword, setSuPassword] = useState("");

  // --- Champs du formulaire Sign In ---
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");

  // Raccourci pour afficher un message typé
  function showMessage(type, text) {
    setMsgType(type);
    setMsg(text);
  }

  // Le message disparaît tout seul après 5 secondes, pas besoin de le fermer manuellement
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 5000);
    return () => clearTimeout(t); // nettoyage si un nouveau message arrive avant la fin
  }, [msg]);

  // Helpers de navigation entre les deux vues, on reset le message au passage
  function goToSignUp() {
    setIsSignUp(true);
    setMsg("");
  }

  function goToSignIn() {
    setIsSignUp(false);
    setMsg("");
  }

  // -------- INSCRIPTION --------
  async function handleSignUp(e) {
    e.preventDefault();
    setMsg("");

    // Validation minimale côté client avant même d'appeler l'API
    if (!suFullName || !suEmail || !suPassport || !suPassword) {
      showMessage("error", "Please fill Full Name, Email, Passport Number and Password.");
      return;
    }

    const payload = {
      fullName: suFullName.trim(),
      email: suEmail.trim(),
      phone: suPhone.trim(),
      address: suAddress.trim(),
      birthDate: suBirthDate || null, // champ optionnel
      passportNumber: suPassport.trim(),
      password: suPassword,
    };

    try {
      const res = await fetch(`${API}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // On parse prudemment : le body peut être vide sur certaines erreurs serveur
      let data = {};
      try { data = await res.json(); } catch {}

      // Cas particulier : email ou passeport déjà utilisé
      if (res.status === 409) {
        showMessage("error", data?.message || "Already exists.");
        setIsSignUp(true);
        return;
      }

      if (!res.ok) {
        showMessage("error", data?.message || "Sign up failed.");
        setIsSignUp(true);
        return;
      }

      // Succès : on félicite et on bascule vers le login après un court délai
      showMessage("success", "Welcome! Your account is created. Please sign in.");
      setTimeout(() => goToSignIn(), 900);

    } catch {
      // Erreur réseau ou serveur complètement KO
      showMessage("error", "Server error. Please try again.");
      setIsSignUp(true);
    }
  }

  // -------- CONNEXION --------
  async function handleSignIn(e) {
    e.preventDefault();
    setMsg("");

    if (!siEmail || !siPassword) {
      showMessage("error", "Please enter Email and Password.");
      return;
    }

    try {
      const res = await fetch(`${API}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: siEmail.trim(), password: siPassword }),
      });

      let data = {};
      try { data = await res.json(); } catch {}

      if (!res.ok) {
        showMessage("error", data?.message || "Invalid email or password.");
        return;
      }

      // Le backend renvoie { token, user: { fullName, role } }
      // On stocke tout ce qu'il faut pour les gardes de route et l'affichage
      const fullName = data?.user?.fullName || "Client";
      const role = (data?.user?.role || "client").toLowerCase();

      localStorage.setItem("token", data.token);
      localStorage.setItem("fullName", fullName);
      localStorage.setItem("role", role);

      showMessage("success", "Login successful. Redirecting...");

      // Petit délai pour que l'utilisateur voie le message de succès avant de partir
      setTimeout(() => {
        if (role === "admin") navigate("/admin");
        else navigate("/dashboard");
      }, 350);

    } catch {
      showMessage("error", "Server error. Please try again.");
    }
  }

  return (
    // La classe "active" déclenche l'animation CSS de bascule Sign In ↔ Sign Up
    <div className={`container ${isSignUp ? "active" : ""}`} id="container">

      {/* Bannière de notification flottante — s'affiche uniquement quand il y a un message
          Les couleurs changent selon le type : rouge = erreur, vert = succès, bleu = info */}
      {msg && (
        <div
          style={{
            position: "fixed",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background:
              msgType === "error" ? "#ff4d4f" :
              msgType === "success" ? "#2ecc71" : "#3498db",
            color: "white",
            padding: "12px 16px",
            borderRadius: 12,
            zIndex: 9999,
            boxShadow: "0 10px 20px rgba(0,0,0,0.25)",
            minWidth: 260,
            textAlign: "center",
            fontWeight: 600,
          }}
        >
          {msg}
        </div>
      )}

      {/* -------- FORMULAIRE INSCRIPTION -------- */}
      <div className="form-container sign-up">
        <form onSubmit={handleSignUp}>
          <h1>Create Account</h1>
          <span>Use your personal details for registration</span>

          <input placeholder="Full Name"       value={suFullName}  onChange={(e) => setSuFullName(e.target.value)} />
          <input type="email" placeholder="Email"        value={suEmail}     onChange={(e) => setSuEmail(e.target.value)} />
          <input placeholder="Phone Number"    value={suPhone}     onChange={(e) => setSuPhone(e.target.value)} />
          <input placeholder="Address"         value={suAddress}   onChange={(e) => setSuAddress(e.target.value)} />
          <input type="date"                   value={suBirthDate} onChange={(e) => setSuBirthDate(e.target.value)} />
          <input placeholder="Passport Number" value={suPassport}  onChange={(e) => setSuPassport(e.target.value)} />
          <input type="password" placeholder="Password"  value={suPassword}  onChange={(e) => setSuPassword(e.target.value)} />

          <button type="submit">Sign Up</button>
        </form>
      </div>

      {/* -------- FORMULAIRE CONNEXION -------- */}
      <div className="form-container sign-in">
        <form onSubmit={handleSignIn}>
          <h1>Sign In</h1>
          <span>Use your email and password</span>

          <input type="email"     placeholder="Email"    value={siEmail}    onChange={(e) => setSiEmail(e.target.value)} />
          <input type="password"  placeholder="Password" value={siPassword} onChange={(e) => setSiPassword(e.target.value)} />

          {/* Lien désactivé pour l'instant, fonctionnalité à venir */}
          <a href="#" onClick={(e) => e.preventDefault()}>
            Forgot your password?
          </a>

          <button type="submit">Sign In</button>
        </form>
      </div>

      {/* -------- PANNEAU DE BASCULE ANIMÉ -------- */}
      {/* Ce bloc se déplace par-dessus les formulaires via CSS
          pour créer l'effet de slide gauche/droite */}
      <div className="toggle-container">
        <div className="toggle">

          {/* Visible quand on est sur Sign Up — invite à revenir au Sign In */}
          <div className="toggle-panel toggle-left">
            <h1>Welcome Back!</h1>
            <p>Enter your personal details to use all site features</p>
            <button className="hidden" type="button" onClick={goToSignIn}>
              Sign In
            </button>
          </div>

          {/* Visible quand on est sur Sign In — invite à créer un compte */}
          <div className="toggle-panel toggle-right">
            <h1>NOXA BANK CANADA</h1>
            <p>Register with your personal details</p>
            <button className="hidden" type="button" onClick={goToSignUp}>
              Sign Up
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
