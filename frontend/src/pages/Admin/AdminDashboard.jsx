import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/Admin/AdminLayout";
import "../../styles/Admin.css";
import api from "../../api/axios";
import { ordersAPI } from "../../api/orders.api";

const statusConfig = {
  pending: {
    label: "En attente",
    color: "var(--yellow)",
    bg: "var(--yellow-light)",
  },
  pending_supplier: {
    label: "En production",
    color: "var(--orange)",
    bg: "var(--orange-light)",
  },
  pending_transport: {
    label: "En transit",
    color: "var(--blue)",
    bg: "var(--blue-light)",
  },
  pending_transitaire: {
    label: "En douane",
    color: "var(--purple)",
    bg: "var(--purple-light)",
  },
  final_calculation: {
    label: "Calcul final",
    color: "var(--yellow)",
    bg: "var(--yellow-light)",
  },
  pending_payment: {
    label: "Devis envoyé",
    color: "var(--teal)",
    bg: "var(--teal-light)",
  },
  waiting_validation: {
    label: "Paiement reçu",
    color: "var(--green)",
    bg: "var(--green-light)",
  },
  paid: { label: "Livré", color: "var(--green)", bg: "var(--green-light)" },
  rejected: { label: "Refusé", color: "var(--red)", bg: "var(--red-light)" },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const now = new Date().toLocaleString("fr", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const [dashData, setDashData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState({});

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [dashRes, ordersRes, usersRes] = await Promise.all([
        api.get("/admin/dashboard"),
        ordersAPI.getAll({ limit: 5 }),
        api.get("/admin/users", { params: { status: "pending" } }),
      ]);
      setDashData(dashRes.data);
      setRecentOrders(ordersRes.data?.orders || []);
      setPendingUsers(usersRes.data?.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Validate / suspend user ───────────────────────────────
  const handleValidate = async (userId, action) => {
    setValidating((v) => ({ ...v, [userId]: true }));
    try {
      await api.put(`/admin/users/${userId}`, {
        status: action === "validate" ? "active" : "suspended",
      });
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
      setDashData((prev) =>
        prev
          ? {
              ...prev,
              pending: { ...prev.pending, payments: prev.pending.payments },
            }
          : prev
      );
    } catch (err) {
      console.error(err);
    } finally {
      setValidating((v) => ({ ...v, [userId]: false }));
    }
  };

  const formatAmount = (v) =>
    v ? `${parseFloat(v).toLocaleString("fr")} MAD` : "—";
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  // ── Build stats from API data ─────────────────────────────
  const buildStats = () => {
    if (!dashData) return [];
    const { revenue, orders, users, pending } = dashData;

    const currentRevenue = parseFloat(revenue?.total || 0);
    const previousRevenue = parseFloat(revenue?.previousTotal || 0);
    const up = true
    if (currentRevenue > previousRevenue) {
      up = true
    } else if (currentRevenue < previousRevenue) {  
      up = false
    }

    
    return [
      {
        label: "Chiffre d'affaires",
        value: `${(parseFloat(revenue?.total || 0) / 1000).toFixed(0)}k`,
        unit: "MAD",
        change: currentRevenue === previousRevenue ? "0" : `${(((currentRevenue - previousRevenue) / (previousRevenue || 1)) * 100).toFixed(0)}%`,
        up: currentRevenue > previousRevenue ? true : currentRevenue < previousRevenue ? false : null,
        type: "teal",
        icon: "◆",
      },
      {
        label: "Commandes actives",
        value: String(orders?.total || 0),
        unit: "",
        change: `${orders?.total > (orders?.previousTotal || 0) ? "+" : ""}${orders?.previousTotal ? (((orders.total - orders.previousTotal) / orders.previousTotal) * 100).toFixed(0) : "0"}%`,
        up: orders?.total > (orders?.previousTotal || 0) ? true : orders?.total < (orders?.previousTotal || 0) ? false : null,
        type: "blue",
        icon: "◈",
      },
      {
        label: "Utilisateurs total",
        value: String(users?.total || 0),
        unit: "",
        change: `${users?.total > (users?.previousTotal || 0) ? "+" : ""}${users?.previousTotal ? (((users.total - users.previousTotal) / users.previousTotal) * 100).toFixed(0) : "0"}%`,
        up: users?.total > (users?.previousTotal || 0) ? true : users?.total < (users?.previousTotal || 0) ? false : null,
        type: "purple",
        icon: "◉",
      },
      {
        label: "Commandes livrées",
        value: String(
          orders?.byStatus?.find((s) => s.status === "paid")?.count || 0
        ),
        unit: "",
        change: `${orders?.byStatus?.find((s) => s.status === "paid")?.count > (orders?.previousByStatus?.find((s) => s.status === "paid")?.count || 0) ? "+" : ""}${orders?.previousByStatus?.find((s) => s.status === "paid")?.count ? (((orders.byStatus.find((s) => s.status === "paid")?.count - orders.previousByStatus.find((s) => s.status === "paid")?.count) / orders.previousByStatus.find((s) => s.status === "paid")?.count) * 100).toFixed(0) : "0"}%`,
        up: orders?.byStatus?.find((s) => s.status === "paid")?.count > (orders?.previousByStatus?.find((s) => s.status === "paid")?.count || 0) ? true : orders?.byStatus?.find((s) => s.status === "paid")?.count < (orders?.previousByStatus?.find((s) => s.status === "paid")?.count || 0) ? false : null,
        type: "green",
        icon: "✓",
      },
      {
        label: "Paiements en att.",
        value: String(pending?.payments || 0),
        unit: "",
        change: `${pending?.payments > (pending?.previousPayments || 0) ? "+" : ""}${pending?.previousPayments ? (((pending.payments - pending.previousPayments) / pending.previousPayments) * 100).toFixed(0) : "0"}%`,
        up: pending?.payments > (pending?.previousPayments || 0) ? true : pending?.payments < (pending?.previousPayments || 0) ? false : null,
        type: "orange",
        icon: "⏳",
      },
      {
        label: "Produits en att.",
        value: String(pending?.products || 0),
        unit: "",
        change: `${pending?.products > (pending?.previousProducts || 0) ? "+" : ""}${pending?.previousProducts ? (((pending.products - pending.previousProducts) / pending.previousProducts) * 100).toFixed(0) : "0"}%`,
        up: pending?.products > (pending?.previousProducts || 0) ? true : pending?.products < (pending?.previousProducts || 0) ? false : null,
        type: "red",
        icon: "⚠",
      },
      {
        label: "Commission MGTS",
        value: `${(parseFloat(revenue?.totalMargin || 0) / 1000).toFixed(0)}k`,
        unit: "MAD",
        change: `${revenue?.totalMargin > revenue?.previousTotalMargin ? "+" : ""}${revenue?.previousTotalMargin ? (((revenue.totalMargin - revenue.previousTotalMargin) / revenue.previousTotalMargin) * 100).toFixed(0) : "0"}%`,
        up: revenue?.totalMargin > revenue?.previousTotalMargin ? true : revenue?.totalMargin < revenue?.previousTotalMargin ? false : null,
        type: "teal",
        icon: "%",
      },
      {
        label: "CA ce mois",
        value: `${(parseFloat(revenue?.thisMonth || 0) / 1000).toFixed(0)}k`,
        unit: "MAD",
        change: `${revenue?.thisMonth > revenue?.lastMonth ? "+" : ""}${revenue?.lastMonth ? (((revenue.thisMonth - revenue.lastMonth) / revenue.lastMonth) * 100).toFixed(0) : "0"}%`,
        up: revenue?.thisMonth > revenue?.lastMonth ? true : revenue?.thisMonth < revenue?.lastMonth ? false : null,
        type: "blue",
        icon: "✦",
      },
    ];
  };

  // ── Build chart from API data ─────────────────────────────
  const buildChart = () => {
    if (!dashData?.revenue?.chart) return [];
    const chart = dashData.revenue.chart;
    const max = Math.max(...chart.map((c) => parseFloat(c.revenue)), 1);
    return chart.map((c) => ({
      month: new Date(c.month + "-01").toLocaleString("fr", { month: "short" }),
      value: parseFloat(c.revenue),
      pct: Math.round((parseFloat(c.revenue) / max) * 100),
    }));
  };

  const stats = buildStats();
  const chart = buildChart();

  if (loading) {
    return (
      <AdminLayout>
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
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "var(--text)",
                letterSpacing: "-.5px",
                marginBottom: 4,
              }}
            >
              Vue d'ensemble
            </h1>
            <p
              style={{
                fontSize: 11,
                color: "var(--text-soft)",
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {now}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate("/admin/exports")}
            >
              ↓ Export
            </button>
            <button className="btn btn-primary btn-sm" onClick={fetchAll}>
              ↻ Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {pendingUsers.length > 0 && (
        <div className="alert-banner">
          <div className="alert-banner-icon">⚠</div>
          <div style={{ flex: 1 }}>
            <div className="alert-banner-title">
              {pendingUsers.length} comptes en attente de validation
            </div>
            <div className="alert-banner-text">
              Des nouveaux utilisateurs attendent votre approbation pour accéder
              à la plateforme.
            </div>
          </div>
          <button
            className="btn btn-orange btn-sm"
            onClick={() => navigate("/admin/users")}
          >
            Valider →
          </button>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {stats.map((s, i) => (
          <div
            key={i}
            className={`card stat-card stat-${s.type}`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">
              {s.value}
              <span> {s.unit}</span>
            </div>
            {s.change !== "0" && (
              <div
                className="stat-change"
                style={{
                  color: s.up
                    ? "var(--green)"
                    : s.up === false
                    ? "var(--red)"
                    : "var(--text-soft)",
                }}
              >
                {s.up ? "▲" : s.up === false ? "▼" : "—"} {s.change} vs mois
                précédent
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* Recent orders */}
        <div className="card">
          <div className="card-header">
            <h3>Commandes récentes</h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate("/admin/orders")}
            >
              Voir tout →
            </button>
          </div>
          <div
            className="table-header"
            style={{ gridTemplateColumns: "1fr 150px 130px 90px 100px" }}
          >
            <span>Commande</span>
            <span>Client</span>
            <span>Fournisseur</span>
            <span>Montant</span>
            <span>Statut</span>
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
              Aucune commande.
            </div>
          ) : (
            recentOrders.map((o) => {
              const s = statusConfig[o.status] ?? statusConfig.pending;
              return (
                <div
                  key={o.id}
                  className="table-row"
                  style={{ gridTemplateColumns: "1fr 150px 130px 90px 100px" }}
                  onClick={() => navigate("/admin/orders")}
                >
                  <div>
                    <div className="row-id">
                      CMD-{String(o.id).padStart(6, "0")}
                    </div>
                    <div className="row-sub" style={{ marginTop: 0 }}>
                      {formatDate(o.createdAt)}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-mid)" }}>
                    {o.clientName || "—"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-soft)" }}>
                    {o.supplierName || "—"}
                  </div>
                  <div className="row-amount" style={{ fontSize: 12 }}>
                    {formatAmount(o.totalAmount)}
                  </div>
                  <span
                    className="badge"
                    style={{ color: s.color, background: s.bg }}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Revenue chart */}
        <div className="card card-pad">
          <h3
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--text-soft)",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              marginBottom: 18,
            }}
          >
            CA Mensuel (MAD)
          </h3>
          {chart.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "var(--text-soft)",
                fontSize: 12,
                padding: "20px 0",
              }}
            >
              Aucune donnée disponible.
            </div>
          ) : (
            chart.map((r, i) => (
              <div key={i} className="chart-bar-row">
                <div className="chart-bar-label">{r.month}</div>
                <div className="chart-bar-track">
                  <div
                    className="chart-bar-fill"
                    style={{
                      width: r.pct + "%",
                      background:
                        i === chart.length - 1 ? "var(--teal)" : "var(--bg-4)",
                      boxShadow:
                        i === chart.length - 1
                          ? "0 0 10px var(--teal-glow)"
                          : "none",
                    }}
                  />
                </div>
                <div className="chart-bar-value">
                  {(r.value / 1000).toFixed(0)}k
                </div>
              </div>
            ))
          )}

          <hr className="divider" />

          {/* Distribution */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            {[
              {
                label: "En cours",
                pct:
                  dashData?.orders?.byStatus
                    ?.filter((s) => !["paid", "rejected"].includes(s.status))
                    .reduce((a, s) => a + s.count, 0) || 0,
                color: "var(--teal)",
              },
              {
                label: "Livrées",
                pct:
                  dashData?.orders?.byStatus?.find((s) => s.status === "paid")
                    ?.count || 0,
                color: "var(--blue)",
              },
              {
                label: "Refusées",
                pct:
                  dashData?.orders?.byStatus?.find(
                    (s) => s.status === "rejected"
                  )?.count || 0,
                color: "var(--purple)",
              },
              {
                label: "Total",
                pct: dashData?.orders?.total || 0,
                color: "var(--orange)",
              },
            ].map((d, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: d.color,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-mid)" }}>
                    {d.label}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      color: "var(--text)",
                    }}
                  >
                    {d.pct}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending validations */}
      <div className="card">
        <div className="card-header">
          <h3>Comptes en attente de validation</h3>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate("/admin/users")}
          >
            Gérer →
          </button>
        </div>
        <div
          className="table-header"
          style={{ gridTemplateColumns: "1fr 120px 180px 100px 140px" }}
        >
          <span>Utilisateur</span>
          <span>Rôle</span>
          <span>Email</span>
          <span>Demande</span>
          <span>Actions</span>
        </div>
        {pendingUsers.length === 0 ? (
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              color: "var(--text-soft)",
              fontSize: 13,
            }}
          >
            ✓ Aucun compte en attente.
          </div>
        ) : (
          pendingUsers.map((u, i) => (
            <div
              key={i}
              className="table-row"
              style={{ gridTemplateColumns: "1fr 120px 180px 100px 140px" }}
            >
              <div>
                <div className="row-title">{u.fullName}</div>
              </div>
              <span
                className="badge"
                style={{
                  color:
                    u.role === "supplier" ? "var(--orange)" : "var(--blue)",
                  background:
                    u.role === "supplier"
                      ? "var(--orange-light)"
                      : "var(--blue-light)",
                  textTransform: "capitalize",
                }}
              >
                {u.role}
              </span>
              <div style={{ fontSize: 12, color: "var(--text-mid)" }}>
                {u.email}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-soft)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {formatDate(u.createdAt)}
              </div>
              <div
                style={{ display: "flex", gap: 6 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="btn btn-primary btn-sm"
                  disabled={validating[u.id]}
                  onClick={() => handleValidate(u.id, "validate")}
                >
                  ✓ Valider
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  disabled={validating[u.id]}
                  onClick={() => handleValidate(u.id, "reject")}
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
