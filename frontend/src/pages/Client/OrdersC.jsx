import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Client.css";
import ClientLayout from "../../components/Client/ClientLayout";


const statusConfig = {
  brouillon:     { label: "Brouillon",      color: "#89B5BE", bg: "#F0F8FA"  },
  en_attente:    { label: "En attente",     color: "#F5A623", bg: "#FEF6E8"  },
  devis_recu:    { label: "Devis reçu",     color: "#009189", bg: "#E0F5F4"  },
  validé:        { label: "Validé",         color: "#007770", bg: "#D5F0EE"  },
  en_production: { label: "En production",  color: "#FF6500", bg: "#FFF0E6"  },
  en_transit:    { label: "En transit",     color: "#0077A8", bg: "#E0F1FA"  },
  livré:         { label: "Livré",          color: "#007770", bg: "#D5F0EE"  },
  refusé:        { label: "Refusé",         color: "#CC3A00", bg: "#FFE8DC"  },
};

const steps = [
  { key: "brouillon",     label: "Demande"    },
  { key: "en_attente",    label: "Analyse"    },
  { key: "devis_recu",    label: "Devis"      },
  { key: "validé",        label: "Validation" },
  { key: "en_production", label: "Production" },
  { key: "en_transit",    label: "Transit"    },
  { key: "livré",         label: "Livraison"  },
];
const stepOrder = steps.map((s) => s.key);

const orders = [
  { id: "CMD-2024-001", product: "Conteneurs de stockage industriels", status: "devis_recu",    date: "15 Nov 2024", qty: 50,   budget: "12 500 €", supplier: "Shenzhen MetalTech Co.", incoterm: "FOB Shanghai", messages: 3,  unread: 1 },
  { id: "CMD-2024-002", product: "Pièces mécaniques sur mesure",       status: "en_production", date: "28 Oct 2024", qty: 200,  budget: "8 200 €",  supplier: "Guangzhou Precision Ltd.", incoterm: "CIF Le Havre", messages: 7,  unread: 0 },
  { id: "CMD-2024-003", product: "Emballages personnalisés",            status: "livré",         date: "10 Sep 2024", qty: 1000, budget: "3 400 €",  supplier: "Yiwu PackPro",            incoterm: "FOB Yiwu",    messages: 12, unread: 0 },
];

