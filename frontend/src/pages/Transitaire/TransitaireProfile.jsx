import { useState } from "react";

const initialProfile = {
  companyName:  "Geodis Freight Forwarding France",
  contactName:  "Sophie Martin",
  email:        "s.martin@geodis.com",
  telephone:    "+33 1 56 76 36 00",
  website:      "www.geodis.com",
  country:      "France",
  city:         "Clichy",
  address:      "26 Quai Charles Pasqua, 92300 Levallois-Perret",
  siret:        "40479444700026",
  agrement:     "FR-TRS-2024-00291",
  description:  "Commissionnaire en douane agréé, opérateur de transit international. Spécialisé import Asie–Europe. Certifié OEA-F.",
  specialties:  ["Dédouanement import", "Transit T1/T2", "Régimes suspensifs", "Conseil douanier"],
};

const paymentHistory = [
  { id:"PAY-2024-022", dos:"DOS-2024-028", amount:"1 483 €", date:"15 Nov 2024", status:"payé"       },
  { id:"PAY-2024-019", dos:"DOS-2024-027", amount:"3 208 €", date:"10 Nov 2024", status:"payé"       },
  { id:"PAY-2024-017", dos:"DOS-2024-026", amount:"2 560 €", date:"03 Nov 2024", status:"payé"       },
  { id:"PAY-2024-015", dos:"DOS-2024-025", amount:"1 940 €", date:"--",          status:"en attente" },
];

