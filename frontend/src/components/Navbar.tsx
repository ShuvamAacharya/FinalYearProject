import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Logo / App Name */}
        <Link to="/" style={styles.logo}>
          EduCity
        </Link>

        {/* Right side links */}
        <div style={styles.links}>
          <Link to="/" style={styles.link}>
            Home
          </Link>

          {!user ? (
            <>
              <Link to="/login" style={styles.link}>
                Login
              </Link>
              <Link to="/register" style={styles.primaryButton}>
                Register
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" style={styles.link}>
                Dashboard
              </Link>
              <span style={styles.userInfo}>
                {user.name} ({user.role.charAt(0).toUpperCase() + user.role.slice(1)})
              </span>
              <button onClick={handleLogout} style={styles.logoutButton}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles: Record<string, React.CSSProperties> = {
  nav: {
    backgroundColor: '#1e293b',
    padding: '12px 0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff',
    textDecoration: 'none',
    letterSpacing: '0.5px',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  },
  link: {
    color: '#e2e8f0',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'color 0.2s',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '16px',
  },
  userInfo: {
    color: '#cbd5e1',
    fontSize: '15px',
  },
  logoutButton: {
    background: 'none',
    border: '1px solid #64748b',
    color: '#e2e8f0',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '15px',
  },
};

export default Navbar;