import { useState, useEffect, useRef } from "react";
import SupplierLayout from "../../components/Fournisseur/SupplierLayout";
import "../../styles/Supplier.css";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { ordersAPI } from "../../api/orders.api";
import { messagesAPI } from "../../api/messages.api";

const statusConfig = {
  pending_supplier: { label: "En attente", color: "#F5A623", bg: "#FEF6E8" },
  pending_transport: {
    label: "En production",
    color: "#FF6500",
    bg: "#FFF0E6",
  },
  pending_transitaire: { label: "Expédié", color: "#0077A8", bg: "#E0F1FA" },
  paid: { label: "Livré", color: "#007770", bg: "#D5F0EE" },
  rejected: { label: "Annulé", color: "#CC3A00", bg: "#FFE8DC" },
};

const steps = [
  { key: "pending_supplier", label: "Confirmation" },
  { key: "pending_transport", label: "Production" },
  { key: "pending_transitaire", label: "Expédition" },
  { key: "paid", label: "Livraison" },
];
const stepOrder = steps.map((s) => s.key);

function Stepper({ status }) {
  const cur = stepOrder.indexOf(status);
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {steps.map((step, i) => {
        const done = i < cur,
          active = i === cur;
        return (
          <div
            key={step.key}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", width: "100%" }}
            >
              {i > 0 && (
                <div
                  style={{
                    flex: 1,
                    height: 3,
                    borderRadius: 2,
                    background: done ? "var(--teal)" : "var(--border)",
                  }}
                />
              )}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: active
                    ? "var(--orange)"
                    : done
                    ? "var(--teal)"
                    : "var(--sky-light)",
                  border: `2.5px solid ${
                    active
                      ? "var(--orange)"
                      : done
                      ? "var(--teal)"
                      : "var(--border)"
                  }`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: active || done ? "#fff" : "var(--text-soft)",
                  flexShrink: 0,
                  animation: active ? "pulse 2s infinite" : "none",
                  boxShadow: active ? "0 0 0 4px var(--orange-light)" : "none",
                }}
              >
                {done ? "✓" : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 3,
                    borderRadius: 2,
                    background: done ? "var(--teal)" : "var(--border)",
                  }}
                />
              )}
            </div>
            <div
              style={{
                fontSize: 10,
                color: active
                  ? "var(--orange)"
                  : done
                  ? "var(--teal)"
                  : "var(--text-soft)",
                marginTop: 8,
                fontWeight: active ? 700 : 400,
              }}
            >
              {step.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function SupplierOrders() {
  const { user } = useAuth();
  const socket = useSocket();
  const chatBodyRef = useRef(null);

  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  // ── Fetch orders ──────────────────────────────────────────
  useEffect(() => {
    ordersAPI
      .getSupplierOrders()
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

  // ── Socket ────────────────────────────────────────────────
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

  const totalRevenue = orders.reduce(
    (s, o) => s + parseFloat(o.myQuote || 0),
    0
  );

  // ── List view ─────────────────────────────────────────────
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 16,
            marginBottom: 28,
          }}
        >
          {[
            {
              label: "En cours",
              value: orders.filter((o) => o.status === "pending_transport")
                .length,
              color: "var(--orange)",
              bg: "var(--orange-light)",
            },
            {
              label: "Livrées",
              value: orders.filter((o) => o.status === "paid").length,
              color: "var(--teal)",
              bg: "var(--teal-light)",
            },
            {
              label: "Total MAD",
              value: `${totalRevenue.toLocaleString()} MAD`,
              color: "#0077A8",
              bg: "#E0F1FA",
            },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: 18 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-soft)",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: 6,
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-dark)",
                    }}
                  >
                    {s.value}
                  </div>
                </div>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: s.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    color: s.color,
                  }}
                >
                  ◆
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div
            className="table-header"
            style={{ gridTemplateColumns: "1fr 160px 140px 100px 100px" }}
          >
            <span>Commande</span>
            <span>Statut</span>
            <span>Client</span>
            <span>Date</span>
            <span>Montant</span>
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
              Aucune commande.
            </div>
          ) : (
            orders.map((o) => {
              const s = statusConfig[o.status] || statusConfig.pending_supplier;
              return (
                <div
                  key={o.id}
                  className="table-row"
                  style={{ gridTemplateColumns: "1fr 160px 140px 100px 100px" }}
                  onClick={() => setSelected(o)}
                >
                  <div>
                    <div className="row-id">
                      CMD-{String(o.id).padStart(6, "0")}
                    </div>
                    <div className="row-title">
                      {o.productName ||
                        o.description?.slice(0, 35) ||
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
                    {o.clientName || "—"}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-soft)" }}>
                    {formatDate(o.createdAt)}
                  </div>
                  <div className="row-amount">{formatAmount(o.myQuote)}</div>
                </div>
              );
            })
          )}
        </div>
      </SupplierLayout>
    );
  }

  // ── Detail view ───────────────────────────────────────────
  const s = statusConfig[selected.status] || statusConfig.pending_supplier;

  return (
    <SupplierLayout>
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
            style={{ fontSize: 19, fontWeight: 700, color: "var(--text-dark)" }}
          >
            {selected.productName || "Commande personnalisée"}
          </h1>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <span
            className="badge"
            style={{
              color: s.color,
              background: s.bg,
              fontSize: 12,
              padding: "6px 14px",
            }}
          >
            <span className="badge-dot" style={{ background: s.color }} />
            {s.label}
          </span>
        </div>
      </div>

      {/* Stepper */}
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="form-label" style={{ marginBottom: 16 }}>
          Suivi de commande
        </div>
        <Stepper status={selected.status} />
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 20 }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card card-pad">
            <div className="form-label" style={{ marginBottom: 16 }}>
              Détails commande
            </div>
            <div className="form-grid">
              {[
                ["Produit", selected.productName || "Personnalisé"],
                ["Quantité", `${selected.quantity} unités`],
                ["Client", selected.clientName || "—"],
                ["Incoterm", selected.incoterm || "—"],
                ["Mon coût soumis", formatAmount(selected.myQuote)],
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
              {selected.description && (
                <div style={{ gridColumn: "1/-1" }}>
                  <div className="form-label" style={{ marginBottom: 4 }}>
                    Notes de fabrication
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--text-mid)",
                      lineHeight: 1.5,
                    }}
                  >
                    {selected.description}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Production update */}
          {selected.status === "pending_transport" && (
            <div
              className="card card-pad"
              style={{ borderColor: "var(--orange)", borderWidth: 2 }}
            >
              <div
                className="form-label"
                style={{ marginBottom: 14, color: "var(--orange)" }}
              >
                Mise à jour production
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div className="form-group">
                  <label className="form-label">Avancement (%)</label>
                  <input
                    className="form-input"
                    type="number"
                    placeholder="Ex : 45"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Photos d'avancement</label>
                  <div
                    className="upload-zone"
                    style={{
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 20, color: "var(--teal)" }}>
                      📷
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-soft)" }}>
                      Ajouter des photos de production
                    </span>
                  </div>
                </div>
                <button className="btn btn-orange">
                  Envoyer la mise à jour
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Chat */}
        <div
          className="card"
          style={{ display: "flex", flexDirection: "column", height: 460 }}
        >
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
                  MGTS — Suivi commande
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--teal)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span
                    className="online-dot"
                    style={{ width: 5, height: 5 }}
                  ></span>{" "}
                  En ligne
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
                  const isSupplier = m.sender_id === user?.id;
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: isSupplier ? "flex-end" : "flex-start",
                      }}
                    >
                      {!isSupplier && (
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: "var(--teal-light)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 9,
                            fontWeight: 700,
                            color: "var(--teal)",
                            flexShrink: 0,
                            marginRight: 8,
                            marginTop: 2,
                          }}
                        >
                          {m.senderName?.[0] || "M"}
                        </div>
                      )}
                      <div
                        className={`bubble ${
                          isSupplier ? "bubble-out" : "bubble-in"
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
                placeholder="Message à MGTS…"
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
    </SupplierLayout>
  );
}
