import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav style={{ padding: '1rem', background: '#f0f0f0' }}>
      <Link to="/">Home</Link>
      {user ? (
        <>
          <span style={{ marginLeft: '1rem' }}>Hello, {user.name} ({user.role})</span>
          <button onClick={logout} style={{ marginLeft: '1rem' }}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login" style={{ marginLeft: '1rem' }}>Login</Link>
          <Link to="/register" style={{ marginLeft: '1rem' }}>Register</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;