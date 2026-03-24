import { useState, useEffect } from "react";
import DossierCard from "../../components/Transitaire/DossierCard";
import { ordersAPI } from "../../api/orders.api";

const filters = [
  "Tous",
  "Nouveau",
  "En cours",
  "Contrôle douane",
  "Validé",
  "Clôturé",
];
const stateMap = {
  pending_transitaire: "Nouveau",
  final_calculation: "En cours",
  pending_payment: "Contrôle douane",
  waiting_validation: "Validé",
  paid: "Clôturé",
};

const modeIcon = { sea: "🚢", air: "✈️", road: "🚛" };

const feeTypes = [
  {
    key: "droits_douane",
    label: "Droits de douane (ad valorem)",
    required: true,
  },
  { key: "tva_import", label: "TVA à l'importation (20%)", required: true },
  { key: "honoraires", label: "Honoraires transitaire", required: true },
  { key: "magasinage", label: "Frais de magasinage", required: false },
  { key: "inspection", label: "Frais d'inspection douanière", required: false },
  {
    key: "doc_douanier",
    label: "Déclaration en douane (DAU)",
    required: false,
  },
  { key: "autres", label: "Autres frais douaniers", required: false },
];

const emptyFees = Object.fromEntries(feeTypes.map((f) => [f.key, ""]));

