import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock, FiUser } from "react-icons/fi";
import { loginUser } from "../services/api";
import tansamLogo from "../../src/assets/tansam/tansamoldlogo (1).png";
import Ballpit from "./Ballpit";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./CSS/Login.css";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.route) {
          setUser(u);
          navigate(u.route, { replace: true });
        }
      }
    } catch {
      // ignore
    }
  }, [navigate, setUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      setUser(data);
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      localStorage.setItem("user", JSON.stringify(data));
      navigate(data.route);
    } catch (err) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <ToastContainer />

      {/* FULLSCREEN BALLPIT BACKGROUND */}
      <div className="ballpit-fullscreen">
        <Ballpit
          count={100}
          gravity={0.01}
          friction={0.9975}
          wallBounce={0.95}
          followCursor={false}
        />
      </div>

      {/* CENTERED SEAMLESS LOGIN CARD */}
      <div className="login-card-glass">
        <div className="logo-row">
          <img src={tansamLogo} alt="TANSAM" />
          <span>TANSAM | PMS</span>
        </div>

        <h3>SIGN IN</h3>
        <p className="subtext">Project Management System</p>

        <form onSubmit={handleSubmit}>
          <div className="input-box">
            <FiUser className="input-icon-left" />
            <input
              type="email"
              placeholder="Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-box">
            <FiLock className="input-icon-left" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="eye-inside"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          <div className="login-btn-wrapper">
            <button type="submit" disabled={loading}>
              {loading ? "AUTHENTICATING..." : "LOGIN"}
            </button>
          </div>
        </form>

        <p className="powered">© 2026 TANSAM</p>
      </div>
    </div>
  );
}

export default Login;
