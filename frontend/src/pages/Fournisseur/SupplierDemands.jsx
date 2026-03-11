import { useState } from "react";
import DemandCard from "../../components/Fournisseur/DemandCard";
import SupplierLayout from "../../components/Fournisseur/SupplierLayout";
import "../../styles/Supplier.css";

const initialDemands = [
  { id:"DEM-2024-018", title:"Pièces mécaniques usinées CNC",      description:"Besoin de 200 pièces usinées en aluminium 6061, tolérance ±0.05 mm, finition anodisée noire, avec taraudages M6.", qty:"200", budget:"8 000 €", dimensions:"80×40×20 mm", matiere:"Alu 6061", incoterm:"FOB", urgency:"high",   state:"new",      client:"Dupont Industries", date:"14 Nov 2024", images:["img1.jpg"], pdf:true  },
  { id:"DEM-2024-017", title:"Emballages kraft personnalisés",      description:"Boîtes kraft 300g, impression 4 couleurs recto/verso, vernis mat, dimensions variables selon SKU.", qty:"5000", budget:"3 500 €", dimensions:"Variable", matiere:"Kraft 300g", incoterm:"CIF", urgency:"medium", state:"quoted",   client:"LogiPack SAS",     date:"12 Nov 2024", images:[],          pdf:false },
  { id:"DEM-2024-016", title:"Conteneurs acier galvanisé 500L",    description:"Conteneurs de grande capacité, couvercle amovible, 2 poignées latérales, revêtement époxy bleu RAL 5010.", qty:"30",   budget:"15 000 €",dimensions:"120×80×70 cm", matiere:"Acier galv.", incoterm:"FOB", urgency:"low",    state:"accepted", client:"StockMax SA",      date:"08 Nov 2024", images:["img1.jpg","img2.jpg"], pdf:true },
  { id:"DEM-2024-015", title:"Profilés inox 316L — découpe laser",  description:"Profilés sur mesure en inox 316L, découpe laser au 1/10 mm, livraison en longueurs de 2m.", qty:"500",  budget:"6 200 €", dimensions:"2000 mm", matiere:"Inox 316L", incoterm:"EXW", urgency:"medium", state:"new",      client:"MetalPro France",  date:"05 Nov 2024", images:[],          pdf:true  },
];

const stateFilters = ["Tous","Nouveau","Devis soumis","Accepté","Refusé"];
const stateMap     = { new:"Nouveau", quoted:"Devis soumis", accepted:"Accepté", rejected:"Refusé" };

