import { NavLink } from "react-router-dom";
import "../../styles/Admin.css";
import logo from "../../assets/logoC.png";

const sections = [
  {
    label: "ANALYTICS",
    items: [
      { to: "/admin", icon: "▦", label: "Dashboard" },
      { to: "/admin/orders", icon: "◈", label: "Commandes", badge: 5 },
      { to: "/admin/payments", icon: "◆", label: "Paiements" },
    ],
  },
  {
    label: "GESTION",
    items: [
      { to: "/admin/users", icon: "◉", label: "Utilisateurs", badge: 3 },
      
    ],
  },
  {
    label: "SYSTÈME",
    items: [
      { to: "/admin/exports", icon: "↓", label: "Exports Excel" },
      { to: "/admin/settings", icon: "▣", label: "Paramètres" },
    ],
  },
];

export default function AdminSidebar() {
  return (
    <aside className="sidebar">
      {/* Top */}
      <div className="sidebar-logo">
        <img src={logo} alt="MGTS Logo" style={{ width: 190, height: 150, marginRight: 8 }} />

      </div>
      <div className="sidebar-admin-badge">
        <div className="sidebar-admin-dot" />
        <span className="sidebar-admin-text">Admin Console</span>
      </div>
    

      {/* Nav */ }
  <nav className="sidebar-nav">
    {sections.map(sec => (
      <div key={sec.label}>
        <div className="nav-section-label">{sec.label}</div>
        {sec.items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin"}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && <span className="nav-item-badge">{item.badge}</span>}
          </NavLink>
        ))}
      </div>
    ))}
  </nav>

  {/* Bottom user */ }
  <div className="sidebar-bottom">
    <NavLink to="/admin/settings" className="sidebar-user" style={{ textDecoration: "none" }}>
      <div className="sidebar-avatar">AD</div>
      <div>
        <div className="sidebar-name">Admin MGTS</div>
        <div className="sidebar-role">SUPER ADMIN</div>
      </div>
    </NavLink>

    <NavLink to="/login" className="btn btn-ghost" style={{ width: "100%", textAlign: "center", marginTop: 10 }}>
      Déconnexion
    </NavLink>
  </div>
    </aside >
  );
}