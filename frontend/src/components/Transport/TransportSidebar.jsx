import { NavLink , Navigate,useNavigate} from "react-router-dom";
import logo from "../../assets/logoC.png";
import { useAuth } from "../../context/AuthContext";
import { ordersAPI } from "../../api/orders.api";
import api from "../../api/axios";
import { useEffect, useState } from "react";



export default function TransportSidebar({ company }) {
  const { logout, user } = useAuth();
  const [badgeCounts, setBadgeCounts] = useState({
    orders: 0,
    messages: 0,
  });

  const fetchBadgeCounts = async () => {
    try {
      const [ordersRes, messagesRes] = await Promise.all([
        api.get(ordersAPI.transportOrdersCounts), // Endpoint for order counts
        api.get("/transport/messages/counts"), // Endpoint for message counts
      ]);

      setBadgeCounts({
        orders: ordersRes.data.pendingOrders || 0,
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
    { to: "/transport", icon: "⬡", label: "Tableau de bord" },
    { to: "/transport/orders", icon: "◈", label: "Commandes validées", badge: badgeCounts.orders },
    { to: "/transport/logistics", icon: "🚢", label: "Frais logistiques" },
    { to: "/transport/history", icon: "◆", label: "Historique" },
    { to: "/transport/messages", icon: "◎", label: "Messagerie", badge: badgeCounts.messages },
    { to: "/transport/profile", icon: "▣", label: "Mon compte" },
  ];
  const initials = user?.fullName
    ? user.fullName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
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
            <div className="sidebar-name">{user?.fullName ?? "Transporteur"}</div>
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