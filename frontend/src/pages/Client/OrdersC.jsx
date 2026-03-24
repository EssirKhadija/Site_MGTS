import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Client.css";
import ClientLayout from "../../components/Client/ClientLayout";
import { useAuth } from "../../context/AuthContext";
import { ordersAPI } from "../../api/orders.api";
import { messagesAPI } from "../../api/messages.api";
import { paymentsAPI } from "../../api/payments.api";
import { useSocket } from "../../context/SocketContext";

const statusConfig = {
  pending: { label: "En attente", color: "#F5A623", bg: "#FEF6E8" },
  pending_supplier: { label: "En attente", color: "#F5A623", bg: "#FEF6E8" },
  pending_transport: {
    label: "En production",
    color: "#FF6500",
    bg: "#FFF0E6",
  },
  pending_transitaire: { label: "En transit", color: "#0077A8", bg: "#E0F1FA" },
  final_calculation: { label: "Devis reçu", color: "#009189", bg: "#E0F5F4" },
  pending_payment: { label: "Devis reçu", color: "#009189", bg: "#E0F5F4" },
  waiting_validation: { label: "Validé", color: "#007770", bg: "#D5F0EE" },
  paid: { label: "Livré", color: "#007770", bg: "#D5F0EE" },
  rejected: { label: "Refusé", color: "#CC3A00", bg: "#FFE8DC" },
};

const steps = [
  { key: "pending", label: "Demande" },
  { key: "pending_supplier", label: "Analyse" },
  { key: "pending_transport", label: "Production" },
  { key: "pending_transitaire", label: "Transit" },
  { key: "pending_payment", label: "Devis" },
  { key: "waiting_validation", label: "Paiement" },
  { key: "paid", label: "Livraison" },
];
const stepOrder = steps.map((s) => s.key);

