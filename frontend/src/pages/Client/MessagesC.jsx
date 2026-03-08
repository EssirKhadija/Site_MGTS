import { useState } from "react";
import "../../styles/Client.css";

const threads = [
  { id: "CMD-2024-001", product: "Conteneurs de stockage industriels", unread: 1, lastMsg: "Nous attendons la réponse de Shenzhen MetalTech, délai 48h.", lastTime: "11:02",
    messages: [
      { from: "mgts",   text: "Bonjour, nous avons bien reçu votre demande.", time: "10:32" },
      { from: "client", text: "Merci, quand aurez-vous le devis fournisseur ?", time: "10:45" },
      { from: "mgts",   text: "Nous attendons la réponse de Shenzhen MetalTech, délai 48h.", time: "11:02" },
    ],
  },
  { id: "CMD-2024-002", product: "Pièces mécaniques sur mesure", unread: 0, lastMsg: "La production a démarré. Livraison estimée dans 3 semaines.", lastTime: "Hier",
    messages: [
      { from: "mgts",   text: "Votre commande a été validée par notre équipe.", time: "09:00" },
      { from: "client", text: "Super, merci pour la confirmation !", time: "09:20" },
      { from: "mgts",   text: "La production a démarré. Livraison estimée dans 3 semaines.", time: "Hier" },
    ],
  },
  { id: "CMD-2024-003", product: "Emballages personnalisés", unread: 0, lastMsg: "Votre commande a été livrée. Merci de confirmer la réception.", lastTime: "3j",
    messages: [
      { from: "mgts",   text: "Les emballages sont en transit depuis Yiwu.", time: "10 Sep" },
      { from: "client", text: "Parfait, merci pour le suivi.", time: "11 Sep" },
      { from: "mgts",   text: "Votre commande a été livrée. Merci de confirmer la réception.", time: "3j" },
    ],
  },
];

export default function Messages() {
  const [activeThread, setActiveThread] = useState(threads[0]);
  const [input, setInput] = useState("");
  const [allMsgs, setAllMsgs] = useState(
    Object.fromEntries(threads.map((t) => [t.id, t.messages]))
  );

  const send = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" });
    setAllMsgs((prev) => ({
      ...prev,
      [activeThread.id]: [...(prev[activeThread.id] ?? []), { from: "client", text: input, time: now }],
    }));
    setInput("");
  };

  const msgs = allMsgs[activeThread?.id] ?? [];

  return (
    <div className="page-content" style={{ height: "calc(100vh - 58px)", paddingBottom: 0, display: "flex", flexDirection: "column" }}>
      <div className="page-header" style={{ flexShrink: 0 }}>
        <div>
          <h1>Messagerie</h1>
          <p>Échanges sécurisés liés à chaque commande.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 18, flex: 1, minHeight: 0 }}>

        {/* Thread list */}
        <div className="card" style={{ overflow: "auto" }}>
          {threads.map((t) => (
            <div
              key={t.id}
              onClick={() => setActiveThread(t)}
              style={{
                padding: "15px 18px",
                borderBottom: "1px solid var(--border-soft)",
                cursor: "pointer",
                background: activeThread?.id === t.id ? "var(--sky-light)" : "transparent",
                borderLeft: activeThread?.id === t.id ? "3px solid var(--teal)" : "3px solid transparent",
                transition: "background .15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span className="mono" style={{ fontSize: 10, color: "var(--text-soft)" }}>{t.id}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 10, color: "var(--text-soft)" }}>{t.lastTime}</span>
                  {t.unread > 0 && <span className="unread-pill">{t.unread}</span>}
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)", marginBottom: 4 }}>{t.product}</div>
              <div style={{ fontSize: 11, color: "var(--text-soft)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{t.lastMsg}</div>
            </div>
          ))}
        </div>

        {/* Chat panel */}
        <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          {/* Chat header */}
          <div className="card-header" style={{ flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,var(--teal),var(--teal-dark))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>M</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)" }}>
                  {activeThread?.id} — {activeThread?.product}
                </div>
                <div style={{ fontSize: 10, color: "var(--teal)", display: "flex", alignItems: "center", gap: 5 }}>
                  <span className="online-dot" style={{ width: 5, height: 5 }}></span> MGTS en ligne
                </div>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm">📎 Joindre un fichier</button>
          </div>

          {/* Messages */}
          <div className="chat-body" style={{ flex: 1 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.from === "client" ? "flex-end" : "flex-start" }}>
                {m.from === "mgts" && (
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--teal-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "var(--teal)", flexShrink: 0, marginRight: 8, marginTop: 2 }}>M</div>
                )}
                <div className={`bubble ${m.from === "client" ? "bubble-out" : "bubble-in"}`}>
                  {m.text}
                  <div className="bubble-time">{m.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="chat-footer" style={{ flexShrink: 0 }}>
            <input
              className="form-input"
              style={{ flex: 1 }}
              placeholder="Votre message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button className="btn btn-ghost" style={{ padding: "10px 12px" }}>📎</button>
            <button className="btn btn-primary" style={{ padding: "10px 16px" }} onClick={send}>Envoyer →</button>
          </div>
        </div>
      </div>
    </div>
  );
}