import { Link } from "react-router-dom";
import "./Navbar.css";
function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="logo">EduCity</h2>

      <ul className="nav-links">
        <li><Link to="/courses">Courses</Link></li>
        <li><Link to="/quizzes">Quizzes</Link></li>
        <li><Link to="/about">About Us</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;