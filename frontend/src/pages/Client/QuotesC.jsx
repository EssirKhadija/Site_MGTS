import { useState } from "react";
import "../../styles/Client.css";

const quotes = [
  {
    id: "DEV-2024-001",
    orderId: "CMD-2024-001",
    product: "Conteneurs de stockage industriels",
    date: "13 Nov 2024",
    expiry: "27 Nov 2024",
    status: "pending",
    lines: [
      { label: "Coût fournisseur (Shenzhen MetalTech)",  value: 9800 },
      { label: "Transport maritime (FOB → Le Havre)",    value: 1200 },
      { label: "Frais transitaire",                      value: 650  },
      { label: "Marge MGTS (8%)",                        value: 920  },
    ],
    total: 12570,
    currency: "€",
    supplier: "Shenzhen MetalTech Co.",
    incoterm: "FOB",
    leadTime: "45 jours",
  },
];

export default function Quotes() {
  const [selected, setSelected] = useState(quotes[0]);
  const [modal, setModal] = useState(null);   // "accept" | "reject" | null
  const [reason, setReason] = useState("");
  const [statuses, setStatuses] = useState({});

  const getStatus = (q) => statuses[q.id] ?? q.status;

  const handleAction = () => {
    setStatuses((s) => ({ ...s, [selected.id]: modal === "accept" ? "accepted" : "rejected" }));
    setModal(null);
    setReason("");
  };

  const statusBadge = (status) => {
    const cfg = {
      pending:  { label: "En attente",  color: "#009189", bg: "#E0F5F4" },
      accepted: { label: "Accepté",     color: "#007770", bg: "#D5F0EE" },
      rejected: { label: "Refusé",      color: "#CC3A00", bg: "#FFE8DC" },
      expired:  { label: "Expiré",      color: "#89B5BE", bg: "#F0F8FA" },
    };
    const s = cfg[status] ?? cfg.pending;
    return <span className="badge" style={{ color: s.color, background: s.bg }}>{s.label}</span>;
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Mes devis</h1>
          <p>{quotes.length} devis en cours de traitement.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>

        {/* Quotes list */}
        <div className="card" style={{ overflow: "hidden" }}>
          {quotes.map((q) => {
            const st = getStatus(q);
            return (
              <div
                key={q.id}
                onClick={() => setSelected(q)}
                style={{
                  padding: "16px 18px",
                  borderBottom: "1px solid var(--border-soft)",
                  cursor: "pointer",
                  background: selected?.id === q.id ? "var(--sky-light)" : "transparent",
                  borderLeft: selected?.id === q.id ? "3px solid var(--teal)" : "3px solid transparent",
                  transition: "background .15s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span className="mono" style={{ fontSize: 10, color: "var(--text-soft)" }}>{q.id}</span>
                  {statusBadge(st)}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)", marginBottom: 4 }}>{q.product}</div>
                <div style={{ fontSize: 11, color: "var(--text-soft)" }}>Expire le {q.expiry}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--teal)", marginTop: 8, fontFamily: "var(--font-mono)" }}>
                  {q.total.toLocaleString("fr")} {q.currency}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quote detail */}
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Header card */}
            <div className="card card-pad">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                <div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--text-soft)", marginBottom: 4 }}>{selected.id} · {selected.orderId}</div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-dark)" }}>{selected.product}</h2>
                </div>
                {statusBadge(getStatus(selected))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, padding: "16px 0", borderTop: "1px solid var(--border-soft)", borderBottom: "1px solid var(--border-soft)" }}>
                {[["Fournisseur",selected.supplier],["Incoterm",selected.incoterm],["Délai",selected.leadTime],["Expire le",selected.expiry]].map(([k,v])=>(
                  <div key={k}>
                    <div className="form-label" style={{ marginBottom: 4 }}>{k}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quote lines */}
            <div className="card card-pad" style={{ borderColor: getStatus(selected) === "pending" ? "var(--teal)" : "var(--border)", borderWidth: getStatus(selected) === "pending" ? 2 : 1 }}>
              {getStatus(selected) === "pending" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, color: "var(--teal)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--teal)", animation: "pulse 1.5s infinite" }}></span>
                  Action requise — Veuillez valider ou refuser ce devis
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                {selected.lines.map((l, i) => (
                  <div key={i} className="quote-line">
                    <span className="quote-line-label">{l.label}</span>
                    <span className="quote-line-value" style={{ color: i === selected.lines.length - 1 ? "var(--text-soft)" : "var(--text-dark)" }}>
                      {l.value.toLocaleString("fr")} {selected.currency}
                    </span>
                  </div>
                ))}
                <div className="quote-line quote-total" style={{ marginTop: 8, paddingTop: 14 }}>
                  <span className="quote-line-label">TOTAL TTC</span>
                  <span className="quote-line-value" style={{ color: "var(--teal)", fontSize: 18 }}>
                    {selected.total.toLocaleString("fr")} {selected.currency}
                  </span>
                </div>
              </div>

              {getStatus(selected) === "pending" && (
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setModal("accept")}>
                    ✓ Accepter le devis
                  </button>
                  <button className="btn btn-danger" onClick={() => setModal("reject")}>
                    ✗ Refuser
                  </button>
                  <button className="btn btn-ghost">↓ Télécharger PDF</button>
                </div>
              )}

              {getStatus(selected) === "accepted" && (
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn btn-primary">◆ Procéder au paiement</button>
                  <button className="btn btn-ghost">↓ Télécharger PDF</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="card modal-box" onClick={(e) => e.stopPropagation()}>
            {modal === "accept" ? (
              <>
                <div className="modal-icon" style={{ background: "var(--teal-light)", color: "var(--teal)" }}>✓</div>
                <div className="modal-title">Accepter le devis</div>
                <div className="modal-desc">
                  En confirmant, vous acceptez le devis de{" "}
                  <strong style={{ color: "var(--teal)" }}>
                    {selected.total.toLocaleString("fr")} {selected.currency}
                  </strong>{" "}
                  et vous engagez à effectuer le virement dans les 48h.
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAction}>Confirmer & Procéder au paiement</button>
                  <button className="btn btn-ghost" onClick={() => setModal(null)}>Annuler</button>
                </div>
              </>
            ) : (
              <>
                <div className="modal-icon" style={{ background: "var(--orange-light)", color: "var(--orange)" }}>✗</div>
                <div className="modal-title">Refuser le devis</div>
                <div className="form-group" style={{ marginBottom: 20, textAlign: "left" }}>
                  <label className="form-label">Motif du refus</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Expliquez la raison du refus pour que notre équipe puisse vous proposer une alternative…"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn btn-orange" style={{ flex: 1 }} onClick={handleAction}>Confirmer le refus</button>
                  <button className="btn btn-ghost" onClick={() => setModal(null)}>Annuler</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}