const Features = () => {
  return (
    <section className="features">
      <div className="container">
        <h2>Why Choose EduCity?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Decentralized Learning</h3>
            <p>Anyone can teach or learn without centralized barriers.</p>
          </div>
          <div className="feature-card">
            <h3>Verifiable Certificates</h3>
            <p>Earn blockchain-backed certificates that are tamper-proof.</p>
          </div>
          <div className="feature-card">
            <h3>Role-Based Access</h3>
            <p>Clear separation for students, instructors, and admins.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;