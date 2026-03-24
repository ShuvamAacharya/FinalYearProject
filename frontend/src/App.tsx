import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Login from "./pages/Login";
import Courses from "./pages/Dashboard/Courses.page";
import Register from "./pages/Register";
import LandingPage from "./pages/Landing.page";
import StudentDashboard from "./pages/Dashboard/student.dashboard";
import AdminDashboard from "./pages/Dashboard/admin.dashboard";
import TeacherDashboard from "./pages/Dashboard/teacher.dashboard";
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<Navigate to="/student/dashboard" replace />} />

      <Route element={<ProtectedRoute roles={["student"]} />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
      </Route>

      <Route element={<ProtectedRoute roles={["instructor", "admin"]} />}>
        <Route path="/instructor/dashboard" element={<TeacherDashboard />} />
      </Route>

      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
