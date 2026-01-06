import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Welcome to EduCity</h1>
        <p className="hero-subtitle">
          A peer-to-peer e-learning platform connecting students, instructors, and administrators in a collaborative academic ecosystem.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn-primary">
            Get Started
          </Link>
          <Link to="/login" className="btn-secondary">
            Login
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;