import { useState } from "react";

const pending = [
  {
    id: "DOS-2024-030", product: "Pièces mécaniques CNC aluminium",
    origin: "Guangzhou, CN", destination: "Marseille, FR", mode: "sea",
    value: "8 200 €", weight: "850 kg", hsCode: "8466.93",
    regime: "Mise en libre pratique", incoterm: "CIF",
    supplier: "Guangzhou Precision", client: "MetalPro France",
    eta: "18 Déc 2024",
    checks: {
      facture:      { label: "Facture commerciale conforme",     done: true  },
      packing:      { label: "Packing list vérifiée",           done: true  },
      bl:           { label: "Connaissement (BL) validé",       done: true  },
      origine:      { label: "Certificat d'origine vérifié",    done: false },
      hs_code:      { label: "Code SH confirmé (8466.93)",      done: false },
      valeur:       { label: "Valeur en douane vérifiée",       done: false },
      restrictions: { label: "Pas de restriction d'import",     done: false },
      conformite:   { label: "Conformité réglementaire (CE/UE)",done: false },
    },
    fees_submitted: true, fees_total: "1 240 €",
  },
  {
    id: "DOS-2024-029", product: "Boîtiers plastique ABS sur mesure",
    origin: "Ningbo, CN", destination: "Bordeaux, FR", mode: "sea",
    value: "6 400 €", weight: "1 200 kg", hsCode: "3926.90",
    regime: "Entrepôt douanier", incoterm: "FOB",
    supplier: "Ningbo PlasticTech", client: "LogiPack SAS",
    eta: "22 Déc 2024",
    checks: {
      facture:      { label: "Facture commerciale conforme",     done: true  },
      packing:      { label: "Packing list vérifiée",           done: true  },
      bl:           { label: "Connaissement (BL) validé",       done: false },
      origine:      { label: "Certificat d'origine vérifié",    done: false },
      hs_code:      { label: "Code SH confirmé (3926.90)",      done: false },
      valeur:       { label: "Valeur en douane vérifiée",       done: false },
      restrictions: { label: "Pas de restriction d'import",     done: false },
      conformite:   { label: "Conformité réglementaire (CE/UE)",done: false },
    },
    fees_submitted: false, fees_total: null,
  },
];

const modeIcon = { sea: "🚢", air: "✈️", road: "🚛" };

