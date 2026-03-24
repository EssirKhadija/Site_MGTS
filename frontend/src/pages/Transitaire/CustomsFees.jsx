import { useState, useEffect } from "react";
import { ordersAPI } from "../../api/orders.api";

const feeLabels = {
  droits_douane: "Droits de douane",
  tva_import: "TVA importation",
  honoraires: "Honoraires transitaire",
  magasinage: "Magasinage",
  inspection: "Inspection douanière",
  doc_douanier: "Déclaration douane",
  autres: "Autres",
};

export default function CustomsFees() {
  const [dossiers, setDossiers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch orders with customs fees submitted ───────────────
  useEffect(() => {
    ordersAPI
      .getTransitaireOrders()
      .then((res) => {
        const list = (res.data || []).filter(
          (o) => o.customsCost && parseFloat(o.customsCost) > 0
        );
        setDossiers(list);
        if (list.length > 0) setSelected(list[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalMonth = dossiers.reduce(
    (s, d) => s + parseFloat(d.customsCost || 0),
    0
  );
  const validated = dossiers.filter((d) =>
    ["paid", "waiting_validation"].includes(d.status)
  ).length;
  const pending = dossiers.filter(
    (d) => d.status === "final_calculation"
  ).length;

  const formatAmount = (v, decimals = 2) =>
    v
      ? parseFloat(v).toLocaleString("fr", {
          minimumFractionDigits: decimals,
        }) + " MAD"
      : "—";

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatId = (id) => `DOS-${String(id).padStart(6, "0")}`;

  // Parse comment to extract fee breakdown if available
  const parseFees = (order) => {
    const comment = order.supplierComment || order.comment || "";
    const fees = {};
    const total = parseFloat(order.customsCost || 0);

    // Try to extract from comment (format saved in TransitaireOrders)
    const droitsMatch = comment.match(/Droits:\s*([\d.]+)/);
    const tvaMatch = comment.match(/TVA:\s*([\d.]+)/);
    const honorairesMatch = comment.match(/Honoraires:\s*([\d.]+)/);

    if (droitsMatch) fees.droits_douane = parseFloat(droitsMatch[1]);
    if (tvaMatch) fees.tva_import = parseFloat(tvaMatch[1]);
    if (honorairesMatch) fees.honoraires = parseFloat(honorairesMatch[1]);

    return { fees, total, notes: comment };
  };

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

  const {
    fees: selectedFees,
    total: selectedTotal,
    notes: selectedNotes,
  } = selected ? parseFees(selected) : { fees: {}, total: 0, notes: "" };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Frais douaniers</h1>
          <p>Récapitulatif de tous les frais soumis à MGTS ce mois.</p>
        </div>
        <button className="btn btn-ghost">↓ Exporter CSV</button>
      </div>

      {/* Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {[
          {
            label: "Total frais soumis",
            value: formatAmount(totalMonth),
            color: "var(--ac)",
            bg: "var(--ac-light)",
          },
          {
            label: "Dossiers validés",
            value: String(validated),
            color: "var(--teal)",
            bg: "var(--teal-light)",
          },
          {
            label: "En attente MGTS",
            value: String(pending),
            color: "var(--warn)",
            bg: "#FEF6E8",
          },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-soft)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: 8,
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-dark)",
                  }}
                >
                  {s.value}
                </div>
              </div>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: s.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: s.color,
                }}
              >
                ✦
              </div>
            </div>
          </div>
        ))}
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
          <p>Aucun frais douanier soumis pour le moment.</p>
        </div>
      ) : (
        <div
          style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}
        >
          {/* List */}
          <div className="card" style={{ overflow: "auto" }}>
            <div className="card-header">
              <h3>Dossiers clôturés</h3>
            </div>
            {dossiers.map((d) => (
              <div
                key={d.id}
                onClick={() => setSelected(d)}
                style={{
                  padding: "15px 18px",
                  borderBottom: "1px solid var(--border-soft)",
                  cursor: "pointer",
                  background:
                    selected?.id === d.id ? "var(--ac-xlight)" : "transparent",
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
                    marginBottom: 5,
                  }}
                >
                  <span
                    className="mono"
                    style={{ fontSize: 10, color: "var(--text-soft)" }}
                  >
                    {formatId(d.id)}
                  </span>
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
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-dark)",
                    marginBottom: 3,
                  }}
                >
                  {d.productName || "Commande personnalisée"}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-soft)" }}>
                  {d.incoterm || "—"} · {formatDate(d.updatedAt)}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--ac)",
                    marginTop: 8,
                  }}
                >
                  {formatAmount(d.customsCost)}
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          {selected && (
            <div className="card card-pad">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 22,
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
                    {formatId(selected.id)}
                  </div>
                  <h2
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: "var(--text-dark)",
                    }}
                  >
                    {selected.productName || "Commande personnalisée"}
                  </h2>
                </div>
                <span
                  className="badge"
                  style={{
                    color: "var(--teal)",
                    background: "var(--teal-light)",
                  }}
                >
                  ✓ Validé MGTS
                </span>
              </div>

              <div
                style={{
                  background: "var(--ac-xlight)",
                  borderRadius: 10,
                  padding: "14px 20px",
                  marginBottom: 22,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 16,
                }}
              >
                {[
                  ["Incoterm", selected.incoterm || "—"],
                  ["Budget estimé", formatAmount(selected.estimatedBudget)],
                  ["Date", formatDate(selected.updatedAt)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--text-soft)",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        marginBottom: 4,
                      }}
                    >
                      {k}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--text-dark)",
                      }}
                    >
                      {v}
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-label" style={{ marginBottom: 14 }}>
                Détail des frais douaniers
              </div>

              {/* Show parsed fees if available */}
              {Object.keys(selectedFees).length > 0 ? (
                Object.entries(selectedFees)
                  .filter(([, v]) => v > 0)
                  .map(([k, v]) => (
                    <div key={k} className="cost-line">
                      <span className="cost-label">{feeLabels[k] ?? k}</span>
                      <span className="cost-value">
                        {parseFloat(v).toLocaleString("fr", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        MAD
                      </span>
                    </div>
                  ))
              ) : (
                // Fallback: show total only
                <div className="cost-line">
                  <span className="cost-label">Total frais douaniers</span>
                  <span className="cost-value">
                    {formatAmount(selected.customsCost)}
                  </span>
                </div>
              )}

              <div className="cost-line cost-total" style={{ marginTop: 8 }}>
                <span className="cost-label">TOTAL DOUANE</span>
                <span className="cost-value" style={{ fontSize: 18 }}>
                  {formatAmount(selected.customsCost)}
                </span>
              </div>

              {selectedNotes && (
                <div
                  style={{
                    background: "var(--sky-light)",
                    borderRadius: 9,
                    padding: "12px 16px",
                    marginTop: 16,
                  }}
                >
                  <div className="form-label" style={{ marginBottom: 6 }}>
                    Notes douanières
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-mid)",
                      lineHeight: 1.6,
                    }}
                  >
                    {selectedNotes}
                  </p>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button className="btn btn-ghost btn-sm">↓ Export PDF</button>
                <button className="btn btn-ghost btn-sm">📄 DAU douane</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
