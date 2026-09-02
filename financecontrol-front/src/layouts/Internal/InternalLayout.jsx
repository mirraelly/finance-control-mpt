import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import "./InternalLayout.css";

function InternalLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <div
      className={`app-layout ${
        sidebarCollapsed ? "app-layout--sidebar-collapsed" : ""
      }`}
    >
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />

      <main className="app-layout__main">
        <Outlet />
      </main>
    </div>
  );
}

export default InternalLayout;
