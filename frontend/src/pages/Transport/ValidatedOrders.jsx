import { useState, useEffect } from "react";
import ShipmentCard from "../../components/Transport/ShipmentCard";
import TransportLayout from "../../components/Transport/TransportLayout";
import { ordersAPI } from "../../api/orders.api";

const feeTypes = [
  { key: "freight", label: "Fret maritime / aérien", required: true },
  { key: "handling", label: "Manutention port", required: true },
  { key: "insurance", label: "Assurance transport", required: false },
  { key: "customs_doc", label: "Documents douaniers", required: false },
  { key: "fuel", label: "Surcharge carburant (BAF)", required: false },
  { key: "terminal", label: "Frais terminal (THC)", required: false },
  { key: "other", label: "Autres frais", required: false },
];

const emptyFees = Object.fromEntries(feeTypes.map((f) => [f.key, ""]));

export default function ValidatedOrders() {
  const [orders, setOrders] = useState([]);
  const [feeTarget, setFeeTarget] = useState(null);
  const [fees, setFees] = useState(emptyFees);
  const [notes, setNotes] = useState("");
  const [detail, setDetail] = useState(null);
  const [filter, setFilter] = useState("Tous");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const setFee = (k, v) => setFees((f) => ({ ...f, [k]: v }));
  const total = Object.values(fees).reduce(
    (s, v) => s + (parseFloat(v.replace(",", ".")) || 0),
    0
  );

  // ── Fetch transport orders ────────────────────────────────
  useEffect(() => {
    ordersAPI
      .getTransportOrders()
      .then((res) => setOrders(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Submit fees ───────────────────────────────────────────
  const submitFees = async () => {
    if (total === 0) return;
    setSubmitting(true);
    try {
      await ordersAPI.addTransportQuote(feeTarget.id, {
        transportCost: total,
        comment: `${notes} | Fret: ${fees.freight} | Manutention: ${fees.handling} | Assurance: ${fees.insurance}`,
      });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === feeTarget.id
            ? {
                ...o,
                feesSubmitted: true,
                myTransportQuote: total,
                status: "pending_transitaire",
                feeBreakdown: { ...fees },
                notes,
              }
            : o
        )
      );

      setFeeTarget(null);
      setFees(emptyFees);
      setNotes("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filters = [
    "Tous",
    "Frais à saisir",
    "En transit",
    "Au port",
    "En douane",
  ];

  const filtered = orders.filter((o) => {
    if (filter === "Tous") return true;
    if (filter === "Frais à saisir") return o.status === "pending_transport";
    if (filter === "En transit") return o.status === "pending_transitaire";
    if (filter === "Au port") return o.status === "final_calculation";
    if (filter === "En douane") return o.status === "pending_payment";
    return true;
  });

  const pendingCount = orders.filter(
    (o) => o.status === "pending_transport"
  ).length;

  const formatAmount = (v) =>
    v ? `${parseFloat(v).toLocaleString("fr")} MAD` : "—";
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

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
        <div className="page-header">
          <div>
            <h1>Commandes validées</h1>
            <p>{pendingCount} commande(s) nécessitent vos frais logistiques.</p>
          </div>
        </div>

        {/* Alert */}
        {pendingCount > 0 && (
          <div
            style={{
              background: "var(--orange-light)",
              border: "1.5px solid var(--orange)",
              borderRadius: "var(--radius-sm)",
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: 18 }}>⚠</span>
            <span style={{ fontSize: 13, color: "var(--text-dark)" }}>
              <strong>{pendingCount} commande(s)</strong> en attente de vos
              frais — les devis clients ne peuvent pas être finalisés sans ces
              informations.
            </span>
          </div>
        )}

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "7px 18px",
                borderRadius: 20,
                border: `1.5px solid ${
                  filter === f ? "var(--tr)" : "var(--border)"
                }`,
                background: filter === f ? "var(--tr-light)" : "transparent",
                color: filter === f ? "var(--tr)" : "var(--text-mid)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--font)",
                transition: "all .15s",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid-2">
          {filtered.map((o) => (
            <ShipmentCard
              key={o.id}
              shipment={{
                ...o,
                id: `CMD-${String(o.id).padStart(6, "0")}`,
                product:
                  o.productName ||
                  o.description?.slice(0, 40) ||
                  "Commande personnalisée",
                mode: "sea",
                origin: "Chine",
                destination: "Maroc",
                weight: `${o.quantity} u`,
                volume: "—",
                supplier: o.supplierName || "—",
                client: o.clientName || "—",
                etd: formatDate(o.createdAt),
                eta: "—",
                feesSubmitted: o.status !== "pending_transport",
                totalFees: formatAmount(o.myTransportQuote),
                feeBreakdown: o.feeBreakdown,
                status:
                  o.status === "pending_transport"
                    ? "pending_fees"
                    : "in_transit",
              }}
              onAddFees={(s) => {
                setFeeTarget({ ...s, id: o.id });
                setFees(emptyFees);
                setNotes("");
              }}
              onView={(s) => setDetail({ ...s, id: o.id })}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: 60,
              color: "var(--text-soft)",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 10 }}>🚢</div>
            <p>Aucune commande dans cette catégorie.</p>
          </div>
        )}

        {/* Detail modal */}
        {detail && (
          <div className="modal-overlay" onClick={() => setDetail(null)}>
            <div
              className="card"
              style={{
                width: 580,
                padding: 30,
                maxHeight: "90vh",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 20,
                }}
              >
                <div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: "var(--text-soft)",
                      marginBottom: 4,
                    }}
                  >
                    {detail.id}
                  </div>
                  <h2
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: "var(--text-dark)",
                    }}
                  >
                    {detail.product}
                  </h2>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setDetail(null)}
                >
                  ✕
                </button>
              </div>

              {/* Route */}
              <div
                style={{
                  background: "var(--tr-xlight)",
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 0,
                }}
              >
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-soft)",
                      marginBottom: 4,
                    }}
                  >
                    ORIGINE
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--text-dark)",
                    }}
                  >
                    {detail.origin}
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 20 }}>🚢</div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--tr)",
                      fontWeight: 600,
                    }}
                  >
                    {detail.incoterm}
                  </div>
                </div>
                <div style={{ textAlign: "center", flexShrink: 0 }}>
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
                    {detail.destination}
                  </div>
                </div>
              </div>

              <div className="form-grid" style={{ marginBottom: 18 }}>
                {[
                  ["Fournisseur", detail.supplier],
                  ["Client", detail.client],
                  ["Poids", detail.weight],
                  ["Volume", detail.volume],
                  ["ETD", detail.etd],
                  ["ETA estimée", detail.eta],
                  ["Incoterm", detail.incoterm],
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

              {detail.feesSubmitted && detail.feeBreakdown && (
                <div
                  style={{
                    background: "var(--teal-light)",
                    borderRadius: 10,
                    padding: 16,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--teal)",
                      fontWeight: 700,
                      marginBottom: 10,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Frais soumis
                  </div>
                  {feeTypes
                    .filter((ft) => detail.feeBreakdown[ft.key])
                    .map((ft) => (
                      <div key={ft.key} className="cost-line">
                        <span className="cost-label">{ft.label}</span>
                        <span className="cost-value">
                          {detail.feeBreakdown[ft.key]} MAD
                        </span>
                      </div>
                    ))}
                  <div className="cost-line cost-total">
                    <span className="cost-label">TOTAL</span>
                    <span className="cost-value" style={{ color: "var(--tr)" }}>
                      {detail.totalFees}
                    </span>
                  </div>
                </div>
              )}

              {!detail.feesSubmitted && (
                <button
                  className="btn btn-primary btn-full"
                  onClick={() => {
                    setDetail(null);
                    setFeeTarget(detail);
                  }}
                >
                  + Saisir les frais logistiques
                </button>
              )}
            </div>
          </div>
        )}

        {/* Fee entry modal */}
        {feeTarget && (
          <div className="modal-overlay" onClick={() => setFeeTarget(null)}>
            <div
              className="card"
              style={{
                width: 520,
                padding: 30,
                maxHeight: "90vh",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ marginBottom: 22 }}>
                <div
                  className="modal-icon"
                  style={{ background: "var(--tr-light)", color: "var(--tr)" }}
                >
                  🚢
                </div>
                <div className="modal-title">Frais logistiques</div>
                <div className="modal-desc">
                  {feeTarget.product}
                  <br />
                  <span
                    style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
                  >
                    {feeTarget.origin} → {feeTarget.destination}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  marginBottom: 20,
                }}
              >
                {feeTypes.map((ft) => (
                  <div key={ft.key} className="form-group">
                    <label className="form-label">
                      {ft.label}{" "}
                      {ft.required && (
                        <span style={{ color: "var(--danger)" }}>*</span>
                      )}
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        className="form-input"
                        placeholder="0.00"
                        style={{ paddingRight: 52 }}
                        value={fees[ft.key]}
                        onChange={(e) => setFee(ft.key, e.target.value)}
                      />
                      <span
                        style={{
                          position: "absolute",
                          right: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: 12,
                          color: "var(--text-soft)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        MAD
                      </span>
                    </div>
                  </div>
                ))}

                <div className="form-group">
                  <label className="form-label">Notes & conditions</label>
                  <textarea
                    className="form-textarea"
                    style={{ minHeight: 60 }}
                    placeholder="Conditions particulières, surcharges saisonnières, remarques…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Live total */}
              <div
                style={{
                  background: "var(--tr-light)",
                  borderRadius: "var(--radius-sm)",
                  padding: "14px 18px",
                  marginBottom: 20,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text-dark)",
                  }}
                >
                  Total frais logistiques
                </span>
                <span
                  style={{
                    fontSize: 20,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    color: "var(--tr)",
                  }}
                >
                  {total.toLocaleString("fr")} MAD
                </span>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={submitFees}
                  disabled={total === 0 || submitting}
                >
                  {submitting ? "Envoi en cours…" : "Soumettre les frais"}
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setFeeTarget(null)}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TransportLayout>
  );
}
