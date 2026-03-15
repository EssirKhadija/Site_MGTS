import { useState } from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import "../../styles/Admin.css";

const orders = [
  { id:"CMD-2024-031", client:"Dupont Industries", supplier:"Shenzhen MetalTech Co.", transport:"CMA CGM Logistics", transitaire:"Geodis FF", product:"Conteneurs stockage 200L", amount:"21 500 €", commission:"2 150 €", status:"en_production", origin:"Shenzhen, CN", dest:"Le Havre, FR", date:"14 Nov 2024", etd:"18 Nov 2024", eta:"10 Déc 2024", incoterm:"FOB", supplierCost:"18 000 €", transportFees:"1 485 €", customsFees:"—", mode:"sea" },
  { id:"CMD-2024-030", client:"MetalPro France",   supplier:"Guangzhou Precision",     transport:"CMA CGM Logistics", transitaire:"Geodis FF", product:"Pièces mécaniques CNC", amount:"8 200 €", commission:"820 €", status:"en_transit",    origin:"Guangzhou, CN",dest:"Marseille, FR",date:"12 Nov 2024", etd:"22 Nov 2024", eta:"18 Déc 2024", incoterm:"CIF", supplierCost:"6 900 €", transportFees:"780 €",  customsFees:"1 240 €", mode:"sea" },
  { id:"CMD-2024-029", client:"LogiPack SAS",      supplier:"Ningbo PlasticTech",      transport:"CMA CGM Logistics", transitaire:"Geodis FF", product:"Boîtiers plastique ABS", amount:"6 400 €", commission:"640 €", status:"en_douane",    origin:"Ningbo, CN",  dest:"Bordeaux, FR",date:"10 Nov 2024", etd:"25 Nov 2024", eta:"22 Déc 2024", incoterm:"FOB", supplierCost:"5 300 €", transportFees:"1 120 €","customsFees":"—", mode:"sea" },
  { id:"CMD-2024-028", client:"InoxPro SAS",       supplier:"Shanghai Steel Ltd.",     transport:"Air France Cargo",  transitaire:"Geodis FF", product:"Profilés acier inox 316L",amount:"12 800 €",commission:"1 280 €",status:"livré",        origin:"Shanghai, CN",dest:"Paris CDG, FR",date:"08 Nov 2024", etd:"20 Nov 2024", eta:"23 Nov 2024", incoterm:"EXW", supplierCost:"10 200 €",transportFees:"2 140 €",customsFees:"3 208 €",mode:"air"},
  { id:"CMD-2024-027", client:"StockMax SA",       supplier:"Shenzhen MetalTech Co.", transport:"CMA CGM Logistics", transitaire:"Geodis FF", product:"Conteneurs stockage 500L",amount:"4 200 €", commission:"420 €", status:"livré",        origin:"Shenzhen, CN",dest:"Lyon, FR",    date:"05 Nov 2024", etd:"10 Nov 2024", eta:"02 Déc 2024", incoterm:"CIF", supplierCost:"3 400 €", transportFees:"560 €",  customsFees:"890 €",   mode:"sea"},
];

const statusConfig = {
  en_attente:    { label:"En attente",    color:"var(--yellow)", bg:"var(--yellow-light)" },
  en_production: { label:"En production", color:"var(--orange)", bg:"var(--orange-light)" },
  en_transit:    { label:"En transit",    color:"var(--blue)",   bg:"var(--blue-light)"   },
  en_douane:     { label:"En douane",     color:"var(--purple)", bg:"var(--purple-light)" },
  livré:         { label:"Livré",         color:"var(--green)",  bg:"var(--green-light)"  },
  annulé:        { label:"Annulé",        color:"var(--red)",    bg:"var(--red-light)"    },
};

const steps = ["Demande","Analyse","Devis","Validation","Production","Transit","Douane","Livraison"];
const stepStatus = { en_attente:1, en_production:4, en_transit:5, en_douane:6, livré:7 };

