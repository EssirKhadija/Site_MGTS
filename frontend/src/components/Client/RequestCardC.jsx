import "../../styles/Client.css";

const statusConfig = {
  brouillon:     { label: "Brouillon",      color: "#89B5BE", bg: "#F0F8FA" },
  en_attente:    { label: "En attente",     color: "#F5A623", bg: "#FEF6E8" },
  devis_recu:    { label: "Devis reçu",     color: "#009189", bg: "#E0F5F4" },
  validé:        { label: "Validé",         color: "#007770", bg: "#D5F0EE" },
  en_production: { label: "En production",  color: "#FF6500", bg: "#FFF0E6" },
  en_transit:    { label: "En transit",     color: "#0077A8", bg: "#E0F1FA" },
  livré:         { label: "Livré",          color: "#007770", bg: "#D5F0EE" },
  refusé:        { label: "Refusé",         color: "#CC3A00", bg: "#FFE8DC" },
};

/**
 * RequestCard — displays a summary of one order/request.
 *
 * Props:
 *   order  {object}   — order data
 *   onClick {fn}      — click handler
 */
export default function RequestCard({ order, onClick }) {
  const s = statusConfig[order.status] ?? statusConfig.brouillon;

  return (
    <div className="card req-card" onClick={onClick}>
      {/* Header */}
      <div className="req-card-header">
        <div>
          <div className="req-card-id">{order.id}</div>
          <div className="req-card-title">{order.product}</div>
        </div>
        <span
          className="badge"
          style={{ color: s.color, background: s.bg }}
        >
          <span
            className={`badge-dot${order.status === "en_production" ? " pulse" : ""}`}
            style={{ background: s.color }}
          />
          {s.label}
        </span>
      </div>

      {/* Fields */}
      <div className="req-card-body">
        <div className="req-card-field">
          <label>Quantité</label>
          <span>{order.qty} unités</span>
        </div>
        <div className="req-card-field">
          <label>Incoterm</label>
          <span>{order.incoterm ?? "FOB"}</span>
        </div>
        {order.dimensions && (
          <div className="req-card-field">
            <label>Dimensions</label>
            <span>{order.dimensions}</span>
          </div>
        )}
        {order.matiere && (
          <div className="req-card-field">
            <label>Matière</label>
            <span>{order.matiere}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="req-card-footer">
        <span className="req-card-supplier">
          🏭 {order.supplier ?? "En attente de fournisseur"}
        </span>
        <span className="req-card-amount">{order.budget}</span>
      </div>
    </div>
  );
}