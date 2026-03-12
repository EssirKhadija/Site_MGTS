import { useState } from "react";
import SupplierLayout from "../../components/Fournisseur/SupplierLayout";
import "../../styles/Supplier.css";

const statusConfig = {
  en_attente:    { label:"En attente",    color:"#F5A623", bg:"#FEF6E8" },
  confirmé:      { label:"Confirmé",      color:"#009189", bg:"#E0F5F4" },
  en_production: { label:"En production", color:"#FF6500", bg:"#FFF0E6" },
  expédié:       { label:"Expédié",       color:"#0077A8", bg:"#E0F1FA" },
  livré:         { label:"Livré",         color:"#007770", bg:"#D5F0EE" },
  annulé:        { label:"Annulé",        color:"#CC3A00", bg:"#FFE8DC" },
};

const steps = [
  { key:"confirmé",      label:"Confirmation" },
  { key:"en_production", label:"Production"   },
  { key:"expédié",       label:"Expédition"   },
  { key:"livré",         label:"Livraison"    },
];
const stepOrder = steps.map(s=>s.key);

const orders = [
  { id:"CMD-2024-002", product:"Pièces mécaniques sur mesure", status:"en_production", client:"Jean Dupont / Dupont Industries", date:"28 Oct 2024", deliveryDate:"20 Nov 2024", qty:200, amount:"8 200 €", incoterm:"FOB Shanghai", notes:"Tolérance ±0.05mm, finition anodisée noire" },
  { id:"CMD-2024-003", product:"Emballages personnalisés",     status:"livré",         client:"LogiPack SAS",                    date:"10 Sep 2024", deliveryDate:"05 Oct 2024", qty:1000,amount:"3 400 €", incoterm:"FOB Yiwu",   notes:"Impression 4 couleurs, vernis mat" },
  { id:"CMD-2024-001", product:"Conteneurs stockage 200L",     status:"livré",         client:"StockMax SA",                     date:"15 Aoû 2024", deliveryDate:"28 Aoû 2024", qty:50,  amount:"4 750 €", incoterm:"CIF Le Havre",notes:"Revêtement époxy, 3 tailles différentes" },
];

