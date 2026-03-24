import { useState, useEffect, useRef } from "react";
import TransportLayout from "../../components/Transport/TransportLayout";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { ordersAPI } from "../../api/orders.api";
import { messagesAPI } from "../../api/messages.api";

export default function TransportMessages() {
  const { user } = useAuth();
  const socket = useSocket();
  const chatBodyRef = useRef(null);

  const [orders, setOrders] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [attachModal, setAttachModal] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  // ── Fetch transport orders ────────────────────────────────
  useEffect(() => {
    ordersAPI
      .getTransportOrders()
      .then((res) => {
        const list = res.data || [];
        setOrders(list);
        if (list.length > 0) setActive(list[0]);
      })
      .catch(console.error)
      .finally(() => setLoadingOrders(false));
  }, []);

  // ── Fetch messages when active changes ────────────────────
  useEffect(() => {
    if (!active) return;
    setLoadingMsgs(true);
    messagesAPI
      .getByOrder(active.id)
      .then((res) => setMessages(res.data || []))
      .catch(console.error)
      .finally(() => setLoadingMsgs(false));

    if (socket) socket.emit("join_order", active.id);
    return () => {
      if (socket) socket.emit("leave_order", active.id);
    };
  }, [active?.id, socket]);

  // ── Socket ────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    socket.on("new_message", (msg) => {
      if (msg.order_id === active?.id) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => socket.off("new_message");
  }, [socket, active?.id]);

  // ── Auto scroll ───────────────────────────────────────────
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Send message ──────────────────────────────────────────
  const send = async () => {
    if (!input.trim() || !active) return;
    const text = input.trim();
    setInput("");
    try {
      await messagesAPI.send(active.id, { content: text });
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString("fr", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatLastTime = (d) => {
    if (!d) return "";
    const diff = Date.now() - new Date(d).getTime();
    const h = Math.floor(diff / 3600000);
    const j = Math.floor(diff / 86400000);
    if (h < 24)
      return new Date(d).toLocaleTimeString("fr", {
        hour: "2-digit",
        minute: "2-digit",
      });
    if (j < 7) return `${j}j`;
    return new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <TransportLayout>
      <div
        className="page-content"
        style={{
          height: "calc(100vh - 58px)",
          paddingBottom: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="page-header" style={{ flexShrink: 0 }}>
          <div>
            <h1>Messagerie</h1>
            <p>Échanges sécurisés avec l'équipe MGTS sur vos expéditions.</p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: 18,
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Thread list */}
          <div className="card" style={{ overflow: "auto" }}>
            <div className="card-header">
              <h3>Conversations</h3>
            </div>
            {loadingOrders ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "var(--text-soft)",
                  fontSize: 12,
                }}
              >
                Chargement...
              </div>
            ) : orders.length === 0 ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "var(--text-soft)",
                  fontSize: 12,
                }}
              >
                Aucune commande
              </div>
            ) : (
              orders.map((o) => (
                <div
                  key={o.id}
                  onClick={() => setActive(o)}
                  style={{
                    padding: "15px 18px",
                    borderBottom: "1px solid var(--border-soft)",
                    cursor: "pointer",
                    background:
                      active?.id === o.id ? "var(--tr-xlight)" : "transparent",
                    borderLeft:
                      active?.id === o.id
                        ? "3px solid var(--tr)"
                        : "3px solid transparent",
                    transition: "background .15s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 5,
                    }}
                  >
                    <span
                      className="mono"
                      style={{ fontSize: 10, color: "var(--text-soft)" }}
                    >
                      CMD-{String(o.id).padStart(6, "0")}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--text-soft)" }}>
                      {formatLastTime(o.updatedAt)}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-dark)",
                      marginBottom: 3,
                    }}
                  >
                    {o.productName ||
                      o.description?.slice(0, 35) ||
                      "Commande personnalisée"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-mid)" }}>
                    MGTS / {o.clientName || "Client"}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat panel */}
          <div
            className="card"
            style={{ display: "flex", flexDirection: "column", minHeight: 0 }}
          >
            <div className="card-header" style={{ flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background:
                      "linear-gradient(135deg,var(--tr),var(--tr-dark))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
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
                    {active
                      ? active.productName || "Commande personnalisée"
                      : "Sélectionnez une commande"}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-mid)" }}>
                    {active ? `MGTS / ${active.clientName || "Client"}` : ""}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setAttachModal(true)}
                >
                  📎 Documents
                </button>
                <button className="btn btn-ghost btn-sm">
                  ◈ Voir commande
                </button>
              </div>
            </div>

            <div className="chat-body" style={{ flex: 1 }} ref={chatBodyRef}>
              {loadingMsgs ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "var(--text-soft)",
                    fontSize: 12,
                    padding: "20px",
                  }}
                >
                  Chargement des messages...
                </div>
              ) : messages.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "var(--text-soft)",
                    fontSize: 12,
                    padding: "20px",
                  }}
                >
                  Aucun message. Démarrez la conversation !
                </div>
              ) : (
                messages.map((m, i) => {
                  const isMe = m.sender_id === user?.id;
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: isMe ? "flex-end" : "flex-start",
                      }}
                    >
                      {!isMe && (
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            background: "var(--tr-light)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 9,
                            fontWeight: 700,
                            color: "var(--tr)",
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
                          isMe ? "bubble-out" : "bubble-in"
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

            <div className="chat-footer" style={{ flexShrink: 0 }}>
              <button
                className="btn btn-ghost btn-sm"
                style={{ padding: "10px 12px" }}
                onClick={() => setAttachModal(true)}
              >
                📎
              </button>
              <input
                className="form-input"
                style={{ flex: 1 }}
                placeholder="Votre message à MGTS…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                disabled={!active}
              />
              <button
                className="btn btn-primary"
                style={{ padding: "10px 16px" }}
                onClick={send}
                disabled={!active || !input.trim()}
              >
                Envoyer →
              </button>
            </div>
          </div>
        </div>

        {/* Attach modal */}
        {attachModal && (
          <div className="modal-overlay" onClick={() => setAttachModal(false)}>
            <div
              className="card modal-box"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="modal-icon"
                style={{ background: "var(--tr-light)", color: "var(--tr)" }}
              >
                📎
              </div>
              <div className="modal-title">Joindre un document</div>
              <div className="modal-desc">
                Sélectionnez le type de document à transmettre à MGTS.
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                {[
                  "Bon de livraison signé",
                  "Connaissement (BL)",
                  "Certificat d'origine",
                  "Liste de colisage (Packing list)",
                  "Facture commerciale",
                  "Document douanier",
                  "Autre document",
                ].map((doc) => (
                  <button
                    key={doc}
                    className="btn btn-ghost btn-full"
                    style={{ justifyContent: "flex-start" }}
                  >
                    📄 {doc}
                  </button>
                ))}
              </div>
              <button
                className="btn btn-ghost btn-full"
                onClick={() => setAttachModal(false)}
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </TransportLayout>
  );
}
