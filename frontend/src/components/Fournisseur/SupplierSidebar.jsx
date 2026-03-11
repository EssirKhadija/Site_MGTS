import { NavLink } from "react-router-dom";
import "../../styles/Supplier.css";

const navItems = [
  { to: "/supplier",          icon: "⬡", label: "Tableau de bord"  },
  { to: "/supplier/products", icon: "◈", label: "Mes produits",    badge: null },
  { to: "/supplier/demands",  icon: "✦", label: "Demandes clients", badge: 3   },
  { to: "/supplier/orders",   icon: "◆", label: "Commandes"        },
  { to: "/supplier/messages", icon: "◎", label: "Messagerie",      badge: 2   },
  { to: "/supplier/profile",  icon: "▣", label: "Mon compte"       },
];

export default function SupplierSidebar({ supplier }) {
  const initials = supplier
    ? supplier.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "SF";

  return (
    <aside className="sidebar">
      {/* Logo — orange tint for supplier */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">S</div>
        <div>
          <div className="sidebar-logo-text">MGTS</div>
          <div className="sidebar-logo-sub">ESPACE FOURNISSEUR</div>
        </div>
      </div>

      {/* Pending badge if not yet validated */}
      {supplier?.status === "pending" && (
        <div style={{ background: "var(--orange-light)", border: "1px solid var(--orange)", borderRadius: 8, padding: "8px 12px", marginBottom: 16, fontSize: 11, color: "var(--orange)", fontWeight: 600, textAlign: "center" }}>
          ⏳ Compte en attente de validation
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/supplier"}
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
        <NavLink to="/supplier/profile" className="sidebar-user-inner" style={{ textDecoration: "none" }}>
          <div className="sidebar-avatar">{initials}</div>
          <div>
            <div className="sidebar-name">{supplier?.name ?? "Fournisseur"}</div>
            <div className="sidebar-email">{supplier?.email ?? ""}</div>
          </div>
        </NavLink>
      </div>
    </aside>
  );
}