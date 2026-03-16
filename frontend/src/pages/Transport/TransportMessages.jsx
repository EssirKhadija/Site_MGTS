import { useState } from "react";
import TransportLayout from "../../components/Transport/TransportLayout";

const threads = [
  {
    id: "CMD-2024-001", subject: "Conteneurs de stockage industriels",
    with: "MGTS Logistique", unread: 2, lastTime: "Il y a 1h",
    messages: [
      { from:"mgts",      text:"Bonjour, la commande CMD-2024-001 est validée fournisseur. Pouvez-vous nous fournir vos frais de transport FOB Shenzhen → Le Havre dès que possible ?", time:"09:10" },
      { from:"mgts",      text:"Poids estimé : 2 400 kg, volume : 18 m³. Départ souhaité autour du 18 novembre.",                                                                          time:"09:12" },
      { from:"transport", text:"Bonjour, je prends en charge le dossier. Je reviens vers vous avec une cotation sous 2h.",                                                                 time:"09:45" },
    ]
  },
  {
    id: "SHP-2024-009", subject: "Boîtiers plastique ABS — en transit",
    with: "MGTS / LogiPack SAS", unread: 0, lastTime: "Hier",
    messages: [
      { from:"mgts",      text:"Pouvez-vous confirmer le passage en douane de SHP-2024-009 ? Le client attend une mise à jour.",                                                           time:"Hier 14:20" },
      { from:"transport", text:"Confirmation : la marchandise est en dédouanement au port de Bordeaux depuis ce matin. Levée prévue demain.",                                              time:"Hier 15:05" },
      { from:"mgts",      text:"Merci, nous informons le client. N'oubliez pas de nous transmettre le certificat d'origine dès que disponible.",                                          time:"Hier 15:30" },
    ]
  },
  {
    id: "SHP-2024-012", subject: "Profilés inox 316L — livré",
    with: "MGTS Logistique", unread: 0, lastTime: "3j",
    messages: [
      { from:"transport", text:"Livraison effectuée ce matin chez InoxPro SAS à Paris. Le bon de livraison signé est joint.",                                                              time:"3j 10:15" },
      { from:"mgts",      text:"Parfait, merci pour la réactivité sur ce dossier aérien ! Facture reçue et transmise à la comptabilité.",                                                 time:"3j 11:00" },
    ]
  },
];

export default function TransportMessages() {
  const [active, setActive]   = useState(threads[0]);
  const [input, setInput]     = useState("");
  const [allMsgs, setAllMsgs] = useState(
    Object.fromEntries(threads.map(t => [t.id, t.messages]))
  );
  const [attachModal, setAttachModal] = useState(false);

  const send = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString("fr", { hour:"2-digit", minute:"2-digit" });
    setAllMsgs(prev => ({ ...prev, [active.id]: [...(prev[active.id]??[]), { from:"transport", text:input, time:now }] }));
    setInput("");
  };

  const msgs = allMsgs[active?.id] ?? [];

  return (
    <TransportLayout>
      <div className="page-content" style={{ height:"calc(100vh - 58px)", paddingBottom:0, display:"flex", flexDirection:"column" }}>
        <div className="page-header" style={{ flexShrink:0 }}>
          <div>
            <h1>Messagerie</h1>
            <p>Échanges sécurisés avec l'équipe MGTS sur vos expéditions.</p>
          </div>
        </div>

      <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:18, flex:1, minHeight:0 }}>

        {/* Thread list */}
        <div className="card" style={{ overflow:"auto" }}>
          <div className="card-header"><h3>Conversations</h3></div>
          {threads.map(t => (
            <div key={t.id} onClick={() => setActive(t)} style={{ padding:"15px 18px", borderBottom:"1px solid var(--border-soft)", cursor:"pointer", background:active?.id===t.id?"var(--tr-xlight)":"transparent", borderLeft:active?.id===t.id?"3px solid var(--tr)":"3px solid transparent", transition:"background .15s" }}>
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

        {/* Chat panel */}
        <div className="card" style={{ display:"flex", flexDirection:"column", minHeight:0 }}>
          {/* Header */}
          <div className="card-header" style={{ flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:9, background:"linear-gradient(135deg,var(--tr),var(--tr-dark))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff" }}>M</div>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:"var(--text-dark)" }}>{active?.subject}</div>
                <div style={{ fontSize:10, color:"var(--text-mid)" }}>{active?.with}</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn btn-ghost btn-sm">📎 Documents</button>
              <button className="btn btn-ghost btn-sm">◈ Voir commande</button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-body" style={{ flex:1 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display:"flex", justifyContent:m.from==="transport"?"flex-end":"flex-start" }}>
                {m.from==="mgts" && (
                  <div style={{ width:26, height:26, borderRadius:"50%", background:"var(--tr-light)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:"var(--tr)", flexShrink:0, marginRight:8, marginTop:2 }}>M</div>
                )}
                <div className={`bubble ${m.from==="transport"?"bubble-out":"bubble-in"}`}>
                  {m.text}
                  <div className="bubble-time">{m.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="chat-footer" style={{ flexShrink:0 }}>
            <button className="btn btn-ghost btn-sm" style={{ padding:"10px 12px" }} onClick={() => setAttachModal(true)}>📎</button>
            <input className="form-input" style={{ flex:1 }} placeholder="Votre message à MGTS…" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} />
            <button className="btn btn-primary" style={{ padding:"10px 16px" }} onClick={send}>Envoyer →</button>
          </div>
        </div>
      </div>

      {/* Attach modal */}
      {attachModal && (
        <div className="modal-overlay" onClick={() => setAttachModal(false)}>
          <div className="card modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-icon" style={{ background:"var(--tr-light)", color:"var(--tr)" }}>📎</div>
            <div className="modal-title">Joindre un document</div>
            <div className="modal-desc">Sélectionnez le type de document à transmettre à MGTS.</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
              {["Bon de livraison signé","Connaissement (BL)","Certificat d'origine","Liste de colisage (Packing list)","Facture commerciale","Document douanier","Autre document"].map(doc => (
                <button key={doc} className="btn btn-ghost btn-full" style={{ justifyContent:"flex-start" }}>
                  📄 {doc}
                </button>
              ))}
            </div>
            <button className="btn btn-ghost btn-full" onClick={() => setAttachModal(false)}>Annuler</button>
          </div>
        </div>
      )}
    </div>
    </TransportLayout>
  );
}