import { useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import {
  HugeiconsIcon,
  PaymentSuccess02Icon,
  UserAccountIcon,
  Tag01Icon,
  CreditCardPosIcon,
  MoneyReceiveCircleIcon,
  MoneySendCircleIcon,
  BankIcon,
  PiggyBankIcon,
  Chart01Icon,
  TradeUpIcon,
  Target01Icon,
  ArrowReloadHorizontalIcon,
  ArrowRight01Icon,
  SaveMoneyDollarIcon,
  UserGroupIcon,
  Clock01Icon,
  ContactBookIcon,
  ArrowDown01Icon,
} from "../../../assets/icons";

import "./Sidebar.css";

const menuGroups = [
  {
    key: "principal",
    roles: ["USER"],
    items: [
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: Chart01Icon,
      },
      {
        label: "Movimentações",
        icon: ArrowReloadHorizontalIcon,
        children: [
          {
            label: "Transações",
            path: "/movimentacoes/transacoes",
            icon: SaveMoneyDollarIcon,
            end: true,
          },
          {
            label: "Transferências",
            path: "/movimentacoes/transferencias",
            icon: ArrowRight01Icon,
          },
          {
            label: "Pagar e Receber",
            path: "/movimentacoes/pagar-e-receber",
            icon: PaymentSuccess02Icon,
          },
        ],
      },
      {
        label: "Contas",
        icon: PiggyBankIcon,
        children: [
          {
            label: "Contas Financeiras",
            path: "/contas/contas-financeiras",
            icon: BankIcon,
          },
          {
            label: "Contas a Pagar",
            path: "/contas/contas-pagar",
            icon: MoneySendCircleIcon,
          },
          {
            label: "Contas a Receber",
            path: "/contas/contas-receber",
            icon: MoneyReceiveCircleIcon,
          },
        ],
      },
      {
        label: "Planejamento",
        icon: Chart01Icon,
        children: [
          {
            label: "Orçamento",
            path: "/planejamento/orcamento",
            icon: Chart01Icon,
          },
          {
            label: "Metas",
            path: "/planejamento/metas",
            icon: Target01Icon,
          },
        ],
      },
      // {
      //   label: "Configurações",
      //   path: "/configuracoes",
      //   icon: Settings01Icon,
      // },
    ],
  },
  {
    key: "cadastros",
    roles: ["USER", "SUPERADMIN"],
    items: [
      {
        label: "Cadastros",
        icon: UserAccountIcon,
        children: [
          {
            label: "Pessoas",
            path: "/cadastros/pessoas",
            icon: ContactBookIcon,
          },
          {
            label: "Categorias",
            path: "/cadastros/categorias",
            icon: Tag01Icon,
          },
          {
            label: "Formas de Pagamento",
            path: "/cadastros/formas-pagamento",
            icon: CreditCardPosIcon,
          },
          // {
          //   label: "Notificações",
          //   path: "/cadastros/notificacoes",
          //   icon: Notification01Icon,
          // },
        ],
      },
    ],
  },
  {
    key: "administracao",
    title: "Administração",
    roles: ["SUPERADMIN"],
    items: [
      {
        label: "Usuários",
        path: "/admin/usuarios",
        icon: UserGroupIcon,
      },
      {
        label: "Logs de login",
        path: "/admin/logs-login",
        icon: Clock01Icon,
      },
    ],
  },
];

