import { useState, useEffect } from "react";
import SupplierLayout from "../../components/Fournisseur/SupplierLayout";
import "../../styles/Supplier.css";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../api/auth.api";
import api from "../../api/axios";

const allCategories = ["Stockage", "Mécanique", "Plastique", "Emballage", "Textile", "Électronique", "Autre"];

const statusCfg = {
  pending:   { label: "En attente de validation", color: "#F5A623", bg: "#FEF6E8", icon: "⏳" },
  active:    { label: "Compte validé",            color: "#009189", bg: "#E0F5F4", icon: "✓"  },
  suspended: { label: "Compte suspendu",          color: "#CC3A00", bg: "#FFE8DC", icon: "⚠"  },
};

export default function SupplierProfile() {
  const { user, logout } = useAuth();

  const [profile, setProfile]     = useState({
    companyName:  "",
    contactName:  "",
    email:        "",
    telephone:    "",
    website:      "",
    country:      "",
    city:         "",
    address:      "",
    siret:        "",
    description:  "",
    categories:   [],
    leadTime:     "",
    minOrder:     "",
    status:       "pending",
  });
  const [passwords, setPasswords]     = useState({ current: "", next: "", confirm: "" });
  const [saved, setSaved]             = useState(false);
  const [saveError, setSaveError]     = useState("");
  const [pwSaved, setPwSaved]         = useState(false);
  const [pwError, setPwError]         = useState("");
  const [loading, setLoading]         = useState(true);
  const [notifications, setNotifications] = useState({
    "Nouvelle demande client":    true,
    "Commande confirmée":         true,
    "Message de l'équipe MGTS":  true,
    "Paiement reçu":              true,
    "Rappel devis en attente":    false,
  });

  const set  = (k, v) => setProfile(p => ({ ...p, [k]: v }));
  const setP = (k, v) => setPasswords(p => ({ ...p, [k]: v }));

  const toggleNotification = (label) =>
    setNotifications(n => ({ ...n, [label]: !n[label] }));

  const toggleCategory = (cat) =>
    set("categories", profile.categories.includes(cat)
      ? profile.categories.filter(c => c !== cat)
      : [...profile.categories, cat]);

  // ── Fetch profile ─────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      authAPI.getMe(),
      api.get("/supplier/profile").catch(() => ({ data: null })),
    ]).then(([meRes, profileRes]) => {
      const u = meRes.data;
      const p = profileRes.data;
      setProfile(prev => ({
        ...prev,
        contactName: u.fullName  || "",
        email:       u.email     || "",
        telephone:   u.phone     || "",
        status:      u.status    || "pending",
        companyName: p?.factoryName   || "",
        description: p?.productTypes  || "",
        categories:  p?.productTypes
          ? p.productTypes.split(",").map(s => s.trim()).filter(Boolean)
          : [],
      }));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Save profile ──────────────────────────────────────────
  const handleSave = async () => {
    setSaveError("");
    try {
      await authAPI.updateProfile({
        fullName: profile.contactName,
        phone:    profile.telephone,
      });
      await api.put("/supplier/profile", {
        factoryName:  profile.companyName,
        productTypes: profile.categories.join(", "),
      }).catch(() => {});
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err.message || "Erreur lors de la sauvegarde.");
    }
  };

  // ── Change password ───────────────────────────────────────
  const handleChangePassword = async () => {
    setPwError("");
    if (passwords.next !== passwords.confirm) return setPwError("Les mots de passe ne correspondent pas.");
    if (passwords.next.length < 8) return setPwError("Minimum 8 caractères.");
    try {
      await authAPI.changePassword({ currentPassword: passwords.current, newPassword: passwords.next });
      setPwSaved(true);
      setPasswords({ current: "", next: "", confirm: "" });
      setTimeout(() => setPwSaved(false), 2500);
    } catch (err) {
      setPwError(err.message || "Mot de passe actuel incorrect.");
    }
  };

  const sc = statusCfg[profile.status] ?? statusCfg.pending;

  const initials = profile.companyName
    ? profile.companyName.slice(0, 2).toUpperCase()
    : (user?.fullName?.slice(0, 2).toUpperCase() || "SU");

  if (loading) {
    return (
      <SupplierLayout>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
          <p style={{ color: "var(--text-soft)", fontSize: 13 }}>Chargement...</p>
        </div>
      </SupplierLayout>
    );
  }

  return (
    <SupplierLayout>
      <div className="page-header">
        <div>
          <h1>Mon compte fournisseur</h1>
          <p>Gérez votre profil et les informations visibles par MGTS.</p>
        </div>
      </div>

      {/* Validation banner */}
      {profile.status === "pending" && (
        <div className="pending-banner" style={{ marginBottom: 24 }}>
          <div className="pending-banner-icon">⏳</div>
          <div>
            <div className="pending-banner-title">Votre compte est en cours de validation</div>
            <div className="pending-banner-text">
              L'équipe MGTS vérifie vos informations. Vous recevrez un email de confirmation sous 24–48h.
            </div>
          </div>
        </div>
      )}

      {/* Company card */}
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: 14, background: "linear-gradient(135deg,var(--orange),var(--teal))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-dark)" }}>{profile.companyName || user?.fullName}</div>
            <div style={{ fontSize: 13, color: "var(--text-mid)", marginTop: 2 }}>{profile.city || "—"}, {profile.country || "—"}</div>
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <span className="badge" style={{ color: sc.color, background: sc.bg }}>{sc.icon} {sc.label}</span>
            </div>
          </div>
        </div>

        {/* Company info */}
        <div className="form-label" style={{ marginBottom: 16 }}>Informations entreprise</div>
        <div className="form-grid">
          {[
            { label: "Raison sociale *",    key: "companyName"  },
            { label: "Nom du contact *",    key: "contactName"  },
            { label: "Téléphone",           key: "telephone"    },
            { label: "Site web",            key: "website"      },
            { label: "N° d'enregistrement", key: "siret"        },
            { label: "Pays *",              key: "country"      },
            { label: "Ville",               key: "city"         },
          ].map(({ label, key }) => (
            <div key={key} className="form-group">
              <label className="form-label">{label}</label>
              <input className="form-input" value={profile[key]} onChange={(e) => set(key, e.target.value)} />
            </div>
          ))}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" value={profile.email} disabled style={{ opacity: 0.6, cursor: "not-allowed" }} />
          </div>

          <div className="form-group full">
            <label className="form-label">Adresse complète</label>
            <input className="form-input" value={profile.address} onChange={(e) => set("address", e.target.value)} />
          </div>

          <div className="form-group full">
            <label className="form-label">Description de l'entreprise</label>
            <textarea className="form-textarea" value={profile.description} onChange={(e) => set("description", e.target.value)} />
          </div>
        </div>

        <hr className="divider" />

        {/* Capabilities */}
        <div className="form-label" style={{ marginBottom: 14 }}>Capacités & spécialités</div>
        <div className="form-grid" style={{ marginBottom: 16 }}>
          <div className="form-group">
            <label className="form-label">Délai de fabrication moyen</label>
            <input className="form-input" placeholder="Ex : 20–45 jours" value={profile.leadTime} onChange={(e) => set("leadTime", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Commande minimum (MAD)</label>
            <input className="form-input" placeholder="Ex : 5000 MAD" value={profile.minOrder} onChange={(e) => set("minOrder", e.target.value)} />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label">Catégories de produits</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
            {allCategories.map((cat) => {
              const active = profile.categories.includes(cat);
              return (
                <button key={cat} onClick={() => toggleCategory(cat)} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${active ? "var(--teal)" : "var(--border)"}`, background: active ? "var(--teal-light)" : "transparent", color: active ? "var(--teal)" : "var(--text-mid)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font)", transition: "all .15s" }}>
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Documents */}
        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label">Documents & certifications</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { name: "Certificat ISO 9001",  uploaded: false },
              { name: "Registre du commerce", uploaded: false },
              { name: "Certificat douanier",  uploaded: false },
            ].map((doc) => (
              <div key={doc.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", background: "var(--bg)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: 18, color: doc.uploaded ? "var(--teal)" : "var(--text-soft)" }}>{doc.uploaded ? "📄" : "□"}</span>
                <span style={{ flex: 1, fontSize: 13, color: "var(--text-dark)" }}>{doc.name}</span>
                {doc.uploaded
                  ? <span style={{ fontSize: 11, color: "var(--teal)", fontWeight: 600 }}>✓ Téléversé</span>
                  : <button className="btn btn-ghost btn-sm">⊕ Ajouter</button>
                }
              </div>
            ))}
          </div>
        </div>

        {saveError && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>⚠ {saveError}</p>}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn btn-orange" onClick={handleSave}>Sauvegarder les modifications</button>
          {saved && <span style={{ fontSize: 13, color: "var(--teal)", fontWeight: 600, animation: "fadeIn .3s ease" }}>✓ Enregistré</span>}
        </div>
      </div>

      {/* Security */}
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="form-label" style={{ marginBottom: 16 }}>Sécurité</div>
        {[["Mot de passe actuel", "current"], ["Nouveau mot de passe", "next"], ["Confirmer le mot de passe", "confirm"]].map(([l, k]) => (
          <div key={k} className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">{l}</label>
            <input className="form-input" type="password" placeholder="••••••••" value={passwords[k]} onChange={(e) => setP(k, e.target.value)} />
          </div>
        ))}
        {pwError && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 10 }}>⚠ {pwError}</p>}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn btn-ghost" onClick={handleChangePassword}>Changer le mot de passe</button>
          {pwSaved && <span style={{ fontSize: 13, color: "var(--teal)", fontWeight: 600 }}>✓ Mot de passe mis à jour</span>}
        </div>
      </div>

      {/* Notification prefs */}
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="form-label" style={{ marginBottom: 16 }}>Préférences de notifications</div>
        {Object.entries(notifications).map(([label, on], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid var(--border-soft)" }}>
            <span style={{ fontSize: 13, color: "var(--text-dark)" }}>{label}</span>
            <div onClick={() => toggleNotification(label)} style={{ width: 40, height: 22, borderRadius: 11, background: on ? "var(--teal)" : "var(--border)", position: "relative", cursor: "pointer", transition: "background .2s" }}>
              <div style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div className="card card-pad" style={{ borderColor: "#ffd0cc" }}>
        <div className="form-label" style={{ marginBottom: 10, color: "var(--danger)" }}>Zone de danger</div>
        <p style={{ fontSize: 13, color: "var(--text-mid)", marginBottom: 14 }}>
          Désactiver votre compte supprime vos produits et vous retire de la plateforme MGTS.
        </p>
        <button className="btn btn-danger btn-sm" onClick={logout}>Se déconnecter</button>
      </div>
    </SupplierLayout>
  );
}