const transitaireStyles = {
  pageContent: {
    padding: "22px 18px 32px",
    maxWidth: 1200,
    margin: "0 auto",
    gap: 20,
  },
  pageHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  banner: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    background: "#FFF8E5",
    border: "1px solid #FFDEA7",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  filterContainer: {
    display: "flex",
    gap: 8,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  emptyState: { textAlign: "center", padding: 50, color: "var(--text-soft)" },
  modalCard: { width: 620, padding: 30, maxHeight: "90vh", overflowY: "auto" },
  smallModalCard: {
    width: 520,
    padding: 30,
    maxHeight: "90vh",
    overflowY: "auto",
  },
};

export default function TransitaireOrders() {
  const [dossiers, setDossiers] = useState([]);
  const [filter, setFilter] = useState("Tous");
  const [detail, setDetail] = useState(null);
  const [feeTarget, setFeeTarget] = useState(null);
  const [fees, setFees] = useState(emptyFees);
  const [feeNotes, setFeeNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const setFee = (k, v) => setFees((f) => ({ ...f, [k]: v }));
  const total = Object.values(fees).reduce(
    (s, v) => s + (parseFloat(v.replace(",", ".")) || 0),
    0
  );

  // ── Fetch orders ──────────────────────────────────────────
  useEffect(() => {
    ordersAPI
      .getTransitaireOrders()
      .then((res) => setDossiers(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Submit customs fees ───────────────────────────────────
  const submitFees = async () => {
    if (total === 0) return;
    setSubmitting(true);
    try {
      await ordersAPI.addTransitaireQuote(feeTarget.id, {
        customsCost: total,
        comment: `${feeNotes} | Droits: ${fees.droits_douane}€ | TVA: ${fees.tva_import}€ | Honoraires: ${fees.honoraires}€`,
      });

      setDossiers((prev) =>
        prev.map((d) =>
          d.id === feeTarget.id
            ? {
                ...d,
                status: "final_calculation",
                customsFees: { ...fees },
                customsTotal: total.toLocaleString("fr") + " MAD",
                feeNotes,
              }
            : d
        )
      );

      setFeeTarget(null);
      setFees(emptyFees);
      setFeeNotes("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = dossiers.filter((d) => {
    if (filter === "Tous") return true;
    return stateMap[d.status] === filter;
  });

  const newCount = dossiers.filter(
    (d) => d.status === "pending_transitaire"
  ).length;

  const formatAmount = (v) =>
    v ? `${parseFloat(v).toLocaleString()} MAD` : "—";
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="page-content" style={transitaireStyles.pageContent}>
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
    <div className="page-content" style={transitaireStyles.pageContent}>
      <div className="page-header" style={transitaireStyles.pageHeader}>
        <div>
          <h1>Commandes</h1>
          <p>
            Consultez l'ensemble des commandes MGTS assignées à votre dossier.
          </p>
        </div>
      </div>

      {/* Alert */}
      {newCount > 0 && (
        <div className="pending-banner" style={transitaireStyles.banner}>
          <div className="pending-banner-icon">✦</div>
          <div>
            <div className="pending-banner-title">
              {newCount} dossier(s) en attente de frais douaniers
            </div>
            <div className="pending-banner-text">
              Saisissez les droits de douane, TVA et honoraires pour chaque
              dossier.
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={transitaireStyles.filterContainer}>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "7px 18px",
              borderRadius: 20,
              border: `1.5px solid ${
                filter === f ? "var(--ac)" : "var(--border)"
              }`,
              background: filter === f ? "var(--ac-light)" : "transparent",
              color: filter === f ? "var(--ac)" : "var(--text-mid)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font)",
              transition: "all .15s",
            }}
          >
            {f}
            {f === "Nouveau" && newCount > 0 && (
              <span
                style={{
                  marginLeft: 6,
                  background: "var(--orange)",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 700,
                  padding: "1px 5px",
                  borderRadius: 8,
                }}
              >
                {newCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid-2">
        {filtered.map((d) => (
          <DossierCard
            key={d.id}
            dossier={{
              ...d,
              id: `DOS-${String(d.id).padStart(6, "0")}`,
              product:
                d.productName ||
                d.description?.slice(0, 40) ||
                "Commande personnalisée",
              mode: "sea",
              origin: d.incoterm ? `Chine (${d.incoterm})` : "Chine",
              destination: "Maroc",
              value: formatAmount(d.estimatedBudget),
              client: d.clientName || "—",
              supplier: d.supplierName || "—",
              etd: formatDate(d.createdAt),
              eta: "—",
              status:
                stateMap[d.status] === "Nouveau"
                  ? "new"
                  : stateMap[d.status] === "En cours"
                  ? "in_progress"
                  : stateMap[d.status] === "Contrôle douane"
                  ? "customs_check"
                  : stateMap[d.status] === "Validé"
                  ? "validated"
                  : "completed",
              documents: [],
              customsFees: d.customsFees,
              customsTotal: d.customsTotal,
              hsCode: "—",
              customsRegime: "Mise en libre pratique",
              weight: "—",
              volume: "—",
              transportFees: formatAmount(d.transportCost),
              supplierCost: formatAmount(d.productionCost),
            }}
            onView={setDetail}
            onAddFees={(dos) => {
              setFeeTarget({ ...dos, id: d.id });
              setFees(emptyFees);
              setFeeNotes("");
            }}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={transitaireStyles.emptyState}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>◈</div>
          <p>Aucun dossier dans cette catégorie.</p>
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div
            className="card"
            style={transitaireStyles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
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
                  {detail.id}
                </div>
                <h2
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "var(--text-dark)",
                  }}
                >
                  {detail.product}
                </h2>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setDetail(null)}
              >
                ✕ Fermer
              </button>
            </div>

            {/* Route */}
            <div
              style={{
                background: "var(--ac-xlight)",
                border: "1px solid var(--ac-light)",
                borderRadius: 10,
                padding: "14px 20px",
                marginBottom: 20,
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
                    marginBottom: 4,
                  }}
                >
                  ORIGINE
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--text-dark)",
                  }}
                >
                  {detail.origin}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24 }}>
                  {modeIcon[detail.mode] ?? "🚢"}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--ac)",
                    fontWeight: 600,
                    marginTop: 3,
                  }}
                >
                  {detail.incoterm}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--text-soft)",
                    marginBottom: 4,
                  }}
                >
                  DESTINATION
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--text-dark)",
                  }}
                >
                  {detail.destination}
                </div>
              </div>
            </div>

            {/* Full order info */}
            <div className="form-label" style={{ marginBottom: 14 }}>
              Informations complètes de la commande
            </div>
            <div className="form-grid" style={{ marginBottom: 20 }}>
              {[
                ["Fournisseur", detail.supplier],
                ["Client final", detail.client],
                ["Valeur marchande", detail.value],
                ["Poids / Volume", `${detail.weight} / ${detail.volume}`],
                ["Code SH", detail.hsCode],
                ["Régime douanier", detail.customsRegime],
                ["Transporteur", detail.transport || "—"],
                ["Frais transport", detail.transportFees],
                ["Coût fournisseur", detail.supplierCost],
                ["ETD / ETA", `${detail.etd} / ${detail.eta}`],
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

            {/* Documents */}
            {detail.documents?.length > 0 && (
              <>
                <div className="form-label" style={{ marginBottom: 10 }}>
                  Documents disponibles
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 20,
                  }}
                >
                  {detail.documents.map((doc, i) => (
                    <button key={i} className="btn btn-ghost btn-sm">
                      📄 {doc}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Customs fees submitted */}
            {detail.customsFees && (
              <div
                style={{
                  background: "var(--ac-light)",
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--ac)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: 10,
                  }}
                >
                  Frais douaniers soumis
                </div>
                {feeTypes
                  .filter((ft) => detail.customsFees[ft.key])
                  .map((ft) => (
                    <div key={ft.key} className="cost-line">
                      <span className="cost-label">{ft.label}</span>
                      <span className="cost-value">
                        {detail.customsFees[ft.key]} MAD
                      </span>
                    </div>
                  ))}
                <div className="cost-line cost-total">
                  <span className="cost-label">TOTAL DOUANE</span>
                  <span className="cost-value">{detail.customsTotal}</span>
                </div>
              </div>
            )}

            {detail.status === "new" && (
              <button
                className="btn btn-primary btn-full"
                onClick={() => {
                  setDetail(null);
                  setFeeTarget(detail);
                }}
              >
                ✦ Saisir les frais douaniers
              </button>
            )}
          </div>
        </div>
      )}

      {/* Fee entry modal */}
      {feeTarget && (
        <div className="modal-overlay" onClick={() => setFeeTarget(null)}>
          <div
            className="card"
            style={transitaireStyles.smallModalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: 22 }}>
              <div
                className="modal-icon"
                style={{ background: "var(--ac-light)", color: "var(--ac)" }}
              >
                ✦
              </div>
              <div className="modal-title">Frais douaniers</div>
              <div className="modal-desc">
                {feeTarget.product}
                <br />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                  Valeur : {feeTarget.value} · Code SH : {feeTarget.hsCode}
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                marginBottom: 20,
              }}
            >
              {feeTypes.map((ft) => (
                <div key={ft.key} className="form-group">
                  <label className="form-label">
                    {ft.label}{" "}
                    {ft.required && (
                      <span style={{ color: "var(--danger)" }}>*</span>
                    )}
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="form-input"
                      placeholder="0.00"
                      style={{ paddingRight: 52 }}
                      value={fees[ft.key]}
                      onChange={(e) => setFee(ft.key, e.target.value)}
                    />
                    <span
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 12,
                        color: "var(--text-soft)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      MAD
                    </span>
                  </div>
                </div>
              ))}

              <div className="form-group">
                <label className="form-label">
                  Notes & observations douanières
                </label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: 60 }}
                  placeholder="Régime spécifique, exonérations, restrictions, observations…"
                  value={feeNotes}
                  onChange={(e) => setFeeNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Live total */}
            <div
              style={{
                background: "var(--ac-light)",
                borderRadius: "var(--radius-sm)",
                padding: "14px 18px",
                marginBottom: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-dark)",
                }}
              >
                Total frais douaniers
              </span>
              <span
                style={{
                  fontSize: 20,
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  color: "var(--ac)",
                }}
              >
                {total.toLocaleString("fr")} MAD
              </span>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={submitFees}
                disabled={total === 0 || submitting}
              >
                {submitting ? "Envoi en cours…" : "Soumettre les frais"}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setFeeTarget(null)}
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
