import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ordersAPI } from "../../api/orders.api";
import { messagesAPI } from "../../api/messages.api";

const statusConfig = {
  pending_transitaire: { label: "Nouveau", color: "#FF6500", bg: "#FFF0E6" },
  final_calculation: { label: "En cours", color: "#5B21B6", bg: "#EDE9FE" },
  pending_payment: {
    label: "Contrôle douane",
    color: "#F5A623",
    bg: "#FEF6E8",
  },
  paid: { label: "Clôturé", color: "#4A7A82", bg: "#EAF7FB" },
};

export default function TransitaireDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ordersAPI.getTransitaireOrders(),
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
  const newDossiers = orders.filter(
    (o) => o.status === "pending_transitaire"
  ).length;
  const inProgress = orders.filter(
    (o) => o.status === "final_calculation"
  ).length;
  const completed = orders.filter((o) => o.status === "paid").length;
  const totalFees = orders
    .filter((o) => o.customsCost)
    .reduce((acc, o) => acc + parseFloat(o.customsCost || 0), 0);

  const stats = [
    {
      label: "Dossiers à traiter",
      value: String(newDossiers),
      icon: "◈",
      color: "#FF6500",
      bg: "#FFF0E6",
    },
    {
      label: "En cours de dédouan.",
      value: String(inProgress),
      icon: "✦",
      color: "#5B21B6",
      bg: "#EDE9FE",
    },
    {
      label: "Validés ce mois",
      value: String(completed),
      icon: "✓",
      color: "#009189",
      bg: "#E0F5F4",
    },
    {
      label: "Frais traités",
      value: `${totalFees.toLocaleString()} MAD`,
      icon: "◆",
      color: "#F5A623",
      bg: "#FEF6E8",
    },
  ];

  const pendingDossiers = orders
    .filter((o) =>
      ["pending_transitaire", "final_calculation"].includes(o.status)
    )
    .slice(0, 3);

  const recentHistory = orders.filter((o) => o.status === "paid").slice(0, 3);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

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
    );
  }

  return (
    <div className="page-content">
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{ fontSize: 23, fontWeight: 700, color: "var(--text-dark)" }}
        >
          Bonjour, {user?.fullName} 👋
        </h1>
        <p style={{ color: "var(--text-mid)", fontSize: 13, marginTop: 5 }}>
          {newDossiers} nouveau(x) dossier(s) en attente de vos frais douaniers.
        </p>
      </div>

      {/* Alert */}
      {newDossiers > 0 && (
        <div className="pending-banner">
          <div className="pending-banner-icon">⚠</div>
          <div style={{ flex: 1 }}>
            <div className="pending-banner-title">
              {newDossiers} dossier(s) nécessitent vos frais douaniers
            </div>
            <div className="pending-banner-text">
              Saisissez les frais douaniers et validez les informations
              d'importation pour débloquer les dossiers.
            </div>
          </div>
          <button
            className="btn btn-orange"
            onClick={() => navigate("/transitaire/orders")}
          >
            Traiter →
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

      {/* Two columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginBottom: 20,
        }}
      >
        {/* Pending dossiers */}
        <div className="card">
          <div className="card-header">
            <h3>Dossiers en attente</h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate("/transitaire/orders")}
            >
              Voir tout →
            </button>
          </div>
          {pendingDossiers.length === 0 ? (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                color: "var(--text-soft)",
                fontSize: 13,
              }}
            >
              Aucun dossier en attente.
            </div>
          ) : (
            pendingDossiers.map((d) => {
              const s =
                statusConfig[d.status] || statusConfig.pending_transitaire;
              return (
                <div
                  key={d.id}
                  className="table-row"
                  style={{ gridTemplateColumns: "1fr 130px 80px" }}
                  onClick={() => navigate("/transitaire/orders")}
                >
                  <div>
                    <div className="row-id">
                      DOS-{String(d.id).padStart(6, "0")}
                    </div>
                    <div className="row-title">
                      {d.productName ||
                        d.description?.slice(0, 35) ||
                        "Commande personnalisée"}
                    </div>
                    <div className="row-sub">{d.incoterm || "—"}</div>
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
                  <div style={{ fontSize: 11, color: "var(--text-soft)" }}>
                    {formatDate(d.createdAt)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Recent history */}
        <div className="card">
          <div className="card-header">
            <h3>Dossiers récents</h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate("/transitaire/history")}
            >
              Voir tout →
            </button>
          </div>
          {recentHistory.length === 0 ? (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                color: "var(--text-soft)",
                fontSize: 13,
              }}
            >
              Aucun dossier clôturé.
            </div>
          ) : (
            recentHistory.map((h) => (
              <div
                key={h.id}
                className="table-row"
                style={{ gridTemplateColumns: "1fr 90px 80px" }}
                onClick={() => navigate("/transitaire/history")}
              >
                <div>
                  <div className="row-id">
                    DOS-{String(h.id).padStart(6, "0")}
                  </div>
                  <div className="row-title">
                    {h.productName || "Commande personnalisée"}
                  </div>
                  <div className="row-sub">{formatDate(h.createdAt)}</div>
                </div>
                <div className="row-amount" style={{ fontSize: 12 }}>
                  {formatAmount(h.customsCost)}
                </div>
                <span
                  className="badge"
                  style={{
                    color: "var(--teal)",
                    background: "var(--teal-light)",
                  }}
                >
                  ✓ Clôturé
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Activity + Quick actions */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 20 }}
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
                  ✦
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
                label: "◈ Dossiers à traiter",
                to: "/transitaire/orders",
                style: "primary",
              },
              {
                label: "✦ Saisir frais douaniers",
                to: "/transitaire/customs",
                style: "teal",
              },
              {
                label: "◆ Valider info. import",
                to: "/transitaire/import",
                style: "orange",
              },
              {
                label: "▣ Historique dossiers",
                to: "/transitaire/history",
                style: "ghost",
              },
              {
                label: "◎ Messagerie MGTS",
                to: "/transitaire/messages",
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
  );
}
