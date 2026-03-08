import { NavLink, useNavigate } from "react-router-dom";
import "../../styles/Client.css";
import logo from "../../assets/logo.png";

const navItems = [
  { to: "/client-dashboard", icon: "⬡", label: "Tableau de bord" },
  { to: "/products",  icon: "◈", label: "Produits"        },
  { to: "/new",       icon: "✦", label: "Nouvelle demande" },
  { to: "/quotes",    icon: "◉", label: "Devis",     badge: 1 },
  { to: "/orders",    icon: "◆", label: "Commandes"       },
  { to: "/messages",  icon: "◎", label: "Messagerie", badge: 2 },
  { to: "/profile",   icon: "▣", label: "Mon profil"      },
];

export default function Sidebar() {
  const navigate = useNavigate();
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
       <img src={logo} alt="MGTS Logo" style={{ width: 190, height: 150, marginRight: 8 }} />
        
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && (
              <span className="nav-item-badge">{item.badge}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="sidebar-user">
        <NavLink to="/profile" className="sidebar-user-inner" style={{ textDecoration: "none" }}>
          <div className="sidebar-avatar">JD</div>
          <div>
            <div className="sidebar-name">Jean Dupont</div>
            <div className="sidebar-email">jean@example.com</div>
          </div>
        </NavLink>
        <button onClick={() => navigate('/login')} className="logout-button">
          Déconnexion
        </button>
      </div>
    </aside>
  );
}