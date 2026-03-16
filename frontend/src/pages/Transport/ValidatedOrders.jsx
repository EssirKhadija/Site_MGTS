import { useState } from "react";
import ShipmentCard from "../../components/Transport/ShipmentCard";
import TransportLayout from "../../components/Transport/TransportLayout";

const initialOrders = [
  { id:"CMD-2024-001", product:"Conteneurs de stockage industriels", mode:"sea",  origin:"Shenzhen, CN",   destination:"Le Havre, FR",  incoterm:"FOB", weight:"2 400 kg", volume:"18 m³", supplier:"Shenzhen MetalTech Co.", client:"Dupont Industries", etd:"18 Nov 2024", eta:"10 Déc 2024", status:"pending_fees", feesSubmitted:false, totalFees:null },
  { id:"CMD-2024-004", product:"Pièces mécaniques CNC aluminium",    mode:"sea",  origin:"Guangzhou, CN",  destination:"Marseille, FR", incoterm:"CIF", weight:"850 kg",  volume:"5 m³",  supplier:"Guangzhou Precision", client:"MetalPro France", etd:"22 Nov 2024", eta:"18 Déc 2024", status:"pending_fees", feesSubmitted:false, totalFees:null },
  { id:"CMD-2024-005", product:"Profilés acier inox 316L",            mode:"air",  origin:"Shanghai, CN",   destination:"Paris CDG, FR", incoterm:"EXW", weight:"320 kg",  volume:"2.1 m³",supplier:"Shanghai Steel Ltd.", client:"InoxPro SAS", etd:"20 Nov 2024", eta:"23 Nov 2024", status:"awaiting_pickup", feesSubmitted:false, totalFees:null },
  { id:"CMD-2024-006", product:"Boîtiers plastique ABS injection",    mode:"sea",  origin:"Ningbo, CN",     destination:"Bordeaux, FR",  incoterm:"FOB", weight:"1 200 kg",volume:"9 m³",  supplier:"Ningbo PlasticTech", client:"LogiPack SAS", etd:"25 Nov 2024", eta:"22 Déc 2024", status:"pending_fees", feesSubmitted:false, totalFees:null },
];

const feeTypes = [
  { key:"freight",    label:"Fret maritime / aérien",   required:true  },
  { key:"handling",   label:"Manutention port",         required:true  },
  { key:"insurance",  label:"Assurance transport",      required:false },
  { key:"customs_doc",label:"Documents douaniers",      required:false },
  { key:"fuel",       label:"Surcharge carburant (BAF)",required:false },
  { key:"terminal",   label:"Frais terminal (THC)",     required:false },
  { key:"other",      label:"Autres frais",             required:false },
];

const emptyFees = Object.fromEntries(feeTypes.map(f => [f.key, ""]));

