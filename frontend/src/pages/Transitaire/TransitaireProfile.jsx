import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../api/auth.api";

export default function TransitaireProfile() {
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState({
    companyName: "",
    contactName: "",
    email: "",
    telephone: "",
    website: "",
    country: "",
    city: "",
    address: "",
    siret: "",
    agrement: "",
    description: "",
    specialties: [],
  });
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [passwords, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");
  const [loading, setLoading] = useState(true);
  const [notifs, setNotifs] = useState([true, true, true, false, true]);

  const set = (k, v) => setProfile((p) => ({ ...p, [k]: v }));
  const setPw = (k, v) => setPwd((p) => ({ ...p, [k]: v }));

  // ── Fetch profile ─────────────────────────────────────────
  useEffect(() => {
    authAPI
      .getMe()
      .then((res) => {
        const u = res.data;
        setProfile((prev) => ({
          ...prev,
          contactName: u.fullName || "",
          email: u.email || "",
          telephone: u.phone || "",
        }));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Save profile ──────────────────────────────────────────
  const handleSave = async () => {
    setSaveError("");
    try {
      await authAPI.updateProfile({
        fullName: profile.contactName,
        phone: profile.telephone,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err.message || "Erreur lors de la sauvegarde.");
    }
  };

  // ── Change password ───────────────────────────────────────
  const handleChangePassword = async () => {
    setPwError("");
    if (passwords.next !== passwords.confirm)
      return setPwError("Les mots de passe ne correspondent pas.");
    if (passwords.next.length < 8) return setPwError("Minimum 8 caractères.");
    try {
      await authAPI.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.next,
      });
      setPwSaved(true);
      setPwd({ current: "", next: "", confirm: "" });
      setTimeout(() => setPwSaved(false), 2500);
    } catch (err) {
      setPwError(err.message || "Mot de passe actuel incorrect.");
    }
  };

  const initials = profile.companyName
    ? profile.companyName.slice(0, 2).toUpperCase()
    : user?.fullName?.slice(0, 2).toUpperCase() || "TR";

  if (loading) {
    return (
      <div className="page-content">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
          }}
        >
          <p style={{ color: "var(--text-soft)", fontSize: 13 }}>
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="page-content"
      style={{
        width: "100%",
        maxWidth: "100%",
        minHeight: "100vh",
        padding: "24px 20px",
        boxSizing: "border-box",
      }}
    >
      <div
        className="page-header"
        style={{ maxWidth: 1320, width: "100%", margin: "0 auto" }}
      >
        <div>
          <h1>Mon compte</h1>
          <p>Informations de votre société de transit et de dédouanement.</p>
        </div>
      </div>

      {/* Company card */}
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: "linear-gradient(135deg,var(--ac),var(--ac-dark))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text-dark)",
              }}
            >
              {profile.companyName || user?.fullName}
            </div>
            <div
              style={{ fontSize: 13, color: "var(--text-mid)", marginTop: 2 }}
            >
              {profile.city || "—"}, {profile.country || "—"}
            </div>
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <span
                className="badge"
                style={{
                  color: "var(--teal)",
                  background: "var(--teal-light)",
                }}
              >
                ✓ Agrément douane
              </span>
              <span
                className="badge"
                style={{ color: "var(--ac)", background: "var(--ac-light)" }}
              >
                OEA-F certifié
              </span>
            </div>
          </div>
        </div>

        <div className="form-label" style={{ marginBottom: 16 }}>
          Informations société
        </div>
        <div className="form-grid">
          {[
            { label: "Raison sociale *", key: "companyName" },
            { label: "Contact principal *", key: "contactName" },
            { label: "Téléphone", key: "telephone" },
            { label: "Site web", key: "website" },
            { label: "SIRET", key: "siret" },
            { label: "N° agrément douanier", key: "agrement" },
            { label: "Ville", key: "city" },
            { label: "Pays *", key: "country" },
          ].map(({ label, key }) => (
            <div key={key} className="form-group">
              <label className="form-label">{label}</label>
              <input
                className="form-input"
                value={profile[key] ?? ""}
                onChange={(e) => set(key, e.target.value)}
              />
            </div>
          ))}

          {/* Email disabled */}
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              className="form-input"
              value={profile.email}
              disabled
              style={{ opacity: 0.6, cursor: "not-allowed" }}
            />
          </div>

          <div className="form-group full">
            <label className="form-label">Adresse complète</label>
            <input
              className="form-input"
              value={profile.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>
          <div className="form-group full">
            <label className="form-label">Description & spécialités</label>
            <textarea
              className="form-textarea"
              value={profile.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
        </div>

        <hr className="divider" />

        {/* Specialties */}
        <div className="form-label" style={{ marginBottom: 14 }}>
          Spécialités douanières
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 20,
          }}
        >
          {[
            "Dédouanement import",
            "Dédouanement export",
            "Transit T1/T2",
            "Régimes suspensifs",
            "Entrepôt douanier",
            "Conseil douanier",
            "Audit douanier",
            "OEA",
          ].map((spec) => {
            const active = profile.specialties?.includes(spec);
            return (
              <button
                key={spec}
                onClick={() =>
                  set(
                    "specialties",
                    active
                      ? profile.specialties.filter((s) => s !== spec)
                      : [...(profile.specialties ?? []), spec]
                  )
                }
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: `1.5px solid ${
                    active ? "var(--ac)" : "var(--border)"
                  }`,
                  background: active ? "var(--ac-light)" : "transparent",
                  color: active ? "var(--ac)" : "var(--text-mid)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font)",
                  transition: "all .15s",
                }}
              >
                {spec}
              </button>
            );
          })}
        </div>

        {/* Documents */}
        <div className="form-label" style={{ marginBottom: 14 }}>
          Certifications & agréments
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginBottom: 22,
          }}
        >
          {[
            { name: "Agrément de commissionnaire en douane", uploaded: false },
            {
              name: "Certificat OEA-F (Opérateur Éco. Agréé)",
              uploaded: false,
            },
            { name: "Licence de transit international", uploaded: false },
            {
              name: "Certificat ISO 9001 — gestion douanière",
              uploaded: false,
            },
          ].map((doc) => (
            <div
              key={doc.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 16px",
                background: "var(--bg)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  color: doc.uploaded ? "var(--ac)" : "var(--text-soft)",
                }}
              >
                {doc.uploaded ? "📄" : "□"}
              </span>
              <span
                style={{ flex: 1, fontSize: 13, color: "var(--text-dark)" }}
              >
                {doc.name}
              </span>
              {doc.uploaded ? (
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--teal)",
                    fontWeight: 600,
                  }}
                >
                  ✓ Téléversé
                </span>
              ) : (
                <button className="btn btn-ghost btn-sm">⊕ Ajouter</button>
              )}
            </div>
          ))}
        </div>

        {saveError && (
          <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>
            ⚠ {saveError}
          </p>
        )}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn btn-primary" onClick={handleSave}>
            Sauvegarder les modifications
          </button>
          {saved && (
            <span
              style={{
                fontSize: 13,
                color: "var(--teal)",
                fontWeight: 600,
                animation: "fadeIn .3s ease",
              }}
            >
              ✓ Enregistré
            </span>
          )}
        </div>
      </div>

      {/* Payment history — affiché depuis le contexte local pour l'instant */}
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text-dark)",
            marginBottom: 18,
          }}
        >
          Historique des paiements
        </div>
        <div
          style={{
            padding: "20px 0",
            textAlign: "center",
            color: "var(--text-soft)",
            fontSize: 13,
          }}
        >
          Les paiements seront affichés ici après validation par MGTS.
        </div>
      </div>

      {/* Notifications */}
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="form-label" style={{ marginBottom: 16 }}>
          Préférences de notifications
        </div>
        {[
          "Nouveau dossier assigné",
          "Demande de validation import",
          "Message de l'équipe MGTS",
          "Paiement reçu",
          "Rappel dossier en attente",
        ].map((label, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "11px 0",
              borderBottom: "1px solid var(--border-soft)",
            }}
          >
            <span style={{ fontSize: 13, color: "var(--text-dark)" }}>
              {label}
            </span>
            <div
              onClick={() =>
                setNotifs((n) => n.map((v, j) => (j === i ? !v : v)))
              }
              style={{
                width: 40,
                height: 22,
                borderRadius: 11,
                background: notifs[i] ? "var(--ac)" : "var(--border)",
                position: "relative",
                cursor: "pointer",
                transition: "background .2s",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 3,
                  left: notifs[i] ? 21 : 3,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left .2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Security */}
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="form-label" style={{ marginBottom: 16 }}>
          Sécurité
        </div>
        {[
          ["Mot de passe actuel", "current"],
          ["Nouveau mot de passe", "next"],
          ["Confirmer", "confirm"],
        ].map(([l, k]) => (
          <div key={k} className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">{l}</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={passwords[k]}
              onChange={(e) => setPw(k, e.target.value)}
            />
          </div>
        ))}
        {pwError && (
          <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 10 }}>
            ⚠ {pwError}
          </p>
        )}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn btn-ghost" onClick={handleChangePassword}>
            Changer le mot de passe
          </button>
          {pwSaved && (
            <span
              style={{ fontSize: 13, color: "var(--teal)", fontWeight: 600 }}
            >
              ✓ Mot de passe mis à jour
            </span>
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="card card-pad" style={{ borderColor: "#ffd0cc" }}>
        <div
          className="form-label"
          style={{ marginBottom: 10, color: "var(--danger)" }}
        >
          Zone de danger
        </div>
        <p style={{ fontSize: 13, color: "var(--text-mid)", marginBottom: 14 }}>
          La désactivation de votre compte vous retire de la plateforme MGTS.
        </p>
        <button className="btn btn-danger btn-sm" onClick={logout}>
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
