import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';
import './LandingPage.css';
import RoleSelectionModal from '../components/common/RoleSelectionModal';

const LandingPage = () => {
  const navigate = useNavigate();

  // Get BOTH user and fetchUser from store reactively
  const { user, fetchUser } = useAuthStore();

  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * Fetch user if token exists but user not loaded yet
   */
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token && !user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  /**
   * Redirect if already logged in
   */
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token || !user) return;

    console.log(
      'User is logged in, redirecting based on role:',
      user.role
    );

    navigate(`/${user.role}/dashboard`);
  }, [user, navigate]);

  /**
   * Handle Login button click
   */
  const handleLoginClick = () => {
    const savedRole = localStorage.getItem('educity_role');

    if (savedRole) {
      navigate(`/login?role=${savedRole}`);
    } else {
      setIsModalOpen(true);
    }
  };

  /**
   * Toggle mobile menu
   */
  const toggleMobileMenu = () => {
    const navLinks = document.getElementById('navLinks');
    navLinks?.classList.toggle('active');
  };

  /**
   * Close cookie banner
   */
  const closeCookieBanner = () => {
    const banner = document.getElementById('cookieBanner');

    if (banner) {
      banner.style.display = 'none';
      localStorage.setItem('cookieConsent', 'true');
    }
  };

  /**
   * Hide cookie banner if already accepted
   */
  useEffect(() => {
    const hasConsent = localStorage.getItem('cookieConsent');
    const banner = document.getElementById('cookieBanner');

    if (hasConsent && banner) {
      banner.style.display = 'none';
    }
  }, []);

  return (
    <div className="landing-page">
      {/* Role Selection Modal */}
      <RoleSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">EduCity</div>

        <ul className="nav-links" id="navLinks">
          <li><a href="#home">Home</a></li>
          <li><a href="#students">Students</a></li>
          <li><a href="#instructors">Instructors</a></li>
          <li><a href="#courses">Courses</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#help">Help</a></li>
        </ul>

        <div className="nav-buttons">
          <button
            onClick={handleLoginClick}
            className="btn-login"
          >
            Login
          </button>

          <button
            onClick={() => navigate('/register')}
            className="btn-register"
          >
            Register
          </button>
        </div>

        <button
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        {/* Floating Icons */}
        <div className="floating-icon icon-1">✏️</div>
        <div className="floating-icon icon-2">🔬</div>
        <div className="floating-icon icon-3">📚</div>
        <div className="floating-icon icon-4">🧮</div>
        <div className="floating-icon icon-5">⚛️</div>
        <div className="floating-icon icon-6">📓</div>

        {/* Clouds */}
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>

        <div className="hero-content">
          <h1>The future of collaborative learning</h1>

          <p>
            A dual-persona learning platform where students become
            instructors and knowledge grows through
            community-driven education.
          </p>

          <div className="hero-buttons">
            <button
              className="btn-primary"
              onClick={() => navigate('/register')}
            >
              Start Learning
            </button>

            <button
              className="btn-secondary"
              onClick={() => navigate('/register')}
            >
              Become Instructor
            </button>
          </div>
        </div>

        {/* Illustration */}
        <div className="hero-illustration">
          <div className="illustration-container">
            <div className="character teacher">
              <div className="face">
                <div className="eyes">
                  <div className="eye"></div>
                  <div className="eye"></div>
                </div>
                <div className="smile"></div>
              </div>
              <div className="book"></div>
            </div>

            <div className="character student">
              <div className="face">
                <div className="eyes">
                  <div className="eye"></div>
                  <div className="eye"></div>
                </div>
                <div className="smile"></div>
              </div>
              <div className="book"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Cookie Banner */}
      <div className="cookie-banner" id="cookieBanner">
        <div className="cookie-text">
          🍪 We use cookies to enhance your experience.
        </div>

        <button
          className="btn-cookie"
          onClick={closeCookieBanner}
        >
          I Understand
        </button>
      </div>

      {/* Chat Bubble */}
      <div className="chat-bubble">
        <div className="chat-icon">💬</div>
      </div>
    </div>
  );
};

export default LandingPage;