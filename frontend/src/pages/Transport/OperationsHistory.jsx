import { useState, useEffect } from "react";
import TransportLayout from "../../components/Transport/TransportLayout";
import { ordersAPI } from "../../api/orders.api";

const statusConfig = {
  pending_transport: {
    label: "Frais à saisir",
    color: "#E03A2E",
    bg: "#FFE8DC",
  },
  pending_transitaire: { label: "En transit", color: "#0060A8", bg: "#E0EFFA" },
  final_calculation: { label: "Au port", color: "#FF6500", bg: "#FFF0E6" },
  pending_payment: { label: "En douane", color: "#7C3AED", bg: "#F5F0FF" },
  paid: { label: "Livré", color: "#009189", bg: "#E0F5F4" },
};

const modeIcon = { sea: "🚢", air: "✈️", road: "🚛", rail: "🚂" };

const feeLabels = {
  freight: "Fret",
  handling: "Manutention",
  insurance: "Assurance",
  customs_doc: "Docs douane",
  fuel: "Surcharge carburant",
  terminal: "THC",
  other: "Autres",
};

export default function OperationsHistory() {
  const [operations, setOperations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("Tous");
  const [loading, setLoading] = useState(true);

  // ── Fetch all transport orders ────────────────────────────
  useEffect(() => {
    ordersAPI
      .getTransportOrders()
      .then((res) => setOperations(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const delivered = operations.filter((o) => o.status === "paid");
  const inProgress = operations.filter((o) => o.status !== "paid");
  const totalRevenue = delivered.reduce(
    (s, o) => s + parseFloat(o.myTransportQuote || 0),
    0
  );

  const filtered = operations.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      String(o.id).includes(q) ||
      (o.productName || "").toLowerCase().includes(q) ||
      (o.clientName || "").toLowerCase().includes(q);
    const matchMode = modeFilter === "Tous" || o.mode === modeFilter;
    return matchSearch && matchMode;
  });

  const formatAmount = (v) =>
    v ? `${parseFloat(v).toLocaleString("fr")} MAD` : "—";
  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "En cours";
  const formatId = (id) => `SHP-${String(id).padStart(6, "0")}`;
  const formatCmdId = (id) => `CMD-${String(id).padStart(6, "0")}`;

  // Parse fee breakdown from comment
  const parseFees = (order) => {
    const comment = order.comment || "";
    const fees = {};
    const freightMatch = comment.match(/Fret:\s*([\d.]+)/);
    const handlingMatch = comment.match(/Manutention:\s*([\d.]+)/);
    const insuranceMatch = comment.match(/Assurance:\s*([\d.]+)/);
    if (freightMatch) fees.freight = parseFloat(freightMatch[1]);
    if (handlingMatch) fees.handling = parseFloat(handlingMatch[1]);
    if (insuranceMatch) fees.insurance = parseFloat(insuranceMatch[1]);
    return fees;
  };

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

  // ── Detail view ───────────────────────────────────────────
  if (selected) {
    const s = statusConfig[selected.status] ?? statusConfig.paid;
    const fees = parseFees(selected);
    return (
      <TransportLayout>
        <div className="page-content">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 28,
            }}
          >
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setSelected(null)}
            >
              ← Retour
            </button>
            <div>
              <div
                className="mono"
                style={{ fontSize: 11, color: "var(--text-soft)" }}
              >
                {formatId(selected.id)} · {formatCmdId(selected.id)}
              </div>
              <h1
                style={{
                  fontSize: 19,
                  fontWeight: 700,
                  color: "var(--text-dark)",
                }}
              >
                {selected.productName || "Commande personnalisée"}
              </h1>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <span
                className="badge"
                style={{
                  color: s.color,
                  background: s.bg,
                  fontSize: 12,
                  padding: "6px 14px",
                }}
              >
                <span className="badge-dot" style={{ background: s.color }} />
                {s.label}
              </span>
            </div>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
          >
            {/* Shipment info */}
            <div className="card card-pad">
              <div className="form-label" style={{ marginBottom: 16 }}>
                Détails de l'expédition
              </div>
              <div
                style={{
                  background: "var(--tr-xlight)",
                  borderRadius: 10,
                  padding: "14px 20px",
                  marginBottom: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-soft)",
                      marginBottom: 4,
                    }}
                  >
                    DÉPART
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--text-dark)",
                    }}
                  >
                    Chine
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22 }}>🚢</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-soft)",
                      marginBottom: 4,
                    }}
                  >
                    DESTINATION
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--text-dark)",
                    }}
                  >
                    Maroc
                  </div>
                </div>
              </div>

              <div className="form-grid">
                {[
                  ["Référence", formatId(selected.id)],
                  ["Commande MGTS", formatCmdId(selected.id)],
                  ["Client final", selected.clientName || "—"],
                  ["Fournisseur", selected.supplierName || "—"],
                  ["Incoterm", selected.incoterm || "—"],
                  ["Date commande", formatDate(selected.createdAt)],
                  [
                    "Livraison",
                    selected.status === "paid"
                      ? formatDate(selected.updatedAt)
                      : "En cours",
                  ],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="form-label" style={{ marginBottom: 4 }}>
                      {k}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text-dark)",
                      }}
                    >
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fee breakdown */}
            <div className="card card-pad">
              <div className="form-label" style={{ marginBottom: 16 }}>
                Détail des frais logistiques
              </div>
              {Object.keys(fees).length > 0 ? (
                Object.entries(fees)
                  .filter(([, v]) => v > 0)
                  .map(([k, v]) => (
                    <div key={k} className="cost-line">
                      <span className="cost-label">{feeLabels[k] ?? k}</span>
                      <span className="cost-value">
                        {parseFloat(v).toLocaleString("fr")} MAD
                      </span>
                    </div>
                  ))
              ) : (
                <div className="cost-line">
                  <span className="cost-label">Frais logistiques</span>
                  <span className="cost-value">
                    {formatAmount(selected.myTransportQuote)}
                  </span>
                </div>
              )}
              <div className="cost-line cost-total" style={{ marginTop: 8 }}>
                <span className="cost-label">TOTAL</span>
                <span
                  className="cost-value"
                  style={{ fontSize: 18, color: "var(--tr)" }}
                >
                  {formatAmount(selected.myTransportQuote)}
                </span>
              </div>
              <hr className="divider" />
              <button className="btn btn-ghost btn-sm">
                ↓ Exporter en PDF
              </button>
            </div>
          </div>
        </div>
      </TransportLayout>
    );
  }

  // ── List view ─────────────────────────────────────────────
  return (
    <TransportLayout>
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Historique des opérations</h1>
            <p>
              {delivered.length} expéditions livrées ·{" "}
              {formatAmount(totalRevenue)} de frais total
            </p>
          </div>
          <button className="btn btn-ghost">↓ Exporter CSV</button>
        </div>

        {/* Summary */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 16,
            marginBottom: 28,
          }}
        >
          {[
            {
              label: "Total opérations",
              value: operations.length,
              color: "var(--tr)",
              bg: "var(--tr-light)",
            },
            {
              label: "Livrées",
              value: delivered.length,
              color: "var(--teal)",
              bg: "var(--teal-light)",
            },
            {
              label: "En cours",
              value: inProgress.length,
              color: "var(--orange)",
              bg: "var(--orange-light)",
            },
            {
              label: "Chiffre total",
              value: formatAmount(totalRevenue),
              color: "#7C3AED",
              bg: "#F5F0FF",
            },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: 18 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-soft)",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: 6,
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-dark)",
                    }}
                  >
                    {s.value}
                  </div>
                </div>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: s.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    color: s.color,
                  }}
                >
                  ◆
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 20,
            alignItems: "center",
          }}
        >
          <div className="navbar-search" style={{ flex: 1, maxWidth: 340 }}>
            <span style={{ color: "var(--text-soft)" }}>⌕</span>
            <input
              placeholder="Rechercher par ID, produit, client…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["Tous", "sea", "air", "road"].map((m) => (
              <button
                key={m}
                onClick={() => setModeFilter(m)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 20,
                  border: `1.5px solid ${
                    modeFilter === m ? "var(--tr)" : "var(--border)"
                  }`,
                  background:
                    modeFilter === m ? "var(--tr-light)" : "transparent",
                  color: modeFilter === m ? "var(--tr)" : "var(--text-mid)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font)",
                  transition: "all .15s",
                }}
              >
                {m === "Tous"
                  ? "Tous"
                  : modeIcon[m] + " " + m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div
            className="table-header"
            style={{ gridTemplateColumns: "1fr 100px 140px 120px 90px 80px" }}
          >
            <span>Expédition</span>
            <span>Mode</span>
            <span>Statut</span>
            <span>Client</span>
            <span>Frais</span>
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
              Aucune opération trouvée.
            </div>
          ) : (
            filtered.map((o) => {
              const s = statusConfig[o.status] ?? statusConfig.paid;
              return (
                <div
                  key={o.id}
                  className="table-row"
                  style={{
                    gridTemplateColumns: "1fr 100px 140px 120px 90px 80px",
                  }}
                  onClick={() => setSelected(o)}
                >
                  <div>
                    <div className="row-id">
                      {formatId(o.id)} · {formatCmdId(o.id)}
                    </div>
                    <div className="row-title">
                      {o.productName || "Commande personnalisée"}
                    </div>
                    <div className="row-sub">🚢 Chine → Maroc</div>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-mid)" }}>
                    🚢 Sea
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
                  <div style={{ fontSize: 12, color: "var(--text-mid)" }}>
                    {o.clientName || "—"}
                  </div>
                  <div className="row-amount" style={{ fontSize: 12 }}>
                    {formatAmount(o.myTransportQuote)}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-soft)" }}>
                    {formatDate(o.createdAt)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </TransportLayout>
  );
}
