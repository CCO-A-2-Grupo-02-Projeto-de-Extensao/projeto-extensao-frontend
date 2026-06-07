import Sidebar from "../components/Sidebar/Sidebar";

export function DashboardLayout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main
        style={{
          flexGrow: 1,
          padding: "20px",
          marginLeft: "200px",
          backgroundColor: "var(--cremeClaro)",
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
}
