import { useState } from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import "../../styles/Admin.css";

const payments = [
  { id:"PAY-2024-031", cmd:"CMD-2024-028", type:"client",       party:"InoxPro SAS",           amount:"12 800 €", commission:"1 280 €", status:"payé",      date:"10 Nov 2024", method:"Virement SEPA" },
  { id:"PAY-2024-030", cmd:"CMD-2024-027", type:"client",       party:"StockMax SA",           amount:"4 200 €",  commission:"420 €",   status:"payé",      date:"08 Nov 2024", method:"Virement SEPA" },
  { id:"PAY-2024-029", cmd:"CMD-2024-026", type:"fournisseur",  party:"Shenzhen MetalTech",    amount:"3 400 €",  commission:"—",       status:"payé",      date:"06 Nov 2024", method:"Swift" },
  { id:"PAY-2024-028", cmd:"CMD-2024-028", type:"fournisseur",  party:"Shanghai Steel Ltd.",   amount:"10 200 €", commission:"—",       status:"payé",      date:"05 Nov 2024", method:"Swift" },
  { id:"PAY-2024-027", cmd:"CMD-2024-028", type:"transporteur", party:"Air France Cargo",      amount:"2 140 €",  commission:"—",       status:"payé",      date:"04 Nov 2024", method:"Virement SEPA" },
  { id:"PAY-2024-026", cmd:"CMD-2024-028", type:"transitaire",  party:"Geodis FF France",      amount:"3 208 €",  commission:"—",       status:"payé",      date:"03 Nov 2024", method:"Virement SEPA" },
  { id:"PAY-2024-025", cmd:"CMD-2024-031", type:"client",       party:"Dupont Industries",     amount:"21 500 €", commission:"2 150 €", status:"en_attente",date:"—",           method:"Virement SEPA" },
  { id:"PAY-2024-024", cmd:"CMD-2024-030", type:"client",       party:"MetalPro France",       amount:"8 200 €",  commission:"820 €",   status:"en_attente",date:"—",           method:"Virement SEPA" },
  { id:"PAY-2024-023", cmd:"CMD-2024-029", type:"client",       party:"LogiPack SAS",          amount:"6 400 €",  commission:"640 €",   status:"en_attente",date:"—",           method:"Virement SEPA" },
];

const statusCfg = {
  payé:       { label:"Payé",        color:"var(--green)",  bg:"var(--green-light)"  },
  en_attente: { label:"En attente",  color:"var(--yellow)", bg:"var(--yellow-light)" },
  litige:     { label:"Litige",      color:"var(--red)",    bg:"var(--red-light)"    },
};

const typeCfg = {
  client:       { label:"Client",       color:"var(--teal)",   bg:"var(--teal-light)"   },
  fournisseur:  { label:"Fournisseur",  color:"var(--orange)", bg:"var(--orange-light)" },
  transporteur: { label:"Transporteur", color:"var(--blue)",   bg:"var(--blue-light)"   },
  transitaire:  { label:"Transitaire",  color:"var(--purple)", bg:"var(--purple-light)" },
};

export default function PaymentsCommissions() {
  const [filter, setFilter] = useState("Tous");

  const totalReceived   = payments.filter(p => p.status === "payé" && p.type === "client").reduce((s,p)=>s+parseInt(p.amount.replace(/\D/g,"")),0);
  const totalPending    = payments.filter(p => p.status === "en_attente").reduce((s,p)=>s+parseInt(p.amount.replace(/\D/g,"")),0);
  const totalCommission = payments.filter(p => p.commission !== "—").reduce((s,p)=>s+parseInt(p.commission.replace(/\D/g,"")),0);

  const filtered = filter === "Tous" ? payments : payments.filter(p => p.type === filter || p.status === filter);

  return (
    <AdminLayout>
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Paiements & commissions</h1>
          <p>Suivi financier complet de toutes les transactions.</p>
        </div>
        </div>
        <button className="btn btn-ghost btn-sm">↓ Exporter</button>
      </div>

      {/* KPIs */}
      <div className="grid-4" style={{ marginBottom:20 }}>
        {[
          { label:"CA Encaissé (mois)",    value:totalReceived.toLocaleString("fr")+" €",  type:"teal",   icon:"▲" },
          { label:"En attente encaissement",value:totalPending.toLocaleString("fr")+" €",  type:"yellow", icon:"⏳" },
          { label:"Commissions MGTS",       value:totalCommission.toLocaleString("fr")+" €",type:"green",  icon:"%" },
          { label:"Taux commission moyen",  value:"10%",                                    type:"purple", icon:"◈" },
        ].map((s,i)=>(
          <div key={i} className={`card stat-card stat-${s.type}`}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize:22 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Commission chart */}
      <div className="card card-pad" style={{ marginBottom:20 }}>
        <div style={{ fontSize:10, fontWeight:700, color:"var(--text-soft)", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:18, fontFamily:"var(--font-mono)" }}>Commissions par commande</div>
        <div style={{ display:"flex", gap:16, alignItems:"flex-end", height:80 }}>
          {payments.filter(p=>p.commission!=="—").map((p,i)=>{
            const val = parseInt(p.commission.replace(/\D/g,""));
            const max = 2150;
            const h   = Math.round(val/max*70);
            return (
              <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5, flex:1 }}>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"var(--teal)" }}>{p.commission}</div>
                <div style={{ width:"100%", height:h, background:"var(--teal)", borderRadius:"3px 3px 0 0", opacity:p.status==="payé"?1:.4 }} />
                <div style={{ fontFamily:"var(--font-mono)", fontSize:8, color:"var(--text-soft)", textAlign:"center" }}>{p.cmd.replace("CMD-2024-","")}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
        {["Tous","client","fournisseur","transporteur","transitaire","payé","en_attente"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{ padding:"5px 12px", borderRadius:"var(--radius-sm)", border:`1px solid ${filter===f?"var(--teal)":"var(--border-mid)"}`, background:filter===f?"var(--teal-light)":"transparent", color:filter===f?"var(--teal)":"var(--text-soft)", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"var(--font)", transition:"all .15s", textTransform:"capitalize" }}>
            {f==="Tous"?"Tous":typeCfg[f]?.label||statusCfg[f]?.label||f}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-header" style={{ gridTemplateColumns:"100px 100px 110px 1fr 110px 100px 90px 100px" }}>
          <span>Paiement</span><span>Commande</span><span>Type</span><span>Partie</span><span>Montant</span><span>Commission</span><span>Statut</span><span>Date</span>
        </div>
        {filtered.map(p=>{
          const s = statusCfg[p.status];
          const t = typeCfg[p.type];
          return (
            <div key={p.id} className="table-row" style={{ gridTemplateColumns:"100px 100px 110px 1fr 110px 100px 90px 100px" }}>
              <div className="mono" style={{ fontSize:10, color:"var(--text-soft)" }}>{p.id}</div>
              <div className="mono" style={{ fontSize:10, color:"var(--text-soft)" }}>{p.cmd.replace("CMD-2024-","#")}</div>
              <span className="badge" style={{ color:t.color, background:t.bg }}>{t.label}</span>
              <div style={{ fontSize:12, color:"var(--text-mid)" }}>{p.party}</div>
              <div className="row-amount" style={{ fontSize:13 }}>{p.amount}</div>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:12, color:"var(--teal)", fontWeight:700 }}>{p.commission}</div>
              <span className="badge" style={{ color:s.color, background:s.bg }}>{s.label}</span>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--text-soft)" }}>{p.date}</div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}