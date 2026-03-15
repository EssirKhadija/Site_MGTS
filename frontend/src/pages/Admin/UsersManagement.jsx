import { useState } from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import "../../styles/Admin.css";

const initialUsers = [
  { id:"USR-001", name:"Jean Dupont",        email:"jean.dupont@dupont.fr",        role:"client",      company:"Dupont Industries",       status:"active",  joined:"10 Jan 2024", orders:8,  spent:"86 200 €" },
  { id:"USR-002", name:"Li Wei",             email:"liwei@szmetal.cn",              role:"fournisseur", company:"Shenzhen MetalTech Co.",  status:"active",  joined:"15 Fév 2024", orders:12, spent:"—"         },
  { id:"USR-003", name:"Sophie Martin",      email:"s.martin@geodis.com",           role:"transitaire", company:"Geodis FF France",        status:"active",  joined:"01 Mar 2024", orders:24, spent:"—"         },
  { id:"USR-004", name:"Pierre Dupuis",      email:"p.dupuis@cmacgm.fr",            role:"transporteur",company:"CMA CGM Logistics",       status:"active",  joined:"20 Mar 2024", orders:18, spent:"—"         },
  { id:"USR-005", name:"Ahmed Al Rashid",    email:"ahmed@dubaimetal.ae",           role:"fournisseur", company:"Dubai MetalCo",           status:"pending", joined:"15 Nov 2024", orders:0,  spent:"—"         },
  { id:"USR-006", name:"Marie Leblanc",      email:"m.leblanc@leblanctransit.fr",   role:"transporteur",company:"Leblanc Transit SAS",     status:"pending", joined:"14 Nov 2024", orders:0,  spent:"—"         },
  { id:"USR-007", name:"Chen Wei",           email:"chenwei@szchemtech.cn",         role:"fournisseur", company:"Shenzhen ChemTech",       status:"pending", joined:"13 Nov 2024", orders:0,  spent:"—"         },
  { id:"USR-008", name:"LogiPack Admin",     email:"admin@logipack.fr",             role:"client",      company:"LogiPack SAS",            status:"active",  joined:"05 Avr 2024", orders:5,  spent:"12 400 €" },
  { id:"USR-009", name:"Huang Lei",          email:"huanglei@guangprecision.cn",    role:"fournisseur", company:"Guangzhou Precision",     status:"suspended",joined:"10 Mai 2024", orders:3,  spent:"—"         },
  { id:"USR-010", name:"InoxPro Manager",    email:"contact@inoxpro.fr",            role:"client",      company:"InoxPro SAS",             status:"active",  joined:"22 Avr 2024", orders:3,  spent:"18 400 €" },
];

const roleConfig = {
  client:       { label:"Client",       color:"var(--teal)",   bg:"var(--teal-light)"   },
  fournisseur:  { label:"Fournisseur",  color:"var(--orange)", bg:"var(--orange-light)" },
  transporteur: { label:"Transporteur", color:"var(--blue)",   bg:"var(--blue-light)"   },
  transitaire:  { label:"Transitaire",  color:"var(--purple)", bg:"var(--purple-light)" },
};

const statusConfig = {
  active:    { label:"Actif",     color:"var(--green)",  bg:"var(--green-light)"  },
  pending:   { label:"En attente",color:"var(--yellow)", bg:"var(--yellow-light)" },
  suspended: { label:"Suspendu",  color:"var(--red)",    bg:"var(--red-light)"    },
};

const roles    = ["Tous","client","fournisseur","transporteur","transitaire"];
const statuses = ["Tous","active","pending","suspended"];

