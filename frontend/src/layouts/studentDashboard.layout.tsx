import { Outlet } from "react-router-dom";

const DashboardLayout: React.FC = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={styles.sidebar}>
        <h2>EduCity</h2>
        <nav>
          <p>Dashboard</p>
          <p>My Courses</p>
          <p>Profile</p>
          <p>Logout</p>
        </nav>
      </aside>

      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: "240px",
    backgroundColor: "#1e293b",
    color: "#ffffff",
    padding: "24px",
  },
  main: {
    flex: 1,
    padding: "40px",
    backgroundColor: "#f8fafc",
  },
};

export default DashboardLayout;
