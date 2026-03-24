import { useState, useEffect, useRef } from "react";
import "../../styles/Client.css";
import ClientLayout from "../../components/Client/ClientLayout";
import { useAuth } from "../../context/AuthContext";
import { ordersAPI } from "../../api/orders.api";
import { messagesAPI } from "../../api/messages.api";
import { useSocket } from "../../context/SocketContext";

export default function Messages() {
  const { user } = useAuth();
  const socket = useSocket();

  const [orders, setOrders]             = useState([]);
  const [activeOrder, setActiveOrder]   = useState(null);
  const [messages, setMessages]         = useState([]);
  const [input, setInput]               = useState("");
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingMsgs, setLoadingMsgs]   = useState(false);
  const chatBodyRef = useRef(null);

  // ── Fetch orders list ─────────────────────────────────────
  useEffect(() => {
    ordersAPI.getMyOrders()
      .then(res => {
        const list = res.data || [];
        setOrders(list);
        if (list.length > 0) setActiveOrder(list[0]);
      })
      .catch(console.error)
      .finally(() => setLoadingOrders(false));
  }, []);

  // ── Fetch messages when active order changes ──────────────
  useEffect(() => {
    if (!activeOrder) return;
    setLoadingMsgs(true);
    messagesAPI.getByOrder(activeOrder.id)
      .then(res => setMessages(res.data || []))
      .catch(console.error)
      .finally(() => setLoadingMsgs(false));

    // Join socket room
    if (socket) {
      socket.emit("join_order", activeOrder.id);
    }

    return () => {
      if (socket) socket.emit("leave_order", activeOrder.id);
    };
  }, [activeOrder?.id, socket]);

  // ── Listen for new messages via socket ────────────────────
  useEffect(() => {
    if (!socket) return;

    socket.on("new_message", (msg) => {
      if (msg.order_id === activeOrder?.id) {
        setMessages(prev => [...prev, msg]);
      }
      // Update last message in order list
      setOrders(prev => prev.map(o =>
        o.id === msg.order_id
          ? { ...o, lastMsg: msg.content, lastTime: msg.createdAt }
          : o
      ));
    });

    return () => socket.off("new_message");
  }, [socket, activeOrder?.id]);

  // ── Auto scroll to bottom ─────────────────────────────────
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Send message ──────────────────────────────────────────
  const send = async () => {
    if (!input.trim() || !activeOrder) return;
    const text = input.trim();
    setInput("");

    try {
      await messagesAPI.send(activeOrder.id, { content: text });
      // Socket will push new_message back
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (d) => {
    if (!d) return "";
    const diff = Date.now() - new Date(d).getTime();
    const h = Math.floor(diff / 3600000);
    const j = Math.floor(diff / 86400000);
    if (h < 1)  return new Date(d).toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" });
    if (h < 24) return new Date(d).toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" });
    if (j < 7)  return `${j}j`;
    return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  };

  const getLastMsg = (order) => {
    return order.lastMsg || "Aucun message";
  };

  const getUnread = (order) => {
    return order.unread || 0;
  };

  return (
    <ClientLayout>
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
            {loadingOrders ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--text-soft)", fontSize: 12 }}>
                Chargement...
              </div>
            ) : orders.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--text-soft)", fontSize: 12 }}>
                Aucune commande
              </div>
            ) : (
              orders.map((o) => (
                <div
                  key={o.id}
                  onClick={() => setActiveOrder(o)}
                  style={{
                    padding: "15px 18px",
                    borderBottom: "1px solid var(--border-soft)",
                    cursor: "pointer",
                    background: activeOrder?.id === o.id ? "var(--sky-light)" : "transparent",
                    borderLeft: activeOrder?.id === o.id ? "3px solid var(--teal)" : "3px solid transparent",
                    transition: "background .15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span className="mono" style={{ fontSize: 10, color: "var(--text-soft)" }}>
                      CMD-{String(o.id).padStart(6, "0")}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 10, color: "var(--text-soft)" }}>
                        {formatTime(o.updatedAt)}
                      </span>
                      {getUnread(o) > 0 && (
                        <span className="unread-pill">{getUnread(o)}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)", marginBottom: 4 }}>
                    {o.productName || o.description?.slice(0, 35) || "Commande personnalisée"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-soft)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    {getLastMsg(o)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat panel */}
          <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>

            {/* Chat header */}
            <div className="card-header" style={{ flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,var(--teal),var(--teal-dark))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>M</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)" }}>
                    {activeOrder
                      ? `CMD-${String(activeOrder.id).padStart(6, "0")} — ${activeOrder.productName || "Commande personnalisée"}`
                      : "Sélectionnez une commande"}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--teal)", display: "flex", alignItems: "center", gap: 5 }}>
                    <span className="online-dot" style={{ width: 5, height: 5 }}></span> MGTS en ligne
                  </div>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm">📎 Joindre un fichier</button>
            </div>

            {/* Messages */}
            <div className="chat-body" style={{ flex: 1 }} ref={chatBodyRef}>
              {loadingMsgs ? (
                <div style={{ textAlign: "center", color: "var(--text-soft)", fontSize: 12, padding: "20px" }}>
                  Chargement des messages...
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text-soft)", fontSize: 12, padding: "20px" }}>
                  Aucun message. Démarrez la conversation !
                </div>
              ) : (
                messages.map((m, i) => {
                  const isClient = m.sender_id === user?.id;
                  return (
                    <div key={i} style={{ display: "flex", justifyContent: isClient ? "flex-end" : "flex-start" }}>
                      {!isClient && (
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--teal-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "var(--teal)", flexShrink: 0, marginRight: 8, marginTop: 2 }}>
                          {m.senderName?.[0] || "M"}
                        </div>
                      )}
                      <div className={`bubble ${isClient ? "bubble-out" : "bubble-in"}`}>
                        {m.content}
                        <div className="bubble-time">{formatTime(m.createdAt)}</div>
                      </div>
                    </div>
                  );
                })
              )}
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
                disabled={!activeOrder}
              />
              <button className="btn btn-ghost" style={{ padding: "10px 12px" }}>📎</button>
              <button
                className="btn btn-primary"
                style={{ padding: "10px 16px" }}
                onClick={send}
                disabled={!activeOrder || !input.trim()}
              >
                Envoyer →
              </button>
            </div>

          </div>
        </div>
      </div>
    </ClientLayout>
  );
}