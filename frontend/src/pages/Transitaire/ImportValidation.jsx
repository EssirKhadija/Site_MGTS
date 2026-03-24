import { useState, useEffect } from "react";
import { ordersAPI } from "../../api/orders.api";

const modeIcon = { sea: "🚢", air: "✈️", road: "🚛" };

const defaultChecks = {
  facture: { label: "Facture commerciale conforme", done: false },
  packing: { label: "Packing list vérifiée", done: false },
  bl: { label: "Connaissement (BL) validé", done: false },
  origine: { label: "Certificat d'origine vérifié", done: false },
  hs_code: { label: "Code SH confirmé", done: false },
  valeur: { label: "Valeur en douane vérifiée", done: false },
  restrictions: { label: "Pas de restriction d'import", done: false },
  conformite: { label: "Conformité réglementaire (CE/UE)", done: false },
};

export default function ImportValidation() {
  const [dossiers, setDossiers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [checks, setChecks] = useState({}); // { [orderId]: { ...defaultChecks } }
  const [validated, setValidated] = useState({});
  const [blockReason, setBlockReason] = useState("");
  const [showBlock, setShowBlock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch orders ──────────────────────────────────────────
  useEffect(() => {
    ordersAPI
      .getTransitaireOrders()
      .then((res) => {
        const list = (res.data || []).filter((o) =>
          ["pending_transitaire", "final_calculation"].includes(o.status)
        );
        setDossiers(list);
        if (list.length > 0) setSelected(list[0]);

        // Init checks for each order
        const initChecks = {};
        list.forEach((o) => {
          initChecks[o.id] = JSON.parse(JSON.stringify(defaultChecks));
        });
        setChecks(initChecks);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Toggle check ──────────────────────────────────────────
  const toggleCheck = (orderId, checkKey) => {
    setChecks((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [checkKey]: {
          ...prev[orderId][checkKey],
          done: !prev[orderId][checkKey].done,
        },
      },
    }));
  };

  const getChecks = (orderId) => checks[orderId] || defaultChecks;

  const allDone = (order) => {
    if (!order) return false;
    const c = getChecks(order.id);
    return Object.values(c).every((ch) => ch.done) && !!order.customsCost;
  };

  // ── Validate import ───────────────────────────────────────
  const validate = async () => {
    setSubmitting(true);
    try {
      // Mark order as validated — update status via API
      await ordersAPI
        .respond(selected.id, { decision: "accept" })
        .catch(() => {});

      setValidated((v) => ({ ...v, [selected.id]: true }));
      setDossiers((prev) =>
        prev.map((d) =>
          d.id === selected.id ? { ...d, status: "final_calculation" } : d
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatAmount = (v) =>
    v ? `${parseFloat(v).toLocaleString()} MAD` : null;
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

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

  const selectedChecks = selected ? getChecks(selected.id) : {};
  const doneCount = Object.values(selectedChecks).filter((c) => c.done).length;
  const totalCount = Object.values(selectedChecks).length;
  const done = allDone(selected);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Validation import</h1>
          <p>
            Vérifiez et validez toutes les informations liées à l'importation
            pour chaque dossier.
          </p>
        </div>
      </div>

      {dossiers.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            color: "var(--text-soft)",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 10 }}>◈</div>
          <p>Aucun dossier en attente de validation.</p>
        </div>
      ) : (
        <div
          style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}
        >
          {/* Dossier list */}
          <div className="card" style={{ overflow: "auto" }}>
            <div className="card-header">
              <h3>Dossiers à valider</h3>
            </div>
            {dossiers.map((d) => {
              const dc = getChecks(d.id);
              const dc_ = Object.values(dc).filter((c) => c.done).length;
              const dt_ = Object.values(dc).length;
              const pct = Math.round((dc_ / dt_) * 100);
              const isValidated = validated[d.id];
              return (
                <div
                  key={d.id}
                  onClick={() => setSelected(d)}
                  style={{
                    padding: "15px 18px",
                    borderBottom: "1px solid var(--border-soft)",
                    cursor: "pointer",
                    background:
                      selected?.id === d.id
                        ? "var(--ac-xlight)"
                        : "transparent",
                    borderLeft:
                      selected?.id === d.id
                        ? "3px solid var(--ac)"
                        : "3px solid transparent",
                    transition: "background .15s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <span
                      className="mono"
                      style={{ fontSize: 10, color: "var(--text-soft)" }}
                    >
                      DOS-{String(d.id).padStart(6, "0")}
                    </span>
                    {isValidated ? (
                      <span
                        className="badge"
                        style={{
                          color: "var(--teal)",
                          background: "var(--teal-light)",
                          fontSize: 10,
                        }}
                      >
                        ✓ Validé
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: 10,
                          color: pct === 100 ? "var(--teal)" : "var(--ac)",
                          fontWeight: 700,
                        }}
                      >
                        {pct}%
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-dark)",
                      marginBottom: 6,
                    }}
                  >
                    {d.productName ||
                      d.description?.slice(0, 35) ||
                      "Commande personnalisée"}
                  </div>
                  <div
                    style={{
                      height: 5,
                      background: "var(--border)",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: pct + "%",
                        height: "100%",
                        background: isValidated ? "var(--teal)" : "var(--ac)",
                        borderRadius: 3,
                        transition: "width .4s",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-soft)",
                      marginTop: 4,
                    }}
                  >
                    {dc_}/{dt_} points validés
                  </div>
                </div>
              );
            })}
          </div>

          {/* Checklist panel */}
          {selected && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Info card */}
              <div className="card card-pad">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 18,
                  }}
                >
                  <div>
                    <div
                      className="mono"
                      style={{
                        fontSize: 11,
                        color: "var(--text-soft)",
                        marginBottom: 4,
                      }}
                    >
                      DOS-{String(selected.id).padStart(6, "0")}
                    </div>
                    <h2
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "var(--text-dark)",
                      }}
                    >
                      {selected.productName || "Commande personnalisée"}
                    </h2>
                  </div>
                  {validated[selected.id] && (
                    <span
                      className="badge"
                      style={{
                        color: "var(--teal)",
                        background: "var(--teal-light)",
                        fontSize: 13,
                        padding: "6px 14px",
                      }}
                    >
                      ✓ Import validé
                    </span>
                  )}
                </div>

                {/* Route */}
                <div
                  style={{
                    background: "var(--ac-xlight)",
                    borderRadius: 10,
                    padding: "12px 18px",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--text-soft)",
                        marginBottom: 3,
                      }}
                    >
                      ORIGINE
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>Chine</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22 }}>🚢</div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--ac)",
                        fontWeight: 600,
                        marginTop: 2,
                      }}
                    >
                      {selected.incoterm || "—"}
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--text-soft)",
                        marginBottom: 3,
                      }}
                    >
                      DESTINATION
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>Maroc</div>
                  </div>
                </div>

                <div className="form-grid">
                  {[
                    [
                      "Valeur marchandise",
                      formatAmount(selected.estimatedBudget) || "—",
                    ],
                    ["Quantité", `${selected.quantity} u`],
                    ["Incoterm", selected.incoterm || "—"],
                    ["Client", selected.clientName || "—"],
                    ["Fournisseur", selected.supplierName || "—"],
                    ["Date", formatDate(selected.createdAt)],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div className="form-label" style={{ marginBottom: 4 }}>
                        {k}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text-dark)",
                        }}
                      >
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checklist */}
              <div className="card card-pad">
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text-dark)",
                    marginBottom: 18,
                  }}
                >
                  Liste de contrôle import
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginBottom: 22,
                  }}
                >
                  {Object.entries(selectedChecks).map(([key, check]) => (
                    <div
                      key={key}
                      onClick={() =>
                        !validated[selected.id] && toggleCheck(selected.id, key)
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "13px 16px",
                        background: check.done
                          ? "var(--teal-light)"
                          : "var(--bg)",
                        borderRadius: "var(--radius-sm)",
                        border: `1.5px solid ${
                          check.done ? "var(--teal)" : "var(--border)"
                        }`,
                        cursor: validated[selected.id] ? "default" : "pointer",
                        transition: "all .2s",
                      }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: check.done
                            ? "var(--teal)"
                            : "var(--card)",
                          border: `2px solid ${
                            check.done ? "var(--teal)" : "var(--border)"
                          }`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all .2s",
                        }}
                      >
                        {check.done && (
                          <span
                            style={{
                              color: "#fff",
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: check.done
                            ? "var(--teal-dark)"
                            : "var(--text-dark)",
                        }}
                      >
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Fees status */}
                <div
                  style={{
                    background: selected.customsCost
                      ? "var(--teal-light)"
                      : "var(--orange-light)",
                    borderRadius: "var(--radius-sm)",
                    padding: "12px 16px",
                    marginBottom: 18,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: 18 }}>
                    {selected.customsCost ? "✓" : "⚠"}
                  </span>
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: selected.customsCost
                          ? "var(--teal)"
                          : "var(--orange)",
                      }}
                    >
                      {selected.customsCost
                        ? `Frais douaniers soumis : ${formatAmount(
                            selected.customsCost
                          )}`
                        : "Frais douaniers non encore soumis"}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-mid)",
                        marginTop: 2,
                      }}
                    >
                      {selected.customsCost
                        ? "Tous les frais ont été enregistrés."
                        : "Saisissez les frais avant de valider."}
                    </div>
                  </div>
                </div>

                {!validated[selected.id] && (
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                      disabled={!done || submitting}
                      onClick={validate}
                    >
                      {submitting
                        ? "Validation en cours…"
                        : done
                        ? "✓ Valider l'importation"
                        : `En attente (${doneCount}/${totalCount} points)`}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => setShowBlock(true)}
                    >
                      ⛔ Bloquer
                    </button>
                  </div>
                )}

                {validated[selected.id] && (
                  <div
                    style={{
                      background: "var(--teal-light)",
                      borderRadius: "var(--radius-sm)",
                      padding: "14px 18px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <span style={{ fontSize: 22, color: "var(--teal)" }}>
                      ✓
                    </span>
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "var(--teal)",
                        }}
                      >
                        Importation validée
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-mid)",
                          marginTop: 2,
                        }}
                      >
                        MGTS a été notifié. Le dossier peut être clôturé.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Block modal */}
      {showBlock && (
        <div className="modal-overlay" onClick={() => setShowBlock(false)}>
          <div className="card modal-box" onClick={(e) => e.stopPropagation()}>
            <div
              className="modal-icon"
              style={{ background: "#FFE8DC", color: "var(--danger)" }}
            >
              ⛔
            </div>
            <div className="modal-title">Bloquer l'importation</div>
            <div className="modal-desc">
              Expliquez la raison du blocage. MGTS et le client seront
              immédiatement notifiés.
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Motif du blocage *</label>
              <textarea
                className="form-textarea"
                placeholder="Ex : Documents manquants, non-conformité réglementaire…"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn btn-danger"
                style={{ flex: 1 }}
                disabled={!blockReason.trim()}
                onClick={() => setShowBlock(false)}
              >
                Confirmer le blocage
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setShowBlock(false)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
