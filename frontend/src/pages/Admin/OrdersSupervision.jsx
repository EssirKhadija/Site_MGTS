import { useState, useEffect } from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import "../../styles/Admin.css";
import { ordersAPI } from "../../api/orders.api";
import api from "../../api/axios";

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
  rejected: { label: "Annulé", color: "var(--red)", bg: "var(--red-light)" },
};

const steps = [
  "Demande",
  "Fournisseur",
  "Transport",
  "Transitaire",
  "Calcul",
  "Devis",
  "Paiement",
  "Livraison",
];
const stepStatus = {
  pending: 0,
  pending_supplier: 1,
  pending_transport: 2,
  pending_transitaire: 3,
  final_calculation: 4,
  pending_payment: 5,
  waiting_validation: 6,
  paid: 7,
};

export default function OrdersSupervision() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [filter, setFilter] = useState("Tous");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [transports, setTransports] = useState([]);
  const [transitaires, setTransitaires] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [assignForm, setAssignForm] = useState({
    supplier_id: "",
    transport_id: "",
    transitaire_id: "",
    mgtsMargin: "",
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [ordersRes, usersRes] = await Promise.all([
        ordersAPI.getAll({ limit: 100 }),
        api.get("/admin/users"),
      ]);
      const allOrders = ordersRes.data?.orders || [];
      const allUsers = usersRes.data?.users || [];
      setOrders(allOrders);
      setSuppliers(allUsers.filter((u) => u.role === "supplier"));
      setTransports(allUsers.filter((u) => u.role === "transport"));
      setTransitaires(allUsers.filter((u) => u.role === "transitaire"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch order detail ────────────────────────────────────
  const openDetail = async (order) => {
    setSelected(order);
    try {
      const res = await api.get(`/admin/orders/${order.id}`);
      setDetail(res.data);
      setAssignForm({
        supplier_id: res.data.supplier_id || "",
        transport_id: res.data.transport_id || "",
        transitaire_id: res.data.transitaire_id || "",
        mgtsMargin: res.data.mgtsMargin || "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  // ── Assign handlers ───────────────────────────────────────
  const handleAssign = async (type) => {
    if (!detail) return;
    setAssigning(true);
    try {
      if (type === "supplier" && assignForm.supplier_id) {
        await ordersAPI.assignSupplier(detail.id, {
          supplier_id: assignForm.supplier_id,
        });
      }
      if (type === "transport" && assignForm.transport_id) {
        await ordersAPI.assignTransport(detail.id, {
          transport_id: assignForm.transport_id,
        });
      }
      if (type === "transitaire" && assignForm.transitaire_id) {
        await ordersAPI.assignTransitaire(detail.id, {
          transitaire_id: assignForm.transitaire_id,
        });
      }
      if (type === "calculate" && assignForm.mgtsMargin) {
        await ordersAPI.calculate(detail.id, {
          mgtsMargin: parseFloat(assignForm.mgtsMargin),
        });
      }
      await fetchAll();
      const res = await api.get(`/admin/orders/${detail.id}`);
      setDetail(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAssigning(false);
    }
  };

  const filtered = orders.filter((o) => {
    const matchFilter = filter === "Tous" || o.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      String(o.id).includes(q) ||
      (o.clientName || "").toLowerCase().includes(q) ||
      (o.productName || "").toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const totalCA = orders.reduce(
    (s, o) => s + parseFloat(o.totalAmount || 0),
    0
  );
  const totalCommission = orders.reduce(
    (s, o) => s + parseFloat(o.mgtsMargin || 0),
    0
  );

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

  // ── Detail view ───────────────────────────────────────────
  if (selected) {
    const o = detail || selected;
    const s = statusConfig[o.status] ?? statusConfig.pending;
    const curStep = stepStatus[o.status] ?? 0;

    return (
      <AdminLayout>
        <div className="page-content">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 24,
            }}
          >
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setSelected(null);
                setDetail(null);
              }}
            >
              ← Retour
            </button>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-soft)",
                }}
              >
                CMD-{String(o.id).padStart(6, "0")}
              </div>
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "var(--text)",
                  marginTop: 2,
                }}
              >
                {o.productName ||
                  o.description?.slice(0, 40) ||
                  "Commande personnalisée"}
              </h1>
            </div>
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <span
                className="badge"
                style={{
                  color: s.color,
                  background: s.bg,
                  fontSize: 11,
                  padding: "5px 12px",
                }}
              >
                <span
                  className="badge-dot pulse"
                  style={{ background: s.color }}
                />
                {s.label}
              </span>
            </div>
          </div>

          {/* Stepper */}
          <div className="card card-pad" style={{ marginBottom: 16 }}>
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
              Cycle de vie
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              {steps.map((step, i) => {
                const done = i < curStep;
                const current = i === curStep;
                return (
                  <div
                    key={step}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      {i > 0 && (
                        <div
                          style={{
                            flex: 1,
                            height: 2,
                            background: done ? "var(--teal)" : "var(--bg-4)",
                          }}
                        />
                      )}
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          background:
                            current || done ? "var(--teal)" : "var(--bg-4)",
                          border: `2px solid ${
                            current || done ? "var(--teal)" : "var(--bg-3)"
                          }`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 9,
                          fontWeight: 700,
                          color: current || done ? "#fff" : "var(--text-soft)",
                          flexShrink: 0,
                          boxShadow: current
                            ? "0 0 12px var(--teal-glow)"
                            : "none",
                        }}
                      >
                        {done ? "✓" : i + 1}
                      </div>
                      {i < steps.length - 1 && (
                        <div
                          style={{
                            flex: 1,
                            height: 2,
                            background: done ? "var(--teal)" : "var(--bg-4)",
                          }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        marginTop: 7,
                        color: current
                          ? "var(--teal)"
                          : done
                          ? "var(--teal)"
                          : "var(--text-soft)",
                        fontWeight: current ? 700 : 400,
                        textAlign: "center",
                        fontFamily: "var(--font-mono)",
                        letterSpacing: ".3px",
                      }}
                    >
                      {step}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 16,
            }}
          >
            {/* Parties */}
            <div className="card card-pad">
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text-soft)",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  marginBottom: 16,
                  fontFamily: "var(--font-mono)",
                }}
              >
                Intervenants
              </div>
              {[
                {
                  role: "Client",
                  value: o.clientName || "—",
                  color: "var(--teal)",
                },
                {
                  role: "Fournisseur",
                  value: o.supplierName || "—",
                  color: "var(--orange)",
                },
                {
                  role: "Transporteur",
                  value: o.transportName || "—",
                  color: "var(--blue)",
                },
                {
                  role: "Transitaire",
                  value: o.transitaireName || "—",
                  color: "var(--purple)",
                },
              ].map((p) => (
                <div
                  key={p.role}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: "1px solid var(--border-soft)",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 2,
                      background: p.color,
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      width: 90,
                      fontSize: 10,
                      color: "var(--text-soft)",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {p.role}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    {p.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Financials */}
            <div className="card card-pad">
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text-soft)",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  marginBottom: 16,
                  fontFamily: "var(--font-mono)",
                }}
              >
                Récapitulatif financier
              </div>
              {[
                [
                  "Coût fournisseur",
                  formatAmount(o.productionCost),
                  "var(--text-mid)",
                ],
                [
                  "Frais transport",
                  formatAmount(o.transportCost),
                  "var(--text-mid)",
                ],
                [
                  "Frais douaniers",
                  formatAmount(o.customsCost),
                  "var(--text-mid)",
                ],
                ["Montant total", formatAmount(o.totalAmount), "var(--text)"],
                ["Commission MGTS", formatAmount(o.mgtsMargin), "var(--teal)"],
              ].map(([k, v, color]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "9px 0",
                    borderBottom: "1px solid var(--border-soft)",
                  }}
                >
                  <span style={{ fontSize: 12, color: "var(--text-soft)" }}>
                    {k}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      fontWeight: 700,
                      color,
                    }}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Assignment panel */}
          <div className="card card-pad">
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--text-soft)",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: 16,
                fontFamily: "var(--font-mono)",
              }}
            >
              Actions admin
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {/* Assign supplier */}
              <div className="form-group">
                <label className="form-label">Assigner fournisseur</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <select
                    className="form-select"
                    value={assignForm.supplier_id}
                    onChange={(e) =>
                      setAssignForm((f) => ({
                        ...f,
                        supplier_id: e.target.value,
                      }))
                    }
                  >
                    <option value="">-- Choisir --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={assigning || !assignForm.supplier_id}
                    onClick={() => handleAssign("supplier")}
                  >
                    ✓
                  </button>
                </div>
              </div>

              {/* Assign transport */}
              <div className="form-group">
                <label className="form-label">Assigner transporteur</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <select
                    className="form-select"
                    value={assignForm.transport_id}
                    onChange={(e) =>
                      setAssignForm((f) => ({
                        ...f,
                        transport_id: e.target.value,
                      }))
                    }
                  >
                    <option value="">-- Choisir --</option>
                    {transports.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={assigning || !assignForm.transport_id}
                    onClick={() => handleAssign("transport")}
                  >
                    ✓
                  </button>
                </div>
              </div>

              {/* Assign transitaire */}
              <div className="form-group">
                <label className="form-label">Assigner transitaire</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <select
                    className="form-select"
                    value={assignForm.transitaire_id}
                    onChange={(e) =>
                      setAssignForm((f) => ({
                        ...f,
                        transitaire_id: e.target.value,
                      }))
                    }
                  >
                    <option value="">-- Choisir --</option>
                    {transitaires.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={assigning || !assignForm.transitaire_id}
                    onClick={() => handleAssign("transitaire")}
                  >
                    ✓
                  </button>
                </div>
              </div>

              {/* Calculate total */}
              <div className="form-group">
                <label className="form-label">Marge MGTS (MAD)</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    className="form-input"
                    type="number"
                    placeholder="Ex: 2000"
                    value={assignForm.mgtsMargin}
                    onChange={(e) =>
                      setAssignForm((f) => ({
                        ...f,
                        mgtsMargin: e.target.value,
                      }))
                    }
                  />
                  <button
                    className="btn btn-teal btn-sm"
                    disabled={assigning || !assignForm.mgtsMargin}
                    onClick={() => handleAssign("calculate")}
                  >
                    Calc.
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // ── List view ─────────────────────────────────────────────
  return (
    <AdminLayout>
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Supervision commandes</h1>
            <p>
              Cycle complet · {orders.length} commandes · CA :{" "}
              {formatAmount(totalCA)} · Commissions :{" "}
              {formatAmount(totalCommission)}
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={fetchAll}>
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
            {/* Mini stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5,1fr)",
                gap: 12,
                marginBottom: 20,
              }}
            >
              {Object.entries(statusConfig)
                .slice(0, 5)
                .map(([key, cfg]) => (
                  <div
                    key={key}
                    onClick={() => setFilter(filter === key ? "Tous" : key)}
                    className="card"
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      borderColor: filter === key ? cfg.color : "var(--border)",
                      background: filter === key ? cfg.bg : "var(--bg-2)",
                      transition: "all .15s",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 9,
                        color: cfg.color,
                        textTransform: "uppercase",
                        letterSpacing: "1.5px",
                        fontFamily: "var(--font-mono)",
                        marginBottom: 5,
                      }}
                    >
                      {cfg.label}
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontFamily: "var(--font-mono)",
                        fontWeight: 400,
                        color: "var(--text)",
                      }}
                    >
                      {orders.filter((o) => o.status === key).length}
                    </div>
                  </div>
                ))}
            </div>

            {/* Search */}
            <div style={{ marginBottom: 16 }}>
              <div className="navbar-search" style={{ width: 300 }}>
                <span style={{ color: "var(--text-soft)" }}>⌕</span>
                <input
                  placeholder="ID, client, produit…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="card">
              <div
                className="table-header"
                style={{
                  gridTemplateColumns:
                    "100px 1fr 160px 120px 100px 100px 110px",
                }}
              >
                <span>ID</span>
                <span>Produit / Client</span>
                <span>Fournisseur</span>
                <span>Montant</span>
                <span>Commission</span>
                <span>Statut</span>
                <span>Date</span>
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
                  Aucune commande trouvée.
                </div>
              ) : (
                filtered.map((o) => {
                  const s = statusConfig[o.status] ?? statusConfig.pending;
                  return (
                    <div
                      key={o.id}
                      className="table-row"
                      style={{
                        gridTemplateColumns:
                          "100px 1fr 160px 120px 100px 110px 100px",
                      }}
                      onClick={() => openDetail(o)}
                    >
                      <div
                        className="mono"
                        style={{ fontSize: 10, color: "var(--text-soft)" }}
                      >
                        CMD-{String(o.id).padStart(6, "0")}
                      </div>
                      <div>
                        <div className="row-title">
                          {o.productName || "Personnalisé"}
                        </div>
                        <div className="row-sub">{o.clientName || "—"}</div>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-mid)" }}>
                        {o.supplierName || "—"}
                      </div>
                      <div className="row-amount">
                        {formatAmount(o.totalAmount)}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                          color: "var(--teal)",
                          fontWeight: 700,
                        }}
                      >
                        {formatAmount(o.mgtsMargin)}
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
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          color: "var(--text-soft)",
                        }}
                      >
                        {formatDate(o.createdAt)}
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
