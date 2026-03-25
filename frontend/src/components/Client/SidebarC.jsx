import { NavLink, useNavigate } from "react-router-dom";
import "../../styles/Client.css";
import logo from "../../assets/logoC.png";
import { useAuth } from "../../context/AuthContext";
import { ordersAPI } from "../../api/orders.api";
import api from "../../api/axios";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [badgeCounts, setBadgeCounts] = useState({
    quotes: 0,
    messages: 0,
  });

  const fetchBadgeCounts = async () => {
    try {
      const [quotesRes, messagesRes] = await Promise.all([
        api.get(ordersAPI.counts), // Assuming this endpoint returns quote counts
        api.get("/client/messages/counts"), // Endpoint for message counts
      ]);

      setBadgeCounts({
        quotes: quotesRes.data.pendingQuotes || 0,
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
    { to: "/client-dashboard", icon: "⬡", label: "Tableau de bord" },
    { to: "/products", icon: "◈", label: "Produits" },
    { to: "/new", icon: "✦", label: "Nouvelle demande" },
    { to: "/quotes", icon: "◉", label: "Devis", badge: badgeCounts.quotes },
    { to: "/orders", icon: "◆", label: "Commandes" },
    {
      to: "/messages",
      icon: "◎",
      label: "Messagerie",
      badge: badgeCounts.messages,
    },
    { to: "/profile", icon: "▣", label: "Mon profil" },
  ];

  const initials = user
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "CL";

  const navigate = useNavigate();
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <img
          src={logo}
          alt="MGTS Logo"
          style={{ width: 190, height: 150, marginRight: 8 }}
        />
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
            {item.badge && <span className="nav-item-badge">{item.badge}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="sidebar-user">
        <NavLink
          to="/profile"
          className="sidebar-user-inner"
          style={{ textDecoration: "none" }}
        >
          <div className="sidebar-avatar">{initials}</div>
          <div>
            <div className="sidebar-name">{user?.fullName}</div>
            <div className="sidebar-email">{user?.email}</div>
          </div>
        </NavLink>
        <button onClick={logout} className="logout-button">
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
