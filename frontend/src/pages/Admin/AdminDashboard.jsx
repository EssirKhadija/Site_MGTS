import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/Admin/AdminLayout";
import "../../styles/Admin.css";

const stats = [
  { label:"Chiffre d'affaires",  value:"186 400", unit:"€", change:"+12%", up:true,  type:"teal",   icon:"◆" },
  { label:"Commandes actives",   value:"24",       unit:"",  change:"+3",   up:true,  type:"blue",   icon:"◈" },
  { label:"Utilisateurs total",  value:"47",       unit:"",  change:"+2",   up:true,  type:"purple", icon:"◉" },
  { label:"Commandes livrées",   value:"142",      unit:"",  change:"+18",  up:true,  type:"green",  icon:"✓" },
  { label:"Paiements en att.",   value:"6",        unit:"",  change:"+1",   up:false, type:"orange", icon:"⏳" },
  { label:"Litiges ouverts",     value:"2",        unit:"",  change:"-1",   up:true,  type:"red",    icon:"⚠" },
  { label:"Commission MGTS",     value:"18 640",   unit:"€", change:"+8%",  up:true,  type:"teal",   icon:"%" },
  { label:"Fournisseurs actifs", value:"12",       unit:"",  change:"0",    up:null,  type:"blue",   icon:"✦" },
];

const recentOrders = [
  { id:"CMD-2024-031", client:"Dupont Industries", supplier:"Shenzhen MetalTech", amount:"21 500 €", status:"en_production", date:"14 Nov 2024" },
  { id:"CMD-2024-030", client:"MetalPro France",   supplier:"Guangzhou Precision", amount:"8 200 €",  status:"en_transit",    date:"12 Nov 2024" },
  { id:"CMD-2024-029", client:"LogiPack SAS",      supplier:"Ningbo PlasticTech", amount:"6 400 €",  status:"en_douane",     date:"10 Nov 2024" },
  { id:"CMD-2024-028", client:"InoxPro SAS",       supplier:"Shanghai Steel Ltd.", amount:"12 800 €", status:"livré",         date:"08 Nov 2024" },
  { id:"CMD-2024-027", client:"StockMax SA",        supplier:"Shenzhen MetalTech", amount:"4 200 €",  status:"livré",         date:"05 Nov 2024" },
];

const pendingUsers = [
  { name:"Ahmed Al Rashid",   role:"fournisseur", company:"Dubai MetalCo",      date:"15 Nov 2024" },
  { name:"Marie Leblanc",     role:"transporteur",company:"Leblanc Transit SAS", date:"14 Nov 2024" },
  { name:"Chen Wei",          role:"fournisseur", company:"Shenzhen ChemTech",  date:"13 Nov 2024" },
];

const revenueByMonth = [
  { month:"Jul", value:124000, pct:66 },
  { month:"Aoû", value:138000, pct:74 },
  { month:"Sep", value:152000, pct:82 },
  { month:"Oct", value:163000, pct:87 },
  { month:"Nov", value:186400, pct:100 },
];

