import { useState, useEffect } from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import "../../styles/Admin.css";
import api from "../../api/axios";

const statusCfg = {
  pending: {
    label: "En attente",
    color: "var(--yellow)",
    bg: "var(--yellow-light)",
  },
  waiting_validation: {
    label: "En attente",
    color: "var(--yellow)",
    bg: "var(--yellow-light)",
  },
  validated: { label: "Payé", color: "var(--green)", bg: "var(--green-light)" },
  rejected: { label: "Refusé", color: "var(--red)", bg: "var(--red-light)" },
};

const typeCfg = {
  client: { label: "Client", color: "var(--teal)", bg: "var(--teal-light)" },
  fournisseur: {
    label: "Fournisseur",
    color: "var(--orange)",
    bg: "var(--orange-light)",
  },
  transporteur: {
    label: "Transporteur",
    color: "var(--blue)",
    bg: "var(--blue-light)",
  },
  transitaire: {
    label: "Transitaire",
    color: "var(--purple)",
    bg: "var(--purple-light)",
  },
};

export default function PaymentsCommissions() {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState("Tous");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState({});

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await api.get("/admin/payments");
      setPayments(res.data?.payments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Validate payment ──────────────────────────────────────
  const handleValidate = async (paymentId) => {
    setActing((a) => ({ ...a, [paymentId]: true }));
    try {
      await api.post(`/admin/payments/${paymentId}/validate`);
      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId ? { ...p, status: "validated" } : p
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActing((a) => ({ ...a, [paymentId]: false }));
    }
  };

  // ── Reject payment ────────────────────────────────────────
  const handleReject = async (paymentId) => {
    setActing((a) => ({ ...a, [paymentId]: true }));
    try {
      await api.post(`/admin/payments/${paymentId}/reject`, {
        reason: "Rejeté par l'administrateur",
      });
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? { ...p, status: "rejected" } : p))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActing((a) => ({ ...a, [paymentId]: false }));
    }
  };

  const formatAmount = (v) =>
    v ? `${parseFloat(v).toLocaleString("fr")} MAD` : "—";
  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";
  const formatId = (id) => `PAY-${String(id).padStart(6, "0")}`;
  const formatCmd = (id) => `#${String(id).padStart(6, "0")}`;

  // ── KPIs ──────────────────────────────────────────────────
  const totalReceived = payments
    .filter((p) => p.status === "validated")
    .reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const totalPending = payments
    .filter((p) => ["pending", "waiting_validation"].includes(p.status))
    .reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const totalCommission = payments.length * 0; // commissions from order_totals
  const commissionRate = totalReceived > 0 ? "10%" : "—";
 
  // ── Chart data ────────────────────────────────────────────
  const chartData = payments
    .filter((p) => p.status === "validated")
    .slice(0, 8);
  const maxAmount = Math.max(
    ...chartData.map((p) => parseFloat(p.amount || 0)),
    1
  );

  // ── Filter ────────────────────────────────────────────────
  const filtered = payments.filter((p) => {
    if (filter === "Tous") return true;
    if (filter === "payé") return p.status === "validated";
    if (filter === "en_attente")
      return ["pending", "waiting_validation"].includes(p.status);
    return true;
  });

  return (
    <AdminLayout>
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Paiements & commissions</h1>
            <p>Suivi financier complet de toutes les transactions.</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={fetchPayments}>
            ↻ Actualiser
          </button>
        </div>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "40vh",
            }}
          >
            <p style={{ color: "var(--text-soft)", fontSize: 13 }}>
              Chargement...
            </p>
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid-4" style={{ marginBottom: 20 }}>
              {[
                {
                  label: "CA Encaissé",
                  value: formatAmount(totalReceived),
                  type: "teal",
                  icon: "▲",
                },
                {
                  label: "En attente encaissement",
                  value: formatAmount(totalPending),
                  type: "yellow",
                  icon: "⏳",
                },
                {
                  label: "Paiements validés",
                  value: String(
                    payments.filter((p) => p.status === "validated").length
                  ),
                  type: "green",
                  icon: "%",
                },
                {
                  label: "En attente validation",
                  value: String(
                    payments.filter((p) =>
                      ["pending", "waiting_validation"].includes(p.status)
                    ).length
                  ),
                  type: "purple",
                  icon: "◈",
                },
              ].map((s, i) => (
                <div key={i} className={`card stat-card stat-${s.type}`}>
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{ fontSize: 22 }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
              <div className="card card-pad" style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--text-soft)",
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    marginBottom: 18,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Paiements validés
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "flex-end",
                    height: 80,
                  }}
                >
                  {chartData.map((p, i) => {
                    const val = parseFloat(p.amount || 0);
                    const h = Math.round((val / maxAmount) * 70);
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 5,
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 9,
                            color: "var(--teal)",
                          }}
                        >
                          {(val / 1000).toFixed(0)}k
                        </div>
                        <div
                          style={{
                            width: "100%",
                            height: h,
                            background: "var(--teal)",
                            borderRadius: "3px 3px 0 0",
                          }}
                        />
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 8,
                            color: "var(--text-soft)",
                            textAlign: "center",
                          }}
                        >
                          {formatCmd(p.order_id)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filters */}
            <div
              style={{
                display: "flex",
                gap: 6,
                marginBottom: 16,
                flexWrap: "wrap",
              }}
            >
              {["Tous", "payé", "en_attente"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: `1px solid ${
                      filter === f ? "var(--teal)" : "var(--border-mid)"
                    }`,
                    background:
                      filter === f ? "var(--teal-light)" : "transparent",
                    color: filter === f ? "var(--teal)" : "var(--text-soft)",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "var(--font)",
                    transition: "all .15s",
                    textTransform: "capitalize",
                  }}
                >
                  {f === "Tous"
                    ? "Tous"
                    : f === "payé"
                    ? "Payés"
                    : "En attente"}
                </button>
              ))}
            </div>

            <div className="card">
              <div
                className="table-header"
                style={{
                  gridTemplateColumns: "110px 90px 1fr 130px 90px 120px 130px",
                }}
              >
                <span>Paiement</span>
                <span>Commande</span>
                <span>Client</span>
                <span>Montant</span>
                <span>Statut</span>
                <span>Date</span>
                <span>Actions</span>
              </div>
              {filtered.length === 0 ? (
                <div
                  style={{
                    padding: "32px",
                    textAlign: "center",
                    color: "var(--text-soft)",
                    fontSize: 13,
                  }}
                >
                  Aucun paiement trouvé.
                </div>
              ) : (
                filtered.map((p) => {
                  const s = statusCfg[p.status] ?? statusCfg.pending;
                  const isPending = ["pending", "waiting_validation"].includes(
                    p.status
                  );
                  return (
                    <div
                      key={p.id}
                      className="table-row"
                      style={{
                        gridTemplateColumns:
                          "110px 90px 1fr 130px 90px 120px 130px",
                      }}
                    >
                      <div
                        className="mono"
                        style={{ fontSize: 10, color: "var(--text-soft)" }}
                      >
                        {formatId(p.id)}
                      </div>
                      <div
                        className="mono"
                        style={{ fontSize: 10, color: "var(--text-soft)" }}
                      >
                        {formatCmd(p.order_id)}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-mid)" }}>
                        {p.clientName || "—"}
                      </div>
                      <div className="row-amount" style={{ fontSize: 13 }}>
                        {formatAmount(p.amount)}
                      </div>
                      <span
                        className="badge"
                        style={{ color: s.color, background: s.bg }}
                      >
                        {s.label}
                      </span>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          color: "var(--text-soft)",
                        }}
                      >
                        {formatDate(p.createdAt)}
                      </div>
                      <div
                        style={{ display: "flex", gap: 6 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isPending ? (
                          <>
                            <button
                              className="btn btn-primary btn-sm"
                              disabled={acting[p.id]}
                              onClick={() => handleValidate(p.id)}
                            >
                              ✓ Valider
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              disabled={acting[p.id]}
                              onClick={() => handleReject(p.id)}
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <span
                            style={{
                              fontSize: 11,
                              color: s.color,
                              fontWeight: 600,
                            }}
                          >
                            {s.label}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
