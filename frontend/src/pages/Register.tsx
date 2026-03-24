import { useState } from "react";
import { useAuth } from "../context/auth.context";
import { useNavigate, Link } from "react-router-dom";
import "../App.css";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

    type Role = "student" | "instructor" | "admin";

    const [form, setForm] = useState<{
      name: string;
      email: string;
      password: string;
      role: Role;
    }>({
      name: "",
      email: "",
      password: "",
      role: "student",
    });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // NEW handleRegister function
  const handleRegister = async () => {
    if (form.password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const user = await register(
        form.name,
        form.email,
        form.password,
        form.role
      );

      if (user.role === "student") {
        navigate("/student/dashboard");
      } else if (user.role === "instructor") {
        navigate("/instructor/dashboard");
      } else if (user.role === "admin") {
        navigate("/admin/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister();
          }}
        >
          <div className="form-group">
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="role-select">
            <label>Register as:</label>
            <select
              value={form.role}
              onChange={(e) =>
              setForm({ ...form, role: e.target.value as "student" | "instructor" | "admin" })
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
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;