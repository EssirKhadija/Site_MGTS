import { useState } from "react";
import TransportLayout from "../../components/Transport/TransportLayout";

const allOperations = [
  { id:"SHP-2024-012", cmdId:"CMD-2024-008", product:"Profilés acier inox 316L",         mode:"air",  origin:"Shanghai, CN",    destination:"Paris CDG, FR",  status:"delivered", submittedDate:"05 Nov 2024", deliveredDate:"08 Nov 2024", total:"2 140 €", client:"InoxPro SAS",       fees:{ freight:1600, handling:180, insurance:120, customs_doc:80, fuel:0,  terminal:160, other:0  } },
  { id:"SHP-2024-011", cmdId:"CMD-2024-007", product:"Conteneurs stockage 200L",          mode:"sea",  origin:"Shenzhen, CN",    destination:"Le Havre, FR",   status:"delivered", submittedDate:"18 Oct 2024", deliveredDate:"02 Nov 2024", total:"1 485 €", client:"StockMax SA",       fees:{ freight:980,  handling:120, insurance:85,  customs_doc:60, fuel:95, terminal:145, other:0  } },
  { id:"SHP-2024-010", cmdId:"CMD-2024-006", product:"Emballages personnalisés kraft",    mode:"sea",  origin:"Yiwu, CN",        destination:"Lyon, FR",       status:"delivered", submittedDate:"22 Sep 2024", deliveredDate:"10 Oct 2024", total:"890 €",   client:"LogiPack SAS",      fees:{ freight:560,  handling:90,  insurance:45,  customs_doc:40, fuel:60, terminal:95,  other:0  } },
  { id:"SHP-2024-009", cmdId:"CMD-2024-005", product:"Boîtiers plastique ABS sur mesure", mode:"sea",  origin:"Ningbo, CN",      destination:"Bordeaux, FR",   status:"in_transit",submittedDate:"28 Oct 2024", deliveredDate:null,         total:"1 120 €", client:"LogiPack SAS",      fees:{ freight:720,  handling:100, insurance:65,  customs_doc:50, fuel:80, terminal:105, other:0  } },
  { id:"SHP-2024-008", cmdId:"CMD-2024-004", product:"Pièces mécaniques CNC aluminium",   mode:"road", origin:"Duisbourg, DE",   destination:"Marseille, FR",  status:"delivered", submittedDate:"10 Sep 2024", deliveredDate:"13 Sep 2024", total:"380 €",   client:"MetalPro France",   fees:{ freight:280,  handling:40,  insurance:30,  customs_doc:0,  fuel:30, terminal:0,   other:0  } },
  { id:"SHP-2024-007", cmdId:"CMD-2024-003", product:"Tissu non-tissé industriel",        mode:"sea",  origin:"Guangzhou, CN",   destination:"Marseille, FR",  status:"delivered", submittedDate:"01 Aoû 2024", deliveredDate:"28 Aoû 2024", total:"1 050 €", client:"TextileFrance SAS", fees:{ freight:680,  handling:110, insurance:70,  customs_doc:55, fuel:75, terminal:110, other:50 } },
];

const statusConfig = {
  delivered:  { label:"Livré",       color:"#009189", bg:"#E0F5F4" },
  in_transit: { label:"En transit",  color:"#0060A8", bg:"#E0EFFA" },
  at_port:    { label:"Au port",     color:"#FF6500", bg:"#FFF0E6" },
  customs:    { label:"En douane",   color:"#7C3AED", bg:"#F5F0FF" },
};

const modeIcon = { sea:"🚢", air:"✈️", road:"🚛", rail:"🚂" };

const feeLabels = {
  freight:"Fret",handling:"Manutention",insurance:"Assurance",
  customs_doc:"Docs douane",fuel:"Surcharge carburant",terminal:"THC",other:"Autres"
};

