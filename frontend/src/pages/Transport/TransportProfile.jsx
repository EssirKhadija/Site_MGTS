import { useState } from "react";
import TransportLayout from "../../components/Transport/TransportLayout";

const initialProfile = {
  companyName:  "CMA CGM Logistics France",
  contactName:  "Pierre Dupuis",
  email:        "p.dupuis@cmacgm-logistics.fr",
  telephone:    "+33 4 88 91 90 00",
  website:      "www.cmacgm-logistics.fr",
  country:      "France",
  city:         "Marseille",
  address:      "4 Quai d'Arenc, 13002 Marseille",
  siret:        "41297848200050",
  licenseNumber:"LTR-FR-2024-00842",
  description:  "Opérateur de transport multimodal (maritime, aérien, routier). 20 ans d'expérience sur les lignes Asie–Europe. Certifié OEA.",
  modes:        ["sea","air","road"],
  zones:        ["Asie → Europe","Europe → Asie","Intra-Europe"],
  insurance:    "AXA Transport — Couverture 5 000 000 € / sinistre",
  status:       "validated",
};

const allModes = [
  { key:"sea",  icon:"🚢", label:"Maritime" },
  { key:"air",  icon:"✈️", label:"Aérien"   },
  { key:"road", icon:"🚛", label:"Routier"  },
  { key:"rail", icon:"🚂", label:"Ferroviaire" },
];

const paymentHistory = [
  { id:"PAY-2024-018", cmd:"CMD-2024-008", amount:"2 140 €", date:"10 Nov 2024", status:"payé"    },
  { id:"PAY-2024-014", cmd:"CMD-2024-007", amount:"1 485 €", date:"05 Nov 2024", status:"payé"    },
  { id:"PAY-2024-010", cmd:"CMD-2024-006", amount:"890 €",   date:"12 Oct 2024", status:"payé"    },
  { id:"PAY-2024-009", cmd:"CMD-2024-005", amount:"1 120 €", date:"--",          status:"en attente"},
];

