import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../App.css";
import './Login.css';

const Login: React.FC = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <h1>EduCity</h1>
        <p>Learn. Teach. Grow together.</p>
      </div>

      <div className="login-container">
        <h2>Welcome Back 👋</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit">Login</button>
        </form>

        <div className="login-footer">
          Don't have an account?{" "}
          <a onClick={() => navigate("/register")}>Register</a>
        </div>
      </div>
    </div>
  );
};

export default Login;