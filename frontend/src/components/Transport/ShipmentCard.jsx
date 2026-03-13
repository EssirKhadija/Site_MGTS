
const statusConfig = {
  awaiting_pickup: { label: "À enlever",      color: "#F5A623", bg: "#FEF6E8", stripe: "#F5A623" },
  in_transit:      { label: "En transit",     color: "#0060A8", bg: "#E0EFFA", stripe: "#0060A8" },
  at_port:         { label: "Au port",        color: "#FF6500", bg: "#FFF0E6", stripe: "#FF6500" },
  customs:         { label: "En douane",      color: "#7C3AED", bg: "#F5F0FF", stripe: "#7C3AED" },
  delivered:       { label: "Livré",          color: "#009189", bg: "#E0F5F4", stripe: "#009189" },
  pending_fees:    { label: "Frais à saisir", color: "#E03A2E", bg: "#FFE8DC", stripe: "#E03A2E" },
};

const modeIcon = { sea: "🚢", air: "✈️", road: "🚛", rail: "🚂" };

/**
 * ShipmentCard
 * Props: shipment {object}, onAddFees {fn}, onView {fn}
 */
export default function ShipmentCard({ shipment, onAddFees, onView }) {
  const s = statusConfig[shipment.status] ?? statusConfig.awaiting_pickup;

  return (
    <div className="card logi-card" onClick={() => onView?.(shipment)}>
      {/* Top stripe */}
      <div style={{ height: 4, background: s.stripe, borderRadius: "var(--radius) var(--radius) 0 0", margin: "-1px -1px 16px -1px" }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div className="row-id">{shipment.id}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-dark)" }}>{shipment.product}</div>
          <div style={{ fontSize: 11, color: "var(--text-soft)", marginTop: 2 }}>
            {modeIcon[shipment.mode] ?? "🚢"} {shipment.origin} → {shipment.destination}
          </div>
        </div>
        <span className="badge" style={{ color: s.color, background: s.bg, flexShrink: 0 }}>
          <span className={`badge-dot${shipment.status === "in_transit" ? " pulse" : ""}`} style={{ background: s.color }} />
          {s.label}
        </span>
      </div>

      {/* Route visual */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 14 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "var(--text-soft)", marginBottom: 4 }}>Origine</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-dark)" }}>{shipment.origin}</div>
        </div>
        <div style={{ flex: 1, height: 2, background: "var(--border)", margin: "10px 12px 0", position: "relative" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 16, animation: "truck 2s ease-in-out infinite" }}>
            {modeIcon[shipment.mode] ?? "🚢"}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "var(--text-soft)", marginBottom: 4 }}>Destination</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-dark)" }}>{shipment.destination}</div>
        </div>
      </div>

      {/* Details grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[
          ["Incoterm",   shipment.incoterm],
          ["Poids",      shipment.weight],
          ["Volume",     shipment.volume],
          ["Fournisseur",shipment.supplier],
          ["Client",     shipment.client],
          ["Départ",     shipment.etd],
        ].map(([k, v]) => (
          <div key={k} style={{ background: "var(--bg)", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 10, color: "var(--text-soft)", marginBottom: 2, textTransform: "uppercase", letterSpacing: ".5px" }}>{k}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-dark)" }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--border-soft)" }}
        onClick={e => e.stopPropagation()}>
        <div>
          {shipment.feesSubmitted
            ? <span style={{ fontSize: 12, color: "var(--teal)", fontWeight: 600 }}>✓ Frais soumis : {shipment.totalFees}</span>
            : <span style={{ fontSize: 12, color: "var(--danger)", fontWeight: 500 }}>⚠ Frais logistiques à saisir</span>
          }
        </div>
        {!shipment.feesSubmitted && (
          <button className="btn btn-primary btn-sm" onClick={() => onAddFees?.(shipment)}>
            + Saisir les frais
          </button>
        )}
      </div>
    </div>
  );
}