export default function UsersManagement({ initialRole = "Tous" }) {
  const [users, setUsers]       = useState(initialUsers);
  const [roleFilter, setRoleFilter]     = useState(initialRole);
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const filtered = users.filter(u => {
    const matchRole   = roleFilter === "Tous"   || u.role === roleFilter;
    const matchStatus = statusFilter === "Tous" || u.status === statusFilter;
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.company.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchStatus && matchSearch;
  });

  const action = (userId, act) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      if (act === "validate")  return { ...u, status: "active" };
      if (act === "suspend")   return { ...u, status: "suspended" };
      if (act === "activate")  return { ...u, status: "active" };
      if (act === "delete")    return null;
      return u;
    }).filter(Boolean));
    setConfirmModal(null);
    if (selected?.id === userId) setSelected(null);
  };

  return (
    <AdminLayout>
      <div className="page-content">
        <div className="page-header">
        <div>
          <h1>Gestion des utilisateurs</h1>
          <p>{users.filter(u => u.status === "pending").length} compte(s) en attente · {users.length} utilisateurs au total</p>
        </div>
        <button className="btn btn-primary btn-sm">+ Inviter un utilisateur</button>
      </div>

      {/* Pending alert */}
      {users.filter(u => u.status === "pending").length > 0 && (
        <div className="alert-banner" style={{ marginBottom: 20 }}>
          <div className="alert-banner-icon">⚠</div>
          <div>
            <div className="alert-banner-title">{users.filter(u => u.status === "pending").length} utilisateurs attendent validation</div>
            <div className="alert-banner-text">Vérifiez les informations avant d'approuver l'accès à la plateforme.</div>
          </div>
          <button className="btn btn-orange btn-sm" onClick={() => setStatusFilter("pending")}>Filtrer</button>
        </div>
      )}

      {/* Counters */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label:"Total",      value:users.length,                                  color:"var(--text)",   bg:"transparent", border:"var(--border-mid)" },
          { label:"Actifs",     value:users.filter(u=>u.status==="active").length,   color:"var(--green)",  bg:"var(--green-light)" },
          { label:"En attente", value:users.filter(u=>u.status==="pending").length,  color:"var(--yellow)", bg:"var(--yellow-light)" },
          { label:"Suspendus",  value:users.filter(u=>u.status==="suspended").length,color:"var(--red)",    bg:"var(--red-light)" },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: "14px 18px", background: s.bg, border: s.border ? `1px solid ${s.border}` : "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, color: s.color === "var(--text)" ? "var(--text-soft)" : s.color, textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: "var(--font-mono)", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 400, fontFamily: "var(--font-mono)", color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <div className="navbar-search" style={{ flex: "none", width: 260 }}>
          <span style={{ color: "var(--text-soft)" }}>⌕</span>
          <input placeholder="Nom, email, entreprise…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {roles.map(r => (
            <button key={r} onClick={() => setRoleFilter(r)} style={{ padding: "5px 12px", borderRadius: "var(--radius-sm)", border: `1px solid ${roleFilter === r ? "var(--teal)" : "var(--border-mid)"}`, background: roleFilter === r ? "var(--teal-light)" : "transparent", color: roleFilter === r ? "var(--teal)" : "var(--text-soft)", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font)", transition: "all .15s", textTransform: "capitalize", letterSpacing: ".3px" }}>
              {r === "Tous" ? "Tous" : r}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: "5px 12px", borderRadius: "var(--radius-sm)", border: `1px solid ${statusFilter === s ? "var(--orange)" : "var(--border-mid)"}`, background: statusFilter === s ? "var(--orange-light)" : "transparent", color: statusFilter === s ? "var(--orange)" : "var(--text-soft)", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font)", transition: "all .15s", textTransform: "capitalize", letterSpacing: ".3px" }}>
              {s === "Tous" ? "Tous" : statusConfig[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-header" style={{ gridTemplateColumns: "1fr 110px 160px 90px 80px 90px 160px" }}>
          <span>Utilisateur</span><span>Rôle</span><span>Entreprise</span><span>Statut</span><span>Commandes</span><span>Inscrit</span><span>Actions</span>
        </div>
        {filtered.map(u => {
          const r = roleConfig[u.role];
          const s = statusConfig[u.status];
          return (
            <div key={u.id} className="table-row" style={{ gridTemplateColumns: "1fr 110px 160px 90px 80px 90px 160px" }} onClick={() => setSelected(u)}>
              <div>
                <div className="row-title">{u.name}</div>
                <div className="row-sub">{u.email}</div>
              </div>
              <span className="badge" style={{ color: r.color, background: r.bg }}>{r.label}</span>
              <div style={{ fontSize: 12, color: "var(--text-mid)" }}>{u.company}</div>
              <span className="badge" style={{ color: s.color, background: s.bg }}>
                <span className="badge-dot" style={{ background: s.color }} />{s.label}
              </span>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-mid)", textAlign: "center" }}>{u.orders}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-soft)" }}>{u.joined}</div>
              <div style={{ display: "flex", gap: 5 }} onClick={e => e.stopPropagation()}>
                {u.status === "pending" && (
                  <button className="btn btn-primary btn-sm" onClick={() => action(u.id, "validate")}>✓ Valider</button>
                )}
                {u.status === "active" && (
                  <button className="btn btn-sm" style={{ background: "var(--yellow-light)", color: "var(--yellow)", border: "1px solid rgba(245,158,11,.2)", fontSize: 11, padding: "5px 10px", borderRadius: "var(--radius-sm)", cursor: "pointer" }} onClick={() => setConfirmModal({ user: u, action: "suspend" })}>⏸ Suspendre</button>
                )}
                {u.status === "suspended" && (
                  <button className="btn btn-primary btn-sm" onClick={() => action(u.id, "activate")}>▶ Réactiver</button>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => setConfirmModal({ user: u, action: "delete" })}>✕</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* User detail panel */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="card modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-soft)", marginBottom: 4 }}>{selected.id}</div>
                <div className="modal-title" style={{ marginBottom: 4 }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-soft)" }}>{selected.email}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              {[["Entreprise",selected.company],["Rôle",roleConfig[selected.role]?.label],["Statut",statusConfig[selected.status]?.label],["Inscription",selected.joined],["Commandes",selected.orders],["CA généré",selected.spent]].map(([k,v]) => (
                <div key={k} style={{ background:"var(--bg-3)", borderRadius:"var(--radius-sm)", padding:"12px 14px" }}>
                  <div className="form-label" style={{ marginBottom:5 }}>{k}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", fontFamily: k==="Commandes"||k==="CA généré" ? "var(--font-mono)":"var(--font)" }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {selected.status === "pending" && <button className="btn btn-primary" style={{ flex:1 }} onClick={() => action(selected.id,"validate")}>✓ Valider le compte</button>}
              {selected.status === "active"  && <button className="btn btn-sm" style={{ flex:1,background:"var(--yellow-light)",color:"var(--yellow)",border:"1px solid rgba(245,158,11,.2)",borderRadius:"var(--radius-sm)",cursor:"pointer",fontWeight:700,fontSize:12 }} onClick={() => action(selected.id,"suspend")}>⏸ Suspendre</button>}
              {selected.status === "suspended" && <button className="btn btn-primary" style={{ flex:1 }} onClick={() => action(selected.id,"activate")}>▶ Réactiver</button>}
              <button className="btn btn-danger" onClick={() => setConfirmModal({ user: selected, action: "delete" })}>✕ Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {confirmModal && (
        <div className="modal-overlay" onClick={() => setConfirmModal(null)}>
          <div className="card modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ width:48,height:48,borderRadius:"50%",background:"var(--red-light)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:20,color:"var(--red)" }}>
              {confirmModal.action === "delete" ? "✕" : "⏸"}
            </div>
            <div className="modal-title" style={{ textAlign:"center" }}>
              {confirmModal.action === "delete" ? "Supprimer cet utilisateur" : "Suspendre ce compte"}
            </div>
            <div className="modal-desc">
              {confirmModal.action === "delete"
                ? `La suppression de "${confirmModal.user.name}" est irréversible. Toutes ses données seront effacées.`
                : `Le compte de "${confirmModal.user.name}" sera suspendu. Il ne pourra plus accéder à la plateforme.`}
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button
              className="btn btn-danger"
              style={{ flex:1 }}
              onClick={() => {
                if (!confirmModal?.user?.id || !confirmModal?.action) return;
                action(confirmModal.user.id, confirmModal.action);
              }}
            >
              Confirmer
            </button>
            <button className="btn btn-ghost" onClick={() => setConfirmModal(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
}