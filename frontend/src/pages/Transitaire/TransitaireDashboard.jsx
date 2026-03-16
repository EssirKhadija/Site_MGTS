import { useNavigate } from "react-router-dom";


const stats = [
  { label: "Dossiers à traiter",  value: "3",       icon: "◈", color: "#FF6500", bg: "#FFF0E6" },
  { label: "En cours de dédouan.",value: "5",       icon: "✦", color: "#5B21B6", bg: "#EDE9FE" },
  { label: "Validés ce mois",     value: "18",      icon: "✓", color: "#009189", bg: "#E0F5F4" },
  { label: "Frais traités",       value: "42 800 €", icon: "◆", color: "#F5A623", bg: "#FEF6E8" },
];

const pendingDossiers = [
  { id: "DOS-2024-031", product: "Conteneurs de stockage industriels", status: "new",    origin: "Shenzhen, CN", destination: "Le Havre, FR", etd: "18 Nov 2024", value: "21 500 €" },
  { id: "DOS-2024-030", product: "Pièces mécaniques CNC aluminium",   status: "in_progress", origin: "Guangzhou, CN", destination: "Marseille, FR", etd: "22 Nov 2024", value: "8 200 €" },
  { id: "DOS-2024-029", product: "Boîtiers plastique ABS sur mesure", status: "customs_check", origin: "Ningbo, CN", destination: "Bordeaux, FR", etd: "15 Nov 2024", value: "6 400 €" },
];

const recentHistory = [
  { id: "DOS-2024-028", product: "Emballages personnalisés kraft",  status: "completed", date: "10 Nov 2024", fees: "1 240 €" },
  { id: "DOS-2024-027", product: "Profilés acier inox 316L",        status: "completed", date: "05 Nov 2024", fees: "890 €"   },
  { id: "DOS-2024-026", product: "Tissu non-tissé industriel",      status: "completed", date: "28 Oct 2024", fees: "1 560 €" },
];

const activity = [
  { icon: "✦", text: "DOS-2024-031 assigné — frais douaniers à saisir",    time: "Il y a 1h",  color: "#FF6500" },
  { icon: "◆", text: "DOS-2024-029 en contrôle douane au Havre",           time: "Il y a 3h",  color: "#5B21B6" },
  { icon: "◎", text: "Message MGTS sur DOS-2024-030",                      time: "Il y a 5h",  color: "#009189" },
  { icon: "✓", text: "DOS-2024-028 clôturé — documents transmis à MGTS",   time: "Il y a 1j",  color: "#009189" },
];

const statusConfig = {
  new:           { label: "Nouveau",         color: "#FF6500", bg: "#FFF0E6" },
  in_progress:   { label: "En cours",        color: "#5B21B6", bg: "#EDE9FE" },
  customs_check: { label: "Contrôle douane", color: "#F5A623", bg: "#FEF6E8" },
  completed:     { label: "Clôturé",         color: "#4A7A82", bg: "#EAF7FB" },
};

export default function TransitaireDashboard() {
  const navigate = useNavigate();

  return (
    <div className="page-content">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 23, fontWeight: 700, color: "var(--text-dark)" }}>
          Bonjour, Geodis Freight Forwarding 👋
        </h1>
        <p style={{ color: "var(--text-mid)", fontSize: 13, marginTop: 5 }}>
          {pendingDossiers.filter(d => d.status === "new").length} nouveau(x) dossier(s) en attente de vos frais douaniers.
        </p>
      </div>

      {/* Alert */}
      {pendingDossiers.filter(d => d.status === "new").length > 0 && (
        <div className="pending-banner">
          <div className="pending-banner-icon">⚠</div>
          <div style={{ flex: 1 }}>
            <div className="pending-banner-title">
              {pendingDossiers.filter(d => d.status === "new").length} dossier(s) nécessitent vos frais douaniers
            </div>
            <div className="pending-banner-text">
              Saisissez les frais douaniers et validez les informations d'importation pour débloquer les dossiers.
            </div>
          </div>
          <button className="btn btn-orange" onClick={() => navigate("/transitaire/orders")}>
            Traiter →
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

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

        {/* Pending dossiers */}
        <div className="card">
          <div className="card-header">
            <h3>Dossiers en attente</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/transitaire/orders")}>Voir tout →</button>
          </div>
          {pendingDossiers.map(d => {
            const s = statusConfig[d.status];
            return (
              <div key={d.id} className="table-row" style={{ gridTemplateColumns: "1fr 130px 80px" }} onClick={() => navigate("/transitaire/orders")}>
                <div>
                  <div className="row-id">{d.id}</div>
                  <div className="row-title">{d.product}</div>
                  <div className="row-sub">{d.origin} → {d.destination}</div>
                </div>
                <span className="badge" style={{ color: s.color, background: s.bg }}>
                  <span className="badge-dot" style={{ background: s.color }} />{s.label}
                </span>
                <div style={{ fontSize: 11, color: "var(--text-soft)" }}>{d.etd}</div>
              </div>
            );
          })}
        </div>

        {/* Recent history */}
        <div className="card">
          <div className="card-header">
            <h3>Dossiers récents</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/transitaire/history")}>Voir tout →</button>
          </div>
          {recentHistory.map(h => (
            <div key={h.id} className="table-row" style={{ gridTemplateColumns: "1fr 90px 80px" }} onClick={() => navigate("/transitaire/history")}>
              <div>
                <div className="row-id">{h.id}</div>
                <div className="row-title">{h.product}</div>
                <div className="row-sub">{h.date}</div>
              </div>
              <div className="row-amount" style={{ fontSize: 12 }}>{h.fees}</div>
              <span className="badge" style={{ color: "var(--teal)", background: "var(--teal-light)" }}>✓ Clôturé</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity + Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 20 }}>
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
              { label: "◈ Dossiers à traiter",       to: "/transitaire/orders",  style: "primary" },
              { label: "✦ Saisir frais douaniers",    to: "/transitaire/customs", style: "teal"    },
              { label: "◆ Valider info. import",      to: "/transitaire/import",  style: "orange"  },
              { label: "▣ Historique dossiers",       to: "/transitaire/history", style: "ghost"   },
              { label: "◎ Messagerie MGTS",           to: "/transitaire/messages",style: "ghost"   },
            ].map(({ label, to, style }) => (
              <button key={to} className={`btn btn-${style} btn-full`} onClick={() => navigate(to)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}