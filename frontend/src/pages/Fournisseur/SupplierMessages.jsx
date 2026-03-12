import { useState } from "react";
import SupplierLayout from "../../components/Fournisseur/SupplierLayout";
import "../../styles/Supplier.css";

const threads = [
  { id:"CMD-2024-002", subject:"Pièces mécaniques sur mesure", with:"MGTS / Jean Dupont",  unread:1, lastTime:"10:05",
    messages:[
      { from:"mgts",    text:"Bonjour, pouvez-vous confirmer le démarrage de la production pour CMD-2024-002 ?",                         time:"09:15" },
      { from:"supplier",text:"Oui, la production a démarré ce matin. Livraison prévue le 20 novembre.",                                  time:"09:42" },
      { from:"mgts",    text:"Parfait, merci. Pouvez-vous envoyer des photos d'avancement mi-production ?",                              time:"10:05" },
    ]
  },
  { id:"DEM-2024-018", subject:"Devis — Pièces CNC aluminium", with:"MGTS Sourcing",        unread:0, lastTime:"Hier",
    messages:[
      { from:"mgts",    text:"Bonjour, nous avons reçu votre coût de fabrication de 7 200 €. Pouvez-vous préciser le délai minimum ?",   time:"Hier 14:30" },
      { from:"supplier",text:"Le délai minimum est de 25 jours ouvrés pour 200 pièces.",                                                  time:"Hier 15:10" },
    ]
  },
  { id:"CMD-2024-003", subject:"Emballages personnalisés",     with:"MGTS / LogiPack SAS",   unread:0, lastTime:"3j",
    messages:[
      { from:"mgts",    text:"La commande a été livrée. Merci pour la réactivité sur ce dossier.",                                       time:"3j 09:00" },
      { from:"supplier",text:"Avec plaisir, n'hésitez pas à nous contacter pour les prochaines commandes.",                              time:"3j 09:45" },
    ]
  },
];

export default function SupplierMessages() {
  const [active, setActive]   = useState(threads[0]);
  const [input, setInput]     = useState("");
  const [allMsgs, setAllMsgs] = useState(
    Object.fromEntries(threads.map((t) => [t.id, t.messages]))
  );

  const send = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString("fr", { hour:"2-digit", minute:"2-digit" });
    setAllMsgs((prev) => ({ ...prev, [active.id]: [...(prev[active.id]??[]), { from:"supplier", text:input, time:now }] }));
    setInput("");
  };

  const msgs = allMsgs[active?.id] ?? [];

  return (
    <SupplierLayout>
      <div className="page-header" style={{ flexShrink:0 }}>
        <div>
          <h1>Messagerie</h1>
          <p>Communication sécurisée avec l'équipe MGTS et les clients.</p>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:18, flex:1, minHeight:0 }}>

        {/* Thread list */}
        <div className="card" style={{ overflow:"auto" }}>
          {threads.map((t) => (
            <div key={t.id} onClick={() => setActive(t)} style={{ padding:"15px 18px", borderBottom:"1px solid var(--border-soft)", cursor:"pointer", background:active?.id===t.id?"var(--sky-light)":"transparent", borderLeft:active?.id===t.id?"3px solid var(--orange)":"3px solid transparent", transition:"background .15s" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span className="mono" style={{ fontSize:10, color:"var(--text-soft)" }}>{t.id}</span>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:10, color:"var(--text-soft)" }}>{t.lastTime}</span>
                  {t.unread>0 && <span className="unread-pill">{t.unread}</span>}
                </div>
              </div>
              <div style={{ fontSize:13, fontWeight:600, color:"var(--text-dark)", marginBottom:3 }}>{t.subject}</div>
              <div style={{ fontSize:11, color:"var(--text-mid)" }}>{t.with}</div>
            </div>
          ))}
        </div>

        {/* Chat */}
        <div className="card" style={{ display:"flex", flexDirection:"column", minHeight:0 }}>
          <div className="card-header" style={{ flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:9, background:"linear-gradient(135deg,var(--teal),var(--teal-dark))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff" }}>M</div>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:"var(--text-dark)" }}>{active?.subject}</div>
                <div style={{ fontSize:10, color:"var(--text-mid)" }}>{active?.with}</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn btn-ghost btn-sm">📎 Joindre</button>
              <button className="btn btn-ghost btn-sm">◆ Voir commande</button>
            </div>
          </div>

          <div className="chat-body" style={{ flex:1 }}>
            {msgs.map((m,i) => (
              <div key={i} style={{ display:"flex", justifyContent:m.from==="supplier"?"flex-end":"flex-start" }}>
                {m.from==="mgts" && (
                  <div style={{ width:26, height:26, borderRadius:"50%", background:"var(--teal-light)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:"var(--teal)", flexShrink:0, marginRight:8, marginTop:2 }}>M</div>
                )}
                <div className={`bubble ${m.from==="supplier"?"bubble-out":"bubble-in"}`}>
                  {m.text}
                  <div className="bubble-time">{m.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="chat-footer" style={{ flexShrink:0 }}>
            <input className="form-input" style={{ flex:1 }} placeholder="Votre message à MGTS…" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} />
            <button className="btn btn-ghost" style={{ padding:"10px 12px" }}>📎</button>
            <button className="btn btn-primary" style={{ padding:"10px 16px" }} onClick={send}>Envoyer →</button>
          </div>
        </div>
      </div>
    </SupplierLayout>
  );
}