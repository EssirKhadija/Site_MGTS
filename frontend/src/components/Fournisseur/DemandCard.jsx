import "../../styles/Supplier.css";

const urgencyMap = {
  high:   { label: "Urgent",  color: "#FF6500", bg: "#FFF0E6" },
  medium: { label: "Normal",  color: "#009189", bg: "#E0F5F4" },
  low:    { label: "Flexible",color: "#89B5BE", bg: "#F0F8FA" },
};

const stateMap = {
  new:       { label: "Nouveau",          color: "#FF6500", bg: "#FFF0E6" },
  quoted:    { label: "Devis soumis",     color: "#009189", bg: "#E0F5F4" },
  accepted:  { label: "Accepté",          color: "#007770", bg: "#D5F0EE" },
  rejected:  { label: "Refusé",           color: "#CC3A00", bg: "#FFE8DC" },
};

/**
 * DemandCard — a client custom-request card for the supplier to review and quote.
 *
 * Props:
 *   demand   {object}  — { id, title, description, qty, dimensions, matiere, budget, incoterm, urgency, state, client, date }
 *   onQuote  {fn}      — open quote modal
 *   onView   {fn}      — open full detail
 */
export default function DemandCard({ demand, onQuote, onView }) {
  const u = urgencyMap[demand.urgency] ?? urgencyMap.medium;
  const s = stateMap[demand.state] ?? stateMap.new;

  return (
    <div className="card demand-card" onClick={() => onView?.(demand)}>
      {/* Header */}
      <div className="demand-header">
        <div>
          <div className="demand-id">{demand.id}</div>
          <div className="demand-title">{demand.title}</div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <span className="badge" style={{ color: u.color, background: u.bg }}>{u.label}</span>
          <span className="badge" style={{ color: s.color, background: s.bg }}>
            <span className="badge-dot" style={{ background: s.color }} />
            {s.label}
          </span>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 12, color: "var(--text-mid)", lineHeight: 1.55, marginBottom: 12 }}>
        {demand.description}
      </p>

      {/* Fields */}
      <div className="demand-meta">
        {[
          ["Quantité",   demand.qty + " unités"],
          ["Budget max", demand.budget],
          demand.dimensions && ["Dimensions", demand.dimensions],
          demand.matiere    && ["Matière",    demand.matiere],
          demand.incoterm   && ["Incoterm",   demand.incoterm],
          ["Client",     demand.client],
        ].filter(Boolean).map(([k, v]) => (
          <div key={k} className="demand-field">
            <label>{k}</label>
            <span>{v}</span>
          </div>
        ))}
      </div>

      {/* Attachments */}
      {(demand.images?.length > 0 || demand.pdf) && (
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          {demand.images?.length > 0 && (
            <span style={{ fontSize: 11, color: "var(--teal)", background: "var(--teal-light)", padding: "3px 9px", borderRadius: 8 }}>
              🖼 {demand.images.length} image(s)
            </span>
          )}
          {demand.pdf && (
            <span style={{ fontSize: 11, color: "var(--teal)", background: "var(--teal-light)", padding: "3px 9px", borderRadius: 8 }}>
              📄 PDF joint
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="demand-footer">
        <span style={{ fontSize: 11, color: "var(--text-soft)" }}>📅 {demand.date}</span>
        <div style={{ display: "flex", gap: 8 }} onClick={(e) => e.stopPropagation()}>
          {demand.state === "new" && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onQuote?.(demand)}
            >
              ✦ Soumettre un coût
            </button>
          )}
          {demand.state === "quoted" && (
            <span style={{ fontSize: 12, color: "var(--teal)", fontWeight: 600 }}>
              ✓ Coût soumis — en attente
            </span>
          )}
        </div>
      </div>
    </div>
  );
}