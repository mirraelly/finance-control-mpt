import {
  HugeiconsIcon,
  Home07Icon,
  Wallet01Icon,
  Chart01Icon,
  TradeUpIcon,
  Target01Icon,
  Settings01Icon,
} from "../../../assets/icons";
import "./Sidebar.css";

const menuItems = [
  {
    label: "Início",
    path: "/home",
    icon: Home07Icon,
  },
  {
    label: "Contas",
    path: "/contas",
    icon: Wallet01Icon,
  },
  {
    label: "Orçamento",
    path: "/orcamento",
    icon: Chart01Icon,
  },
  {
    label: "Metas",
    path: "/metas",
    icon: Target01Icon,
  },
  {
    label: "Configurações",
    path: "/configuracoes",
    icon: Settings01Icon,
  },
];

function Sidebar({ collapsed = false, onToggle }) {
  return (
    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
      <div className="sidebar__brand">
        <button
          type="button"
          className="sidebar__brand-button"
          onClick={onToggle}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          <HugeiconsIcon
            icon={TradeUpIcon}
            stroke="2"
            size={24}
            color="var(--color-midnight-blue)"
          />
        </button>

        {!collapsed && (
          <div className="sidebar__brand-name">
            <span className="brand-name">Finance Control</span>
            <span className="brand-tag">MPT</span>
          </div>
        )}
      </div>

      <nav className="sidebar__nav" aria-label="Menu principal">
        <div className="sidebar__nav-list">
          {menuItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className="sidebar__nav-item"
              title={collapsed ? item.label : undefined}
            >
              <span className="sidebar__nav-icon">
                <HugeiconsIcon icon={item.icon} size={20} strokeWidth={2} />
              </span>

              {!collapsed && (
                <span className="sidebar__nav-label">{item.label}</span>
              )}
            </a>
          ))}
        </div>
      </nav>

      <div className="sidebar__bottom">
        {/* <div className="sidebar__user">
          <div
            className="sidebar__user-avatar"
            title={collapsed ? "Ana Silva" : undefined}
          >
            A
          </div>

          {!collapsed && (
            <div className="sidebar__user-info">
              <strong>Ana Silva</strong>
              <span>Plano Pro</span>
            </div>
          )}
        </div> */}

        <div className="sidebar__footer">
          <span className="sidebar__version">v1.0.0</span>
          {!collapsed && (
            <span className="sidebar__copyright">©2026 NossoGrupo</span>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
