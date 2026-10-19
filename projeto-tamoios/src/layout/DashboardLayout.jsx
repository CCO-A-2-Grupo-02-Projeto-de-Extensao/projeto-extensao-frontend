import Sidebar from "../components/Sidebar/Sidebar";

export function DashboardLayout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main
        style={{
          flexGrow: 1,
          padding: "32px",
          marginLeft: "240px",
          backgroundColor: "var(--cremeClaro)",
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
}
