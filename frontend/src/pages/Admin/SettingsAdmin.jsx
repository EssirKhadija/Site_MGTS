import { useState } from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import "../../styles/Admin.css";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../api/auth.api";

export default function SettingsAdmin() {
  const { user, logout } = useAuth();

  const [platform, setPlatform] = useState({
    companyName: "MGTS",
    maintenance: "Aucune maintenance prévue.",
    darkMode: "off",
    smtp: "off",
    commissionRate: "10",
    currency: "MAD",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [saved, setSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  const set = (k, v) => setPlatform((p) => ({ ...p, [k]: v }));
  const setPw = (k, v) => setPasswords((p) => ({ ...p, [k]: v }));

  // ── Save platform settings ────────────────────────────────
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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
      setPasswords({ current: "", next: "", confirm: "" });
      setTimeout(() => setPwSaved(false), 2500);
    } catch (err) {
      setPwError(err.message || "Mot de passe actuel incorrect.");
    }
  };

  return (
    <AdminLayout>
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Paramètres</h1>
            <p>
              Configurez les options du système, les préférences et les
              paramètres de sécurité.
            </p>
          </div>
        </div>

        {/* Admin profile */}
        <div className="card card-pad" style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                background:
                  "linear-gradient(135deg,var(--teal),var(--teal-dark))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {user?.fullName?.slice(0, 2).toUpperCase() || "AD"}
            </div>
            <div>
              <div
                style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}
              >
                {user?.fullName}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-soft)",
                  marginTop: 2,
                }}
              >
                {user?.email}
              </div>
              <span
                className="badge"
                style={{
                  color: "var(--teal)",
                  background: "var(--teal-light)",
                  marginTop: 6,
                  display: "inline-flex",
                }}
              >
                ✓ Administrateur
              </span>
            </div>
          </div>
        </div>

        {/* Platform settings */}
        <div className="card card-pad" style={{ marginBottom: 20 }}>
          <h2
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: 18,
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontFamily: "var(--font-mono)",
            }}
          >
            Paramètres de la plateforme
          </h2>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Nom de l'entreprise</label>
              <input
                className="form-input"
                value={platform.companyName}
                onChange={(e) => set("companyName", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Taux de commission MGTS (%)</label>
              <input
                className="form-input"
                type="number"
                value={platform.commissionRate}
                onChange={(e) => set("commissionRate", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Devise</label>
              <select
                className="form-select"
                value={platform.currency}
                onChange={(e) => set("currency", e.target.value)}
              >
                <option value="MAD">MAD — Dirham marocain</option>
                <option value="EUR">EUR — Euro</option>
                <option value="USD">USD — Dollar américain</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Mode sombre</label>
              <select
                className="form-select"
                value={platform.darkMode}
                onChange={(e) => set("darkMode", e.target.value)}
              >
                <option value="off">Désactivé</option>
                <option value="on">Activé</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Activer SMTP (emails)</label>
              <select
                className="form-select"
                value={platform.smtp}
                onChange={(e) => set("smtp", e.target.value)}
              >
                <option value="off">Désactivé</option>
                <option value="on">Activé</option>
              </select>
            </div>
            <div className="form-group full">
              <label className="form-label">Avis de maintenance</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: 80 }}
                value={platform.maintenance}
                onChange={(e) => set("maintenance", e.target.value)}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <button className="btn btn-primary" onClick={handleSave}>
              Enregistrer les paramètres
            </button>
            {saved && (
              <span
                style={{ fontSize: 13, color: "var(--teal)", fontWeight: 600 }}
              >
                ✓ Paramètres enregistrés
              </span>
            )}
          </div>
        </div>

        {/* Security */}
        <div className="card card-pad" style={{ marginBottom: 20 }}>
          <h2
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: 18,
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontFamily: "var(--font-mono)",
            }}
          >
            Sécurité
          </h2>
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
            <p
              style={{ color: "var(--danger)", fontSize: 13, marginBottom: 10 }}
            >
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

        {/* System info */}
        <div className="card card-pad" style={{ marginBottom: 20 }}>
          <h2
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: 18,
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontFamily: "var(--font-mono)",
            }}
          >
            Informations système
          </h2>
          <div className="form-grid">
            {[
              ["Version API", "v1.0.0"],
              ["Environnement", "Production"],
              ["Base de données", "MySQL 8.0"],
              ["Node.js", "v24.x"],
              ["Socket.io", "v4.x"],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="form-label" style={{ marginBottom: 4 }}>
                  {k}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {v}
                </div>
              </div>
            ))}
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
          <p
            style={{
              fontSize: 13,
              color: "var(--text-soft)",
              marginBottom: 14,
            }}
          >
            Se déconnecter de la session administrateur.
          </p>
          <button className="btn btn-danger btn-sm" onClick={logout}>
            Se déconnecter
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
