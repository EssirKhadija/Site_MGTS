
const statusConfig = {
  new:           { label: "Nouveau",          color: "#FF6500", bg: "#FFF0E6" },
  in_progress:   { label: "En cours",         color: "#5B21B6", bg: "#EDE9FE" },
  customs_check: { label: "Contrôle douane",  color: "#F5A623", bg: "#FEF6E8" },
  validated:     { label: "Validé",           color: "#009189", bg: "#E0F5F4" },
  completed:     { label: "Clôturé",          color: "#4A7A82", bg: "#EAF7FB" },
  blocked:       { label: "Bloqué",           color: "#E03A2E", bg: "#FFE8DC" },
};

const modeIcon = { sea: "🚢", air: "✈️", road: "🚛", rail: "🚂" };

/**
 * DossierCard — one complete order dossier for the freight forwarder.
 *
 * Props:
 *   dossier  {object}
 *   onView   {fn}
 *   onAddFees {fn}
 */
export default function DossierCard({ dossier, onView, onAddFees }) {
  const s = statusConfig[dossier.status] ?? statusConfig.new;

  return (
    <div className="card dossier-card" onClick={() => onView?.(dossier)}>
      {/* Status stripe */}
      <div style={{ height: 4, background: s.color, borderRadius: "var(--radius) var(--radius) 0 0", margin: "-1px -1px 16px -1px" }} />

      {/* Header */}
      <div className="dossier-header">
        <div>
          <div className="dossier-id">{dossier.id}</div>
          <div className="dossier-title">{dossier.product}</div>
          <div style={{ fontSize: 11, color: "var(--text-soft)", marginTop: 2 }}>
            {modeIcon[dossier.mode] ?? "🚢"} {dossier.origin} → {dossier.destination}
          </div>
        </div>
        <span className="badge" style={{ color: s.color, background: s.bg, flexShrink: 0 }}>
          <span className={`badge-dot${dossier.status === "in_progress" || dossier.status === "customs_check" ? " pulse" : ""}`} style={{ background: s.color }} />
          {s.label}
        </span>
      </div>

      {/* Fields */}
      <div className="dossier-meta">
        {[
          ["Fournisseur",  dossier.supplier],
          ["Client",       dossier.client],
          ["Incoterm",     dossier.incoterm],
          ["Valeur merch.",dossier.value],
          ["Poids",        dossier.weight],
          ["Régime douane",dossier.customsRegime ?? "—"],
        ].map(([k, v]) => (
          <div key={k} className="dossier-field">
            <label>{k}</label>
            <span>{v}</span>
          </div>
        ))}
      </div>

      {/* Documents chips */}
      {dossier.documents?.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
          {dossier.documents.map((doc, i) => (
            <span key={i} style={{ fontSize: 10, color: "var(--ac)", background: "var(--ac-light)", padding: "2px 8px", borderRadius: 8, fontWeight: 600 }}>
              📄 {doc}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="dossier-footer" onClick={e => e.stopPropagation()}>
        <span style={{ fontSize: 11, color: "var(--text-soft)" }}>📅 {dossier.etd}</span>
        <div style={{ display: "flex", gap: 8 }}>
          {dossier.status === "new" && (
            <button className="btn btn-primary btn-sm" onClick={() => onAddFees?.(dossier)}>
              ✦ Saisir frais douane
            </button>
          )}
          {dossier.status === "in_progress" && (
            <button className="btn btn-primary btn-sm" onClick={() => onView?.(dossier)}>
              ◆ Valider l'import
            </button>
          )}
          {(dossier.status === "validated" || dossier.status === "completed") && (
            <span style={{ fontSize: 12, color: "var(--teal)", fontWeight: 600 }}>✓ Dossier finalisé</span>
          )}
        </div>
      </div>
    </div>
  );
}