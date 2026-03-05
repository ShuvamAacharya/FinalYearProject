import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await register(
        form.name,
        form.email,
        form.password,
        form.role
      );

      navigate("/dashboard");
    } catch {
      setError("Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <h1>EduCity</h1>
        <p>Learn. Teach. Grow together.</p>
      </div>

      <div className="login-container">
        <h2>Create Your Account</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
            />
          </div>

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

          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              required
            />
          </div>

          {/* ROLE SELECTION */}

          <div className="role-select">
            <label>Register as:</label>

            <select
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
            </select>
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit">Register</button>
        </form>

        <div className="login-footer">
          Already have an account?{" "}
          <a onClick={() => navigate("/login")}>Login</a>
        </div>
      </div>
    </div>
  );
};

export default Register;