export default function TransitaireProfile() {
  const [profile, setProfile] = useState(initialProfile);
  const [saved, setSaved]     = useState(false);
  const [passwords, setPwd]   = useState({ current: "", next: "", confirm: "" });
  const [notifs, setNotifs]   = useState([true, true, true, false, true]);

  const set   = (k, v) => setProfile(p => ({ ...p, [k]: v }));
  const setPw = (k, v) => setPwd(p => ({ ...p, [k]: v }));
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="page-content" style={{ maxWidth: 700 }}>
      <div className="page-header">
        <div>
          <h1>Mon compte</h1>
          <p>Informations de votre société de transit et de dédouanement.</p>
        </div>
      </div>

      {/* Company card */}
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: 14, background: "linear-gradient(135deg,var(--ac),var(--ac-dark))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
            {profile.companyName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-dark)" }}>{profile.companyName}</div>
            <div style={{ fontSize: 13, color: "var(--text-mid)", marginTop: 2 }}>{profile.city}, {profile.country}</div>
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <span className="badge" style={{ color: "var(--teal)", background: "var(--teal-light)" }}>✓ Agrément douane</span>
              <span className="badge" style={{ color: "var(--ac)", background: "var(--ac-light)" }}>OEA-F certifié</span>
            </div>
          </div>
        </div>

        <div className="form-label" style={{ marginBottom: 16 }}>Informations société</div>
        <div className="form-grid">
          {[
            { label: "Raison sociale *",       key: "companyName"  },
            { label: "Contact principal *",    key: "contactName"  },
            { label: "Email *",                key: "email"        },
            { label: "Téléphone",              key: "telephone"    },
            { label: "Site web",               key: "website"      },
            { label: "SIRET",                  key: "siret"        },
            { label: "N° agrément douanier",   key: "agrement"     },
            { label: "Ville",                  key: "city"         },
            { label: "Pays *",                 key: "country"      },
          ].map(({ label, key }) => (
            <div key={key} className="form-group">
              <label className="form-label">{label}</label>
              <input className="form-input" value={profile[key] ?? ""} onChange={e => set(key, e.target.value)} />
            </div>
          ))}
          <div className="form-group full">
            <label className="form-label">Adresse complète</label>
            <input className="form-input" value={profile.address} onChange={e => set("address", e.target.value)} />
          </div>
          <div className="form-group full">
            <label className="form-label">Description & spécialités</label>
            <textarea className="form-textarea" value={profile.description} onChange={e => set("description", e.target.value)} />
          </div>
        </div>

        <hr className="divider" />

        {/* Specialties */}
        <div className="form-label" style={{ marginBottom: 14 }}>Spécialités douanières</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {["Dédouanement import","Dédouanement export","Transit T1/T2","Régimes suspensifs","Entrepôt douanier","Conseil douanier","Audit douanier","OEA"].map(spec => {
            const active = profile.specialties?.includes(spec);
            return (
              <button key={spec} onClick={() => set("specialties", active ? profile.specialties.filter(s => s !== spec) : [...(profile.specialties ?? []), spec])} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${active ? "var(--ac)" : "var(--border)"}`, background: active ? "var(--ac-light)" : "transparent", color: active ? "var(--ac)" : "var(--text-mid)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font)", transition: "all .15s" }}>
                {spec}
              </button>
            );
          })}
        </div>

        {/* Documents */}
        <div className="form-label" style={{ marginBottom: 14 }}>Certifications & agréments</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
          {[
            { name: "Agrément de commissionnaire en douane",  uploaded: true  },
            { name: "Certificat OEA-F (Opérateur Éco. Agréé)",uploaded: true  },
            { name: "Licence de transit international",        uploaded: true  },
            { name: "Certificat ISO 9001 — gestion douanière", uploaded: false },
          ].map(doc => (
            <div key={doc.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", background: "var(--bg)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
              <span style={{ fontSize: 18, color: doc.uploaded ? "var(--ac)" : "var(--text-soft)" }}>{doc.uploaded ? "📄" : "□"}</span>
              <span style={{ flex: 1, fontSize: 13, color: "var(--text-dark)" }}>{doc.name}</span>
              {doc.uploaded
                ? <span style={{ fontSize: 11, color: "var(--teal)", fontWeight: 600 }}>✓ Téléversé</span>
                : <button className="btn btn-ghost btn-sm">⊕ Ajouter</button>
              }
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn btn-primary" onClick={handleSave}>Sauvegarder les modifications</button>
          {saved && <span style={{ fontSize: 13, color: "var(--teal)", fontWeight: 600, animation: "fadeIn .3s ease" }}>✓ Enregistré</span>}
        </div>
      </div>

      {/* Payment history */}
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-dark)", marginBottom: 18 }}>Historique des paiements</div>
        {paymentHistory.map(p => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid var(--border-soft)" }}>
            <div>
              <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-soft)" }}>{p.id} · {p.dos}</div>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--text-dark)" }}>{p.amount}</div>
            <div style={{ fontSize: 11, color: "var(--text-soft)" }}>{p.date}</div>
            <span className="badge" style={{ color: p.status === "payé" ? "var(--teal)" : "var(--warn)", background: p.status === "payé" ? "var(--teal-light)" : "#FEF6E8" }}>
              {p.status === "payé" ? "✓ Payé" : "⏳ En attente"}
            </span>
          </div>
        ))}
      </div>

      {/* Notifications */}
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="form-label" style={{ marginBottom: 16 }}>Préférences de notifications</div>
        {["Nouveau dossier assigné","Demande de validation import","Message de l'équipe MGTS","Paiement reçu","Rappel dossier en attente"].map((label, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid var(--border-soft)" }}>
            <span style={{ fontSize: 13, color: "var(--text-dark)" }}>{label}</span>
            <div onClick={() => setNotifs(n => n.map((v, j) => j === i ? !v : v))} style={{ width: 40, height: 22, borderRadius: 11, background: notifs[i] ? "var(--ac)" : "var(--border)", position: "relative", cursor: "pointer", transition: "background .2s" }}>
              <div style={{ position: "absolute", top: 3, left: notifs[i] ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Security */}
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="form-label" style={{ marginBottom: 16 }}>Sécurité</div>
        {[["Mot de passe actuel", "current"], ["Nouveau mot de passe", "next"], ["Confirmer", "confirm"]].map(([l, k]) => (
          <div key={k} className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">{l}</label>
            <input className="form-input" type="password" placeholder="••••••••" value={passwords[k]} onChange={e => setPw(k, e.target.value)} />
          </div>
        ))}
        <button className="btn btn-ghost">Changer le mot de passe</button>
      </div>

      {/* Danger zone */}
      <div className="card card-pad" style={{ borderColor: "#ffd0cc" }}>
        <div className="form-label" style={{ marginBottom: 10, color: "var(--danger)" }}>Zone de danger</div>
        <p style={{ fontSize: 13, color: "var(--text-mid)", marginBottom: 14 }}>La désactivation de votre compte vous retire de la plateforme MGTS.</p>
        <button className="btn btn-danger btn-sm">Désactiver mon compte</button>
      </div>
    </div>
  );
}