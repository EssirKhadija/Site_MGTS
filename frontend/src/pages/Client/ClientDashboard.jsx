import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Client.css";
import ClientLayout from "../../components/Client/ClientLayout";
import { useAuth } from "../../context/AuthContext";
import { ordersAPI } from "../../api/orders.api";
import { messagesAPI } from "../../api/messages.api";

const statusConfig = {
  pending: { label: "En attente", color: "#F5A623", bg: "#FEF6E8" },
  pending_supplier: {
    label: "Chez fournisseur",
    color: "#9B59B6",
    bg: "#F5EEF8",
  },
  pending_transport: {
    label: "Chez transporteur",
    color: "#0077A8",
    bg: "#E0F1FA",
  },
  pending_transitaire: {
    label: "Chez transitaire",
    color: "#2E86C1",
    bg: "#EBF5FB",
  },
  final_calculation: { label: "Calcul final", color: "#F5A623", bg: "#FEF6E8" },
  pending_payment: { label: "Devis reçu", color: "#009189", bg: "#E0F5F4" },
  waiting_validation: {
    label: "Paiement envoyé",
    color: "#007770",
    bg: "#D5F0EE",
  },
  paid: { label: "Payé", color: "#007770", bg: "#D5F0EE" },
  rejected: { label: "Refusé", color: "#CC3A00", bg: "#FFE8DC" },
};

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [ordersRes, notifRes, unreadRes] = await Promise.all([
        ordersAPI.getMyOrders(),
        messagesAPI.getNotifications({ limit: 4 }),
        messagesAPI.getUnreadCount(),
      ]);

      setOrders(ordersRes.data?.orders || ordersRes.data || []);
      setNotifications(notifRes.data?.notifications || []);
      setUnreadCount(unreadRes.data?.unreadCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── STATS calculées depuis les vraies commandes ───────────
  const activeOrders = orders.filter(
    (o) => !["paid", "rejected"].includes(o.status)
  ).length;

  const pendingQuotes = orders.filter(
    (o) => o.status === "pending_payment"
  ).length;

  const deliveredCount = orders.filter((o) => o.status === "paid").length;

  const totalSaved = orders
    .filter((o) => o.mgtsMargin)
    .reduce((acc, o) => acc + parseFloat(o.mgtsMargin || 0), 0);

  const stats = [
    {
      label: "Commandes actives",
      value: activeOrders,
      icon: "⬡",
      color: "#009189",
      bg: "#E0F5F4",
    },
    {
      label: "Devis en attente",
      value: pendingQuotes,
      icon: "◈",
      color: "#F5A623",
      bg: "#FEF6E8",
    },
    {
      label: "Commandes livrées",
      value: deliveredCount,
      icon: "◉",
      color: "#FF6500",
      bg: "#FFF0E6",
    },
    {
      label: "Marge MGTS totale",
      value: `${totalSaved.toLocaleString()} MAD`,
      icon: "◆",
      color: "#0077A8",
      bg: "#E0F1FA",
    },
  ];

  const recentOrders = orders.slice(0, 5);

  // ── Formatage date ────────────────────────────────────────
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ── Formatage montant ─────────────────────────────────────
  const formatAmount = (amount) => {
    if (!amount) return "—";
    return `${parseFloat(amount).toLocaleString()} MAD`;
  };

  if (loading) {
    return (
      <ClientLayout>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
          }}
        >
          <p style={{ color: "var(--text-mid)" }}>Chargement...</p>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{ fontSize: 23, fontWeight: 700, color: "var(--text-dark)" }}
        >
          Bonjour, {user?.fullName?.split(" ")[0]} 👋
        </h1>
        <p style={{ color: "var(--text-mid)", fontSize: 13, marginTop: 5 }}>
          Voici l'état de vos opérations en cours.
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="card stat-card">
            <div className="stat-card-inner">
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

      {/* Table + Activity */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}
      >
        {/* Recent orders */}
        <div className="card">
          <div className="card-header">
            <h3>Commandes récentes</h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate("/client/orders")}
            >
              Voir tout →
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                color: "var(--text-soft)",
              }}
            >
              <p style={{ fontSize: 14 }}>Aucune commande pour le moment.</p>
              <button
                className="btn btn-primary"
                style={{ marginTop: 16 }}
                onClick={() => navigate("/client/new-order")}
              >
                ✦ Créer ma première commande
              </button>
            </div>
          ) : (
            <>
              <div
                className="table-header"
                style={{ gridTemplateColumns: "1fr 170px 120px 110px 52px" }}
              >
                <span>Commande</span>
                <span>Statut</span>
                <span>Date</span>
                <span>Montant</span>
                <span>Msg</span>
              </div>

              {recentOrders.map((o) => {
                const s = statusConfig[o.status] || {
                  label: o.status,
                  color: "#888",
                  bg: "#f0f0f0",
                };
                return (
                  <div
                    key={o.id}
                    className="table-row"
                    style={{
                      gridTemplateColumns: "1fr 170px 120px 110px 52px",
                    }}
                    onClick={() => navigate(`/client/orders/${o.id}`)}
                  >
                    <div>
                      <div className="row-id">
                        CMD-{String(o.id).padStart(6, "0")}
                      </div>
                      <div className="row-title">
                        {o.productName ||
                          o.description?.slice(0, 40) ||
                          "Commande personnalisée"}
                      </div>
                    </div>
                    <span
                      className="badge"
                      style={{ color: s.color, background: s.bg }}
                    >
                      <span
                        className={`badge-dot${
                          o.status === "pending_supplier" ? " pulse" : ""
                        }`}
                        style={{ background: s.color }}
                      />
                      {s.label}
                    </span>
                    <div style={{ fontSize: 12, color: "var(--text-soft)" }}>
                      {formatDate(o.createdAt)}
                    </div>
                    <div className="row-amount">
                      {formatAmount(o.totalAmount)}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-soft)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      ◎
                      {unreadCount > 0 && (
                        <span className="unread-pill">{unreadCount}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Activity feed */}
        <div className="card card-pad">
          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 18,
              color: "var(--text-dark)",
            }}
          >
            Notifications récentes
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
              Aucune notification
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
                    {formatDate(n.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}

          <hr className="divider" />
          <button
            className="btn btn-primary btn-full"
            onClick={() => navigate("/client/new-order")}
          >
            ✦ Nouvelle demande
          </button>
        </div>
      </div>
    </ClientLayout>
  );
}