export default function ValidatedOrders() {
  const [orders, setOrders]       = useState(initialOrders);
  const [feeTarget, setFeeTarget] = useState(null);
  const [fees, setFees]           = useState(emptyFees);
  const [notes, setNotes]         = useState("");
  const [detail, setDetail]       = useState(null);
  const [filter, setFilter]       = useState("Tous");

  const setFee = (k, v) => setFees(f => ({ ...f, [k]: v }));

  const total = Object.values(fees).reduce((s, v) => s + (parseFloat(v.replace(",",".")) || 0), 0);

  const submitFees = () => {
    setOrders(prev => prev.map(o =>
      o.id === feeTarget.id
        ? { ...o, feesSubmitted: true, totalFees: total.toLocaleString("fr") + " €", status: "in_transit", feeBreakdown: { ...fees }, notes }
        : o
    ));
    setFeeTarget(null);
    setFees(emptyFees);
    setNotes("");
  };

  const filters = ["Tous", "Frais à saisir", "En transit", "Au port", "En douane"];

  const filtered = orders.filter(o => {
    if (filter === "Tous")           return true;
    if (filter === "Frais à saisir") return !o.feesSubmitted;
    if (filter === "En transit")     return o.status === "in_transit";
    if (filter === "Au port")        return o.status === "at_port";
    if (filter === "En douane")      return o.status === "customs";
    return true;
  });

  return (
    <TransportLayout>
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Commandes validées</h1>
            <p>{orders.filter(o => !o.feesSubmitted).length} commande(s) nécessitent vos frais logistiques.</p>
          </div>
        </div>

      {/* Alert */}
      {orders.filter(o => !o.feesSubmitted).length > 0 && (
        <div style={{ background:"var(--orange-light)", border:"1.5px solid var(--orange)", borderRadius:"var(--radius-sm)", padding:"12px 20px", display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <span style={{ fontSize:18 }}>⚠</span>
          <span style={{ fontSize:13, color:"var(--text-dark)" }}>
            <strong>{orders.filter(o=>!o.feesSubmitted).length} commande(s)</strong> en attente de vos frais — les devis clients ne peuvent pas être finalisés sans ces informations.
          </span>
        </div>
      )}

      {/* Filters */}
      <div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding:"7px 18px", borderRadius:20, border:`1.5px solid ${filter===f?"var(--tr)":"var(--border)"}`, background:filter===f?"var(--tr-light)":"transparent", color:filter===f?"var(--tr)":"var(--text-mid)", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"var(--font)", transition:"all .15s" }}>
            {f}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid-2">
        {filtered.map(o => (
          <ShipmentCard
            key={o.id}
            shipment={o}
            onAddFees={s => { setFeeTarget(s); setFees(emptyFees); setNotes(""); }}
            onView={setDetail}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign:"center", padding:60, color:"var(--text-soft)" }}>
          <div style={{ fontSize:32, marginBottom:10 }}>🚢</div>
          <p>Aucune commande dans cette catégorie.</p>
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="card" style={{ width:580, padding:30, maxHeight:"90vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
              <div>
                <div className="mono" style={{ fontSize:11, color:"var(--text-soft)", marginBottom:4 }}>{detail.id}</div>
                <h2 style={{ fontSize:17, fontWeight:700, color:"var(--text-dark)" }}>{detail.product}</h2>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setDetail(null)}>✕</button>
            </div>

            {/* Route */}
            <div style={{ background:"var(--tr-xlight)", borderRadius:10, padding:16, marginBottom:18, display:"flex", alignItems:"center", gap:0 }}>
              <div style={{ textAlign:"center", flexShrink:0 }}>
                <div style={{ fontSize:10, color:"var(--text-soft)", marginBottom:4 }}>ORIGINE</div>
                <div style={{ fontSize:13, fontWeight:700, color:"var(--text-dark)" }}>{detail.origin}</div>
              </div>
              <div style={{ flex:1, textAlign:"center" }}>
                <div style={{ fontSize:20 }}>{ {sea:"🚢",air:"✈️",road:"🚛"}[detail.mode] ?? "🚢"}</div>
                <div style={{ fontSize:10, color:"var(--tr)", fontWeight:600 }}>{detail.incoterm}</div>
              </div>
              <div style={{ textAlign:"center", flexShrink:0 }}>
                <div style={{ fontSize:10, color:"var(--text-soft)", marginBottom:4 }}>DESTINATION</div>
                <div style={{ fontSize:13, fontWeight:700, color:"var(--text-dark)" }}>{detail.destination}</div>
              </div>
            </div>

            <div className="form-grid" style={{ marginBottom:18 }}>
              {[["Fournisseur",detail.supplier],["Client",detail.client],["Poids",detail.weight],["Volume",detail.volume],["ETD",detail.etd],["ETA estimée",detail.eta],["Incoterm",detail.incoterm]].map(([k,v]) => (
                <div key={k}>
                  <div className="form-label" style={{ marginBottom:4 }}>{k}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:"var(--text-dark)" }}>{v}</div>
                </div>
              ))}
            </div>

            {detail.feesSubmitted && detail.feeBreakdown && (
              <div style={{ background:"var(--teal-light)", borderRadius:10, padding:16, marginBottom:16 }}>
                <div style={{ fontSize:12, color:"var(--teal)", fontWeight:700, marginBottom:10, textTransform:"uppercase", letterSpacing:"1px" }}>Frais soumis</div>
                {feeTypes.filter(ft => detail.feeBreakdown[ft.key]).map(ft => (
                  <div key={ft.key} className="cost-line">
                    <span className="cost-label">{ft.label}</span>
                    <span className="cost-value">{detail.feeBreakdown[ft.key]} €</span>
                  </div>
                ))}
                <div className="cost-line cost-total">
                  <span className="cost-label">TOTAL</span>
                  <span className="cost-value" style={{ color:"var(--tr)" }}>{detail.totalFees}</span>
                </div>
              </div>
            )}

            {!detail.feesSubmitted && (
              <button className="btn btn-primary btn-full" onClick={() => { setDetail(null); setFeeTarget(detail); }}>
                + Saisir les frais logistiques
              </button>
            )}
          </div>
        </div>
      )}

      {/* Fee entry modal */}
      {feeTarget && (
        <div className="modal-overlay" onClick={() => setFeeTarget(null)}>
          <div className="card" style={{ width:520, padding:30, maxHeight:"90vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
            <div style={{ marginBottom:22 }}>
              <div className="modal-icon" style={{ background:"var(--tr-light)", color:"var(--tr)" }}>🚢</div>
              <div className="modal-title">Frais logistiques</div>
              <div className="modal-desc">
                {feeTarget.product}<br />
                <span style={{ fontFamily:"var(--font-mono)", fontSize:12 }}>{feeTarget.origin} → {feeTarget.destination}</span>
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:20 }}>
              {feeTypes.map(ft => (
                <div key={ft.key} className="form-group">
                  <label className="form-label">
                    {ft.label} {ft.required && <span style={{ color:"var(--danger)" }}>*</span>}
                  </label>
                  <div style={{ position:"relative" }}>
                    <input
                      className="form-input"
                      placeholder="0.00"
                      style={{ paddingRight:36 }}
                      value={fees[ft.key]}
                      onChange={e => setFee(ft.key, e.target.value)}
                    />
                    <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", fontSize:12, color:"var(--text-soft)", fontFamily:"var(--font-mono)" }}>€</span>
                  </div>
                </div>
              ))}

              <div className="form-group">
                <label className="form-label">Notes & conditions</label>
                <textarea className="form-textarea" style={{ minHeight:60 }} placeholder="Conditions particulières, surcharges saisonnières, remarques…" value={notes} onChange={e=>setNotes(e.target.value)} />
              </div>
            </div>

            {/* Live total */}
            <div style={{ background:"var(--tr-light)", borderRadius:"var(--radius-sm)", padding:"14px 18px", marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:14, fontWeight:600, color:"var(--text-dark)" }}>Total frais logistiques</span>
              <span style={{ fontSize:20, fontFamily:"var(--font-mono)", fontWeight:700, color:"var(--tr)" }}>
                {total.toLocaleString("fr")} €
              </span>
            </div>

            <div style={{ display:"flex", gap:10 }}>
              <button className="btn btn-primary" style={{ flex:1 }} onClick={submitFees} disabled={total === 0}>
                Soumettre les frais
              </button>
              <button className="btn btn-ghost" onClick={() => setFeeTarget(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </TransportLayout>
  );
}