export default function SupplierDemands() {
  const [demands, setDemands]     = useState(initialDemands);
  const [filter, setFilter]       = useState("Tous");
  const [quoteTarget, setQuoteTarget] = useState(null);
  const [detail, setDetail]       = useState(null);
  const [quoteForm, setQuoteForm] = useState({ cost:"", leadTime:"", notes:"", validity:"30" });

  const setQ = (k, v) => setQuoteForm((f) => ({ ...f, [k]: v }));

  const submitQuote = () => {
    if (!quoteForm.cost.trim()) return;
    setDemands((d) => d.map((x) => x.id === quoteTarget.id ? { ...x, state: "quoted", submittedCost: quoteForm.cost, leadTime: quoteForm.leadTime } : x));
    setQuoteTarget(null);
    setQuoteForm({ cost:"", leadTime:"", notes:"", validity:"30" });
  };

  const filtered = demands.filter((d) => {
    if (filter === "Tous") return true;
    return stateMap[d.state] === filter;
  });

  return (
    <SupplierLayout>
      <div className="page-header">
        <div>
          <h1>Demandes clients</h1>
          <p>{demands.filter(d => d.state === "new").length} nouvelles demandes à traiter.</p>
        </div>
      </div>

      {/* Alert for new demands */}
      {demands.filter(d => d.state === "new").length > 0 && (
        <div className="pending-banner">
          <div className="pending-banner-icon">✦</div>
          <div>
            <div className="pending-banner-title">
              {demands.filter(d => d.state === "new").length} demande(s) en attente de votre coût de fabrication
            </div>
            <div className="pending-banner-text">
              Soumettez vos coûts pour que l'équipe MGTS puisse établir les devis clients.
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {stateFilters.map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 18px", borderRadius: 20, border: `1.5px solid ${filter===f?"var(--orange)":"var(--border)"}`, background: filter===f?"var(--orange-light)":"transparent", color: filter===f?"var(--orange)":"var(--text-mid)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font)", transition: "all .15s" }}>
            {f}
            {f === "Nouveau" && <span style={{ marginLeft: 6, background: "var(--orange)", color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 8 }}>{demands.filter(d=>d.state==="new").length}</span>}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid-2">
        {filtered.map((d) => (
          <DemandCard
            key={d.id}
            demand={d}
            onQuote={(d) => { setQuoteTarget(d); setQuoteForm({ cost:"", leadTime:"", notes:"", validity:"30" }); }}
            onView={setDetail}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-soft)" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>◈</div>
          <p>Aucune demande dans cette catégorie.</p>
        </div>
      )}

      {/* Detail panel */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="card" style={{ width: 580, padding: 30, maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div className="mono" style={{ fontSize: 11, color: "var(--text-soft)", marginBottom: 4 }}>{detail.id}</div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-dark)" }}>{detail.title}</h2>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setDetail(null)}>✕ Fermer</button>
            </div>

            <div style={{ background: "var(--bg)", borderRadius: "var(--radius-sm)", padding: 16, marginBottom: 18 }}>
              <div className="form-label" style={{ marginBottom: 8 }}>Description client</div>
              <p style={{ fontSize: 13, color: "var(--text-dark)", lineHeight: 1.6 }}>{detail.description}</p>
            </div>

            <div className="form-grid" style={{ marginBottom: 18 }}>
              {[["Quantité",detail.qty+" unités"],["Budget max",detail.budget],["Dimensions",detail.dimensions],["Matière",detail.matiere],["Incoterm",detail.incoterm],["Client",detail.client],["Date",detail.date]].filter(([,v])=>v).map(([k,v])=>(
                <div key={k}>
                  <div className="form-label" style={{ marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)" }}>{v}</div>
                </div>
              ))}
            </div>

            {(detail.images?.length > 0 || detail.pdf) && (
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                {detail.images?.length > 0 && <button className="btn btn-ghost btn-sm">🖼 Voir {detail.images.length} photo(s)</button>}
                {detail.pdf && <button className="btn btn-ghost btn-sm">📄 Télécharger le PDF</button>}
              </div>
            )}

            {detail.state === "new" && (
              <div style={{ paddingTop: 16, borderTop: "1px solid var(--border-soft)" }}>
                <button className="btn btn-orange btn-full" onClick={() => { setDetail(null); setQuoteTarget(detail); }}>
                  ✦ Soumettre mon coût de fabrication
                </button>
              </div>
            )}

            {detail.state === "quoted" && (
              <div style={{ background: "var(--teal-light)", borderRadius: "var(--radius-sm)", padding: 14, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>✓</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--teal)" }}>Coût soumis : {detail.submittedCost}</div>
                  <div style={{ fontSize: 12, color: "var(--text-mid)" }}>En attente de validation MGTS</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quote modal */}
      {quoteTarget && (
        <div className="modal-overlay" onClick={() => setQuoteTarget(null)}>
          <div className="card" style={{ width: 500, padding: 30 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ marginBottom: 20 }}>
              <div className="modal-icon" style={{ background: "var(--orange-light)", color: "var(--orange)" }}>✦</div>
              <div className="modal-title">Soumettre votre coût</div>
              <div className="modal-desc">{quoteTarget.title} · {quoteTarget.qty} unités</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 22 }}>
              <div className="form-group">
                <label className="form-label">Coût de fabrication total (€) *</label>
                <input className="form-input" placeholder="Ex : 7 200" value={quoteForm.cost} onChange={(e) => setQ("cost", e.target.value)} />
                <span style={{ fontSize: 11, color: "var(--text-soft)" }}>Prix usine hors transport — MGTS ajoutera les frais logistiques et sa marge.</span>
              </div>

              <div className="form-group">
                <label className="form-label">Délai de fabrication</label>
                <input className="form-input" placeholder="Ex : 30 jours" value={quoteForm.leadTime} onChange={(e) => setQ("leadTime", e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Validité de l'offre (jours)</label>
                <select className="form-select" value={quoteForm.validity} onChange={(e) => setQ("validity", e.target.value)}>
                  {["15","30","45","60"].map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Notes & conditions</label>
                <textarea className="form-textarea" style={{ minHeight: 70 }} placeholder="Conditions particulières, options disponibles, contraintes techniques…" value={quoteForm.notes} onChange={(e) => setQ("notes", e.target.value)} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-orange" style={{ flex: 1 }} onClick={submitQuote}>Envoyer le coût</button>
              <button className="btn btn-ghost" onClick={() => setQuoteTarget(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </SupplierLayout>
  );
}