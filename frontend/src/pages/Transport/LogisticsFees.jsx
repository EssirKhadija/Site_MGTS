import { useState } from "react";
import TransportLayout from "../../components/Transport/TransportLayout";

const submittedFees = [
  {
    id: "CMD-2024-002", product: "Pièces mécaniques sur mesure", origin: "Guangzhou, CN", destination: "Marseille, FR",
    mode: "sea", submittedDate: "29 Oct 2024", status: "validated",
    fees: { freight: 980, handling: 120, insurance: 85, customs_doc: 60, fuel: 95, terminal: 145, other: 0 },
    total: 1485, notes: "Surcharge BAF appliquée selon grille Q4 2024.",
  },
  {
    id: "CMD-2024-003", product: "Emballages personnalisés", origin: "Yiwu, CN", destination: "Lyon, FR",
    mode: "sea", submittedDate: "12 Sep 2024", status: "validated",
    fees: { freight: 560, handling: 90, insurance: 45, customs_doc: 40, fuel: 60, terminal: 95, other: 0 },
    total: 890, notes: "",
  },
];

const feeLabels = {
  freight:    "Fret maritime / aérien",
  handling:   "Manutention port",
  insurance:  "Assurance transport",
  customs_doc:"Documents douaniers",
  fuel:       "Surcharge carburant",
  terminal:   "Frais terminal (THC)",
  other:      "Autres frais",
};

const modeIcon = { sea: "🚢", air: "✈️", road: "🚛" };

export default function LogisticsFees() {
  const [selected, setSelected] = useState(submittedFees[0]);

  const totalMonth = submittedFees.reduce((s, f) => s + f.total, 0);

  return (
    <TransportLayout>
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Frais logistiques</h1>
          <p>Récapitulatif de tous les frais soumis à MGTS.</p>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total soumis ce mois", value: totalMonth.toLocaleString("fr") + " €", icon: "◆", color: "var(--tr)",    bg: "var(--tr-light)"    },
          { label: "Dossiers validés",     value: submittedFees.length,                   icon: "✓",  color: "var(--teal)",  bg: "var(--teal-light)"  },
          { label: "En attente validation", value: "0",                                   icon: "◈",  color: "var(--warn)",  bg: "#FEF6E8"            },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-dark)" }}>{s.value}</div>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: s.color }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>

        {/* List */}
        <div className="card" style={{ overflow: "auto" }}>
          <div className="card-header"><h3>Dossiers</h3></div>
          {submittedFees.map(f => (
            <div key={f.id} onClick={() => setSelected(f)} style={{ padding: "15px 18px", borderBottom: "1px solid var(--border-soft)", cursor: "pointer", background: selected?.id === f.id ? "var(--tr-xlight)" : "transparent", borderLeft: selected?.id === f.id ? "3px solid var(--tr)" : "3px solid transparent", transition: "background .15s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span className="mono" style={{ fontSize: 10, color: "var(--text-soft)" }}>{f.id}</span>
                <span className="badge" style={{ color: "var(--teal)", background: "var(--teal-light)", fontSize: 10 }}>✓ Validé</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)", marginBottom: 3 }}>{f.product}</div>
              <div style={{ fontSize: 11, color: "var(--text-soft)" }}>{modeIcon[f.mode]} {f.origin} → {f.destination}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: "var(--tr)", marginTop: 8 }}>
                {f.total.toLocaleString("fr")} €
              </div>
            </div>
          ))}
        </div>

        {/* Detail */}
        {selected && (
          <div className="card card-pad">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div className="mono" style={{ fontSize: 11, color: "var(--text-soft)", marginBottom: 4 }}>{selected.id}</div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-dark)" }}>{selected.product}</h2>
                <div style={{ fontSize: 12, color: "var(--text-mid)", marginTop: 3 }}>{modeIcon[selected.mode]} {selected.origin} → {selected.destination}</div>
              </div>
              <span className="badge" style={{ color: "var(--teal)", background: "var(--teal-light)" }}>✓ Validé par MGTS</span>
            </div>

            {/* Route visual */}
            <div style={{ background: "var(--tr-xlight)", borderRadius: 10, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "var(--text-soft)", marginBottom: 4 }}>DÉPART</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-dark)" }}>{selected.origin}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 26 }}>{modeIcon[selected.mode]}</div>
                <div style={{ fontSize: 10, color: "var(--tr)", fontWeight: 600, marginTop: 4 }}>SOUMIS LE {selected.submittedDate}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "var(--text-soft)", marginBottom: 4 }}>ARRIVÉE</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-dark)" }}>{selected.destination}</div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="form-label" style={{ marginBottom: 14 }}>Détail des frais</div>
            {Object.entries(selected.fees).filter(([, v]) => v > 0).map(([k, v]) => (
              <div key={k} className="cost-line">
                <span className="cost-label">{feeLabels[k] ?? k}</span>
                <span className="cost-value">{v.toLocaleString("fr")} €</span>
              </div>
            ))}
            <div className="cost-line cost-total" style={{ marginTop: 8 }}>
              <span className="cost-label">TOTAL LOGISTIQUE</span>
              <span className="cost-value" style={{ color: "var(--tr)", fontSize: 18 }}>{selected.total.toLocaleString("fr")} €</span>
            </div>

            {selected.notes && (
              <div style={{ background: "var(--sky-light)", borderRadius: 9, padding: "12px 16px", marginTop: 16 }}>
                <div className="form-label" style={{ marginBottom: 6 }}>Notes</div>
                <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.5 }}>{selected.notes}</p>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="btn btn-ghost btn-sm">↓ Exporter PDF</button>
            </div>
          </div>
        )}
      </div>
    </div>
    </TransportLayout>
  );
}