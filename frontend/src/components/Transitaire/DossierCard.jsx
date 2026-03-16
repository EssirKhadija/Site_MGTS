
const statusConfig = {
  new:           { label: "Nouveau",          color: "#FF6500", bg: "#FFF0E6" },
  in_progress:   { label: "En cours",         color: "#5B21B6", bg: "#EDE9FE" },
  customs_check: { label: "Contrôle douane",  color: "#F5A623", bg: "#FEF6E8" },
  validated:     { label: "Validé",           color: "#009189", bg: "#E0F5F4" },
  completed:     { label: "Clôturé",          color: "#4A7A82", bg: "#EAF7FB" },
  blocked:       { label: "Bloqué",           color: "#E03A2E", bg: "#FFE8DC" },
};

const modeIcon = { sea: "🚢", air: "✈️", road: "🚛", rail: "🚂" };

const cardStyles = {
  base: {
    borderRadius: 14,
    border: "1px solid var(--border)",
    boxShadow: "0 8px 18px rgba(15, 23, 42, 0.08)",
    transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
    cursor: "pointer",
    padding: 16,
    background: "#ffffff",
    minHeight: 230,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  hovered: {
    transform: "translateY(-2px)",
    borderColor: "var(--ac-light)",
    boxShadow: "0 12px 25px rgba(12, 31, 68, 0.12)",
  },
  id: { fontSize: 12, color: "var(--text-soft)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 },
  title: { fontSize: 15, fontWeight: 700, color: "var(--text-dark)", lineHeight: 1.35, marginBottom: 6 },
  route: { fontSize: 12, color: "var(--text-mid)", lineHeight: 1.35 },
  label: { fontSize: 11, color: "var(--text-soft)", fontWeight: 600, marginBottom: 1 },
  value: { fontSize: 13, color: "var(--text-dark)", fontWeight: 600 },
  badge: { fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 999, letterSpacing: "0.03em" },
  field: { display: "flex", flexDirection: "column", gap: 2, marginBottom: 8 },
};

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
    <div className="card dossier-card" style={cardStyles.base} onClick={() => onView?.(dossier)}>
      {/* Status stripe */}
      <div style={{ height: 4, background: s.color, borderRadius: "var(--radius) var(--radius) 0 0", margin: "-1px -1px 16px -1px" }} />

      {/* Header */}
      <div className="dossier-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
        <div>
          <div className="dossier-id" style={cardStyles.id}>{dossier.id}</div>
          <div className="dossier-title" style={cardStyles.title}>{dossier.product}</div>
          <div style={cardStyles.route}>
            {modeIcon[dossier.mode] ?? "🚢"} {dossier.origin} → {dossier.destination}
          </div>
        </div>
        <span className="badge" style={{ ...cardStyles.badge, color: s.color, background: s.bg, flexShrink: 0 }}>
          <span className={`badge-dot${dossier.status === "in_progress" || dossier.status === "customs_check" ? " pulse" : ""}`} style={{ background: s.color, width: 8, height: 8, marginRight: 6 }} />
          {s.label}
        </span>
      </div>

      {/* Fields */}
      <div className="dossier-meta" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, marginBottom: 12 }}>
        {[
          ["Fournisseur",  dossier.supplier],
          ["Client",       dossier.client],
          ["Incoterm",     dossier.incoterm],
          ["Valeur merch.",dossier.value],
          ["Poids",        dossier.weight],
          ["Régime douane",dossier.customsRegime ?? "—"],
        ].map(([k, v]) => (
          <div key={k} className="dossier-field" style={cardStyles.field}>
            <label style={cardStyles.label}>{k}</label>
            <span style={cardStyles.value}>{v}</span>
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
      <div className="dossier-footer" onClick={e => e.stopPropagation()} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 10, borderTop: "1px solid #eef1f5" }}>
        <span style={{ fontSize: 11, color: "var(--text-soft)", fontWeight: 600 }}>📅 {dossier.etd}</span>
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