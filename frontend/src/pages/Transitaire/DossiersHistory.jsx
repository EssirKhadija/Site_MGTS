import { useState } from "react";

const history = [
  { id:"DOS-2024-028", product:"Emballages personnalisés kraft",    hsCode:"4819.10", regime:"Mise en libre pratique", mode:"sea", origin:"Yiwu, CN",       destination:"Lyon, FR",       client:"LogiPack SAS",     date:"10 Nov 2024", fees:"1 483 €", status:"completed" },
  { id:"DOS-2024-027", product:"Profilés acier inox 316L",          hsCode:"7222.20", regime:"Mise en libre pratique", mode:"air", origin:"Shanghai, CN",    destination:"Paris CDG, FR",  client:"InoxPro SAS",      date:"05 Nov 2024", fees:"3 208 €", status:"completed" },
  { id:"DOS-2024-026", product:"Tissu non-tissé industriel",        hsCode:"5603.11", regime:"Mise en libre pratique", mode:"sea", origin:"Guangzhou, CN",   destination:"Marseille, FR",  client:"TextileFrance SAS",date:"28 Oct 2024", fees:"2 560 €", status:"completed" },
  { id:"DOS-2024-025", product:"Conteneurs de stockage 200L",       hsCode:"7309.00", regime:"Mise en libre pratique", mode:"sea", origin:"Shenzhen, CN",    destination:"Le Havre, FR",   client:"StockMax SA",      date:"15 Oct 2024", fees:"1 940 €", status:"completed" },
  { id:"DOS-2024-024", product:"Pièces mécaniques acier inox",      hsCode:"8466.93", regime:"Entrepôt douanier",      mode:"sea", origin:"Ningbo, CN",      destination:"Bordeaux, FR",   client:"MetalPro France",  date:"02 Oct 2024", fees:"2 120 €", status:"completed" },
  { id:"DOS-2024-023", product:"Boîtiers électroniques PCB",        hsCode:"8534.00", regime:"Mise en libre pratique", mode:"air", origin:"Shenzhen, CN",    destination:"Paris CDG, FR",  client:"TechElec SAS",     date:"18 Sep 2024", fees:"890 €",  status:"completed" },
];

const modeIcon = { sea:"🚢", air:"✈️", road:"🚛" };

