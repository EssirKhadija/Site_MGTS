import { useState } from "react";

const submitted = [
  {
    id: "DOS-2024-028", product: "Emballages personnalisés kraft", value: "4 200 €",
    hsCode: "4819.10", regime: "Mise en libre pratique", date: "10 Nov 2024", status: "validated",
    fees: { droits_douane: 336, tva_import: 907.2, honoraires: 180, magasinage: 0, inspection: 0, doc_douanier: 60, autres: 0 },
    total: 1483.2, notes: "Taux de droit : 8% sur valeur CIF. TVA calculée sur (valeur + fret + droits).",
  },
  {
    id: "DOS-2024-027", product: "Profilés acier inox 316L",       value: "12 800 €",
    hsCode: "7222.20", regime: "Mise en libre pratique", date: "05 Nov 2024", status: "validated",
    fees: { droits_douane: 0, tva_import: 2688, honoraires: 220, magasinage: 90, inspection: 150, doc_douanier: 60, autres: 0 },
    total: 3208, notes: "Droits à 0% — régime préférentiel Chine (accord bilatéral). Inspection physique requise.",
  },
  {
    id: "DOS-2024-026", product: "Tissu non-tissé industriel",      value: "7 600 €",
    hsCode: "5603.11", regime: "Mise en libre pratique", date: "28 Oct 2024", status: "validated",
    fees: { droits_douane: 608, tva_import: 1641.6, honoraires: 180, magasinage: 0, inspection: 0, doc_douanier: 60, autres: 70 },
    total: 2559.6, notes: "Surcharge anti-dumping de 70 € appliquée (règlement UE 2023/142).",
  },
];

const feeLabels = {
  droits_douane: "Droits de douane", tva_import: "TVA importation",
  honoraires: "Honoraires transitaire", magasinage: "Magasinage",
  inspection: "Inspection douanière", doc_douanier: "Déclaration douane", autres: "Autres",
};

export default function CustomsFees() {
  const [selected, setSelected] = useState(submitted[0]);

  const totalMonth = submitted.reduce((s, d) => s + d.total, 0);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Frais douaniers</h1>
          <p>Récapitulatif de tous les frais soumis à MGTS ce mois.</p>
        </div>
        <button className="btn btn-ghost">↓ Exporter CSV</button>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total frais soumis",  value: totalMonth.toLocaleString("fr", { minimumFractionDigits: 2 }) + " €", color: "var(--ac)",    bg: "var(--ac-light)"   },
          { label: "Dossiers validés",    value: submitted.length,                                                       color: "var(--teal)",  bg: "var(--teal-light)" },
          { label: "En attente MGTS",     value: "0",                                                                    color: "var(--warn)",  bg: "#FEF6E8"           },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-dark)" }}>{s.value}</div>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: s.color }}>✦</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>

        {/* List */}
        <div className="card" style={{ overflow: "auto" }}>
          <div className="card-header"><h3>Dossiers clôturés</h3></div>
          {submitted.map(d => (
            <div key={d.id} onClick={() => setSelected(d)} style={{ padding: "15px 18px", borderBottom: "1px solid var(--border-soft)", cursor: "pointer", background: selected?.id === d.id ? "var(--ac-xlight)" : "transparent", borderLeft: selected?.id === d.id ? "3px solid var(--ac)" : "3px solid transparent", transition: "background .15s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span className="mono" style={{ fontSize: 10, color: "var(--text-soft)" }}>{d.id}</span>
                <span className="badge" style={{ color: "var(--teal)", background: "var(--teal-light)", fontSize: 10 }}>✓ Validé</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)", marginBottom: 3 }}>{d.product}</div>
              <div style={{ fontSize: 11, color: "var(--text-soft)" }}>SH {d.hsCode} · {d.date}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: "var(--ac)", marginTop: 8 }}>
                {d.total.toLocaleString("fr", { minimumFractionDigits: 2 })} €
              </div>
            </div>
          ))}
        </div>

        {/* Detail */}
        {selected && (
          <div className="card card-pad">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
              <div>
                <div className="mono" style={{ fontSize: 11, color: "var(--text-soft)", marginBottom: 4 }}>{selected.id}</div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-dark)" }}>{selected.product}</h2>
              </div>
              <span className="badge" style={{ color: "var(--teal)", background: "var(--teal-light)" }}>✓ Validé MGTS</span>
            </div>

            <div style={{ background: "var(--ac-xlight)", borderRadius: 10, padding: "14px 20px", marginBottom: 22, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {[["Code SH", selected.hsCode], ["Valeur marchande", selected.value], ["Régime douanier", selected.regime]].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 10, color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-dark)" }}>{v}</div>
                </div>
              ))}
            </div>

            <div className="form-label" style={{ marginBottom: 14 }}>Détail des frais douaniers</div>
            {Object.entries(selected.fees).filter(([, v]) => v > 0).map(([k, v]) => (
              <div key={k} className="cost-line">
                <span className="cost-label">{feeLabels[k] ?? k}</span>
                <span className="cost-value">{v.toLocaleString("fr", { minimumFractionDigits: 2 })} €</span>
              </div>
            ))}
            <div className="cost-line cost-total" style={{ marginTop: 8 }}>
              <span className="cost-label">TOTAL DOUANE</span>
              <span className="cost-value" style={{ fontSize: 18 }}>{selected.total.toLocaleString("fr", { minimumFractionDigits: 2 })} €</span>
            </div>

            {selected.notes && (
              <div style={{ background: "var(--sky-light)", borderRadius: 9, padding: "12px 16px", marginTop: 16 }}>
                <div className="form-label" style={{ marginBottom: 6 }}>Notes douanières</div>
                <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.6 }}>{selected.notes}</p>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="btn btn-ghost btn-sm">↓ Export PDF</button>
              <button className="btn btn-ghost btn-sm">📄 DAU douane</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}