export default function OperationsHistory() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch]     = useState("");
  const [modeFilter, setModeFilter] = useState("Tous");

  const totalRevenue = allOperations.filter(o=>o.status==="delivered")
    .reduce((s,o)=>s+parseInt(o.total.replace(/\D/g,"")),0);

  const filtered = allOperations.filter(o => {
    const matchSearch = !search || o.id.toLowerCase().includes(search.toLowerCase()) || o.product.toLowerCase().includes(search.toLowerCase()) || o.client.toLowerCase().includes(search.toLowerCase());
    const matchMode   = modeFilter === "Tous" || o.mode === modeFilter;
    return matchSearch && matchMode;
  });

  if (selected) {
    const s = statusConfig[selected.status] ?? statusConfig.delivered;
    return (
      <div className="page-content">
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:28 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>← Retour</button>
          <div>
            <div className="mono" style={{ fontSize:11, color:"var(--text-soft)" }}>{selected.id} · {selected.cmdId}</div>
            <h1 style={{ fontSize:19, fontWeight:700, color:"var(--text-dark)" }}>{selected.product}</h1>
          </div>
          <div style={{ marginLeft:"auto" }}>
            <span className="badge" style={{ color:s.color, background:s.bg, fontSize:12, padding:"6px 14px" }}>
              <span className="badge-dot" style={{ background:s.color }} />{s.label}
            </span>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          {/* Shipment info */}
          <div className="card card-pad">
            <div className="form-label" style={{ marginBottom:16 }}>Détails de l'expédition</div>

            {/* Route */}
            <div style={{ background:"var(--tr-xlight)", borderRadius:10, padding:"14px 20px", marginBottom:18, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:10, color:"var(--text-soft)", marginBottom:4 }}>DÉPART</div>
                <div style={{ fontSize:13, fontWeight:700, color:"var(--text-dark)" }}>{selected.origin}</div>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:22 }}>{modeIcon[selected.mode]}</div>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:10, color:"var(--text-soft)", marginBottom:4 }}>DESTINATION</div>
                <div style={{ fontSize:13, fontWeight:700, color:"var(--text-dark)" }}>{selected.destination}</div>
              </div>
            </div>

            <div className="form-grid">
              {[
                ["Référence expédition", selected.id],
                ["Commande MGTS",        selected.cmdId],
                ["Client final",         selected.client],
                ["Mode transport",       modeIcon[selected.mode]+" "+selected.mode.charAt(0).toUpperCase()+selected.mode.slice(1)],
                ["Frais soumis le",      selected.submittedDate],
                ["Date livraison",       selected.deliveredDate ?? "En cours"],
              ].map(([k,v]) => (
                <div key={k}>
                  <div className="form-label" style={{ marginBottom:4 }}>{k}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:"var(--text-dark)" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Fee breakdown */}
          <div className="card card-pad">
            <div className="form-label" style={{ marginBottom:16 }}>Détail des frais logistiques</div>
            {Object.entries(selected.fees).filter(([,v])=>v>0).map(([k,v]) => (
              <div key={k} className="cost-line">
                <span className="cost-label">{feeLabels[k]??k}</span>
                <span className="cost-value">{v.toLocaleString("fr")} €</span>
              </div>
            ))}
            <div className="cost-line cost-total" style={{ marginTop:8 }}>
              <span className="cost-label">TOTAL</span>
              <span className="cost-value" style={{ fontSize:18, color:"var(--tr)" }}>{selected.total}</span>
            </div>

            <hr className="divider" />
            <button className="btn btn-ghost btn-sm">↓ Exporter en PDF</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TransportLayout>
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Historique des opérations</h1>
            <p>{allOperations.filter(o=>o.status==="delivered").length} expéditions livrées · {totalRevenue.toLocaleString("fr")} € de frais total</p>
          </div>
          <button className="btn btn-ghost">↓ Exporter CSV</button>
        </div>

      {/* Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
        {[
          { label:"Total opérations",  value:allOperations.length,                                      color:"var(--tr)",    bg:"var(--tr-light)"    },
          { label:"Livrées",           value:allOperations.filter(o=>o.status==="delivered").length,     color:"var(--teal)",  bg:"var(--teal-light)"  },
          { label:"En cours",          value:allOperations.filter(o=>o.status!=="delivered").length,     color:"var(--orange)",bg:"var(--orange-light)" },
          { label:"Chiffre total",     value:totalRevenue.toLocaleString("fr")+" €",                    color:"#7C3AED",      bg:"#F5F0FF"             },
        ].map((s,i)=>(
          <div key={i} className="card" style={{ padding:18 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:11, color:"var(--text-soft)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>{s.label}</div>
                <div style={{ fontSize:22, fontWeight:700, fontFamily:"var(--font-mono)", color:"var(--text-dark)" }}>{s.value}</div>
              </div>
              <div style={{ width:36, height:36, borderRadius:9, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:s.color }}>◆</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:12, marginBottom:20, alignItems:"center" }}>
        <div className="navbar-search" style={{ flex:1, maxWidth:340 }}>
          <span style={{ color:"var(--text-soft)" }}>⌕</span>
          <input placeholder="Rechercher par ID, produit, client…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {["Tous","sea","air","road"].map(m=>(
            <button key={m} onClick={()=>setModeFilter(m)} style={{ padding:"7px 16px", borderRadius:20, border:`1.5px solid ${modeFilter===m?"var(--tr)":"var(--border)"}`, background:modeFilter===m?"var(--tr-light)":"transparent", color:modeFilter===m?"var(--tr)":"var(--text-mid)", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"var(--font)", transition:"all .15s" }}>
              {m==="Tous"?"Tous":modeIcon[m]+" "+m.charAt(0).toUpperCase()+m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-header" style={{ gridTemplateColumns:"1fr 130px 140px 100px 90px 80px" }}>
          <span>Expédition</span><span>Mode</span><span>Statut</span><span>Client</span><span>Frais</span><span>Date</span>
        </div>
        {filtered.map(o=>{
          const s = statusConfig[o.status]??statusConfig.delivered;
          return (
            <div key={o.id} className="table-row" style={{ gridTemplateColumns:"1fr 130px 140px 100px 90px 80px" }} onClick={()=>setSelected(o)}>
              <div>
                <div className="row-id">{o.id} · {o.cmdId}</div>
                <div className="row-title">{o.product}</div>
                <div className="row-sub">{o.origin} → {o.destination}</div>
              </div>
              <div style={{ fontSize:13, color:"var(--text-mid)" }}>{modeIcon[o.mode]} {o.mode.charAt(0).toUpperCase()+o.mode.slice(1)}</div>
              <span className="badge" style={{ color:s.color, background:s.bg }}>
                <span className="badge-dot" style={{ background:s.color }} />{s.label}
              </span>
              <div style={{ fontSize:12, color:"var(--text-mid)" }}>{o.client}</div>
              <div className="row-amount" style={{ fontSize:12 }}>{o.total}</div>
              <div style={{ fontSize:11, color:"var(--text-soft)" }}>{o.submittedDate}</div>
            </div>
          );
        })}
      </div>
    </div>
    </TransportLayout>
  );
}