export default function TransportProfile() {
  const [profile, setProfile] = useState(initialProfile);
  const [saved, setSaved]     = useState(false);
  const [passwords, setPwd]   = useState({ current:"", next:"", confirm:"" });

  const set  = (k,v) => setProfile(p => ({ ...p, [k]:v }));
  const setPw = (k,v) => setPwd(p => ({ ...p, [k]:v }));

  const toggleMode = mode => {
    set("modes", profile.modes.includes(mode)
      ? profile.modes.filter(m => m !== mode)
      : [...profile.modes, mode]);
  };

  const handleSave = () => { setSaved(true); setTimeout(()=>setSaved(false),2500); };

  return (
    <TransportLayout>
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Mon compte</h1>
            <p>Informations de votre société de transport.</p>
          </div>
        </div>

      {/* Company header */}
      <div className="card card-pad" style={{ marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:18, marginBottom:24 }}>
          <div style={{ width:64, height:64, borderRadius:14, background:"linear-gradient(135deg,var(--tr),var(--tr-dark))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:700, color:"#fff", flexShrink:0 }}>
            {profile.companyName.slice(0,2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize:18, fontWeight:700, color:"var(--text-dark)" }}>{profile.companyName}</div>
            <div style={{ fontSize:13, color:"var(--text-mid)", marginTop:2 }}>{profile.city}, {profile.country}</div>
            <div style={{ marginTop:8 }}>
              <span className="badge" style={{ color:"var(--teal)", background:"var(--teal-light)" }}>✓ Compte validé</span>
            </div>
          </div>
        </div>

        {/* Company info */}
        <div className="form-label" style={{ marginBottom:16 }}>Informations société</div>
        <div className="form-grid">
          {[
            { label:"Raison sociale *",    key:"companyName"  },
            { label:"Contact principal *", key:"contactName"  },
            { label:"Email *",             key:"email"        },
            { label:"Téléphone",           key:"telephone"    },
            { label:"Site web",            key:"website"      },
            { label:"SIRET",               key:"siret"        },
            { label:"N° licence transport",key:"licenseNumber"},
            { label:"Ville",               key:"city"         },
            { label:"Pays *",              key:"country"      },
          ].map(({ label, key }) => (
            <div key={key} className="form-group">
              <label className="form-label">{label}</label>
              <input className="form-input" value={profile[key]??""} onChange={e=>set(key,e.target.value)} />
            </div>
          ))}
          <div className="form-group full">
            <label className="form-label">Adresse complète</label>
            <input className="form-input" value={profile.address} onChange={e=>set("address",e.target.value)} />
          </div>
          <div className="form-group full">
            <label className="form-label">Description & spécialités</label>
            <textarea className="form-textarea" value={profile.description} onChange={e=>set("description",e.target.value)} />
          </div>
        </div>

        <hr className="divider" />

        {/* Transport modes */}
        <div className="form-label" style={{ marginBottom:14 }}>Modes de transport assurés</div>
        <div style={{ display:"flex", gap:10, marginBottom:20 }}>
          {allModes.map(m => {
            const active = profile.modes.includes(m.key);
            return (
              <button key={m.key} onClick={()=>toggleMode(m.key)} style={{ padding:"10px 18px", borderRadius:10, border:`2px solid ${active?"var(--tr)":"var(--border)"}`, background:active?"var(--tr-light)":"transparent", color:active?"var(--tr)":"var(--text-mid)", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"var(--font)", transition:"all .15s", display:"flex", alignItems:"center", gap:6 }}>
                {m.icon} {m.label}
              </button>
            );
          })}
        </div>

        {/* Coverage zones */}
        <div className="form-group" style={{ marginBottom:20 }}>
          <label className="form-label">Zones de couverture</label>
          <input className="form-input" placeholder="Ex : Asie → Europe, Intra-Europe…" value={profile.zones?.join(", ")} onChange={e=>set("zones", e.target.value.split(",").map(z=>z.trim()))} />
        </div>

        {/* Insurance */}
        <div className="form-group" style={{ marginBottom:20 }}>
          <label className="form-label">Assurance transport</label>
          <input className="form-input" placeholder="Assureur — Montant couverture" value={profile.insurance} onChange={e=>set("insurance",e.target.value)} />
        </div>

        {/* Certifications */}
        <div className="form-group" style={{ marginBottom:22 }}>
          <label className="form-label">Certifications & agréments</label>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { name:"Agrément OEA (Opérateur Économique Agréé)", uploaded:true  },
              { name:"Licence de transport international",         uploaded:true  },
              { name:"Assurance RC transporteur",                  uploaded:true  },
              { name:"Certificat ISO 14001",                       uploaded:false },
            ].map(doc => (
              <div key={doc.name} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 16px", background:"var(--bg)", borderRadius:"var(--radius-sm)", border:"1px solid var(--border)" }}>
                <span style={{ fontSize:18, color:doc.uploaded?"var(--tr)":"var(--text-soft)" }}>{doc.uploaded?"📄":"□"}</span>
                <span style={{ flex:1, fontSize:13, color:"var(--text-dark)" }}>{doc.name}</span>
                {doc.uploaded
                  ? <span style={{ fontSize:11, color:"var(--teal)", fontWeight:600 }}>✓ Téléversé</span>
                  : <button className="btn btn-ghost btn-sm">⊕ Ajouter</button>
                }
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <button className="btn btn-primary" onClick={handleSave}>Sauvegarder</button>
          {saved && <span style={{ fontSize:13, color:"var(--teal)", fontWeight:600 }}>✓ Enregistré</span>}
        </div>
      </div>

      {/* Payment history */}
      <div className="card card-pad" style={{ marginBottom:20 }}>
        <div style={{ fontSize:14, fontWeight:600, color:"var(--text-dark)", marginBottom:18 }}>Historique des paiements</div>
        {paymentHistory.map(p => (
          <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 0", borderBottom:"1px solid var(--border-soft)" }}>
            <div>
              <div style={{ fontSize:12, fontFamily:"var(--font-mono)", color:"var(--text-soft)" }}>{p.id} · {p.cmd}</div>
            </div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:13, fontWeight:700, color:"var(--text-dark)" }}>{p.amount}</div>
            <div style={{ fontSize:11, color:"var(--text-soft)" }}>{p.date}</div>
            <span className="badge" style={{ color:p.status==="payé"?"var(--teal)":"var(--warn)", background:p.status==="payé"?"var(--teal-light)":"#FEF6E8" }}>
              {p.status==="payé"?"✓ Payé":"⏳ En attente"}
            </span>
          </div>
        ))}
      </div>

      {/* Security */}
      <div className="card card-pad" style={{ marginBottom:20 }}>
        <div className="form-label" style={{ marginBottom:16 }}>Sécurité</div>
        {[["Mot de passe actuel","current"],["Nouveau mot de passe","next"],["Confirmer","confirm"]].map(([l,k]) => (
          <div key={k} className="form-group" style={{ marginBottom:14 }}>
            <label className="form-label">{l}</label>
            <input className="form-input" type="password" placeholder="••••••••" value={passwords[k]} onChange={e=>setPw(k,e.target.value)} />
          </div>
        ))}
        <button className="btn btn-ghost">Changer le mot de passe</button>
      </div>

      {/* Danger zone */}
      <div className="card card-pad" style={{ borderColor:"#ffd0cc" }}>
        <div className="form-label" style={{ marginBottom:10, color:"var(--danger)" }}>Zone de danger</div>
        <p style={{ fontSize:13, color:"var(--text-mid)", marginBottom:14 }}>La désactivation de votre compte vous retire de la plateforme MGTS.</p>
        <button className="btn btn-danger btn-sm">Désactiver mon compte</button>
      </div>
    </div>
    </TransportLayout>
  );
}