import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/logoC.png";
import { useAuth } from "../../context/AuthContext";
import { ordersAPI } from "../../api/orders.api";
import api from "../../api/axios";
import { useEffect, useState } from "react";



export default function TransitaireSidebar({ company }) {
  const { logout, user } = useAuth()
  const [badgeCounts, setBadgeCounts] = useState({
    orders: 0,
    messages: 0,
  });

  const fetchBadgeCounts = async () => {
    try {
      const [ordersRes, messagesRes] = await Promise.all([
        api.get(ordersAPI.transitaireOrdersCounts), // Endpoint for order counts
        api.get("/transitaire/messages/counts"), // Endpoint for message counts
      ]);

      setBadgeCounts({
        orders: ordersRes.data.pendingOrders || 0,
        messages: messagesRes.data.unreadMessages || 0,
      });
    } catch (err) {
      console.error("Failed to fetch badge counts:", err);
    } finally {
      // Schedule next fetch in 30 seconds
      setTimeout(fetchBadgeCounts, 30000);
    }
  };

  useEffect(() => {
    fetchBadgeCounts();
    // Cleanup on unmount
    return () => {
      setBadgeCounts({ orders: 0, messages: 0 });
    };
  }, []);
  const navItems = [
    { to: "/transitaire", icon: "⬡", label: "Tableau de bord" },
    { to: "/transitaire/orders", icon: "◈", label: "Commandes", badge: badgeCounts.orders },
    { to: "/transitaire/customs", icon: "✦", label: "Frais douaniers" },
    { to: "/transitaire/import", icon: "◆", label: "Validation import" },
    { to: "/transitaire/history", icon: "▣", label: "Historique dossiers" },
    { to: "/transitaire/messages", icon: "◎", label: "Messagerie", badge: badgeCounts.messages },
    { to: "/transitaire/profile", icon: "▤", label: "Mon compte" },
  ];
  
  const navigate = useNavigate();
  const initials = user
    ? user.fullName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "TR";

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
            <div className="sidebar-name">{user?.fullName ?? "Transitaire"}</div>
            <div className="sidebar-email">{user?.email ?? ""}</div>
          </div>
        </NavLink>
        <button onClick={logout} className="logout-button" style={{ marginTop: 10 }}>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}