import { useState, useEffect } from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import "../../styles/Admin.css";
import api from "../../api/axios";

const roleConfig = {
  client: { label: "Client", color: "var(--teal)", bg: "var(--teal-light)" },
  supplier: {
    label: "Fournisseur",
    color: "var(--orange)",
    bg: "var(--orange-light)",
  },
  transport: {
    label: "Transporteur",
    color: "var(--blue)",
    bg: "var(--blue-light)",
  },
  transitaire: {
    label: "Transitaire",
    color: "var(--purple)",
    bg: "var(--purple-light)",
  },
  admin: { label: "Admin", color: "var(--teal)", bg: "var(--teal-light)" },
};

const statusConfig = {
  active: { label: "Actif", color: "var(--green)", bg: "var(--green-light)" },
  pending: {
    label: "En attente",
    color: "var(--yellow)",
    bg: "var(--yellow-light)",
  },
  suspended: { label: "Suspendu", color: "var(--red)", bg: "var(--red-light)" },
};

const roles = ["Tous", "client", "supplier", "transport", "transitaire"];
const statuses = ["Tous", "active", "pending", "suspended"];

export default function UsersManagement({ initialRole = "Tous" }) {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState(initialRole);
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState({});

  // ── Create user modal ─────────────────────────────────────
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "supplier",
    companyName: "",
    factoryName: "",
    productTypes: "",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users", { params: { limit: 100 } });
      setUsers(res.data?.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Actions ───────────────────────────────────────────────
  const action = async (userId, act) => {
    setActing((a) => ({ ...a, [userId]: true }));
    try {
      if (act === "validate" || act === "activate") {
        await api.put(`/admin/users/${userId}`, { status: "active" });
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: "active" } : u))
        );
      }
      if (act === "suspend") {
        await api.put(`/admin/users/${userId}`, { status: "suspended" });
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: "suspended" } : u))
        );
      }
      if (act === "delete") {
        await api.delete(`/admin/users/${userId}`);
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
      setConfirmModal(null);
      if (selected?.id === userId) setSelected(null);
    } catch (err) {
      console.error(err);
    } finally {
      setActing((a) => ({ ...a, [userId]: false }));
    }
  };

  // ── Create user ───────────────────────────────────────────
  const handleCreate = async () => {
    setCreateError("");
    if (!createForm.fullName || !createForm.email || !createForm.password) {
      return setCreateError("Nom, email et mot de passe sont obligatoires.");
    }
    setCreating(true);
    try {
      await api.post("/admin/users", createForm);
      setCreateModal(false);
      setCreateForm({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        role: "supplier",
        companyName: "",
        factoryName: "",
        productTypes: "",
      });
      await fetchUsers();
    } catch (err) {
      setCreateError(err.message || "Erreur lors de la création.");
    } finally {
      setCreating(false);
    }
  };
  

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "Tous" || u.role === roleFilter;
    const matchStatus = statusFilter === "Tous" || u.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      (u.fullName || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q);
    return matchRole && matchStatus && matchSearch;
  });

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  return (
    <AdminLayout>
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Gestion des utilisateurs</h1>
            <p>
              {users.filter((u) => u.status === "pending").length} compte(s) en
              attente · {users.length} utilisateurs au total
            </p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setCreateModal(true)}
          >
            + Créer un utilisateur
          </button>
        </div>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "40vh",
            }}
          >
            <p style={{ color: "var(--text-soft)", fontSize: 13 }}>
              Chargement...
            </p>
          </div>
        ) : (
          <>
            {/* Pending alert */}
            {users.filter((u) => u.status === "pending").length > 0 && (
              <div className="alert-banner" style={{ marginBottom: 20 }}>
                <div className="alert-banner-icon">⚠</div>
                <div>
                  <div className="alert-banner-title">
                    {users.filter((u) => u.status === "pending").length}{" "}
                    utilisateurs attendent validation
                  </div>
                  <div className="alert-banner-text">
                    Vérifiez les informations avant d'approuver l'accès à la
                    plateforme.
                  </div>
                </div>
                <button
                  className="btn btn-orange btn-sm"
                  onClick={() => setStatusFilter("pending")}
                >
                  Filtrer
                </button>
              </div>
            )}

            {/* Counters */}
            <div className="grid-4" style={{ marginBottom: 20 }}>
              {[
                {
                  label: "Total",
                  value: users.length,
                  color: "var(--text)",
                  bg: "transparent",
                  border: "var(--border-mid)",
                },
                {
                  label: "Actifs",
                  value: users.filter((u) => u.status === "active").length,
                  color: "var(--green)",
                  bg: "var(--green-light)",
                },
                {
                  label: "En attente",
                  value: users.filter((u) => u.status === "pending").length,
                  color: "var(--yellow)",
                  bg: "var(--yellow-light)",
                },
                {
                  label: "Suspendus",
                  value: users.filter((u) => u.status === "suspended").length,
                  color: "var(--red)",
                  bg: "var(--red-light)",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="card"
                  style={{
                    padding: "14px 18px",
                    background: s.bg,
                    border: s.border
                      ? `1px solid ${s.border}`
                      : "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color:
                        s.color === "var(--text)"
                          ? "var(--text-soft)"
                          : s.color,
                      textTransform: "uppercase",
                      letterSpacing: "1.5px",
                      fontFamily: "var(--font-mono)",
                      marginBottom: 6,
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 400,
                      fontFamily: "var(--font-mono)",
                      color: s.color,
                    }}
                  >
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div
              style={{
                display: "flex",
                gap: 10,
                marginBottom: 18,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div
                className="navbar-search"
                style={{ flex: "none", width: 260 }}
              >
                <span style={{ color: "var(--text-soft)" }}>⌕</span>
                <input
                  placeholder="Nom, email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: `1px solid ${
                        roleFilter === r ? "var(--teal)" : "var(--border-mid)"
                      }`,
                      background:
                        roleFilter === r ? "var(--teal-light)" : "transparent",
                      color:
                        roleFilter === r ? "var(--teal)" : "var(--text-soft)",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "var(--font)",
                      transition: "all .15s",
                      textTransform: "capitalize",
                      letterSpacing: ".3px",
                    }}
                  >
                    {r === "Tous" ? "Tous" : roleConfig[r]?.label || r}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: `1px solid ${
                        statusFilter === s
                          ? "var(--orange)"
                          : "var(--border-mid)"
                      }`,
                      background:
                        statusFilter === s
                          ? "var(--orange-light)"
                          : "transparent",
                      color:
                        statusFilter === s
                          ? "var(--orange)"
                          : "var(--text-soft)",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "var(--font)",
                      transition: "all .15s",
                      textTransform: "capitalize",
                      letterSpacing: ".3px",
                    }}
                  >
                    {s === "Tous" ? "Tous" : statusConfig[s]?.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="card">
              <div
                className="table-header"
                style={{
                  gridTemplateColumns: "1fr 110px 160px 90px 80px 90px 160px",
                }}
              >
                <span>Utilisateur</span>
                <span>Rôle</span>
                <span>Email</span>
                <span>Statut</span>
                <span>Commandes</span>
                <span>Inscrit</span>
                <span>Actions</span>
              </div>
              {filtered.length === 0 ? (
                <div
                  style={{
                    padding: "32px",
                    textAlign: "center",
                    color: "var(--text-soft)",
                    fontSize: 13,
                  }}
                >
                  Aucun utilisateur trouvé.
                </div>
              ) : (
                filtered.map((u) => {
                  const r = roleConfig[u.role] || {
                    label: u.role,
                    color: "var(--text-mid)",
                    bg: "var(--bg-3)",
                  };
                  const s = statusConfig[u.status] || statusConfig.pending;
                  return (
                    <div
                      key={u.id}
                      className="table-row"
                      style={{
                        gridTemplateColumns:
                          "1fr 110px 160px 90px 80px 90px 160px",
                      }}
                      onClick={() => setSelected(u)}
                    >
                      <div>
                        <div className="row-title">{u.fullName}</div>
                        <div className="row-sub">{u.email}</div>
                      </div>
                      <span
                        className="badge"
                        style={{ color: r.color, background: r.bg }}
                      >
                        {r.label}
                      </span>
                      <div style={{ fontSize: 12, color: "var(--text-mid)" }}>
                        {u.email}
                      </div>
                      <span
                        className="badge"
                        style={{ color: s.color, background: s.bg }}
                      >
                        <span
                          className="badge-dot"
                          style={{ background: s.color }}
                        />
                        {s.label}
                      </span>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                          color: "var(--text-mid)",
                          textAlign: "center",
                        }}
                      >
                        —
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          color: "var(--text-soft)",
                        }}
                      >
                        {formatDate(u.createdAt)}
                      </div>
                      <div
                        style={{ display: "flex", gap: 5 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {u.status === "pending" && (
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={acting[u.id]}
                            onClick={() => action(u.id, "validate")}
                          >
                            ✓ Valider
                          </button>
                        )}
                        {u.status === "active" && (
                          <button
                            className="btn btn-sm"
                            style={{
                              background: "var(--yellow-light)",
                              color: "var(--yellow)",
                              border: "1px solid rgba(245,158,11,.2)",
                              fontSize: 11,
                              padding: "5px 10px",
                              borderRadius: "var(--radius-sm)",
                              cursor: "pointer",
                            }}
                            disabled={acting[u.id]}
                            onClick={() =>
                              setConfirmModal({ user: u, action: "suspend" })
                            }
                          >
                            ⏸
                          </button>
                        )}
                        {u.status === "suspended" && (
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={acting[u.id]}
                            onClick={() => action(u.id, "activate")}
                          >
                            ▶
                          </button>
                        )}
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={acting[u.id]}
                          onClick={() =>
                            setConfirmModal({ user: u, action: "delete" })
                          }
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* User detail panel */}
        {selected && (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div
              className="card modal-box"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "var(--text-soft)",
                      marginBottom: 4,
                    }}
                  >
                    USR-{String(selected.id).padStart(6, "0")}
                  </div>
                  <div className="modal-title" style={{ marginBottom: 4 }}>
                    {selected.fullName}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-soft)" }}>
                    {selected.email}
                  </div>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setSelected(null)}
                >
                  ✕
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                  marginBottom: 20,
                }}
              >
                {[
                  ["Rôle", roleConfig[selected.role]?.label || selected.role],
                  ["Statut", statusConfig[selected.status]?.label],
                  ["Email", selected.email],
                  ["Téléphone", selected.phone || "—"],
                  ["Inscription", formatDate(selected.createdAt)],
                  ["Vérifié", selected.isVerified ? "✓ Oui" : "✗ Non"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      background: "var(--bg-3)",
                      borderRadius: "var(--radius-sm)",
                      padding: "12px 14px",
                    }}
                  >
                    <div className="form-label" style={{ marginBottom: 5 }}>
                      {k}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text)",
                      }}
                    >
                      {v}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                {selected.status === "pending" && (
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => action(selected.id, "validate")}
                  >
                    ✓ Valider le compte
                  </button>
                )}
                {selected.status === "active" && (
                  <button
                    className="btn btn-sm"
                    style={{
                      flex: 1,
                      background: "var(--yellow-light)",
                      color: "var(--yellow)",
                      border: "1px solid rgba(245,158,11,.2)",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                    onClick={() => action(selected.id, "suspend")}
                  >
                    ⏸ Suspendre
                  </button>
                )}
                {selected.status === "suspended" && (
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => action(selected.id, "activate")}
                  >
                    ▶ Réactiver
                  </button>
                )}
                <button
                  className="btn btn-danger"
                  onClick={() =>
                    setConfirmModal({ user: selected, action: "delete" })
                  }
                >
                  ✕ Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm modal */}
        {confirmModal && (
          <div className="modal-overlay" onClick={() => setConfirmModal(null)}>
            <div
              className="card modal-box"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "var(--red-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  fontSize: 20,
                  color: "var(--red)",
                }}
              >
                {confirmModal.action === "delete" ? "✕" : "⏸"}
              </div>
              <div className="modal-title" style={{ textAlign: "center" }}>
                {confirmModal.action === "delete"
                  ? "Supprimer cet utilisateur"
                  : "Suspendre ce compte"}
              </div>
              <div className="modal-desc">
                {confirmModal.action === "delete"
                  ? `La suppression de "${confirmModal.user.fullName}" est irréversible. Toutes ses données seront effacées.`
                  : `Le compte de "${confirmModal.user.fullName}" sera suspendu. Il ne pourra plus accéder à la plateforme.`}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                  onClick={() =>
                    action(confirmModal.user.id, confirmModal.action)
                  }
                >
                  Confirmer
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setConfirmModal(null)}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create user modal */}
        {createModal && (
          <div className="modal-overlay" onClick={() => setCreateModal(false)}>
            <div
              className="card"
              style={{
                width: 520,
                padding: 30,
                maxHeight: "90vh",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ marginBottom: 20 }}>
                <h2
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: 4,
                  }}
                >
                  Créer un utilisateur
                </h2>
                <p style={{ fontSize: 12, color: "var(--text-soft)" }}>
                  Les identifiants seront envoyés par email automatiquement.
                </p>
              </div>

              {createError && (
                <div
                  style={{
                    background: "var(--red-light)",
                    border: "1px solid var(--red)",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px 14px",
                    marginBottom: 16,
                    fontSize: 13,
                    color: "var(--red)",
                  }}
                >
                  ⚠ {createError}
                </div>
              )}

              <div className="form-grid">
                <div className="form-group full">
                  <label className="form-label">Nom complet *</label>
                  <input
                    className="form-input"
                    placeholder="Ex : Li Wei"
                    value={createForm.fullName}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, fullName: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="email@example.com"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, email: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input
                    className="form-input"
                    placeholder="+212600000000"
                    value={createForm.phone}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, phone: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mot de passe *</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="••••••••"
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, password: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Rôle *</label>
                  <select
                    className="form-select"
                    value={createForm.role}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, role: e.target.value }))
                    }
                  >
                    <option value="supplier">Fournisseur</option>
                    <option value="transport">Transporteur</option>
                    <option value="transitaire">Transitaire</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label className="form-label">
                    {createForm.role === "supplier"
                      ? "Nom de l'usine"
                      : "Nom de l'entreprise"}
                  </label>
                  <input
                    className="form-input"
                    placeholder="Ex : Shenzhen MetalTech Co."
                    value={
                      createForm.role === "supplier"
                        ? createForm.factoryName
                        : createForm.companyName
                    }
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        [createForm.role === "supplier"
                          ? "factoryName"
                          : "companyName"]: e.target.value,
                      }))
                    }
                  />
                </div>
                {createForm.role === "supplier" && (
                  <div className="form-group full">
                    <label className="form-label">Types de produits</label>
                    <input
                      className="form-input"
                      placeholder="Ex : Mécanique, Stockage"
                      value={createForm.productTypes}
                      onChange={(e) =>
                        setCreateForm((f) => ({
                          ...f,
                          productTypes: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}
              </div>

              <hr className="divider" />
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={handleCreate}
                  disabled={creating}
                >
                  {creating
                    ? "Création en cours…"
                    : "✓ Créer & envoyer les identifiants"}
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setCreateModal(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
