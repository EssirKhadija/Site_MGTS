import { useState, useEffect } from "react";
import "../../styles/Client.css";

const typeConfig = {
  success: { icon: "✓", color: "#009189", bg: "#E0F5F4" },
  info:    { icon: "◈", color: "#0077A8", bg: "#E0F1FA" },
  warning: { icon: "⚠", color: "#F5A623", bg: "#FEF6E8" },
  error:   { icon: "✗", color: "#FF6500", bg: "#FFF0E6" },
};

/**
 * Single notification toast.
 *
 * Props:
 *   id       {string|number}
 *   type     {"success"|"info"|"warning"|"error"}
 *   title    {string}
 *   message  {string}
 *   duration {number}  ms before auto-dismiss (default 4500)
 *   onClose  {fn}
 */
export function NotificationToast({ id, type = "info", title, message, duration = 4500, onClose }) {
  const cfg = typeConfig[type] ?? typeConfig.info;

  useEffect(() => {
    const t = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(t);
  }, [id, duration, onClose]);

  return (
    <div className="notif">
      <div className="notif-icon" style={{ color: cfg.color, background: cfg.bg }}>
        {cfg.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div className="notif-title">{title}</div>
        {message && <div className="notif-msg">{message}</div>}
      </div>
      <button className="notif-close" onClick={() => onClose(id)}>×</button>
    </div>
  );
}

/**
 * NotificationCenter — renders a stack of toasts in the top-right corner.
 *
 * Usage:
 *   const { notify, NotificationCenter } = useNotifications();
 *   notify({ type:"success", title:"Devis accepté", message:"Votre commande est confirmée." });
 *   return <><NotificationCenter /><YourApp /></>
 */
export function useNotifications() {
  const [toasts, setToasts] = useState([]);

  const notify = ({ type = "info", title, message, duration }) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
  };

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const NotificationCenter = () => (
    <div className="notif-wrap">
      {toasts.map((t) => (
        <NotificationToast key={t.id} {...t} onClose={remove} />
      ))}
    </div>
  );

  return { notify, NotificationCenter };
}

/**
 * NotificationPanel — dropdown list of past notifications (for navbar bell).
 *
 * Props:
 *   notifications  {Array}
 *   onMarkRead     {fn}
 *   onClose        {fn}
 */
export function NotificationPanel({ notifications = [], onMarkRead, onClose }) {
  return (
    <div style={{
      position: "absolute",
      top: 48,
      right: 0,
      width: 340,
      background: "#fff",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      boxShadow: "var(--shadow-md)",
      zIndex: 150,
      overflow: "hidden",
    }}>
      <div style={{
        padding: "14px 18px",
        borderBottom: "1px solid var(--border-soft)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-dark)" }}>Notifications</span>
        <button
          style={{ background: "none", border: "none", fontSize: 12, color: "var(--teal)", cursor: "pointer", fontWeight: 600 }}
          onClick={onMarkRead}
        >
          Tout marquer lu
        </button>
      </div>

      <div style={{ maxHeight: 340, overflowY: "auto" }}>
        {notifications.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-soft)", fontSize: 13 }}>
            Aucune notification
          </div>
        ) : (
          notifications.map((n) => {
            const cfg = typeConfig[n.type] ?? typeConfig.info;
            return (
              <div key={n.id} style={{
                display: "flex",
                gap: 12,
                padding: "13px 18px",
                borderBottom: "1px solid var(--border-soft)",
                background: n.read ? "transparent" : "var(--sky-xlight)",
                cursor: "pointer",
                transition: "background .15s",
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: cfg.bg, color: cfg.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>
                  {cfg.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, color: "var(--text-dark)", lineHeight: 1.4 }}>{n.title}</div>
                  {n.message && <div style={{ fontSize: 12, color: "var(--text-mid)", marginTop: 2 }}>{n.message}</div>}
                  <div style={{ fontSize: 11, color: "var(--text-soft)", marginTop: 4 }}>{n.time}</div>
                </div>
                {!n.read && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--orange)", flexShrink: 0, marginTop: 4 }}></span>}
              </div>
            );
          })
        )}
      </div>

      <div style={{ padding: "10px 18px", borderTop: "1px solid var(--border-soft)", textAlign: "center" }}>
        <button style={{ background: "none", border: "none", fontSize: 12, color: "var(--teal)", cursor: "pointer", fontWeight: 600 }} onClick={onClose}>
          Fermer
        </button>
      </div>
    </div>
  );
}