function Stepper({ status }) {
  const cur = stepOrder.indexOf(status);
  return (
    <div style={{ display:"flex", alignItems:"center" }}>
      {steps.map((step, i) => {
        const done = i < cur, active = i === cur;
        return (
          <div key={step.key} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", width:"100%" }}>
              {i>0 && <div style={{ flex:1, height:3, borderRadius:2, background:done?"var(--teal)":"var(--border)" }} />}
              <div style={{ width:28, height:28, borderRadius:"50%", background:active?"var(--orange)":done?"var(--teal)":"var(--sky-light)", border:`2.5px solid ${active?"var(--orange)":done?"var(--teal)":"var(--border)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:active||done?"#fff":"var(--text-soft)", flexShrink:0, animation:active?"pulse 2s infinite":"none", boxShadow:active?"0 0 0 4px var(--orange-light)":"none" }}>
                {done?"✓":i+1}
              </div>
              {i<steps.length-1 && <div style={{ flex:1, height:3, borderRadius:2, background:done?"var(--teal)":"var(--border)" }} />}
            </div>
            <div style={{ fontSize:10, color:active?"var(--orange)":done?"var(--teal)":"var(--text-soft)", marginTop:8, fontWeight:active?700:400 }}>{step.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function SupplierOrders() {
  const [selected, setSelected] = useState(null);
  const [msgInput, setMsgInput] = useState("");
  const [msgs, setMsgs] = useState([
    { from:"mgts",    text:"Bonjour, pouvez-vous confirmer le démarrage de la production pour CMD-2024-002 ?", time:"09:15" },
    { from:"supplier",text:"Oui, la production a démarré ce matin. Livraison prévue le 20 novembre.", time:"09:42" },
    { from:"mgts",    text:"Parfait, merci pour la confirmation. Pouvez-vous envoyer des photos d'avancement mi-production ?", time:"10:05" },
  ]);

  const sendMsg = () => {
    if (!msgInput.trim()) return;
    setMsgs([...msgs, { from:"supplier", text:msgInput, time:new Date().toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"}) }]);
    setMsgInput("");
  };

  if (!selected) {
    return (
      <SupplierLayout>
        <div className="page-header">
          <div>
            <h1>Historique des commandes</h1>
            <p>{orders.length} commandes associées à votre compte.</p>
          </div>
        </div>

        {/* Summary bar */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:28 }}>
          {[
            { label:"En cours",  value:orders.filter(o=>o.status==="en_production").length,  color:"var(--orange)",  bg:"var(--orange-light)" },
            { label:"Livrées",   value:orders.filter(o=>o.status==="livré").length,           color:"var(--teal)",    bg:"var(--teal-light)"   },
            { label:"Total (€)", value:orders.reduce((s,o)=>s+parseInt(o.amount.replace(/\D/g,"")),0).toLocaleString("fr")+" €", color:"#0077A8", bg:"#E0F1FA" },
          ].map((s,i)=>(
            <div key={i} className="card" style={{ padding:18 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:11, color:"var(--text-soft)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>{s.label}</div>
                  <div style={{ fontSize:24, fontWeight:700, fontFamily:"var(--font-mono)", color:"var(--text-dark)" }}>{s.value}</div>
                </div>
                <div style={{ width:38, height:38, borderRadius:10, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, color:s.color }}>◆</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="table-header" style={{ gridTemplateColumns:"1fr 160px 140px 100px 100px" }}>
            <span>Commande</span><span>Statut</span><span>Client</span><span>Date</span><span>Montant</span>
          </div>
          {orders.map((o) => {
            const s = statusConfig[o.status];
            return (
              <div key={o.id} className="table-row" style={{ gridTemplateColumns:"1fr 160px 140px 100px 100px" }} onClick={() => setSelected(o)}>
                <div>
                  <div className="row-id">{o.id}</div>
                  <div className="row-title">{o.product}</div>
                  <div className="row-sub">Qté : {o.qty} · {o.incoterm}</div>
                </div>
                <span className="badge" style={{ color:s.color, background:s.bg }}>
                  <span className={`badge-dot${o.status==="en_production"?" pulse":""}`} style={{ background:s.color }} />{s.label}
                </span>
                <div style={{ fontSize:12, color:"var(--text-mid)" }}>{o.client.split("/")[0].trim()}</div>
                <div style={{ fontSize:12, color:"var(--text-soft)" }}>{o.date}</div>
                <div className="row-amount">{o.amount}</div>
              </div>
            );
          })}
        </div>
      </SupplierLayout>
    );
  }

  const s = statusConfig[selected.status];
  return (
    <SupplierLayout>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:28 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>← Retour</button>
        <div>
          <div className="mono" style={{ fontSize:11, color:"var(--text-soft)" }}>{selected.id}</div>
          <h1 style={{ fontSize:19, fontWeight:700, color:"var(--text-dark)" }}>{selected.product}</h1>
        </div>
        <div style={{ marginLeft:"auto" }}>
          <span className="badge" style={{ color:s.color, background:s.bg, fontSize:12, padding:"6px 14px" }}>
            <span className="badge-dot" style={{ background:s.color }} />{s.label}
          </span>
        </div>
      </div>

      {/* Stepper */}
      <div className="card card-pad" style={{ marginBottom:20 }}>
        <div className="form-label" style={{ marginBottom:16 }}>Suivi de commande</div>
        <Stepper status={selected.status} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 400px", gap:20 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <div className="card card-pad">
            <div className="form-label" style={{ marginBottom:16 }}>Détails commande</div>
            <div className="form-grid">
              {[["Produit",selected.product],["Quantité",selected.qty+" unités"],["Client",selected.client],["Incoterm",selected.incoterm],["Montant",selected.amount],["Date commande",selected.date],["Livraison prévue",selected.deliveryDate]].map(([k,v])=>(
                <div key={k}>
                  <div className="form-label" style={{ marginBottom:4 }}>{k}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:"var(--text-dark)" }}>{v}</div>
                </div>
              ))}
              <div style={{ gridColumn:"1/-1" }}>
                <div className="form-label" style={{ marginBottom:4 }}>Notes de fabrication</div>
                <div style={{ fontSize:13, color:"var(--text-mid)", lineHeight:1.5 }}>{selected.notes}</div>
              </div>
            </div>
          </div>

          {/* Production update */}
          {selected.status === "en_production" && (
            <div className="card card-pad" style={{ borderColor:"var(--orange)", borderWidth:2 }}>
              <div className="form-label" style={{ marginBottom:14, color:"var(--orange)" }}>Mise à jour production</div>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div className="form-group">
                  <label className="form-label">Avancement (%)</label>
                  <input className="form-input" type="number" placeholder="Ex : 45" min="0" max="100" />
                </div>
                <div className="form-group">
                  <label className="form-label">Photos d'avancement</label>
                  <div className="upload-zone" style={{ padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:20, color:"var(--teal)" }}>📷</span>
                    <span style={{ fontSize:12, color:"var(--text-soft)" }}>Ajouter des photos de production</span>
                  </div>
                </div>
                <button className="btn btn-orange">Envoyer la mise à jour</button>
              </div>
            </div>
          )}
        </div>

        {/* Chat with MGTS */}
        <div className="card" style={{ display:"flex", flexDirection:"column", height:460 }}>
          <div className="card-header">
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:30, height:30, borderRadius:9, background:"linear-gradient(135deg,var(--teal),var(--teal-dark))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff" }}>M</div>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:"var(--text-dark)" }}>MGTS — Suivi commande</div>
                <div style={{ fontSize:10, color:"var(--teal)", display:"flex", alignItems:"center", gap:4 }}>
                  <span className="online-dot" style={{ width:5, height:5 }}></span> En ligne
                </div>
              </div>
            </div>
          </div>
          <div className="chat-wrap">
            <div className="chat-body">
              {msgs.map((m,i) => (
                <div key={i} style={{ display:"flex", justifyContent:m.from==="supplier"?"flex-end":"flex-start" }}>
                  {m.from==="mgts" && <div style={{ width:24, height:24, borderRadius:"50%", background:"var(--teal-light)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:"var(--teal)", flexShrink:0, marginRight:8, marginTop:2 }}>M</div>}
                  <div className={`bubble ${m.from==="supplier"?"bubble-out":"bubble-in"}`}>
                    {m.text}
                    <div className="bubble-time">{m.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="chat-footer">
              <input className="form-input" style={{ flex:1 }} placeholder="Message à MGTS…" value={msgInput} onChange={e=>setMsgInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} />
              <button className="btn btn-primary" style={{ padding:"10px 14px" }} onClick={sendMsg}>→</button>
            </div>
          </div>
        </div>
      </div>
    </SupplierLayout>
  );
}