export default function DossiersHistory() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch]     = useState("");
  const [modeFilter, setModeFilter] = useState("Tous");

  const totalFees = history.reduce((s, h) => s + parseInt(h.fees.replace(/\D/g, "")), 0);

  const filtered = history.filter(h => {
    const matchSearch = !search || h.id.toLowerCase().includes(search.toLowerCase()) || h.product.toLowerCase().includes(search.toLowerCase()) || h.client.toLowerCase().includes(search.toLowerCase());
    const matchMode   = modeFilter === "Tous" || h.mode === modeFilter;
    return matchSearch && matchMode;
  });

  if (selected) {
    return (
      <div className="page-content">
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:28 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>← Retour</button>
          <div>
            <div className="mono" style={{ fontSize:11, color:"var(--text-soft)" }}>{selected.id}</div>
            <h1 style={{ fontSize:19, fontWeight:700, color:"var(--text-dark)" }}>{selected.product}</h1>
          </div>
          <div style={{ marginLeft:"auto" }}>
            <span className="badge" style={{ color:"var(--teal)", background:"var(--teal-light)", fontSize:12, padding:"6px 14px" }}>✓ Clôturé</span>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <div className="card card-pad">
            <div className="form-label" style={{ marginBottom:16 }}>Informations du dossier</div>
            <div style={{ background:"var(--ac-xlight)", borderRadius:10, padding:"14px 20px", marginBottom:18, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:10, color:"var(--text-soft)", marginBottom:4 }}>ORIGINE</div>
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
              {[["Client",selected.client],["Code SH",selected.hsCode],["Régime douanier",selected.regime],["Mode transport",modeIcon[selected.mode]+" "+selected.mode],["Date clôture",selected.date],["Frais soumis",selected.fees]].map(([k,v])=>(
                <div key={k}>
                  <div className="form-label" style={{ marginBottom:4 }}>{k}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:"var(--text-dark)" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card card-pad">
            <div className="form-label" style={{ marginBottom:16 }}>Validation de l'importation</div>
            {["Facture commerciale conforme","Packing list vérifiée","Connaissement validé","Certificat d'origine vérifié","Code SH confirmé","Valeur en douane vérifiée","Restrictions vérifiées","Conformité CE/UE validée"].map((item, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:"var(--teal-light)", borderRadius:"var(--radius-sm)", border:"1px solid var(--teal)", marginBottom:8 }}>
                <div style={{ width:20, height:20, borderRadius:"50%", background:"var(--teal)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ color:"#fff", fontSize:10, fontWeight:700 }}>✓</span>
                </div>
                <span style={{ fontSize:12, fontWeight:500, color:"var(--teal-dark)" }}>{item}</span>
              </div>
            ))}
            <hr className="divider" />
            <button className="btn btn-ghost btn-sm">↓ Télécharger le dossier complet</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Historique des dossiers</h1>
          <p>{history.length} dossiers traités · {totalFees.toLocaleString("fr")} € de frais total</p>
        </div>
        <button className="btn btn-ghost">↓ Exporter CSV</button>
      </div>

      {/* Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
        {[
          { label:"Dossiers traités",  value:history.length,                                   color:"var(--ac)",    bg:"var(--ac-light)"    },
          { label:"Fret maritime",     value:history.filter(h=>h.mode==="sea").length,          color:"var(--teal)",  bg:"var(--teal-light)"  },
          { label:"Fret aérien",       value:history.filter(h=>h.mode==="air").length,          color:"var(--orange)",bg:"var(--orange-light)" },
          { label:"Frais total",       value:totalFees.toLocaleString("fr")+" €",               color:"#F5A623",      bg:"#FEF6E8"             },
        ].map((s,i)=>(
          <div key={i} className="card" style={{ padding:18 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:11, color:"var(--text-soft)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>{s.label}</div>
                <div style={{ fontSize:22, fontWeight:700, fontFamily:"var(--font-mono)", color:"var(--text-dark)" }}>{s.value}</div>
              </div>
              <div style={{ width:36, height:36, borderRadius:9, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:s.color }}>✦</div>
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
            <button key={m} onClick={()=>setModeFilter(m)} style={{ padding:"7px 16px", borderRadius:20, border:`1.5px solid ${modeFilter===m?"var(--ac)":"var(--border)"}`, background:modeFilter===m?"var(--ac-light)":"transparent", color:modeFilter===m?"var(--ac)":"var(--text-mid)", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"var(--font)", transition:"all .15s" }}>
              {m==="Tous"?"Tous":modeIcon[m]+" "+m.charAt(0).toUpperCase()+m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="table-header" style={{ gridTemplateColumns:"1fr 100px 120px 120px 80px 90px" }}>
          <span>Dossier</span><span>Code SH</span><span>Client</span><span>Régime</span><span>Frais</span><span>Date</span>
        </div>
        {filtered.map(h => (
          <div key={h.id} className="table-row" style={{ gridTemplateColumns:"1fr 100px 120px 120px 80px 90px" }} onClick={() => setSelected(h)}>
            <div>
              <div className="row-id">{h.id}</div>
              <div className="row-title">{h.product}</div>
              <div className="row-sub">{modeIcon[h.mode]} {h.origin} → {h.destination}</div>
            </div>
            <div className="mono" style={{ fontSize:12, color:"var(--text-mid)" }}>{h.hsCode}</div>
            <div style={{ fontSize:12, color:"var(--text-mid)" }}>{h.client}</div>
            <div style={{ fontSize:11, color:"var(--text-soft)" }}>{h.regime}</div>
            <div className="row-amount" style={{ fontSize:12 }}>{h.fees}</div>
            <div style={{ fontSize:11, color:"var(--text-soft)" }}>{h.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}