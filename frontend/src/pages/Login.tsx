import { useState } from "react";
import { useAuth } from "../context/auth.context";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Login: React.FC = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  // ✅ New clean login handler
  const handleLogin = async (email: string, password: string) => {
    try {
      const user = await login(email, password);

      if (user.role === "student") {
        navigate("/student/dashboard");
      } else if (user.role === "instructor") {
        navigate("/instructor/dashboard");
      } else if (user.role === "admin") {
        navigate("/admin/dashboard");
      }
    } catch {
      setError("Invalid email or password");
    }
  };

  // ✅ Form submit calls handleLogin
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    handleLogin(form.email, form.password);
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