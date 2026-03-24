import { NavLink } from "react-router-dom";
import "../../styles/Admin.css";
import logo from "../../assets/logoC.png";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { ordersAPI } from "../../api/orders.api";
import { useEffect, useState } from "react";

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const [localBadgeCounts, setLocalBadgeCounts] = useState({
    orders: 0,
    payments: 0,
    users: 0,
  });

  const fetchBadgeCounts = async () => {
    try {
      const [ordersRes, paymentsRes, usersRes] = await Promise.all([
        api.get(ordersAPI.counts),
        api.get("/admin/payments/counts"),
        api.get("/admin/users/counts"),
      ]);

      setLocalBadgeCounts({
        orders: ordersRes.data.count || 0,
        payments: paymentsRes.data.count || 0,
        users: usersRes.data.count || 0,
      });
    } catch (err) {
      console.error("Failed to fetch badge counts:", err);
    }
  };

  useEffect(() => {
    fetchBadgeCounts();
  }, []);

  const sections = [
    {
      label: "ANALYTICS",
      items: [
        { to: "/admin", icon: "▦", label: "Dashboard" },
        {
          to: "/admin/orders",
          icon: "◈",
          label: "Commandes",
          badge: localBadgeCounts.orders,
        },
        {
          to: "/admin/payments",
          icon: "◆",
          label: "Paiements",
          badge: localBadgeCounts.payments,
        },
      ],
    },
    {
      label: "GESTION",
      items: [
        {
          to: "/admin/users",
          icon: "◉",
          label: "Utilisateurs",
          badge: localBadgeCounts.users,
        },
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

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

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

      <div className="sidebar-admin-badge">
        <div className="sidebar-admin-dot" />
        <span className="sidebar-admin-text">Admin Console</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {sections.map((sec) => (
          <div key={sec.label}>
            <div className="nav-section-label">{sec.label}</div>
            {sec.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/admin"}
                className={({ isActive }) =>
                  `nav-item${isActive ? " active" : ""}`
                }
              >
                <span className="nav-item-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className="nav-item-badge">{item.badge}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom user */}
      <div className="sidebar-bottom">
        <NavLink
          to="/admin/settings"
          className="sidebar-user"
          style={{ textDecoration: "none" }}
        >
          <div className="sidebar-avatar">{initials}</div>
          <div>
            <div className="sidebar-name">{user?.fullName || "Admin MGTS"}</div>
            <div className="sidebar-role">SUPER ADMIN</div>
          </div>
        </NavLink>

        <button
          className="btn btn-ghost"
          style={{ width: "100%", textAlign: "center", marginTop: 10 }}
          onClick={logout}
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
