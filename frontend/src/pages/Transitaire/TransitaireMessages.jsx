import { useState } from "react";

const threads = [
  {
    id: "DOS-2024-030", subject: "Pièces mécaniques CNC — validation import",
    with: "MGTS Logistique", unread: 2, lastTime: "Il y a 2h",
    messages: [
      { from:"mgts",  text:"Bonjour, le dossier DOS-2024-030 est prêt pour la validation import. Pouvez-vous confirmer la conformité du certificat d'origine pour le code SH 8466.93 ?", time:"08:30" },
      { from:"mgts",  text:"Nous avons besoin de votre validation avant le 25 novembre pour respecter les délais de livraison.", time:"08:32" },
      { from:"trans", text:"Bonjour, je prends en charge le dossier. Je vérifie le certificat d'origine et reviens vers vous aujourd'hui.", time:"09:15" },
    ]
  },
  {
    id: "DOS-2024-029", subject: "Boîtiers ABS — contrôle douane Bordeaux",
    with: "MGTS / LogiPack SAS", unread: 0, lastTime: "Hier",
    messages: [
      { from:"mgts",  text:"La marchandise est en contrôle douane à Bordeaux. Y a-t-il un problème particulier que nous devons communiquer au client ?", time:"Hier 11:00" },
      { from:"trans", text:"Le contrôle porte sur l'origine des marchandises. Nous attendons la décision de la douane. Délai estimé : 48h.", time:"Hier 11:45" },
      { from:"mgts",  text:"Merci. Nous informons le client. Tenez-nous au courant dès que possible.", time:"Hier 12:10" },
    ]
  },
  {
    id: "DOS-2024-028", subject: "Emballages kraft — dossier clôturé",
    with: "MGTS Logistique", unread: 0, lastTime: "3j",
    messages: [
      { from:"trans", text:"Dossier DOS-2024-028 clôturé. Import validé, tous les documents transmis à MGTS. Frais douaniers : 1 483 €.", time:"3j 09:00" },
      { from:"mgts",  text:"Parfait merci, tout est bien reçu. La facture sera traitée sous 5 jours ouvrés.", time:"3j 10:30" },
    ]
  },
];

export default function TransitaireMessages() {
  const [active, setActive]   = useState(threads[0]);
  const [input, setInput]     = useState("");
  const [allMsgs, setAllMsgs] = useState(
    Object.fromEntries(threads.map(t => [t.id, t.messages]))
  );
  const [docModal, setDocModal] = useState(false);

  const send = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" });
    setAllMsgs(prev => ({ ...prev, [active.id]: [...(prev[active.id] ?? []), { from: "trans", text: input, time: now }] }));
    setInput("");
  };

  const msgs = allMsgs[active?.id] ?? [];

  return (
    <div className="page-content" style={{ height: "calc(100vh - 58px)", paddingBottom: 0, display: "flex", flexDirection: "column" }}>
      <div className="page-header" style={{ flexShrink: 0 }}>
        <div>
          <h1>Messagerie</h1>
          <p>Communication sécurisée avec l'équipe MGTS sur vos dossiers douaniers.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 18, flex: 1, minHeight: 0 }}>

        {/* Thread list */}
        <div className="card" style={{ overflow: "auto" }}>
          <div className="card-header"><h3>Conversations</h3></div>
          {threads.map(t => (
            <div key={t.id} onClick={() => setActive(t)} style={{ padding: "15px 18px", borderBottom: "1px solid var(--border-soft)", cursor: "pointer", background: active?.id === t.id ? "var(--ac-xlight)" : "transparent", borderLeft: active?.id === t.id ? "3px solid var(--ac)" : "3px solid transparent", transition: "background .15s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span className="mono" style={{ fontSize: 10, color: "var(--text-soft)" }}>{t.id}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 10, color: "var(--text-soft)" }}>{t.lastTime}</span>
                  {t.unread > 0 && <span className="unread-pill">{t.unread}</span>}
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)", marginBottom: 3 }}>{t.subject}</div>
              <div style={{ fontSize: 11, color: "var(--text-mid)" }}>{t.with}</div>
            </div>
          ))}
        </div>

        {/* Chat */}
        <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div className="card-header" style={{ flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,var(--ac),var(--ac-dark))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>M</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)" }}>{active?.subject}</div>
                <div style={{ fontSize: 10, color: "var(--text-mid)" }}>{active?.with}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setDocModal(true)}>📎 Documents</button>
              <button className="btn btn-ghost btn-sm">◈ Voir dossier</button>
            </div>
          </div>

          <div className="chat-body" style={{ flex: 1 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.from === "trans" ? "flex-end" : "flex-start" }}>
                {m.from === "mgts" && (
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--ac-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "var(--ac)", flexShrink: 0, marginRight: 8, marginTop: 2 }}>M</div>
                )}
                <div className={`bubble ${m.from === "trans" ? "bubble-out" : "bubble-in"}`}>
                  {m.text}
                  <div className="bubble-time">{m.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="chat-footer" style={{ flexShrink: 0 }}>
            <button className="btn btn-ghost btn-sm" style={{ padding: "10px 12px" }} onClick={() => setDocModal(true)}>📎</button>
            <input className="form-input" style={{ flex: 1 }} placeholder="Votre message à MGTS…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} />
            <button className="btn btn-primary" style={{ padding: "10px 16px" }} onClick={send}>Envoyer →</button>
          </div>
        </div>
      </div>

      {/* Doc modal */}
      {docModal && (
        <div className="modal-overlay" onClick={() => setDocModal(false)}>
          <div className="card modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon" style={{ background: "var(--ac-light)", color: "var(--ac)" }}>📎</div>
            <div className="modal-title">Joindre un document douanier</div>
            <div className="modal-desc">Sélectionnez le document à transmettre à MGTS.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {["Déclaration en douane (DAU/DEB)","Certificat d'origine","Document de transit (T1/T2)","Licence d'importation","Certificat phytosanitaire","Rapport d'inspection","Bon à dédouaner","Autre document"].map(doc => (
                <button key={doc} className="btn btn-ghost btn-full" style={{ justifyContent: "flex-start" }}>
                  📄 {doc}
                </button>
              ))}
            </div>
            <button className="btn btn-ghost btn-full" onClick={() => setDocModal(false)}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}