const statusConfig = {
  en_production: { label:"En production",  color:"var(--orange)",  bg:"var(--orange-light)" },
  en_transit:    { label:"En transit",     color:"var(--blue)",    bg:"var(--blue-light)"   },
  en_douane:     { label:"En douane",      color:"var(--purple)",  bg:"var(--purple-light)" },
  livré:         { label:"Livré",          color:"var(--green)",   bg:"var(--green-light)"  },
  en_attente:    { label:"En attente",     color:"var(--yellow)",  bg:"var(--yellow-light)" },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const now = new Date().toLocaleString("fr", { weekday:"long", day:"numeric", month:"long", year:"numeric" });

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", letterSpacing: "-.5px", marginBottom: 4 }}>
              Vue d'ensemble
            </h1>
            <p style={{ fontSize: 11, color: "var(--text-soft)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "1px" }}>{now}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/admin/exports")}>↓ Export</button>
            <button className="btn btn-primary btn-sm">↻ Actualiser</button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {pendingUsers.length > 0 && (
        <div className="alert-banner">
          <div className="alert-banner-icon">⚠</div>
          <div style={{ flex: 1 }}>
            <div className="alert-banner-title">{pendingUsers.length} comptes en attente de validation</div>
            <div className="alert-banner-text">Des nouveaux utilisateurs attendent votre approbation pour accéder à la plateforme.</div>
          </div>
          <button className="btn btn-orange btn-sm" onClick={() => navigate("/admin/users")}>Valider →</button>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {stats.map((s, i) => (
          <div key={i} className={`card stat-card stat-${s.type}`} style={{ animationDelay: `${i * .05}s` }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}<span> {s.unit}</span></div>
            {s.change !== "0" && (
              <div className="stat-change" style={{ color: s.up ? "var(--green)" : s.up === false ? "var(--red)" : "var(--text-soft)" }}>
                {s.up ? "▲" : s.up === false ? "▼" : "—"} {s.change} vs mois précédent
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, marginBottom: 16 }}>
        {/* Recent orders */}
        <div className="card">
          <div className="card-header">
            <h3>Commandes récentes</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/admin/orders")}>Voir tout →</button>
          </div>
          <div className="table-header" style={{ gridTemplateColumns: "1fr 150px 130px 90px 100px" }}>
            <span>Commande</span><span>Client</span><span>Fournisseur</span><span>Montant</span><span>Statut</span>
          </div>
          {recentOrders.map(o => {
            const s = statusConfig[o.status] ?? statusConfig.en_attente;
            return (
              <div key={o.id} className="table-row" style={{ gridTemplateColumns: "1fr 150px 130px 90px 100px" }} onClick={() => navigate("/admin/orders")}>
                <div>
                  <div className="row-id">{o.id}</div>
                  <div className="row-sub" style={{ marginTop: 0 }}>{o.date}</div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-mid)" }}>{o.client}</div>
                <div style={{ fontSize: 11, color: "var(--text-soft)" }}>{o.supplier}</div>
                <div className="row-amount" style={{ fontSize: 12 }}>{o.amount}</div>
                <span className="badge" style={{ color: s.color, background: s.bg }}>{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Revenue chart */}
        <div className="card card-pad">
          <h3 style={{ fontSize: 10, fontWeight: 700, color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 18 }}>
            CA Mensuel (€)
          </h3>
          {revenueByMonth.map((r, i) => (
            <div key={i} className="chart-bar-row">
              <div className="chart-bar-label">{r.month}</div>
              <div className="chart-bar-track">
                <div className="chart-bar-fill" style={{ width: r.pct + "%", background: i === revenueByMonth.length - 1 ? "var(--teal)" : "var(--bg-4)", boxShadow: i === revenueByMonth.length - 1 ? "0 0 10px var(--teal-glow)" : "none" }} />
              </div>
              <div className="chart-bar-value">{(r.value / 1000).toFixed(0)}k</div>
            </div>
          ))}

          <hr className="divider" />

          {/* Distribution donut placeholder */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label:"Mécanique",  pct:34, color:"var(--teal)"   },
              { label:"Stockage",   pct:22, color:"var(--blue)"   },
              { label:"Emballage",  pct:18, color:"var(--purple)" },
              { label:"Autre",      pct:26, color:"var(--orange)" },
            ].map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-mid)" }}>{d.label}</div>
                  <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text)" }}>{d.pct}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending validations */}
      <div className="card">
        <div className="card-header">
          <h3>Comptes en attente de validation</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/admin/users")}>Gérer →</button>
        </div>
        <div className="table-header" style={{ gridTemplateColumns: "1fr 120px 180px 100px 140px" }}>
          <span>Utilisateur</span><span>Rôle</span><span>Entreprise</span><span>Demande</span><span>Actions</span>
        </div>
        {pendingUsers.map((u, i) => (
          <div key={i} className="table-row" style={{ gridTemplateColumns: "1fr 120px 180px 100px 140px" }}>
            <div>
              <div className="row-title">{u.name}</div>
            </div>
            <span className="badge" style={{ color: u.role === "fournisseur" ? "var(--orange)" : "var(--blue)", background: u.role === "fournisseur" ? "var(--orange-light)" : "var(--blue-light)", textTransform: "capitalize" }}>{u.role}</span>
            <div style={{ fontSize: 12, color: "var(--text-mid)" }}>{u.company}</div>
            <div style={{ fontSize: 11, color: "var(--text-soft)", fontFamily: "var(--font-mono)" }}>{u.date}</div>
            <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
              <button className="btn btn-primary btn-sm">✓ Valider</button>
              <button className="btn btn-danger btn-sm">✕</button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}