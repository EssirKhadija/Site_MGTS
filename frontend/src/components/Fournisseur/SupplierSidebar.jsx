import { NavLink, useNavigate } from "react-router-dom";
import "../../styles/Supplier.css";
import logo from "../../assets/logoC.png";
import { useAuth } from "../../context/AuthContext";
import { ordersAPI } from "../../api/orders.api";
import api from "../../api/axios";
import { useEffect, useState } from "react";

export default function SupplierSidebar({ supplier }) {
  const { logout, user } = useAuth();
  const [badgeCounts, setBadgeCounts] = useState({
    demands: 0,
    messages: 0,
  });

  const fetchBadgeCounts = async () => {
    try {
      const [demandsRes, messagesRes] = await Promise.all([
        api.get(ordersAPI.supplierDemandsCounts), // Endpoint for demand counts
        api.get("/supplier/messages/counts"), // Endpoint for message counts
      ]);

      setBadgeCounts({
        demands: demandsRes.data.pendingDemands || 0,
        messages: messagesRes.data.unreadMessages || 0,
      });
    } catch (err) {
      console.error("Failed to fetch badge counts:", err);
    }
  };

  useEffect(() => {
    fetchBadgeCounts();
  }, []);

  const navItems = [
    { to: "/supplier", icon: "⬡", label: "Tableau de bord" },
    { to: "/supplier/products", icon: "◈", label: "Mes produits", badge: null },
    {
      to: "/supplier/demands",
      icon: "✦",
      label: "Demandes clients",
      badge: badgeCounts.demands,
    },
    { to: "/supplier/orders", icon: "◆", label: "Commandes" },
    {
      to: "/supplier/messages",
      icon: "◎",
      label: "Messagerie",
      badge: badgeCounts.messages,
    },
    { to: "/supplier/profile", icon: "▣", label: "Mon compte" },
  ];
  const initials = user
    ? user.fullName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "SU";

  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      {/* Logo — orange tint for supplier */}
      <div className="sidebar-logo">
        <img
          src={logo}
          alt="MGTS Logo"
          style={{ width: 190, height: 150, marginRight: 8 }}
        />
      </div>

      {/* Pending badge if not yet validated */}
      {supplier?.status === "pending" && (
        <div
          style={{
            background: "var(--orange-light)",
            border: "1px solid var(--orange)",
            borderRadius: 8,
            padding: "8px 12px",
            marginBottom: 16,
            fontSize: 11,
            color: "var(--orange)",
            fontWeight: 600,
            textAlign: "center",
          }}
        >
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
            {item.badge && <span className="nav-item-badge">{item.badge}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="sidebar-user">
        <NavLink
          to="/supplier/profile"
          className="sidebar-user-inner"
          style={{ textDecoration: "none" }}
        >
          <div className="sidebar-avatar">{initials}</div>
          <div>
            <div className="sidebar-name">
              {user?.fullName ?? "Fournisseur"}
            </div>
            <div className="sidebar-email">{user?.email ?? ""}</div>
          </div>
        </NavLink>
        <button onClick={logout} className="logout-button">
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
