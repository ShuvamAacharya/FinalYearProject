import { useAuth } from "../../context/auth.context";

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <div>
          <h1>Admin Dashboard</h1>
          <p>
            Signed in as <strong>{user.name}</strong> (admin)
          </p>
        </div>
        <button style={styles.logout} type="button" onClick={logout}>
          Logout
        </button>
      </header>

      <section style={styles.content}>
        <h2>Platform overview</h2>
        <p>
          Manage instructors, review courses, and monitor platform activity. Full
          admin tools will connect here as you build out the API.
        </p>
      </section>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
    padding: "24px",
    maxWidth: "960px",
    margin: "0 auto",
  },
  header: {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logout: {
    padding: "10px 16px",
    backgroundColor: "#ef4444",
    border: "none",
    color: "#fff",
    borderRadius: "6px",
    cursor: "pointer",
  },
  content: {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
};

export default AdminDashboard;
