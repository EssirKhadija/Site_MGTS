import { useState } from "react";
import "../../styles/Client.css";

const initialProfile = {
  prenom: "Jean",
  nom: "Dupont",
  email: "jean@example.com",
  telephone: "+33 6 12 34 56 78",
  entreprise: "Dupont Industries",
  pays: "France",
  ville: "Paris",
  siret: "12345678901234",
};

const paymentHistory = [
  { id: "CMD-2024-003", amount: "3 400 €",  date: "10 Sep 2024", method: "Virement" },
  { id: "CMD-2024-002", amount: "8 200 €",  date: "28 Oct 2024", method: "Virement" },
];

export default function Profile() {
  const [profile, setProfile] = useState(initialProfile);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    "Réception d'un devis": true,
    "Mise à jour du statut commande": true,
    "Nouveau message MGTS": true,
    "Facture disponible": true,
    "Promotions & actualités": false,
  });

  const set = (k, v) => setProfile((p) => ({ ...p, [k]: v }));
  const setP = (k, v) => setPasswords((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="page-content" style={{ maxWidth: 680 }}>
      <div className="page-header">
        <div>
          <h1>Mon profil</h1>
          <p>Gérez vos informations personnelles et la sécurité de votre compte.</p>
        </div>
      </div>

      {/* Avatar + summary */}
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,var(--teal),var(--orange))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
            {profile.prenom[0]}{profile.nom[0]}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-dark)" }}>
              {profile.prenom} {profile.nom}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-soft)", marginTop: 2 }}>
              {profile.entreprise} · Client depuis Nov 2023
            </div>
            <div style={{ marginTop: 8 }}>
              <span style={{ background: "var(--teal-light)", color: "var(--teal)", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 10 }}>
                Compte vérifié ✓
              </span>
            </div>
          </div>
        </div>

        {/* Profile fields */}
        <div className="form-label" style={{ marginBottom: 16 }}>Informations personnelles</div>
        <div className="form-grid">
          {[
            { label: "Prénom",    key: "prenom" },
            { label: "Nom",       key: "nom"    },
            { label: "Email",     key: "email"  },
            { label: "Téléphone", key: "telephone" },
            { label: "Entreprise",key: "entreprise" },
            { label: "SIRET",     key: "siret"  },
            { label: "Ville",     key: "ville"  },
            { label: "Pays",      key: "pays"   },
          ].map(({ label, key }) => (
            <div key={key} className="form-group">
              <label className="form-label">{label}</label>
              <input
                className="form-input"
                value={profile[key]}
                onChange={(e) => set(key, e.target.value)}
              />
            </div>
          ))}
        </div>

        <hr className="divider" />

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn btn-primary" onClick={handleSave}>
            Sauvegarder les modifications
          </button>
          {saved && (
            <span style={{ fontSize: 13, color: "var(--teal)", fontWeight: 600, animation: "fadeIn .3s ease" }}>
              ✓ Modifications enregistrées
            </span>
          )}
        </div>
      </div>

      {/* Security */}
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="form-label" style={{ marginBottom: 18 }}>Sécurité</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Mot de passe actuel", key: "current"  },
            { label: "Nouveau mot de passe", key: "next"    },
            { label: "Confirmer le mot de passe", key: "confirm" },
          ].map(({ label, key }) => (
            <div key={key} className="form-group">
              <label className="form-label">{label}</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={passwords[key]}
                onChange={(e) => setP(key, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18 }}>
          <button className="btn btn-ghost">Changer le mot de passe</button>
        </div>
      </div>

      {/* Notifications preferences */}
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="form-label" style={{ marginBottom: 18 }}>Préférences de notifications</div>
        {[
          ["Réception d'un devis",        true  ],
          ["Mise à jour du statut commande", true],
          ["Nouveau message MGTS",         true  ],
          ["Facture disponible",           true  ],
          ["Promotions & actualités",      false ],
        ].map(([label, defaultVal], i) => {
          const checked = notifications[label];
          return (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border-soft)" }}>
              <span style={{ fontSize: 13, color: "var(--text-dark)" }}>{label}</span>
              <div
                onClick={() => setNotifications(prev => ({ ...prev, [label]: !prev[label] }))}
                style={{
                  width: 40, height: 22, borderRadius: 11,
                  background: checked ? "var(--teal)" : "var(--border)",
                  position: "relative", cursor: "pointer", transition: "background .2s",
                }}
              >
                <div style={{
                  position: "absolute", top: 3, left: checked ? 21 : 3,
                  width: 16, height: 16, borderRadius: "50%", background: "#fff",
                  transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                }}></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment history */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3>Historique des paiements</h3>
        </div>
        {paymentHistory.map((p) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", borderBottom: "1px solid var(--border-soft)" }}>
            <div>
              <div className="mono" style={{ fontSize: 10, color: "var(--text-soft)" }}>{p.id}</div>
              <div style={{ fontSize: 13, color: "var(--text-dark)", marginTop: 2 }}>{p.date} · {p.method}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: "var(--text-dark)" }}>{p.amount}</span>
              <span style={{ background: "var(--teal-light)", color: "var(--teal)", fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 10 }}>Payé</span>
            </div>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div className="card card-pad" style={{ borderColor: "#ffd0cc" }}>
        <div className="form-label" style={{ marginBottom: 12, color: "var(--danger)" }}>Zone de danger</div>
        <p style={{ fontSize: 13, color: "var(--text-mid)", marginBottom: 16 }}>
          La suppression de votre compte est irréversible. Toutes vos données seront effacées.
        </p>
        <button className="btn btn-danger btn-sm">Supprimer mon compte</button>
      </div>
    </div>
  );
}