export default function ImportValidation() {
  const [dossiers, setDossiers] = useState(pending);
  const [selected, setSelected] = useState(dossiers[0]);
  const [blockReason, setBlockReason] = useState("");
  const [showBlock, setShowBlock]     = useState(false);
  const [validated, setValidated]     = useState({});

  const toggleCheck = (dosId, checkKey) => {
    setDossiers(prev => prev.map(d => {
      if (d.id !== dosId) return d;
      return { ...d, checks: { ...d.checks, [checkKey]: { ...d.checks[checkKey], done: !d.checks[checkKey].done } } };
    }));
    if (selected?.id === dosId) {
      setSelected(prev => ({
        ...prev,
        checks: { ...prev.checks, [checkKey]: { ...prev.checks[checkKey], done: !prev.checks[checkKey].done } },
      }));
    }
  };

  const allDone = sel => sel && Object.values(sel.checks).every(c => c.done) && sel.fees_submitted;

  const validate = () => {
    setValidated(v => ({ ...v, [selected.id]: true }));
    setDossiers(prev => prev.map(d => d.id === selected.id ? { ...d, status: "validated" } : d));
  };

  const done = allDone(selected);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Validation import</h1>
          <p>Vérifiez et validez toutes les informations liées à l'importation pour chaque dossier.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>

        {/* Dossier list */}
        <div className="card" style={{ overflow: "auto" }}>
          <div className="card-header"><h3>Dossiers à valider</h3></div>
          {dossiers.map(d => {
            const doneCount  = Object.values(d.checks).filter(c => c.done).length;
            const totalCount = Object.values(d.checks).length;
            const pct        = Math.round(doneCount / totalCount * 100);
            const isValidated = validated[d.id];
            return (
              <div key={d.id} onClick={() => setSelected(d)} style={{ padding: "15px 18px", borderBottom: "1px solid var(--border-soft)", cursor: "pointer", background: selected?.id === d.id ? "var(--ac-xlight)" : "transparent", borderLeft: selected?.id === d.id ? "3px solid var(--ac)" : "3px solid transparent", transition: "background .15s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span className="mono" style={{ fontSize: 10, color: "var(--text-soft)" }}>{d.id}</span>
                  {isValidated
                    ? <span className="badge" style={{ color: "var(--teal)", background: "var(--teal-light)", fontSize: 10 }}>✓ Validé</span>
                    : <span style={{ fontSize: 10, color: pct === 100 ? "var(--teal)" : "var(--ac)", fontWeight: 700 }}>{pct}%</span>
                  }
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)", marginBottom: 6 }}>{d.product}</div>
                {/* Progress */}
                <div style={{ height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: pct + "%", height: "100%", background: isValidated ? "var(--teal)" : "var(--ac)", borderRadius: 3, transition: "width .4s" }} />
                </div>
                <div style={{ fontSize: 10, color: "var(--text-soft)", marginTop: 4 }}>{doneCount}/{totalCount} points validés</div>
              </div>
            );
          })}
        </div>

        {/* Checklist panel */}
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Info card */}
            <div className="card card-pad">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                <div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--text-soft)", marginBottom: 4 }}>{selected.id}</div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-dark)" }}>{selected.product}</h2>
                </div>
                {validated[selected.id] && (
                  <span className="badge" style={{ color: "var(--teal)", background: "var(--teal-light)", fontSize: 13, padding: "6px 14px" }}>✓ Import validé</span>
                )}
              </div>

              {/* Route */}
              <div style={{ background: "var(--ac-xlight)", borderRadius: 10, padding: "12px 18px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "var(--text-soft)", marginBottom: 3 }}>ORIGINE</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{selected.origin}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22 }}>{modeIcon[selected.mode]}</div>
                  <div style={{ fontSize: 10, color: "var(--ac)", fontWeight: 600, marginTop: 2 }}>{selected.incoterm}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "var(--text-soft)", marginBottom: 3 }}>DESTINATION</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{selected.destination}</div>
                </div>
              </div>

              <div className="form-grid">
                {[["Valeur marchandise", selected.value], ["Poids", selected.weight], ["Code SH", selected.hsCode], ["Régime", selected.regime], ["Client", selected.client], ["ETA", selected.eta]].map(([k, v]) => (
                  <div key={k}>
                    <div className="form-label" style={{ marginBottom: 4 }}>{k}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checklist */}
            <div className="card card-pad">
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-dark)", marginBottom: 18 }}>
                Liste de contrôle import
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
                {Object.entries(selected.checks).map(([key, check]) => (
                  <div key={key} onClick={() => !validated[selected.id] && toggleCheck(selected.id, key)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", background: check.done ? "var(--teal-light)" : "var(--bg)", borderRadius: "var(--radius-sm)", border: `1.5px solid ${check.done ? "var(--teal)" : "var(--border)"}`, cursor: validated[selected.id] ? "default" : "pointer", transition: "all .2s" }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: check.done ? "var(--teal)" : "var(--card)", border: `2px solid ${check.done ? "var(--teal)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s" }}>
                      {check.done && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: check.done ? "var(--teal-dark)" : "var(--text-dark)" }}>{check.label}</span>
                  </div>
                ))}
              </div>

              {/* Fees status */}
              <div style={{ background: selected.fees_submitted ? "var(--teal-light)" : "var(--orange-light)", borderRadius: "var(--radius-sm)", padding: "12px 16px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18 }}>{selected.fees_submitted ? "✓" : "⚠"}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: selected.fees_submitted ? "var(--teal)" : "var(--orange)" }}>
                    {selected.fees_submitted ? `Frais douaniers soumis : ${selected.fees_total}` : "Frais douaniers non encore soumis"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-mid)", marginTop: 2 }}>
                    {selected.fees_submitted ? "Tous les frais ont été enregistrés." : "Saisissez les frais avant de valider."}
                  </div>
                </div>
              </div>

              {!validated[selected.id] && (
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    disabled={!done}
                    onClick={validate}
                  >
                    {done ? "✓ Valider l'importation" : `En attente (${Object.values(selected.checks).filter(c => c.done).length}/${Object.values(selected.checks).length} points)`}
                  </button>
                  <button className="btn btn-danger" onClick={() => setShowBlock(true)}>⛔ Bloquer</button>
                </div>
              )}

              {validated[selected.id] && (
                <div style={{ background: "var(--teal-light)", borderRadius: "var(--radius-sm)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 22, color: "var(--teal)" }}>✓</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--teal)" }}>Importation validée</div>
                    <div style={{ fontSize: 12, color: "var(--text-mid)", marginTop: 2 }}>MGTS a été notifié. Le dossier peut être clôturé.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Block modal */}
      {showBlock && (
        <div className="modal-overlay" onClick={() => setShowBlock(false)}>
          <div className="card modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon" style={{ background: "#FFE8DC", color: "var(--danger)" }}>⛔</div>
            <div className="modal-title">Bloquer l'importation</div>
            <div className="modal-desc">Expliquez la raison du blocage. MGTS et le client seront immédiatement notifiés.</div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Motif du blocage *</label>
              <textarea className="form-textarea" placeholder="Ex : Documents manquants, non-conformité réglementaire, restriction d'importation…" value={blockReason} onChange={e => setBlockReason(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-danger" style={{ flex: 1 }} disabled={!blockReason.trim()} onClick={() => setShowBlock(false)}>
                Confirmer le blocage
              </button>
              <button className="btn btn-ghost" onClick={() => setShowBlock(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}