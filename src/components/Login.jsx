import "../styles/login.css";
import { useEffect } from "react";

function Login() {
  useEffect(() => {
    const container = document.getElementById("container");
    const registerBtn = document.getElementById("register");
    const loginBtn = document.getElementById("login");

    if (!container || !registerBtn || !loginBtn) return;

    registerBtn.onclick = () => {
      container.classList.add("active");
    };

    loginBtn.onclick = () => {
      container.classList.remove("active");
    };
  }, []);

  return (
    <div className="container" id="container">

      <div className="form-container sign-up">
        <form>
          <h1>Create Account</h1>

         

          <input type="text" placeholder="Full Name" />
          <input type="email" placeholder="Email" />
          <input type="text" placeholder="Phone Number" />
          <input type="text" placeholder="Address" />
          <input type="date" title="Birthday" />
          <input type="password" placeholder="Password" />

          <button type="button">Sign Up</button>
        </form>
      </div>

      <div className="form-container sign-in">
        <form>
          <h1>Sign In</h1>

          <div className="social-icons">
            <a href="#" className="icon"><i className="fa-brands fa-google-plus-g"></i></a>
            <a href="#" className="icon"><i className="fa-brands fa-github"></i></a>
          </div>

          <span>or use your email and password</span>

          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />

          <a href="#">Forgot your password?</a>
          <button type="button">Sign In</button>
        </form>
      </div>

      <div className="toggle-container">
        <div className="toggle">

          <div className="toggle-panel toggle-left">
            <h1>Welcome To your Bank Account</h1>
            <p>
                
                
            </p>
            <button className="hidden" id="login">Sign In</button>
          </div>

          <div className="toggle-panel toggle-right">
            <h1>NOXA BANK CANADA</h1>
            <p>Register with your personal details </p>
            <button className="hidden" id="register">Sign Up</button>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Login;
