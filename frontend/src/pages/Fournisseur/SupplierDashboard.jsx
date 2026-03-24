import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Supplier.css";
import SupplierLayout from "../../components/Fournisseur/SupplierLayout";
import { useAuth } from "../../context/AuthContext";
import { ordersAPI } from "../../api/orders.api";
import { productsAPI } from "../../api/products.api";
import { messagesAPI } from "../../api/messages.api";

const stateConfig = {
  pending_supplier: { label: "Nouveau", color: "#FF6500", bg: "#FFF0E6" },
  pending_transport: { label: "Devis soumis", color: "#009189", bg: "#E0F5F4" },
  waiting_validation: { label: "Accepté", color: "#007770", bg: "#D5F0EE" },
  rejected: { label: "Refusé", color: "#CC3A00", bg: "#FFE8DC" },
};

const orderConfig = {
  pending_transport: {
    label: "En production",
    color: "#FF6500",
    bg: "#FFF0E6",
  },
  pending_transitaire: { label: "En transit", color: "#0077A8", bg: "#E0F1FA" },
  paid: { label: "Livré", color: "#007770", bg: "#D5F0EE" },
};

export default function SupplierDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ordersAPI.getSupplierOrders(),
      productsAPI.getMine(),
      messagesAPI.getNotifications({ limit: 4 }),
    ])
      .then(([ordersRes, productsRes, notifRes]) => {
        setOrders(ordersRes.data || []);
        setProducts(productsRes.data || []);
        setNotifications(notifRes.data?.notifications || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Stats calculées ───────────────────────────────────────
  const publishedProducts = products.filter(
    (p) => p.status === "active"
  ).length;
  const pendingDemands = orders.filter(
    (o) => o.status === "pending_supplier"
  ).length;
  const activeOrders = orders.filter((o) =>
    ["pending_transport", "pending_transitaire"].includes(o.status)
  ).length;
  const monthRevenue = orders
    .filter((o) => o.myQuote)
    .reduce((acc, o) => acc + parseFloat(o.myQuote || 0), 0);

  const stats = [
    {
      label: "Produits publiés",
      value: String(publishedProducts),
      icon: "◈",
      color: "#009189",
      bg: "#E0F5F4",
    },
    {
      label: "Demandes en attente",
      value: String(pendingDemands),
      icon: "✦",
      color: "#FF6500",
      bg: "#FFF0E6",
    },
    {
      label: "Commandes actives",
      value: String(activeOrders),
      icon: "◆",
      color: "#0077A8",
      bg: "#E0F1FA",
    },
    {
      label: "Chiffre du mois",
      value: `${monthRevenue.toLocaleString()} MAD`,
      icon: "⬡",
      color: "#F5A623",
      bg: "#FEF6E8",
    },
  ];

  const recentDemands = orders
    .filter((o) => o.status === "pending_supplier")
    .slice(0, 3);
  const recentOrders = orders
    .filter((o) => o.status !== "pending_supplier")
    .slice(0, 3);

  const formatTime = (d) => {
    const diff = Date.now() - new Date(d).getTime();
    const h = Math.floor(diff / 3600000);
    const j = Math.floor(diff / 86400000);
    if (h < 1) return "Il y a moins d'1h";
    if (h < 24) return `Il y a ${h}h`;
    return `Il y a ${j}j`;
  };

  const formatAmount = (v) =>
    v ? `${parseFloat(v).toLocaleString()} MAD` : "—";

  if (loading) {
    return (
      <SupplierLayout>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
          }}
        >
          <p style={{ color: "var(--text-soft)", fontSize: 13 }}>
            Chargement...
          </p>
        </div>
      </SupplierLayout>
    );
  }

  return (
    <SupplierLayout>
      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{ fontSize: 23, fontWeight: 700, color: "var(--text-dark)" }}
        >
          Bonjour, {user?.fullName} 👋
        </h1>
        <p style={{ color: "var(--text-mid)", fontSize: 13, marginTop: 5 }}>
          Voici l'état de votre activité fournisseur aujourd'hui.
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="card stat-card">
            <div className="stat-inner">
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
              </div>
              <div
                className="stat-icon"
                style={{ background: s.bg, color: s.color }}
              >
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginBottom: 20,
        }}
      >
        {/* Demands */}
        <div className="card">
          <div className="card-header">
            <h3>Demandes récentes</h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate("/supplier/demands")}
            >
              Voir tout →
            </button>
          </div>
          {recentDemands.length === 0 ? (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                color: "var(--text-soft)",
                fontSize: 13,
              }}
            >
              Aucune demande en attente.
            </div>
          ) : (
            recentDemands.map((d) => {
              const s = stateConfig[d.status] || stateConfig.pending_supplier;
              return (
                <div
                  key={d.id}
                  className="table-row"
                  style={{ gridTemplateColumns: "1fr 120px 80px" }}
                  onClick={() => navigate("/supplier/demands")}
                >
                  <div>
                    <div className="row-id">
                      DEM-{String(d.id).padStart(6, "0")}
                    </div>
                    <div className="row-title">
                      {d.productName ||
                        d.description?.slice(0, 35) ||
                        "Commande personnalisée"}
                    </div>
                    <div className="row-sub">{d.clientName}</div>
                  </div>
                  <span
                    className="badge"
                    style={{ color: s.color, background: s.bg }}
                  >
                    <span
                      className="badge-dot"
                      style={{ background: s.color }}
                    />
                    {s.label}
                  </span>
                  <div className="row-amount" style={{ fontSize: 12 }}>
                    {formatAmount(d.estimatedBudget)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Orders */}
        <div className="card">
          <div className="card-header">
            <h3>Commandes en cours</h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate("/supplier/orders")}
            >
              Voir tout →
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                color: "var(--text-soft)",
                fontSize: 13,
              }}
            >
              Aucune commande en cours.
            </div>
          ) : (
            recentOrders.map((o) => {
              const s = orderConfig[o.status] || orderConfig.pending_transport;
              return (
                <div
                  key={o.id}
                  className="table-row"
                  style={{ gridTemplateColumns: "1fr 120px 90px" }}
                  onClick={() => navigate("/supplier/orders")}
                >
                  <div>
                    <div className="row-id">
                      CMD-{String(o.id).padStart(6, "0")}
                    </div>
                    <div className="row-title">
                      {o.productName || "Commande personnalisée"}
                    </div>
                    <div className="row-sub">{o.clientName}</div>
                  </div>
                  <span
                    className="badge"
                    style={{ color: s.color, background: s.bg }}
                  >
                    <span
                      className={`badge-dot${
                        o.status === "pending_transport" ? " pulse" : ""
                      }`}
                      style={{ background: s.color }}
                    />
                    {s.label}
                  </span>
                  <div className="row-amount">{formatAmount(o.myQuote)}</div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Activity + Quick actions */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}
      >
        <div className="card card-pad">
          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 18,
              color: "var(--text-dark)",
            }}
          >
            Activité récente
          </h3>
          {notifications.length === 0 ? (
            <p
              style={{
                fontSize: 12,
                color: "var(--text-soft)",
                textAlign: "center",
                padding: "20px 0",
              }}
            >
              Aucune activité récente.
            </p>
          ) : (
            notifications.map((n, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  marginBottom: 16,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    background: "#009189" + "18",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    color: "#009189",
                    flexShrink: 0,
                  }}
                >
                  ◆
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-dark)",
                      lineHeight: 1.5,
                    }}
                  >
                    {n.title}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-soft)",
                      marginTop: 3,
                    }}
                  >
                    {formatTime(n.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card card-pad">
          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 18,
              color: "var(--text-dark)",
            }}
          >
            Actions rapides
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              {
                label: "➕ Ajouter un produit",
                to: "/supplier/products",
                style: "primary",
              },
              {
                label: "✦ Voir les demandes",
                to: "/supplier/demands",
                style: "orange",
              },
              {
                label: "◎ Ouvrir la messagerie",
                to: "/supplier/messages",
                style: "ghost",
              },
              {
                label: "◆ Historique commandes",
                to: "/supplier/orders",
                style: "ghost",
              },
            ].map(({ label, to, style }) => (
              <button
                key={to}
                className={`btn btn-${style} btn-full`}
                onClick={() => navigate(to)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SupplierLayout>
  );
}
