import { useAuth } from "../../context/AuthContext";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <header style={styles.header}>
        <h1>Student Dashboard</h1>
        <p>
          Welcome back, <strong>{user?.name || "Student"}</strong>
        </p>
      </header>

      {/* Stats */}
      <section style={styles.stats}>
        <StatCard title="Enrolled Courses" value="3" />
        <StatCard title="Completed Courses" value="1" />
        <StatCard title="Certificates" value="1" />
      </section>

      {/* Main Content */}
      <section style={styles.content}>
        <h2>My Learning</h2>
        <p>
          Access your enrolled courses, track progress, and continue learning.
        </p>
      </section>
    </div>
  );
};

/* 🔹 Reusable Stat Card */
type StatCardProps = {
  title: string;
  value: string;
};

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <div style={styles.card}>
      <h3>{value}</h3>
      <p>{title}</p>
    </div>
  );
};

/* 🔹 Styles */
const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },
  header: {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  content: {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
};

export default Dashboard;