export default function OrdersSupervision() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState("Tous");
  const [search, setSearch]     = useState("");

  const filtered = orders.filter(o => {
    const matchFilter = filter === "Tous" || o.status === filter;
    const matchSearch = !search || o.id.toLowerCase().includes(search.toLowerCase()) || o.client.toLowerCase().includes(search.toLowerCase()) || o.product.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalCA = orders.reduce((s,o) => s + parseInt(o.amount.replace(/\D/g,"")),0);
  const totalCommission = orders.reduce((s,o) => s + parseInt(o.commission.replace(/\D/g,"")),0);

  if (selected) {
    const s = statusConfig[selected.status];
    const curStep = stepStatus[selected.status] ?? 0;
    return (
      <AdminLayout>
        <div className="page-content">
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:24 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>← Retour</button>
          <div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--text-soft)" }}>{selected.id}</div>
            <h1 style={{ fontSize:20, fontWeight:800, color:"var(--text)", marginTop:2 }}>{selected.product}</h1>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", gap:8, alignItems:"center" }}>
            <span className="badge" style={{ color:s.color, background:s.bg, fontSize:11, padding:"5px 12px" }}>
              <span className="badge-dot pulse" style={{ background:s.color }} />{s.label}
            </span>
          </div>
        </div>

        {/* Stepper */}
        <div className="card card-pad" style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:700, color:"var(--text-soft)", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:18, fontFamily:"var(--font-mono)" }}>Cycle de vie</div>
          <div style={{ display:"flex", alignItems:"center" }}>
            {steps.map((step, i) => {
              const done    = i < curStep;
              const current = i === curStep;
              return (
                <div key={step} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", width:"100%" }}>
                    {i>0 && <div style={{ flex:1, height:2, background: done?"var(--teal)":"var(--bg-4)" }} />}
                    <div style={{ width:26, height:26, borderRadius:"50%", background:current?"var(--teal)":done?"var(--teal)":"var(--bg-4)", border:`2px solid ${current?"var(--teal)":done?"var(--teal)":"var(--bg-3)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:current||done?"#fff":"var(--text-soft)", flexShrink:0, boxShadow:current?"0 0 12px var(--teal-glow)":"none", animation:current?"glow 2s infinite":"none" }}>
                      {done?"✓":i+1}
                    </div>
                    {i<steps.length-1 && <div style={{ flex:1, height:2, background:done?"var(--teal)":"var(--bg-4)" }} />}
                  </div>
                  <div style={{ fontSize:9, marginTop:7, color:current?"var(--teal)":done?"var(--teal)":"var(--text-soft)", fontWeight:current?700:400, textAlign:"center", fontFamily:"var(--font-mono)", letterSpacing:".3px" }}>{step}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          {/* Parties */}
          <div className="card card-pad">
            <div style={{ fontSize:10, fontWeight:700, color:"var(--text-soft)", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:16, fontFamily:"var(--font-mono)" }}>Intervenants</div>
            {[
              { role:"Client",       value:selected.client,      color:"var(--teal)"   },
              { role:"Fournisseur",  value:selected.supplier,    color:"var(--orange)" },
              { role:"Transporteur", value:selected.transport,   color:"var(--blue)"   },
              { role:"Transitaire",  value:selected.transitaire, color:"var(--purple)" },
            ].map(p => (
              <div key={p.role} style={{ display:"flex", gap:12, padding:"10px 0", borderBottom:"1px solid var(--border-soft)", alignItems:"center" }}>
                <div style={{ width:6, height:6, borderRadius:2, background:p.color, flexShrink:0 }} />
                <div style={{ width:90, fontSize:10, color:"var(--text-soft)", textTransform:"uppercase", letterSpacing:"1px", fontFamily:"var(--font-mono)" }}>{p.role}</div>
                <div style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>{p.value}</div>
              </div>
            ))}
          </div>

          {/* Financials */}
          <div className="card card-pad">
            <div style={{ fontSize:10, fontWeight:700, color:"var(--text-soft)", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:16, fontFamily:"var(--font-mono)" }}>Récapitulatif financier</div>
            {[
              ["Coût fournisseur",  selected.supplierCost,  "var(--text-mid)"],
              ["Frais transport",   selected.transportFees, "var(--text-mid)"],
              ["Frais douaniers",   selected.customsFees,   "var(--text-mid)"],
              ["Montant total",     selected.amount,        "var(--text)"],
              ["Commission MGTS",   selected.commission,    "var(--teal)"],
            ].map(([k,v,color]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid var(--border-soft)" }}>
                <span style={{ fontSize:12, color:"var(--text-soft)" }}>{k}</span>
                <span style={{ fontFamily:"var(--font-mono)", fontSize:13, fontWeight:700, color }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
  }

  return (
    <AdminLayout>
      <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Supervision commandes</h1>
          <p>Cycle complet · {orders.length} commandes · CA : {totalCA.toLocaleString("fr")} € · Commissions : {totalCommission.toLocaleString("fr")} €</p>
        </div>
        <button className="btn btn-ghost btn-sm">↓ Export</button>
      </div>

      {/* Mini stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:20 }}>
        {Object.entries(statusConfig).map(([key,cfg]) => (
          <div key={key} onClick={() => setFilter(filter===key?"Tous":key)} className="card" style={{ padding:"12px 16px", cursor:"pointer", borderColor: filter===key ? cfg.color : "var(--border)", background: filter===key ? cfg.bg : "var(--bg-2)", transition:"all .15s" }}>
            <div style={{ fontSize:9, color:cfg.color, textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--font-mono)", marginBottom:5 }}>{cfg.label}</div>
            <div style={{ fontSize:22, fontFamily:"var(--font-mono)", fontWeight:400, color:"var(--text)" }}>{orders.filter(o=>o.status===key).length}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom:16 }}>
        <div className="navbar-search" style={{ width:300 }}>
          <span style={{ color:"var(--text-soft)" }}>⌕</span>
          <input placeholder="ID, client, produit…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        <div className="table-header" style={{ gridTemplateColumns:"100px 1fr 160px 120px 100px 100px 110px" }}>
          <span>ID</span><span>Produit / Client</span><span>Fournisseur</span><span>Montant</span><span>Commission</span><span>Statut</span><span>ETA</span>
        </div>
        {filtered.map(o => {
          const s = statusConfig[o.status];
          return (
            <div key={o.id} className="table-row" style={{ gridTemplateColumns:"100px 1fr 160px 120px 100px 110px 100px" }} onClick={() => setSelected(o)}>
              <div className="mono" style={{ fontSize:10, color:"var(--text-soft)" }}>{o.id}</div>
              <div>
                <div className="row-title">{o.product}</div>
                <div className="row-sub">{o.client} · {o.origin} → {o.dest}</div>
              </div>
              <div style={{ fontSize:11, color:"var(--text-mid)" }}>{o.supplier}</div>
              <div className="row-amount">{o.amount}</div>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:12, color:"var(--teal)", fontWeight:700 }}>{o.commission}</div>
              <span className="badge" style={{ color:s.color, background:s.bg }}>
                <span className="badge-dot" style={{ background:s.color }} />{s.label}
              </span>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--text-soft)" }}>{o.eta}</div>
            </div>
          );
        })}
      </div>
    </div>
    </AdminLayout>
  );
}