import { NavLink , Navigate,useNavigate} from "react-router-dom";
import logo from "../../assets/logoC.png";

const navItems = [
  { to: "/transport", icon: "⬡", label: "Tableau de bord" },
  { to: "/transport/orders", icon: "◈", label: "Commandes validées", badge: 4 },
  { to: "/transport/logistics", icon: "🚢", label: "Frais logistiques" },
  { to: "/transport/history", icon: "◆", label: "Historique" },
  { to: "/transport/messages", icon: "◎", label: "Messagerie", badge: 2 },
  { to: "/transport/profile", icon: "▣", label: "Mon compte" },
];

export default function TransportSidebar({ company }) {
  const initials = company?.name
    ? company.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "TR";
      const navigate = useNavigate();


  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src={logo} alt="MGTS Logo" style={{ width: 190, height: 150, marginRight: 8 }} />

      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/transport"}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && <span className="nav-item-badge">{item.badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <NavLink to="/transport/profile" className="sidebar-user-inner" style={{ textDecoration: "none" }}>
          <div className="sidebar-avatar">{initials}</div>
          <div>
            <div className="sidebar-name">{company?.name ?? "Transporteur"}</div>
            <div className="sidebar-email">{company?.email ?? ""}</div>
          </div>
        </NavLink>
        <button onClick={() => navigate('/login')} className="logout-button">
          Déconnexion
        </button>
      </div>
    </aside>
  );
}