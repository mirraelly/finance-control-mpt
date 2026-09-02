import { useState } from "react";
import { Outlet } from "react-router-dom";
import { HugeiconsIcon, Menu01Icon } from "../../assets/icons";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import "./InternalLayout.css";

function InternalLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const handleOpenMobileMenu = () => {
    setMobileMenuOpen(true);
  };

  const handleCloseMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div
      className={`app-layout ${
        sidebarCollapsed ? "app-layout--sidebar-collapsed" : ""
      }`}
    >
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        onToggle={handleToggleSidebar}
        onCloseMobile={handleCloseMobileMenu}
      />

      {mobileMenuOpen && (
        <div
          className="app-layout__overlay"
          onClick={handleCloseMobileMenu}
          aria-hidden="true"
        />
      )}

      <main className="app-layout__main">
        <button
          type="button"
          className="app-layout__mobile-menu"
          onClick={handleOpenMobileMenu}
          aria-label="Abrir menu"
        >
          <HugeiconsIcon icon={Menu01Icon} size={24} strokeWidth={2} />
        </button>

        <Outlet />
      </main>
    </div>
  );
}

export default InternalLayout;