function Stepper({ status }) {
  const currentIdx = Math.max(stepOrder.indexOf(status), 0);
  return (
    <div className="stepper">
      {steps.map((step, i) => {
        const done = i < currentIdx;
        const cur = i === currentIdx;
        return (
          <div key={step.key} className="stepper-item">
            <div
              style={{ display: "flex", alignItems: "center", width: "100%" }}
            >
              {i > 0 && (
                <div
                  className="stepper-line"
                  style={{ background: done ? "var(--teal)" : "var(--border)" }}
                />
              )}
              <div
                className={`stepper-dot ${
                  cur ? "current" : done ? "done" : "pending"
                }`}
              >
                {done ? "✓" : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className="stepper-line"
                  style={{ background: done ? "var(--teal)" : "var(--border)" }}
                />
              )}
            </div>
            <div
              className={`stepper-label ${
                cur ? "current" : done ? "done" : ""
              }`}
            >
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
  const { user } = useAuth();
  const socket = useSocket();
  const chatBodyRef = useRef(null);

  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [responding, setResponding] = useState(false);

  // ── Fetch orders ──────────────────────────────────────────
  useEffect(() => {
    ordersAPI
      .getMyOrders()
      .then((res) => setOrders(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Fetch messages when order selected ────────────────────
  useEffect(() => {
    if (!selected) return;
    setLoadingMsgs(true);
    messagesAPI
      .getByOrder(selected.id)
      .then((res) => setMessages(res.data || []))
      .catch(console.error)
      .finally(() => setLoadingMsgs(false));

    if (socket) socket.emit("join_order", selected.id);
    return () => {
      if (socket) socket.emit("leave_order", selected.id);
    };
  }, [selected?.id, socket]);

  // ── Socket: receive new messages ──────────────────────────
  useEffect(() => {
    if (!socket) return;
    socket.on("new_message", (msg) => {
      if (msg.order_id === selected?.id) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => socket.off("new_message");
  }, [socket, selected?.id]);

  // ── Auto scroll ───────────────────────────────────────────
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Send message ──────────────────────────────────────────
  const sendMsg = async () => {
    if (!msgInput.trim() || !selected) return;
    const text = msgInput.trim();
    setMsgInput("");
    try {
      await messagesAPI.send(selected.id, { content: text });
    } catch (err) {
      console.error(err);
    }
  };

  // ── Accept quote ──────────────────────────────────────────
  const acceptQuote = async () => {
    setResponding(true);
    try {
      await ordersAPI.respond(selected.id, { decision: "accept" });
      const updated = { ...selected, status: "waiting_validation" };
      setSelected(updated);
      setOrders((prev) =>
        prev.map((o) => (o.id === selected.id ? updated : o))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setResponding(false);
    }
  };

  // ── Reject quote ──────────────────────────────────────────
  const rejectQuote = async () => {
    setResponding(true);
    try {
      await ordersAPI.respond(selected.id, { decision: "reject" });
      const updated = { ...selected, status: "rejected" };
      setSelected(updated);
      setOrders((prev) =>
        prev.map((o) => (o.id === selected.id ? updated : o))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setResponding(false);
    }
  };

  // ── Download invoice ──────────────────────────────────────
  const downloadInvoice = async () => {
    try {
      const res = await paymentsAPI.downloadInvoice(selected.id);
      const url = window.URL.createObjectURL(new Blob([res]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `MGTS_Invoice_${selected.id}.pdf`;
      a.click();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString("fr", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatAmount = (v) =>
    v ? `${parseFloat(v).toLocaleString()} MAD` : "—";

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
            <button
              className="btn btn-primary"
              onClick={() => navigate("/client/new-order")}
            >
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

            {loading ? (
              <div
                style={{
                  padding: "32px",
                  textAlign: "center",
                  color: "var(--text-soft)",
                  fontSize: 13,
                }}
              >
                Chargement...
              </div>
            ) : orders.length === 0 ? (
              <div
                style={{
                  padding: "32px",
                  textAlign: "center",
                  color: "var(--text-soft)",
                  fontSize: 13,
                }}
              >
                Aucune commande pour le moment.
              </div>
            ) : (
              orders.map((o) => {
                const s = statusConfig[o.status] || {
                  label: o.status,
                  color: "#89B5BE",
                  bg: "#F0F8FA",
                };
                return (
                  <div
                    key={o.id}
                    className="table-row"
                    style={{
                      gridTemplateColumns: "1fr 170px 130px 100px 60px",
                    }}
                    onClick={() => setSelected(o)}
                  >
                    <div>
                      <div className="row-id">
                        CMD-{String(o.id).padStart(6, "0")}
                      </div>
                      <div className="row-title">
                        {o.productName ||
                          o.description?.slice(0, 40) ||
                          "Commande personnalisée"}
                      </div>
                      <div className="row-sub">
                        Qté : {o.quantity} · {o.incoterm || "—"}
                      </div>
                    </div>
                    <span
                      className="badge"
                      style={{ color: s.color, background: s.bg }}
                    >
                      <span
                        className={`badge-dot${
                          o.status === "pending_transport" ? " pulse" : ""
                        }`}
                        style={{ background: s.color }}
                      />
                      {s.label}
                    </span>
                    <div style={{ fontSize: 12, color: "var(--text-mid)" }}>
                      {formatDate(o.createdAt)}
                    </div>
                    <div className="row-amount">
                      {formatAmount(o.totalAmount)}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 12,
                        color: "var(--text-soft)",
                      }}
                    >
                      ◎
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </ClientLayout>
    );
  }

  /* ── Detail view ── */
  const s = statusConfig[selected.status] || {
    label: selected.status,
    color: "#89B5BE",
    bg: "#F0F8FA",
  };
  const hasQuote = ["pending_payment", "final_calculation"].includes(
    selected.status
  );

  return (
    <ClientLayout>
      <div className="page-content">
        {/* Back + Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 28,
          }}
        >
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setSelected(null)}
          >
            ← Retour
          </button>
          <div>
            <div
              className="mono"
              style={{ fontSize: 11, color: "var(--text-soft)" }}
            >
              CMD-{String(selected.id).padStart(6, "0")}
            </div>
            <h1
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: "var(--text-dark)",
              }}
            >
              {selected.productName ||
                selected.description?.slice(0, 50) ||
                "Commande personnalisée"}
            </h1>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            {hasQuote && (
              <>
                <button
                  className="btn btn-primary"
                  onClick={acceptQuote}
                  disabled={responding}
                >
                  ✓ Accepter le devis
                </button>
                <button
                  className="btn btn-danger"
                  onClick={rejectQuote}
                  disabled={responding}
                >
                  ✗ Refuser
                </button>
              </>
            )}
            {selected.status === "paid" && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={downloadInvoice}
              >
                ↓ Facture PDF
              </button>
            )}
          </div>
        </div>

        {/* Stepper */}
        <div className="card card-pad" style={{ marginBottom: 20 }}>
          <div className="form-label" style={{ marginBottom: 18 }}>
            Suivi de commande
          </div>
          <Stepper status={selected.status} />
        </div>

        {/* Detail + Chat */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 20 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Info */}
            <div className="card card-pad">
              <div className="form-label" style={{ marginBottom: 16 }}>
                Détails commande
              </div>
              <div className="form-grid">
                {[
                  ["Produit", selected.productName || "Personnalisé"],
                  ["Quantité", `${selected.quantity} unités`],
                  [
                    "Type",
                    selected.type === "custom"
                      ? "Personnalisé"
                      : "Produit existant",
                  ],
                  ["Incoterm", selected.incoterm || "—"],
                  ["Budget estimé", formatAmount(selected.estimatedBudget)],
                  ["Date commande", formatDate(selected.createdAt)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="form-label" style={{ marginBottom: 4 }}>
                      {k}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text-dark)",
                      }}
                    >
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quote summary */}
            {hasQuote && selected.totalAmount && (
              <div
                className="card card-pad"
                style={{ borderColor: "var(--teal)", borderWidth: 2 }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 16,
                    color: "var(--teal)",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--teal)",
                      animation: "pulse 1.5s infinite",
                    }}
                  ></span>
                  Devis reçu — Action requise
                </div>
                {[
                  ["Coût fournisseur", selected.productionCost],
                  ["Transport maritime", selected.transportCost],
                  ["Frais transitaire", selected.customsCost],
                  ["Commission MGTS", selected.mgtsMargin],
                ].map(([k, v]) => (
                  <div key={k} className="quote-line">
                    <span className="quote-line-label">{k}</span>
                    <span className="quote-line-value">{formatAmount(v)}</span>
                  </div>
                ))}
                <div className="quote-line quote-total">
                  <span className="quote-line-label">TOTAL</span>
                  <span
                    className="quote-line-value"
                    style={{ color: "var(--teal)", fontSize: 16 }}
                  >
                    {formatAmount(selected.totalAmount)}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={acceptQuote}
                    disabled={responding}
                  >
                    ✓ Accepter & Procéder au paiement
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={rejectQuote}
                    disabled={responding}
                  >
                    ✗ Refuser
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Chat */}
          <div className="card" style={{ height: 460 }}>
            <div className="card-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    background:
                      "linear-gradient(135deg,var(--teal),var(--teal-dark))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  M
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-dark)",
                    }}
                  >
                    Messagerie MGTS
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--teal)",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <span className="online-dot"></span> En ligne
                  </div>
                </div>
              </div>
            </div>

            <div className="chat-wrap">
              <div className="chat-body" ref={chatBodyRef}>
                {loadingMsgs ? (
                  <div
                    style={{
                      textAlign: "center",
                      color: "var(--text-soft)",
                      fontSize: 12,
                    }}
                  >
                    Chargement...
                  </div>
                ) : messages.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      color: "var(--text-soft)",
                      fontSize: 12,
                    }}
                  >
                    Aucun message.
                  </div>
                ) : (
                  messages.map((m, i) => {
                    const isClient = m.sender_id === user?.id;
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: isClient ? "flex-end" : "flex-start",
                        }}
                      >
                        <div
                          className={`bubble ${
                            isClient ? "bubble-out" : "bubble-in"
                          }`}
                        >
                          {m.content}
                          <div className="bubble-time">
                            {formatTime(m.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
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
                <button
                  className="btn btn-primary"
                  style={{ padding: "10px 14px" }}
                  onClick={sendMsg}
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
