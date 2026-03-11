import { useNavigate } from "react-router-dom";
import "../../styles/Supplier.css";
import SupplierLayout from "../../components/Fournisseur/SupplierLayout";

const stats = [
  { label: "Produits publiés",    value: "8",      icon: "◈", color: "#009189", bg: "#E0F5F4" },
  { label: "Demandes en attente", value: "3",      icon: "✦", color: "#FF6500", bg: "#FFF0E6" },
  { label: "Commandes actives",   value: "5",      icon: "◆", color: "#0077A8", bg: "#E0F1FA" },
  { label: "Chiffre du mois",     value: "24 600 €",icon: "⬡", color: "#F5A623", bg: "#FEF6E8" },
];

const recentDemands = [
  { id:"DEM-2024-018", title:"Pièces mécaniques usinées",    state:"new",    urgency:"high",   date:"14 Nov 2024", budget:"8 000 €",  client:"Dupont Industries" },
  { id:"DEM-2024-017", title:"Emballages kraft sur mesure",  state:"quoted", urgency:"medium", date:"12 Nov 2024", budget:"3 500 €",  client:"LogiPack SAS" },
  { id:"DEM-2024-016", title:"Conteneurs acier galvanisé",   state:"accepted",urgency:"low",   date:"08 Nov 2024", budget:"15 000 €", client:"StockMax SA" },
];

const recentOrders = [
  { id:"CMD-2024-002", product:"Pièces mécaniques sur mesure", status:"en_production", amount:"8 200 €",  client:"Jean Dupont",  date:"28 Oct 2024" },
  { id:"CMD-2024-003", product:"Emballages personnalisés",      status:"livré",         amount:"3 400 €",  client:"LogiPack SAS", date:"10 Sep 2024" },
];

const activity = [
  { icon:"✦", text:"Nouvelle demande DEM-2024-018 reçue",       time:"Il y a 1h",  color:"#FF6500" },
  { icon:"◆", text:"Commande CMD-2024-002 en production",        time:"Il y a 6h",  color:"#009189" },
  { icon:"◎", text:"Message de MGTS sur CMD-2024-002",           time:"Il y a 1j",  color:"#0077A8" },
  { icon:"⬡", text:"Paiement reçu pour CMD-2024-003",           time:"Il y a 3j",  color:"#F5A623" },
];

const stateConfig = {
  new:      { label:"Nouveau",      color:"#FF6500", bg:"#FFF0E6" },
  quoted:   { label:"Devis soumis", color:"#009189", bg:"#E0F5F4" },
  accepted: { label:"Accepté",      color:"#007770", bg:"#D5F0EE" },
  rejected: { label:"Refusé",       color:"#CC3A00", bg:"#FFE8DC" },
};

const orderConfig = {
  en_production:{ label:"En production", color:"#FF6500", bg:"#FFF0E6" },
  livré:        { label:"Livré",          color:"#007770", bg:"#D5F0EE" },
  en_transit:   { label:"En transit",     color:"#0077A8", bg:"#E0F1FA" },
};

export default function SupplierDashboard() {
  const navigate = useNavigate();

  return (
    <SupplierLayout>
      {/* Welcome */}
      
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 23, fontWeight: 700, color: "var(--text-dark)" }}>
          Bonjour, Shenzhen MetalTech 👋
        </h1>
        <p style={{ color: "var(--text-mid)", fontSize: 13, marginTop: 5 }}>
          Voici l'état de votre activité fournisseur aujourd'hui.
        </p>
      </div>

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

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

        {/* Demands */}
        <div className="card">
          <div className="card-header">
            <h3>Demandes récentes</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/supplier/demands")}>Voir tout →</button>
          </div>
          {recentDemands.map((d) => {
            const s = stateConfig[d.state];
            return (
              <div key={d.id} className="table-row" style={{ gridTemplateColumns: "1fr 120px 80px" }} onClick={() => navigate("/supplier/demands")}>
                <div>
                  <div className="row-id">{d.id}</div>
                  <div className="row-title">{d.title}</div>
                  <div className="row-sub">{d.client}</div>
                </div>
                <span className="badge" style={{ color: s.color, background: s.bg }}>
                  <span className="badge-dot" style={{ background: s.color }} />{s.label}
                </span>
                <div className="row-amount" style={{ fontSize: 12 }}>{d.budget}</div>
              </div>
            );
          })}
        </div>

        {/* Orders */}
        <div className="card">
          <div className="card-header">
            <h3>Commandes en cours</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/supplier/orders")}>Voir tout →</button>
          </div>
          {recentOrders.map((o) => {
            const s = orderConfig[o.status] ?? orderConfig.en_production;
            return (
              <div key={o.id} className="table-row" style={{ gridTemplateColumns: "1fr 120px 90px" }} onClick={() => navigate("/supplier/orders")}>
                <div>
                  <div className="row-id">{o.id}</div>
                  <div className="row-title">{o.product}</div>
                  <div className="row-sub">{o.client} · {o.date}</div>
                </div>
                <span className="badge" style={{ color: s.color, background: s.bg }}>
                  <span className={`badge-dot${o.status === "en_production" ? " pulse" : ""}`} style={{ background: s.color }} />{s.label}
                </span>
                <div className="row-amount">{o.amount}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity + Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
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
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 18, color: "var(--text-dark)" }}>Actions rapides</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "➕ Ajouter un produit",     to: "/supplier/products", style: "primary" },
              { label: "✦ Voir les demandes",       to: "/supplier/demands",  style: "orange"  },
              { label: "◎ Ouvrir la messagerie",    to: "/supplier/messages", style: "ghost"   },
              { label: "◆ Historique commandes",    to: "/supplier/orders",   style: "ghost"   },
            ].map(({ label, to, style }) => (
              <button
                key={to}
                className={`btn btn-${style} btn-full`}
                onClick={() => navigate(to)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SupplierLayout>
  );
}