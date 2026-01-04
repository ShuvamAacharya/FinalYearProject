import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to EduCity</h1>
      <p style={styles.subtitle}>
        A peer-to-peer e-learning platform for students, instructors, and administrators.
      </p>

      <div style={styles.section}>
        <h2>What is EduCity?</h2>
        <p>
          EduCity enables collaborative online learning where instructors create
          courses, students actively learn and complete assessments, and administrators
          ensure quality and system integrity.
        </p>
      </div>

      <div style={styles.roles}>
        <div style={styles.card}>
          <h3>Student</h3>
          <p>Enroll in courses, attempt quizzes, and earn certificates.</p>
        </div>
        <div style={styles.card}>
          <h3>Instructor</h3>
          <p>Create courses, upload content, and assess students.</p>
        </div>
        <div style={styles.card}>
          <h3>Admin</h3>
          <p>Manage users, approve courses, and monitor the system.</p>
        </div>
      </div>

      <div style={styles.actions}>
        <Link to="/register" style={styles.primaryBtn}>
          Get Started
        </Link>
        <Link to="/login" style={styles.secondaryBtn}>
          Login
        </Link>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '40px',
    textAlign: 'center',
    minHeight: 'calc(100vh - 80px)', // Adjust if you have navbar height
  },
  title: {
    fontSize: '36px',
    marginBottom: '10px',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: '18px',
    color: '#555',
    marginBottom: '40px',
  },
  section: {
    maxWidth: '800px',
    margin: '0 auto 50px',
    lineHeight: '1.6',
  },
  roles: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    marginBottom: '60px',
    flexWrap: 'wrap' as const,
  },
  card: {
    border: '1px solid #e2e8f0',
    padding: '24px',
    width: '260px',
    borderRadius: '12px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    flexWrap: 'wrap' as const,
  },
  primaryBtn: {
    padding: '14px 32px',
    backgroundColor: '#1e293b',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '16px',
  },
  secondaryBtn: {
    padding: '14px 32px',
    border: '2px solid #1e293b',
    color: '#1e293b',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '16px',
  },
};

// Optional hover effect (inline styles can't do :hover, but you can add later with CSS file)
export default Home;