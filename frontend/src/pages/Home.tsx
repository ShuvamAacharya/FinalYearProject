import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <main style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <h1 style={styles.headline}>Welcome to EduCity</h1>

        <p style={styles.description}>
          A peer-to-peer e-learning platform that empowers students, instructors,
          and administrators to collaborate, learn, and manage education
          effectively.
        </p>

        <div style={styles.heroActions}>
          <Link
            to="/register"
            style={styles.primaryBtn}
            aria-label="Register on EduCity"
          >
            Get Started
          </Link>

          <Link
            to="/login"
            style={styles.secondaryBtn}
            aria-label="Login to EduCity"
          >
            Login
          </Link>
        </div>
      </section>

      {/* Roles Section */}
      <section style={styles.rolesSection}>
        <h2 style={styles.sectionTitle}>Who Can Use EduCity?</h2>

        <div style={styles.rolesGrid}>
          <RoleCard
            title="Student"
            description="Enroll in courses, access learning materials, attempt quizzes,
            track progress, and earn verifiable certificates."
          />

          <RoleCard
            title="Instructor"
            description="Create and manage courses, upload content, design assessments,
            monitor student performance, and provide feedback."
          />

          <RoleCard
            title="Administrator"
            description="Manage users and courses, approve content, moderate activities,
            ensure platform integrity, and generate reports."
          />
        </div>
      </section>
    </main>
  );
};

/* 🔹 Reusable Role Card Component */
type RoleCardProps = {
  title: string;
  description: string;
};

const RoleCard: React.FC<RoleCardProps> = ({ title, description }) => (
  <div style={styles.roleCard}>
    <h3 style={styles.roleTitle}>{title}</h3>
    <p style={styles.roleDesc}>{description}</p>
  </div>
);

/* 🔹 Styles */
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "calc(100vh - 68px)",
    backgroundColor: "#f8fafc",
  },

  hero: {
    textAlign: "center",
    padding: "80px 20px 100px",
    backgroundColor: "#ffffff",
  },

  headline: {
    fontSize: "42px",
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: "20px",
  },

  description: {
    fontSize: "20px",
    color: "#475569",
    maxWidth: "800px",
    margin: "0 auto 40px",
    lineHeight: 1.6,
  },

  heroActions: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
  },

  primaryBtn: {
    padding: "14px 32px",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    textDecoration: "none",
    borderRadius: "8px",
    fontSize: "18px",
    fontWeight: 600,
  },

  secondaryBtn: {
    padding: "14px 32px",
    border: "2px solid #3b82f6",
    color: "#3b82f6",
    textDecoration: "none",
    borderRadius: "8px",
    fontSize: "18px",
    fontWeight: 600,
  },

  rolesSection: {
    padding: "60px 20px",
    backgroundColor: "#f1f5f9",
    textAlign: "center",
  },

  sectionTitle: {
    fontSize: "32px",
    color: "#1e293b",
    marginBottom: "50px",
  },

  rolesGrid: {
    display: "flex",
    justifyContent: "center",
    gap: "30px",
    maxWidth: "1200px",
    margin: "0 auto",
    flexWrap: "wrap",
  },

  roleCard: {
    backgroundColor: "#ffffff",
    padding: "32px",
    width: "320px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    textAlign: "left",
  },

  roleTitle: {
    fontSize: "24px",
    color: "#1e293b",
    marginBottom: "16px",
  },

  roleDesc: {
    fontSize: "16px",
    color: "#475569",
    lineHeight: 1.6,
  },
};

export default Home;
