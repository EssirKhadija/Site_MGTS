import { useState, useEffect } from "react";
import "../../styles/Client.css";
import ClientLayout from "../../components/Client/ClientLayout";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../api/auth.api";
import { paymentsAPI } from "../../api/payments.api";

export default function Profile() {
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [payments, setPayments] = useState([]);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    "Réception d'un devis": true,
    "Mise à jour du statut commande": true,
    "Nouveau message MGTS": true,
    "Facture disponible": true,
    "Promotions & actualités": false,
  });

  const set = (k, v) => setProfile((p) => ({ ...p, [k]: v }));
  const setP = (k, v) => setPasswords((p) => ({ ...p, [k]: v }));

  // ── Fetch profile + payments ──────────────────────────────
  useEffect(() => {
    Promise.all([
      authAPI.getMe(),
      paymentsAPI.getAll().catch(() => ({ data: { payments: [] } })),
    ])
      .then(([meRes, payRes]) => {
        const u = meRes.data;
        setProfile({
          fullName: u.fullName || "",
          email: u.email || "",
          phone: u.phone || "",
        });
        setPayments(payRes.data?.payments || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Save profile ──────────────────────────────────────────
  const handleSave = async () => {
    setSaveError("");
    try {
      await authAPI.updateProfile({
        fullName: profile.fullName,
        phone: profile.phone,
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
    if (passwords.next !== passwords.confirm) {
      return setPwError("Les mots de passe ne correspondent pas.");
    }
    if (passwords.next.length < 8) {
      return setPwError("Le mot de passe doit contenir au moins 8 caractères.");
    }
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

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatAmount = (v) =>
    v ? `${parseFloat(v).toLocaleString()} MAD` : "—";

  const initials = profile.fullName
    ? profile.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  if (loading) {
    return (
      <ClientLayout>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
          }}
        >
          <p
            style={{
              color: "var(--text-soft)",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
            }}
          >
            Chargement...
          </p>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="page-content">
        <h1>Mon profil</h1>
        <p>
          Gérez vos informations personnelles et la sécurité de votre compte.
        </p>
      </div>

      {/* Avatar + summary */}
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
              borderRadius: "50%",
              background: "linear-gradient(135deg,var(--teal),var(--orange))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
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
              {profile.fullName}
            </div>
            <div
              style={{ fontSize: 13, color: "var(--text-soft)", marginTop: 2 }}
            >
              {profile.email} · Client depuis{" "}
              {new Date(user?.createdAt).toLocaleDateString("fr-FR", {
                month: "short",
                year: "numeric",
              })}
            </div>
            <div style={{ marginTop: 8 }}>
              {user?.isVerified && (
                <span
                  style={{
                    background: "var(--teal-light)",
                    color: "var(--teal)",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 10,
                  }}
                >
                  Compte vérifié ✓
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile fields */}
        <div className="form-label" style={{ marginBottom: 16 }}>
          Informations personnelles
        </div>
        <div className="form-grid">
          {[
            { label: "Nom complet", key: "fullName" },
            { label: "Téléphone", key: "phone" },
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
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              value={profile.email}
              disabled
              style={{ opacity: 0.6, cursor: "not-allowed" }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Rôle</label>
            <input
              className="form-input"
              value={user?.role || "client"}
              disabled
              style={{
                opacity: 0.6,
                cursor: "not-allowed",
                textTransform: "capitalize",
              }}
            />
          </div>
        </div>

        <hr className="divider" />

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
              ✓ Modifications enregistrées
            </span>
          )}
        </div>
      </div>

      {/* Security */}
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="form-label" style={{ marginBottom: 18 }}>
          Sécurité
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Mot de passe actuel", key: "current" },
            { label: "Nouveau mot de passe", key: "next" },
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
        {pwError && (
          <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 10 }}>
            ⚠ {pwError}
          </p>
        )}
        <div
          style={{
            marginTop: 18,
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
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

      {/* Notifications preferences */}
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="form-label" style={{ marginBottom: 18 }}>
          Préférences de notifications
        </div>
        {Object.entries(notifications).map(([label, checked], i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: "1px solid var(--border-soft)",
            }}
          >
            <span style={{ fontSize: 13, color: "var(--text-dark)" }}>
              {label}
            </span>
            <div
              onClick={() =>
                setNotifications((prev) => ({ ...prev, [label]: !prev[label] }))
              }
              style={{
                width: 40,
                height: 22,
                borderRadius: 11,
                background: checked ? "var(--teal)" : "var(--border)",
                position: "relative",
                cursor: "pointer",
                transition: "background .2s",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 3,
                  left: checked ? 21 : 3,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left .2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment history */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3>Historique des paiements</h3>
        </div>
        {payments.length === 0 ? (
          <div
            style={{
              padding: "20px 22px",
              color: "var(--text-soft)",
              fontSize: 13,
            }}
          >
            Aucun paiement enregistré.
          </div>
        ) : (
          payments.map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 22px",
                borderBottom: "1px solid var(--border-soft)",
              }}
            >
              <div>
                <div
                  className="mono"
                  style={{ fontSize: 10, color: "var(--text-soft)" }}
                >
                  CMD-{String(p.order_id).padStart(6, "0")}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text-dark)",
                    marginTop: 2,
                  }}
                >
                  {formatDate(p.createdAt)} · {p.paymentMethod || "Virement"}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  className="mono"
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--text-dark)",
                  }}
                >
                  {formatAmount(p.amount)}
                </span>
                <span
                  style={{
                    background:
                      p.status === "validated"
                        ? "var(--teal-light)"
                        : "var(--bg)",
                    color:
                      p.status === "validated"
                        ? "var(--teal)"
                        : "var(--text-soft)",
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "3px 9px",
                    borderRadius: 10,
                  }}
                >
                  {p.status === "validated"
                    ? "Payé"
                    : p.status === "pending"
                    ? "En attente"
                    : "Rejeté"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Danger zone */}
      <div
        className="card card-pad"
        style={{ borderColor: "#ffd0cc", marginBottom: 20 }}
      >
        <div
          className="form-label"
          style={{ marginBottom: 12, color: "var(--danger)" }}
        >
          Zone de danger
        </div>
        <p style={{ fontSize: 13, color: "var(--text-mid)", marginBottom: 16 }}>
          La suppression de votre compte est irréversible. Toutes vos données
          seront effacées.
        </p>
        <button className="btn btn-danger btn-sm" onClick={logout}>
          Se déconnecter
        </button>
      </div>
    </ClientLayout>
  );
}
