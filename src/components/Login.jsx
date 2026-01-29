import "../styles/login.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5200/api/auth";

export default function Login() {
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);

  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info"); // info | error | success

  // Sign Up
  const [suFullName, setSuFullName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPhone, setSuPhone] = useState("");
  const [suAddress, setSuAddress] = useState("");
  const [suBirthDate, setSuBirthDate] = useState("");
  const [suPassport, setSuPassport] = useState("");
  const [suPassword, setSuPassword] = useState("");

  // Sign In
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");

  function showMessage(type, text) {
    setMsgType(type);
    setMsg(text);
  }

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 5000);
    return () => clearTimeout(t);
  }, [msg]);

  function goToSignUp() {
    setIsSignUp(true);
    setMsg("");
  }

  function goToSignIn() {
    setIsSignUp(false);
    setMsg("");
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setMsg("");

    if (!suFullName || !suEmail || !suPassport || !suPassword) {
      showMessage("error", "Please fill Full Name, Email, Passport Number and Password.");
      return;
    }

    const payload = {
      fullName: suFullName.trim(),
      email: suEmail.trim(),
      phone: suPhone.trim(),
      address: suAddress.trim(),
      birthDate: suBirthDate || null,
      passportNumber: suPassport.trim(),
      password: suPassword,
    };

    try {
      const res = await fetch(`${API}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {}

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

      showMessage("success", "Welcome! Your account is created. Please sign in.");
      setTimeout(() => goToSignIn(), 900);
    } catch {
      showMessage("error", "Server error. Please try again.");
      setIsSignUp(true);
    }
  }

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
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) {
        showMessage("error", data?.message || "Invalid email or password.");
        return;
      }

      // ✅ IMPORTANT: maintenant backend renvoie user{ fullName, role }
      const fullName = data?.user?.fullName || "Client";
      const role = (data?.user?.role || "client").toLowerCase();

      localStorage.setItem("token", data.token);
      localStorage.setItem("fullName", fullName);
      localStorage.setItem("role", role);

      showMessage("success", "Login successful. Redirecting...");

      setTimeout(() => {
        if (role === "admin") navigate("/admin");
        else navigate("/dashboard");
      }, 350);
    } catch {
      showMessage("error", "Server error. Please try again.");
    }
  }

  return (
    <div className={`container ${isSignUp ? "active" : ""}`} id="container">
      {msg && (
        <div
          style={{
            position: "fixed",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background:
              msgType === "error" ? "#ff4d4f" : msgType === "success" ? "#2ecc71" : "#3498db",
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

      {/* SIGN UP */}
      <div className="form-container sign-up">
        <form onSubmit={handleSignUp}>
          <h1>Create Account</h1>
          <span>Use your personal details for registration</span>

          <input placeholder="Full Name" value={suFullName} onChange={(e) => setSuFullName(e.target.value)} />
          <input type="email" placeholder="Email" value={suEmail} onChange={(e) => setSuEmail(e.target.value)} />
          <input placeholder="Phone Number" value={suPhone} onChange={(e) => setSuPhone(e.target.value)} />
          <input placeholder="Address" value={suAddress} onChange={(e) => setSuAddress(e.target.value)} />
          <input type="date" value={suBirthDate} onChange={(e) => setSuBirthDate(e.target.value)} />
          <input placeholder="Passport Number" value={suPassport} onChange={(e) => setSuPassport(e.target.value)} />
          <input type="password" placeholder="Password" value={suPassword} onChange={(e) => setSuPassword(e.target.value)} />

          <button type="submit">Sign Up</button>
        </form>
      </div>

      {/* SIGN IN */}
      <div className="form-container sign-in">
        <form onSubmit={handleSignIn}>
          <h1>Sign In</h1>
          <span>Use your email and password</span>

          <input type="email" placeholder="Email" value={siEmail} onChange={(e) => setSiEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={siPassword} onChange={(e) => setSiPassword(e.target.value)} />

          <a href="#" onClick={(e) => e.preventDefault()}>
            Forgot your password?
          </a>

          <button type="submit">Sign In</button>
        </form>
      </div>

      {/* TOGGLE */}
      <div className="toggle-container">
        <div className="toggle">
          <div className="toggle-panel toggle-left">
            <h1>Welcome Back!</h1>
            <p>Enter your personal details to use all site features</p>
            <button className="hidden" type="button" onClick={goToSignIn}>
              Sign In
            </button>
          </div>

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
