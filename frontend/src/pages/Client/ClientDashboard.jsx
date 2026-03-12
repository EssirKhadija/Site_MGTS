import { useNavigate } from "react-router-dom";
import "../../styles/Client.css";
import ClientLayout from "../../components/Client/ClientLayout";

const stats = [
  { label: "Commandes actives",   value: "2",       icon: "⬡", color: "#009189", bg: "#E0F5F4"  },
  { label: "Devis en attente",    value: "1",       icon: "◈", color: "#F5A623", bg: "#FEF6E8"  },
  { label: "Livraisons ce mois",  value: "1",       icon: "◉", color: "#FF6500", bg: "#FFF0E6"  },
  { label: "Économies réalisées", value: "2 100 €", icon: "◆", color: "#0077A8", bg: "#E0F1FA"  },
];

const recentOrders = [
  { id: "CMD-2024-001", product: "Conteneurs de stockage industriels", status: "devis_recu",    date: "15 Nov 2024", budget: "12 500 €", messages: 3, unread: 1 },
  { id: "CMD-2024-002", product: "Pièces mécaniques sur mesure",       status: "en_production", date: "28 Oct 2024", budget: "8 200 €",  messages: 7, unread: 0 },
  { id: "CMD-2024-003", product: "Emballages personnalisés",            status: "livré",         date: "10 Sep 2024", budget: "3 400 €",  messages: 12,unread: 0 },
];

const activity = [
  { icon: "◆", text: "Devis reçu pour CMD-2024-001",        time: "Il y a 2h",  color: "#009189" },
  { icon: "◉", text: "Production démarrée CMD-2024-002",    time: "Il y a 1j",  color: "#FF6500" },
  { icon: "✦", text: "Facture disponible CMD-2024-003",     time: "Il y a 3j",  color: "#0077A8" },
  { icon: "◈", text: "Nouveau message de l'équipe MGTS",    time: "Il y a 5j",  color: "#F5A623" },
];

const statusConfig = {
  brouillon:     { label: "Brouillon",      color: "#89B5BE", bg: "#F0F8FA" },
  en_attente:    { label: "En attente",     color: "#F5A623", bg: "#FEF6E8" },
  devis_recu:    { label: "Devis reçu",     color: "#009189", bg: "#E0F5F4" },
  validé:        { label: "Validé",         color: "#007770", bg: "#D5F0EE" },
  en_production: { label: "En production",  color: "#FF6500", bg: "#FFF0E6" },
  en_transit:    { label: "En transit",     color: "#0077A8", bg: "#E0F1FA" },
  livré:         { label: "Livré",          color: "#007770", bg: "#D5F0EE" },
  refusé:        { label: "Refusé",         color: "#CC3A00", bg: "#FFE8DC" },
};

export default function ClientDashboard() {
  const navigate = useNavigate();

  return (
    <ClientLayout>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 23, fontWeight: 700, color: "var(--text-dark)" }}>
          Bonjour, Jean 👋
        </h1>
        <p style={{ color: "var(--text-mid)", fontSize: 13, marginTop: 5 }}>
          Voici l'état de vos opérations en cours.
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="card stat-card">
            <div className="stat-card-inner">
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
              </div>
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table + Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

        {/* Recent orders */}
        <div className="card">
          <div className="card-header">
            <h3>Commandes récentes</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/orders")}>
              Voir tout →
            </button>
          </div>

          <div
            className="table-header"
            style={{ gridTemplateColumns: "1fr 160px 120px 90px 52px" }}
          >
            <span>Commande</span>
            <span>Statut</span>
            <span>Date</span>
            <span>Budget</span>
            <span>Msg</span>
          </div>

          {recentOrders.map((o) => {
            const s = statusConfig[o.status];
            return (
              <div
                key={o.id}
                className="table-row"
                style={{ gridTemplateColumns: "1fr 160px 120px 90px 52px" }}
                onClick={() => navigate("/orders")}
              >
                <div>
                  <div className="row-id">{o.id}</div>
                  <div className="row-title">{o.product}</div>
                </div>
                <span className="badge" style={{ color: s.color, background: s.bg }}>
                  <span
                    className={`badge-dot${o.status === "en_production" ? " pulse" : ""}`}
                    style={{ background: s.color }}
                  />
                  {s.label}
                </span>
                <div style={{ fontSize: 12, color: "var(--text-soft)" }}>{o.date}</div>
                <div className="row-amount">{o.budget}</div>
                <div style={{ fontSize: 12, color: "var(--text-soft)", display: "flex", alignItems: "center", gap: 4 }}>
                  ◎ {o.messages}
                  {o.unread > 0 && <span className="unread-pill">{o.unread}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Activity feed */}
        <div className="card card-pad">
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 18, color: "var(--text-dark)" }}>
            Activité récente
          </h3>

          {activity.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-start" }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: a.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: a.color, flexShrink: 0 }}>
                {a.icon}
              </div>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-dark)", lineHeight: 1.5 }}>{a.text}</div>
                <div style={{ fontSize: 11, color: "var(--text-soft)", marginTop: 3 }}>{a.time}</div>
              </div>
            </div>
          ))}

          <hr className="divider" />
          <button
            className="btn btn-primary btn-full"
            onClick={() => navigate("/new")}
          >
            ✦ Nouvelle demande
          </button>
        </div>

      </div>
    </ClientLayout>
  );
}