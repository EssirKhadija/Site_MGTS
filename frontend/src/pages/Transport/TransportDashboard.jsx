import { useNavigate } from "react-router-dom";
import TransportLayout from "../../components/Transport/TransportLayout";

const stats = [
  { label: "Commandes à traiter",  value: "4",  icon: "◈", color: "#E03A2E", bg: "#FFE8DC" },
  { label: "Expéditions en cours", value: "7",  icon: "🚢", color: "#0060A8", bg: "#E0EFFA" },
  { label: "Livrées ce mois",      value: "12", icon: "✓",  color: "#009189", bg: "#E0F5F4" },
  { label: "Chiffre du mois",      value: "38 400 €", icon: "◆", color: "#F5A623", bg: "#FEF6E8" },
];

const pendingOrders = [
  { id: "CMD-2024-001", product: "Conteneurs de stockage industriels", origin: "Shenzhen", destination: "Le Havre", incoterm: "FOB", weight: "2 400 kg", etd: "18 Nov", status: "pending_fees" },
  { id: "CMD-2024-004", product: "Pièces mécaniques CNC",              origin: "Guangzhou", destination: "Marseille", incoterm: "CIF", weight: "850 kg",  etd: "22 Nov", status: "pending_fees" },
];

const activeShipments = [
  { id: "SHP-2024-009", product: "Emballages kraft sur mesure", mode: "sea", origin: "Yiwu", destination: "Lyon", status: "in_transit",  eta: "05 Déc", progress: 65 },
  { id: "SHP-2024-008", product: "Profilés acier inox 304",     mode: "air", origin: "Shanghai", destination: "Paris CDG", status: "at_port", eta: "24 Nov", progress: 85 },
  { id: "SHP-2024-007", product: "Boîtiers plastique ABS",      mode: "sea", origin: "Ningbo", destination: "Bordeaux", status: "customs", eta: "28 Nov", progress: 78 },
];

const modeIcon = { sea: "🚢", air: "✈️", road: "🚛", rail: "🚂" };

const statusConfig = {
  pending_fees: { label: "Frais à saisir", color: "#E03A2E", bg: "#FFE8DC" },
  in_transit:   { label: "En transit",     color: "#0060A8", bg: "#E0EFFA" },
  at_port:      { label: "Au port",        color: "#FF6500", bg: "#FFF0E6" },
  customs:      { label: "En douane",      color: "#7C3AED", bg: "#F5F0FF" },
  delivered:    { label: "Livré",          color: "#009189", bg: "#E0F5F4" },
};

const activity = [
  { icon: "◈", text: "CMD-2024-001 en attente de frais logistiques",   time: "Il y a 30 min", color: "#E03A2E" },
  { icon: "🚢", text: "SHP-2024-009 en transit — ETA 05 Déc",           time: "Il y a 2h",     color: "#0060A8" },
  { icon: "◎", text: "Message MGTS sur SHP-2024-008",                   time: "Il y a 4h",     color: "#009189" },
  { icon: "✓", text: "SHP-2024-006 livré — documents transmis",         time: "Il y a 1j",     color: "#009189" },
];

export default function TransportDashboard() {
  const navigate = useNavigate();

  return (
    <TransportLayout>
      <div className="page-content">
        <div style={{ marginBottom: 32 }}>
          
          <h1 style={{ fontSize: 23, fontWeight: 700, color: "var(--text-dark)" }}>
            Bonjour, CMA CGM Logistics 
        </h1>
        <p style={{ color: "var(--text-mid)", fontSize: 13, marginTop: 5 }}>
          {pendingOrders.length} commande(s) en attente de vos frais logistiques.
        </p>
      </div>

      {/* Alert strip */}
      {pendingOrders.length > 0 && (
        <div style={{ background: "var(--orange-light)", border: "1.5px solid var(--orange)", borderRadius: "var(--radius-sm)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <span style={{ fontSize: 22 }}>⚠</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-dark)" }}>
              {pendingOrders.length} commande(s) nécessitent vos frais logistiques
            </div>
            <div style={{ fontSize: 12, color: "var(--text-mid)", marginTop: 2 }}>
              Saisissez les frais de transport pour que MGTS puisse finaliser les devis clients.
            </div>
          </div>
          <button className="btn btn-orange" onClick={() => navigate("/transport/orders")}>
            Traiter maintenant →
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="card stat-card">
            <div className="stat-inner">
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
              </div>
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

        {/* Pending orders */}
        <div className="card">
          <div className="card-header">
            <h3>Commandes — frais à saisir</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/transport/orders")}>Voir tout →</button>
          </div>
          {pendingOrders.map(o => (
            <div key={o.id} className="table-row" style={{ gridTemplateColumns: "1fr 110px 80px" }} onClick={() => navigate("/transport/orders")}>
              <div>
                <div className="row-id">{o.id}</div>
                <div className="row-title">{o.product}</div>
                <div className="row-sub">{o.origin} → {o.destination} · {o.weight}</div>
              </div>
              <span className="badge" style={{ color: "#E03A2E", background: "#FFE8DC" }}>
                <span className="badge-dot" style={{ background: "#E03A2E" }} />Frais requis
              </span>
              <div style={{ fontSize: 11, color: "var(--text-soft)" }}>ETD {o.etd}</div>
            </div>
          ))}
        </div>

        {/* Active shipments */}
        <div className="card">
          <div className="card-header">
            <h3>Expéditions en cours</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/transport/history")}>Voir tout →</button>
          </div>
          {activeShipments.map(s => {
            const cfg = statusConfig[s.status];
            return (
              <div key={s.id} style={{ padding: "14px 22px", borderBottom: "1px solid var(--border-soft)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div className="row-id">{s.id}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)" }}>
                      {modeIcon[s.mode]} {s.origin} → {s.destination}
                    </div>
                  </div>
                  <span className="badge" style={{ color: cfg.color, background: cfg.bg }}>
                    <span className="badge-dot" style={{ background: cfg.color }} />{cfg.label}
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: s.progress + "%", height: "100%", background: "var(--tr)", borderRadius: 3, transition: "width .5s" }} />
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-soft)", flexShrink: 0 }}>ETA {s.eta}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity + Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
        <div className="card card-pad">
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 18, color: "var(--text-dark)" }}>Activité récente</h3>
          {activity.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-start" }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: a.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: a.color, flexShrink: 0 }}>{a.icon}</div>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-dark)", lineHeight: 1.5 }}>{a.text}</div>
                <div style={{ fontSize: 11, color: "var(--text-soft)", marginTop: 3 }}>{a.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card card-pad">
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "var(--text-dark)" }}>Actions rapides</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "◈ Commandes à traiter",  to: "/transport/orders",    style: "primary" },
              { label: "🚢 Saisir frais logistiques", to: "/transport/logistics", style: "teal"  },
              { label: "◎ Messagerie MGTS",       to: "/transport/messages",  style: "ghost"   },
              { label: "◆ Historique opérations", to: "/transport/history",   style: "ghost"   },
            ].map(({ label, to, style }) => (
              <button key={to} className={`btn btn-${style} btn-full`} onClick={() => navigate(to)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
    </TransportLayout>
  );
}