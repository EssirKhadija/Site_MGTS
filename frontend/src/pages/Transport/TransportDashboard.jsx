import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TransportLayout from "../../components/Transport/TransportLayout";
import { useAuth } from "../../context/AuthContext";
import { ordersAPI } from "../../api/orders.api";
import { messagesAPI } from "../../api/messages.api";

const modeIcon = { sea: "🚢", air: "✈️", road: "🚛", rail: "🚂" };

const statusConfig = {
  pending_transport: {
    label: "Frais à saisir",
    color: "#E03A2E",
    bg: "#FFE8DC",
  },
  pending_transitaire: { label: "En transit", color: "#0060A8", bg: "#E0EFFA" },
  final_calculation: { label: "Au port", color: "#FF6500", bg: "#FFF0E6" },
  paid: { label: "Livré", color: "#009189", bg: "#E0F5F4" },
};

export default function TransportDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ordersAPI.getTransportOrders(),
      messagesAPI.getNotifications({ limit: 4 }),
    ])
      .then(([ordersRes, notifRes]) => {
        setOrders(ordersRes.data || []);
        setNotifications(notifRes.data?.notifications || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Stats calculées ───────────────────────────────────────
  const pendingOrders = orders.filter((o) => o.status === "pending_transport");
  const activeShipments = orders.filter(
    (o) => o.status === "pending_transitaire"
  );
  const delivered = orders.filter((o) => o.status === "paid");
  const totalRevenue = orders
    .filter((o) => o.myTransportQuote)
    .reduce((acc, o) => acc + parseFloat(o.myTransportQuote || 0), 0);

  const stats = [
    {
      label: "Commandes à traiter",
      value: String(pendingOrders.length),
      icon: "◈",
      color: "#E03A2E",
      bg: "#FFE8DC",
    },
    {
      label: "Expéditions en cours",
      value: String(activeShipments.length),
      icon: "🚢",
      color: "#0060A8",
      bg: "#E0EFFA",
    },
    {
      label: "Livrées ce mois",
      value: String(delivered.length),
      icon: "✓",
      color: "#009189",
      bg: "#E0F5F4",
    },
    {
      label: "Chiffre du mois",
      value: `${totalRevenue.toLocaleString()} MAD`,
      icon: "◆",
      color: "#F5A623",
      bg: "#FEF6E8",
    },
  ];

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
      <TransportLayout>
        <div className="page-content">
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
        </div>
      </TransportLayout>
    );
  }

  return (
    <TransportLayout>
      <div className="page-content">
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{ fontSize: 23, fontWeight: 700, color: "var(--text-dark)" }}
          >
            Bonjour, {user?.fullName} 👋
          </h1>
          <p style={{ color: "var(--text-mid)", fontSize: 13, marginTop: 5 }}>
            {pendingOrders.length} commande(s) en attente de vos frais
            logistiques.
          </p>
        </div>

        {/* Alert strip */}
        {pendingOrders.length > 0 && (
          <div
            style={{
              background: "var(--orange-light)",
              border: "1.5px solid var(--orange)",
              borderRadius: "var(--radius-sm)",
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 24,
            }}
          >
            <span style={{ fontSize: 22 }}>⚠</span>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-dark)",
                }}
              >
                {pendingOrders.length} commande(s) nécessitent vos frais
                logistiques
              </div>
              <div
                style={{ fontSize: 12, color: "var(--text-mid)", marginTop: 2 }}
              >
                Saisissez les frais de transport pour que MGTS puisse finaliser
                les devis clients.
              </div>
            </div>
            <button
              className="btn btn-orange"
              onClick={() => navigate("/transport/orders")}
            >
              Traiter maintenant →
            </button>
          </div>
        )}

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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginBottom: 20,
          }}
        >
          {/* Pending orders */}
          <div className="card">
            <div className="card-header">
              <h3>Commandes — frais à saisir</h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate("/transport/orders")}
              >
                Voir tout →
              </button>
            </div>
            {pendingOrders.length === 0 ? (
              <div
                style={{
                  padding: "24px",
                  textAlign: "center",
                  color: "var(--text-soft)",
                  fontSize: 13,
                }}
              >
                Aucune commande en attente.
              </div>
            ) : (
              pendingOrders.slice(0, 3).map((o) => (
                <div
                  key={o.id}
                  className="table-row"
                  style={{ gridTemplateColumns: "1fr 110px 80px" }}
                  onClick={() => navigate("/transport/orders")}
                >
                  <div>
                    <div className="row-id">
                      CMD-{String(o.id).padStart(6, "0")}
                    </div>
                    <div className="row-title">
                      {o.productName ||
                        o.description?.slice(0, 35) ||
                        "Commande personnalisée"}
                    </div>
                    <div className="row-sub">
                      {o.incoterm || "—"} · {o.quantity} u
                    </div>
                  </div>
                  <span
                    className="badge"
                    style={{ color: "#E03A2E", background: "#FFE8DC" }}
                  >
                    <span
                      className="badge-dot"
                      style={{ background: "#E03A2E" }}
                    />
                    Frais requis
                  </span>
                  <div style={{ fontSize: 11, color: "var(--text-soft)" }}>
                    {new Date(o.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Active shipments */}
          <div className="card">
            <div className="card-header">
              <h3>Expéditions en cours</h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate("/transport/history")}
              >
                Voir tout →
              </button>
            </div>
            {activeShipments.length === 0 ? (
              <div
                style={{
                  padding: "24px",
                  textAlign: "center",
                  color: "var(--text-soft)",
                  fontSize: 13,
                }}
              >
                Aucune expédition en cours.
              </div>
            ) : (
              activeShipments.slice(0, 3).map((s) => (
                <div
                  key={s.id}
                  style={{
                    padding: "14px 22px",
                    borderBottom: "1px solid var(--border-soft)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      <div className="row-id">
                        CMD-{String(s.id).padStart(6, "0")}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text-dark)",
                        }}
                      >
                        🚢 Chine → Maroc
                      </div>
                    </div>
                    <span
                      className="badge"
                      style={{ color: "#0060A8", background: "#E0EFFA" }}
                    >
                      <span
                        className="badge-dot"
                        style={{ background: "#0060A8" }}
                      />
                      En transit
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        flex: 1,
                        height: 5,
                        background: "var(--border)",
                        borderRadius: 3,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: "60%",
                          height: "100%",
                          background: "var(--tr, #0060A8)",
                          borderRadius: 3,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--text-soft)",
                        flexShrink: 0,
                      }}
                    >
                      {formatAmount(s.myTransportQuote)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity + Quick actions */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}
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
                      background: "#0060A8" + "18",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      color: "#0060A8",
                      flexShrink: 0,
                    }}
                  >
                    ◈
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
                marginBottom: 16,
                color: "var(--text-dark)",
              }}
            >
              Actions rapides
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                {
                  label: "◈ Commandes à traiter",
                  to: "/transport/orders",
                  style: "primary",
                },
                {
                  label: "🚢 Saisir frais logistiques",
                  to: "/transport/logistics",
                  style: "teal",
                },
                {
                  label: "◎ Messagerie MGTS",
                  to: "/transport/messages",
                  style: "ghost",
                },
                {
                  label: "◆ Historique opérations",
                  to: "/transport/history",
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
      </div>
    </TransportLayout>
  );
}
