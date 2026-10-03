import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import {
  HugeiconsIcon,
  Menu01Icon,
  PanelRightOpenIcon,
} from "../../assets/icons";
import Sidebar from "../../components/layout/Sidebar/Sidebar";

import "./InternalLayout.css";
import Header from "../../components/layout/Header/Header";

function InternalLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const pageTitles = {
    "/dashboard": "Dashboard",
    "/transacoes": "Transações",
    "/perfil": "Perfil",
    "/componentes-teste": "Componentes",
    "/admin/usuarios": "Usuários",
    "/admin/logs-login": "Logs de login",
    "/cadastros/pessoas": "Pessoas",
    "/cadastros/categorias": "Categorias",
    "/cadastros/contas-financeiras": "Contas financeiras",
    "/cadastros/contas-pagar": "Contas a pagar",
    "/cadastros/contas-receber": "Contas a receber",
    "/cadastros/notificacoes": "Notificações",
  };
  const currentPath = Object.keys(pageTitles).find(
    (path) =>
      location.pathname === path || location.pathname.startsWith(`${path}/`),
  );
  const title = pageTitles[currentPath] || "Início";

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

      {!sidebarCollapsed && (
        <button
          type="button"
          className="app-layout__sidebar-toggle"
          onClick={handleToggleSidebar}
          aria-label="Recolher menu"
          title="Recolher menu"
        >
          <HugeiconsIcon icon={PanelRightOpenIcon} size={18} stroke="3" strokeWidth="2.2" />
        </button>
      )}

      {mobileMenuOpen && (
        <div
          className="app-layout__overlay"
          onClick={handleCloseMobileMenu}
          aria-hidden="true"
        />
      )}

      <div className="app-layout__content">
        <button
          type="button"
          className="app-layout__mobile-menu"
          onClick={handleOpenMobileMenu}
          aria-label="Abrir menu"
        >
          <HugeiconsIcon icon={Menu01Icon} size={24} strokeWidth={2} />
        </button>
        <Header title={title} />

        <main className="app-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default InternalLayout;