function Stepper({ status }) {
  const currentIdx = stepOrder.indexOf(status);
  return (
    <div className="stepper">
      {steps.map((step, i) => {
        const done = i < currentIdx;
        const cur  = i === currentIdx;
        return (
          <div key={step.key} className="stepper-item">
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              {i > 0 && (
                <div
                  className="stepper-line"
                  style={{ background: done ? "var(--teal)" : "var(--border)" }}
                />
              )}
              <div className={`stepper-dot ${cur ? "current" : done ? "done" : "pending"}`}>
                {done ? "✓" : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className="stepper-line"
                  style={{ background: done ? "var(--teal)" : "var(--border)" }}
                />
              )}
            </div>
            <div className={`stepper-label ${cur ? "current" : done ? "done" : ""}`}>
              {step.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Orders() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [msgInput, setMsgInput] = useState("");
  const [msgs, setMsgs] = useState([
    { from: "mgts",   text: "Bonjour, nous avons bien reçu votre demande.", time: "10:32" },
    { from: "client", text: "Merci, quand aurez-vous le devis fournisseur ?", time: "10:45" },
    { from: "mgts",   text: "Nous attendons la réponse de Shenzhen MetalTech, délai 48h.", time: "11:02" },
  ]);

  const sendMsg = () => {
    if (!msgInput.trim()) return;
    setMsgs([...msgs, {
      from: "client",
      text: msgInput,
      time: new Date().toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" }),
    }]);
    setMsgInput("");
  };

  /* ── List view ── */
  if (!selected) {
    return (
      <ClientLayout>
        <div className="page-content">
          <div className="page-header">
            <div>
              <h1>Mes commandes</h1>
              <p>{orders.length} commandes au total.</p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate("/new")}>
              ✦ Nouvelle demande
            </button>
          </div>

        <div className="card">
          <div
            className="table-header"
            style={{ gridTemplateColumns: "1fr 170px 130px 100px 60px" }}
          >
            <span>Commande</span>
            <span>Statut</span>
            <span>Date</span>
            <span>Budget</span>
            <span>Msg</span>
          </div>

          {orders.map((o) => {
            const s = statusConfig[o.status];
            return (
              <div
                key={o.id}
                className="table-row"
                style={{ gridTemplateColumns: "1fr 170px 130px 100px 60px" }}
                onClick={() => setSelected(o)}
              >
                <div>
                  <div className="row-id">{o.id}</div>
                  <div className="row-title">{o.product}</div>
                  <div className="row-sub">Qté : {o.qty} · {o.supplier}</div>
                </div>
                <span className="badge" style={{ color: s.color, background: s.bg }}>
                  <span className={`badge-dot${o.status === "en_production" ? " pulse" : ""}`} style={{ background: s.color }} />
                  {s.label}
                </span>
                <div style={{ fontSize: 12, color: "var(--text-mid)" }}>{o.date}</div>
                <div className="row-amount">{o.budget}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-soft)" }}>
                  ◎ {o.messages}
                  {o.unread > 0 && <span className="unread-pill">{o.unread}</span>}
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </ClientLayout>
    );
  }

  /* ── Detail view ── */
  const s = statusConfig[selected.status];

  return (
    <ClientLayout>
      <div className="page-content">
        {/* Back + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>← Retour</button>
        <div>
          <div className="mono" style={{ fontSize: 11, color: "var(--text-soft)" }}>{selected.id}</div>
          <h1 style={{ fontSize: 19, fontWeight: 700, color: "var(--text-dark)" }}>{selected.product}</h1>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          {selected.status === "devis_recu" && (
            <>
              <button className="btn btn-primary" onClick={() => navigate("/quotes")}>✓ Voir le devis</button>
              <button className="btn btn-danger">✗ Refuser</button>
            </>
          )}
          <button className="btn btn-ghost btn-sm">↓ Facture PDF</button>
        </div>
      </div>

      {/* Stepper */}
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="form-label" style={{ marginBottom: 18 }}>Suivi de commande</div>
        <Stepper status={selected.status} />
      </div>

      {/* Detail + Chat */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Info */}
          <div className="card card-pad">
            <div className="form-label" style={{ marginBottom: 16 }}>Détails commande</div>
            <div className="form-grid">
              {[
                ["Produit",         selected.product],
                ["Quantité",        selected.qty + " unités"],
                ["Fournisseur",     selected.supplier],
                ["Incoterm",        selected.incoterm],
                ["Budget estimé",   selected.budget],
                ["Date commande",   selected.date],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="form-label" style={{ marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quote summary (if devis recu) */}
          {selected.status === "devis_recu" && (
            <div className="card card-pad" style={{ borderColor: "var(--teal)", borderWidth: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, color: "var(--teal)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--teal)", animation: "pulse 1.5s infinite" }}></span>
                Devis reçu — Action requise
              </div>
              {[["Coût fournisseur","9 800 €"],["Transport maritime","1 200 €"],["Frais transitaire","650 €"],["Marge MGTS (8%)","920 €"]].map(([k,v])=>(
                <div key={k} className="quote-line"><span className="quote-line-label">{k}</span><span className="quote-line-value">{v}</span></div>
              ))}
              <div className="quote-line quote-total">
                <span className="quote-line-label">TOTAL TTC</span>
                <span className="quote-line-value" style={{ color: "var(--teal)", fontSize: 16 }}>12 570 €</span>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate("/quotes")}>✓ Accepter & Procéder au paiement</button>
                <button className="btn btn-danger">✗ Refuser</button>
              </div>
            </div>
          )}
        </div>

        {/* Chat */}
        <div className="card" style={{ height: 460 }}>
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,var(--teal),var(--teal-dark))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>M</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)" }}>Messagerie MGTS</div>
                <div style={{ fontSize: 10, color: "var(--teal)", display: "flex", alignItems: "center", gap: 5 }}>
                  <span className="online-dot"></span> En ligne
                </div>
              </div>
            </div>
          </div>

          <div className="chat-wrap">
            <div className="chat-body">
              {msgs.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.from === "client" ? "flex-end" : "flex-start" }}>
                  <div className={`bubble ${m.from === "client" ? "bubble-out" : "bubble-in"}`}>
                    {m.text}
                    <div className="bubble-time">{m.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="chat-footer">
              <input
                className="form-input"
                style={{ flex: 1 }}
                placeholder="Votre message…"
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMsg()}
              />
              <button className="btn btn-primary" style={{ padding: "10px 14px" }} onClick={sendMsg}>→</button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </ClientLayout>
  );
}