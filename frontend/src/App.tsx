// import { Routes, Route } from 'react-router-dom';
// import MainLayout from './layouts/MainLayout.tsx';     // ← Add .tsx
// import Home from './pages/Home.tsx';                   // ← Add .tsx
// import Login from './pages/Login.tsx';                 // ← Add .tsx
// import Register from './pages/Register.tsx';           // ← Add .tsx
// import ProtectedRoute from './components/ProtectedRoute.tsx'; // ← Add .tsx

// const App = () => (
//   <Routes>
//     <Route element={<MainLayout />}>
//       <Route path="/" element={<Home />} />
//       <Route path="/login" element={<Login />} />
//       <Route path="/register" element={<Register />} />

//       {/* Protected example */}
//       <Route element={<ProtectedRoute />}>
//         <Route path="/dashboard" element={<div>User Dashboard</div>} />
//       </Route>

//       {/* Admin example */}
//       <Route element={<ProtectedRoute adminOnly />}>
//         <Route path="/admin" element={<div>Admin Panel</div>} />
//       </Route>
//     </Route>
//   </Routes>
// );

// export default App;


//final
// import { Routes, Route } from 'react-router-dom';
// import MainLayout from './layouts/MainLayout.tsx';
// import Home from './pages/Home.tsx';
// import Login from './pages/Login.tsx';
// import Register from './pages/Register.tsx';

// const App = () => (
//   <Routes>
//     <Route element={<MainLayout />}>
//       <Route index element={<Home />} />
//       <Route path="login" element={<Login />} />
//       <Route path="register" element={<Register />} />
//     </Route>
//   </Routes>
// );


// import { useEffect, useState } from "react";
// import "./App.css";

// const App = () => {
  
//   const [message, setMessage] = useState<string>("");
//   const [backendStatus, setBackendStatus] = useState<boolean>(false);

//   useEffect(() => {
//     fetch("http://localhost:5000/")
//       .then((res) => res.json())
//       .then((data) => {
//         setMessage(data.message);
//       })
//       .catch((err) => {
//         console.error("Backend error:", err);
//       });
//   }, []);

//   return (
//     <div className="landing">

//       {/* HERO */}
//       <section className="hero">
//         <h1>EduCity</h1>
//         <p>
//           A Dual-Persona E-Learning Platform where you can
//           <span> Learn</span> and <span> Teach</span> seamlessly.
//         </p>

//         <div className="buttons">
//           <button className="primary">Get Started</button>
//           <button className="secondary">Explore Courses</button>
//         </div>

//         {/* Backend Status Indicator */}
//         <div className="status">
//           {backendStatus ? (
//             <p className="online">🟢 {message}</p>
//           ) : (
//             <p className="offline">🔴 Backend not connected</p>
//           )}
//         </div>
//       </section>
//        {/* FEATURES */}
//       <section className="features">
//         <h2>Why EduCity?</h2>

//         <div className="grid">
//           <div className="card">
//             <h3>🔁 Role Switching</h3>
//             <p>Switch between Student and Instructor in one account.</p>
//           </div>

//           <div className="card">
//             <h3>🎓 Verified Certificates</h3>
//             <p>Earn blockchain-backed digital certificates.</p>
//           </div>

//           <div className="card">
//             <h3>🌍 Community Learning</h3>
//             <p>Collaborative peer-to-peer knowledge sharing.</p>
//           </div>

//           <div className="card">
//             <h3>⚡ Scalable Architecture</h3>
//             <p>Built with modern secure web technologies.</p>
//           </div>
//         </div>
//               </section>

//       <footer>
//         <p>© {new Date().getFullYear()} EduCity. All rights reserved.</p>
//       </footer>

//     </div>
//   );
// };

// export default App;

import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";

// import Home from "./pages/Home";
import Login from "./pages/Login";
import Courses from "./pages/Courses";
import Register from "./pages/Register";
import StudentDashboard from "./pages/Dashboard/StudentDashboard";



const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">

      {/* NAVBAR */}
      <nav className="navbar">
        <h2 className="logo">EduCity</h2>
        <div className="nav-buttons">
          <button
            onClick={() => navigate("/login")}
            className="nav-btn"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="nav-btn primary"
          >
            Register
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <h1>
          Learn. Teach. <span>Grow.</span>
        </h1>

        <p>
          A dual-persona e-learning platform — switch between Student and Instructor seamlessly.
        </p>

        <div className="hero-buttons">
          <button
            className="primary large"
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>

          <button
            className="secondary large"
            onClick={() => navigate("/courses")}
          >
            Explore Courses
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <h2>Why EduCity?</h2>

        <div className="feature-grid">
          <div className="card">
            <h3>🔁 Role Switching</h3>
            <p>Instantly switch between learning and teaching modes.</p>
          </div>

          <div className="card">
            <h3>🎓 Verified Certificates</h3>
            <p>Secure, blockchain-backed digital certificates.</p>
          </div>

          <div className="card">
            <h3>🌍 Community Driven</h3>
            <p>Join a collaborative peer-to-peer learning ecosystem.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <p>© {new Date().getFullYear()} EduCity • Made with curiosity</p>
      </footer>
    </div>
  );
};

// const Courses = () => (
//   <div className="page">
//     <h1>Explore Courses</h1>
//     <p>(Course listing coming soon...)</p>
//   </div>
// );

// const Login = () => (
//   <div className="page">
//     <h1>Login</h1>
//     <p>Sign in to your EduCity account</p>
//   </div>
// );

// const Register = () => (
//   <div className="page">
//     <h1>Create Account</h1>
//     <p>Join thousands of learners and teachers</p>
//   </div>
// );

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<StudentDashboard />} />
    </Routes>
  );
}

export default App;