function Sidebar({
  collapsed = false,
  mobileOpen = false,
  onToggle,
  onCloseMobile,
}) {
  const isCompact = collapsed && !mobileOpen;
  const location = useLocation();
  const [menusAbertos, setMenusAbertos] = useState(() =>
    Object.fromEntries(
      menuGroups
        .flatMap((group) => group.items)
        .filter((item) => item.children)
        .map((item) => [
          item.label,
          item.children.some(
            (child) =>
              location.pathname === child.path ||
              location.pathname.startsWith(`${child.path}/`),
          ),
        ]),
    ),
  );
  const role = localStorage.getItem("role");
  const visibleGroups = menuGroups.filter((group) =>
    group.roles.includes(role),
  );

  return (
    <aside
      className={`
        sidebar
        ${isCompact ? "sidebar--collapsed" : ""}
        ${mobileOpen ? "sidebar--mobile-open" : ""}
      `}
    >
      <div className="sidebar__brand">
        {isCompact ? (
          <button
            type="button"
            className="sidebar__brand-button"
            onClick={onToggle}
            aria-label="Expandir menu"
            title="Expandir menu"
          >
            <HugeiconsIcon
              icon={TradeUpIcon}
              stroke="2"
              size={24}
              color="var(--color-midnight-blue)"
            />
          </button>
        ) : (
          <span className="sidebar__brand-button" aria-hidden="true">
            <HugeiconsIcon
              icon={TradeUpIcon}
              stroke="2"
              size={24}
              color="var(--color-midnight-blue)"
            />
          </span>
        )}

        {!isCompact && (
          <>
            <div className="sidebar__brand-name">
              <span className="brand-name">Finance Control</span>
              <span className="brand-tag">MPT</span>
            </div>
          </>
        )}
      </div>

      <nav className="sidebar__nav" aria-label="Menu principal">
        {visibleGroups.map((group) => (
          <div
            key={group.key}
            className={`sidebar__nav-group sidebar__nav-group--${group.key}`}
          >
            {group.title && !isCompact && (
              <span className="sidebar__nav-title">{group.title}</span>
            )}

            <div className="sidebar__nav-list">
              {group.items.map((item) => {
                const itemAtivo = item.children?.some(
                  (child) =>
                    location.pathname === child.path ||
                    location.pathname.startsWith(`${child.path}/`),
                );
                const menuAberto = menusAbertos[item.label];
                const submenuId = `sidebar-${group.key}-${item.label
                  .toLowerCase()
                  .replace(/\s+/g, "-")}-submenu`;

                return item.children ? (
                  <div className="sidebar__nav-item-group" key={item.label}>
                    <button
                      type="button"
                      className={`sidebar__nav-item sidebar__nav-toggle${menuAberto || itemAtivo ? " sidebar__nav-item--active" : ""}`}
                      onClick={() =>
                        setMenusAbertos((abertos) => ({
                          ...abertos,
                          [item.label]: !abertos[item.label],
                        }))
                      }
                      aria-expanded={Boolean(menuAberto)}
                      aria-controls={submenuId}
                      title={isCompact ? item.label : undefined}
                    >
                      <span className="sidebar__nav-icon">
                        <HugeiconsIcon
                          icon={item.icon}
                          size={20}
                          strokeWidth={2}
                        />
                      </span>
                      {!isCompact && (
                        <>
                          <span className="sidebar__nav-label">
                            {item.label}
                          </span>
                          <HugeiconsIcon
                            icon={ArrowDown01Icon}
                            size={16}
                            strokeWidth={2}
                            className={`sidebar__nav-chevron${menuAberto ? " sidebar__nav-chevron--open" : ""}`}
                          />
                        </>
                      )}
                    </button>

                    {menuAberto && (
                      <div
                        className="sidebar__nav-sublist"
                        id={submenuId}
                        aria-label={`Submenus de ${item.label}`}
                      >
                        {item.children.map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            end={child.end}
                            onClick={onCloseMobile}
                            className={({ isActive }) =>
                              `sidebar__nav-item sidebar__nav-subitem${isActive ? " sidebar__nav-item--active" : ""}`
                            }
                            title={isCompact ? child.label : undefined}
                          >
                            <span className="sidebar__nav-icon">
                              <HugeiconsIcon
                                icon={child.icon}
                                size={20}
                                strokeWidth={2}
                              />
                            </span>
                            {!isCompact && (
                              <span className="sidebar__nav-label">
                                {child.label}
                              </span>
                            )}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `sidebar__nav-item${isActive ? " sidebar__nav-item--active" : ""}`
                    }
                    title={isCompact ? item.label : undefined}
                  >
                    <span className="sidebar__nav-icon">
                      <HugeiconsIcon
                        icon={item.icon}
                        size={20}
                        strokeWidth={2}
                      />
                    </span>

                    {!isCompact && (
                      <span className="sidebar__nav-label">{item.label}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar__bottom">
        <div className="sidebar__footer">
          <span className="sidebar__version">v1.0.0</span>

          {!isCompact && (
            <span className="sidebar__copyright">©2026 NossoGrupo</span>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
