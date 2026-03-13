import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/transitaire",           icon: "⬡", label: "Tableau de bord"      },
  { to: "/transitaire/orders",    icon: "◈", label: "Commandes",    badge: 3 },
  { to: "/transitaire/customs",   icon: "✦", label: "Frais douaniers"       },
  { to: "/transitaire/import",    icon: "◆", label: "Validation import"     },
  { to: "/transitaire/history",   icon: "▣", label: "Historique dossiers"   },
  { to: "/transitaire/messages",  icon: "◎", label: "Messagerie",  badge: 2 },
  { to: "/transitaire/profile",   icon: "▤", label: "Mon compte"            },
];

export default function TransitaireSidebar({ company }) {
  const initials = company?.name
    ? company.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "TR";

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">T</div>
        <div>
          <div className="sidebar-logo-text">MGTS</div>
          <div className="sidebar-logo-sub">ESPACE TRANSITAIRE</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/transitaire"}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && <span className="nav-item-badge">{item.badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <NavLink to="/transitaire/profile" className="sidebar-user-inner" style={{ textDecoration: "none" }}>
          <div className="sidebar-avatar">{initials}</div>
          <div>
            <div className="sidebar-name">{company?.name ?? "Transitaire"}</div>
            <div className="sidebar-email">{company?.email ?? ""}</div>
          </div>
        </NavLink>
      </div>
    </aside>
  );
}