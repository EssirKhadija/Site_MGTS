import { useState, useEffect } from "react";
import DemandCard from "../../components/Fournisseur/DemandCard";
import SupplierLayout from "../../components/Fournisseur/SupplierLayout";
import "../../styles/Supplier.css";
import { ordersAPI } from "../../api/orders.api";

const stateFilters = ["Tous", "Nouveau", "Devis soumis", "Accepté", "Refusé"];

const statusToState = {
  pending_supplier: "new",
  pending_transport: "quoted",
  waiting_validation: "accepted",
  paid: "accepted",
  rejected: "rejected",
};

const stateMap = {
  new: "Nouveau",
  quoted: "Devis soumis",
  accepted: "Accepté",
  rejected: "Refusé",
};

export default function SupplierDemands() {
  const [demands, setDemands] = useState([]);
  const [filter, setFilter] = useState("Tous");
  const [quoteTarget, setQuoteTarget] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    cost: "",
    leadTime: "",
    notes: "",
    validity: "30",
  });

  const setQ = (k, v) => setQuoteForm((f) => ({ ...f, [k]: v }));

  // ── Fetch orders assigned to supplier ─────────────────────
  useEffect(() => {
    ordersAPI
      .getSupplierOrders()
      .then((res) => {
        const orders = (res.data || []).map((o) => ({
          ...o,
          state: statusToState[o.status] || "new",
        }));
        setDemands(orders);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Submit quote ──────────────────────────────────────────
  const submitQuote = async () => {
    if (!quoteForm.cost.trim()) return;
    setSubmitting(true);
    try {
      await ordersAPI.addSupplierQuote(quoteTarget.id, {
        productionCost: parseFloat(quoteForm.cost),
        comment: `${quoteForm.notes} — Délai: ${quoteForm.leadTime} — Validité: ${quoteForm.validity}j`,
      });

      setDemands((prev) =>
        prev.map((d) =>
          d.id === quoteTarget.id
            ? { ...d, state: "quoted", myQuote: quoteForm.cost }
            : d
        )
      );

      setQuoteTarget(null);
      setQuoteForm({ cost: "", leadTime: "", notes: "", validity: "30" });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = demands.filter((d) => {
    if (filter === "Tous") return true;
    return stateMap[d.state] === filter;
  });

  const newCount = demands.filter((d) => d.state === "new").length;

  const formatAmount = (v) =>
    v ? `${parseFloat(v).toLocaleString()} MAD` : "—";

  if (loading) {
    return (
      <SupplierLayout>
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
      </SupplierLayout>
    );
  }

  return (
    <SupplierLayout>
      <div className="page-header">
        <div>
          <h1>Demandes clients</h1>
          <p>{newCount} nouvelles demandes à traiter.</p>
        </div>
      </div>

      {/* Alert for new demands */}
      {newCount > 0 && (
        <div className="pending-banner">
          <div className="pending-banner-icon">✦</div>
          <div>
            <div className="pending-banner-title">
              {newCount} demande(s) en attente de votre coût de fabrication
            </div>
            <div className="pending-banner-text">
              Soumettez vos coûts pour que l'équipe MGTS puisse établir les
              devis clients.
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {stateFilters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "7px 18px",
              borderRadius: 20,
              border: `1.5px solid ${
                filter === f ? "var(--orange)" : "var(--border)"
              }`,
              background: filter === f ? "var(--orange-light)" : "transparent",
              color: filter === f ? "var(--orange)" : "var(--text-mid)",
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

      {/* Cards grid */}
      <div className="grid-2">
        {filtered.map((d) => (
          <DemandCard
            key={d.id}
            demand={{
              ...d,
              title:
                d.productName ||
                d.description?.slice(0, 40) ||
                "Commande personnalisée",
              qty: String(d.quantity),
              budget: formatAmount(d.estimatedBudget),
              dimensions: d.dimensions || "—",
              matiere: d.material || "—",
              client: d.clientName || "—",
              date: new Date(d.createdAt).toLocaleDateString("fr-FR"),
              images: d.images ? JSON.parse(d.images || "[]") : [],
              pdf: !!d.attachmentPdf,
            }}
            onQuote={(d) => {
              setQuoteTarget(d);
              setQuoteForm({
                cost: "",
                leadTime: "",
                notes: "",
                validity: "30",
              });
            }}
            onView={setDetail}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            color: "var(--text-soft)",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 10 }}>◈</div>
          <p>Aucune demande dans cette catégorie.</p>
        </div>
      )}

      {/* Detail panel */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div
            className="card"
            style={{
              width: 580,
              padding: 30,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 20,
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
                  CMD-{String(detail.id).padStart(6, "0")}
                </div>
                <h2
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "var(--text-dark)",
                  }}
                >
                  {detail.title}
                </h2>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setDetail(null)}
              >
                ✕ Fermer
              </button>
            </div>

            <div
              style={{
                background: "var(--bg)",
                borderRadius: "var(--radius-sm)",
                padding: 16,
                marginBottom: 18,
              }}
            >
              <div className="form-label" style={{ marginBottom: 8 }}>
                Description client
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-dark)",
                  lineHeight: 1.6,
                }}
              >
                {detail.description || "Aucune description fournie."}
              </p>
            </div>

            <div className="form-grid" style={{ marginBottom: 18 }}>
              {[
                ["Quantité", detail.qty + " unités"],
                ["Budget max", detail.budget],
                ["Dimensions", detail.dimensions],
                ["Matière", detail.matiere],
                ["Incoterm", detail.incoterm || "—"],
                ["Client", detail.client],
                ["Date", detail.date],
              ]
                .filter(([, v]) => v && v !== "—")
                .map(([k, v]) => (
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

            {(detail.images?.length > 0 || detail.pdf) && (
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                {detail.images?.length > 0 && (
                  <button className="btn btn-ghost btn-sm">
                    🖼 Voir {detail.images.length} photo(s)
                  </button>
                )}
                {detail.pdf && (
                  <a
                    href={`http://localhost:5000/${detail.attachmentPdf}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <button className="btn btn-ghost btn-sm">
                      📄 Télécharger le PDF
                    </button>
                  </a>
                )}
              </div>
            )}

            {detail.state === "new" && (
              <div
                style={{
                  paddingTop: 16,
                  borderTop: "1px solid var(--border-soft)",
                }}
              >
                <button
                  className="btn btn-orange btn-full"
                  onClick={() => {
                    setDetail(null);
                    setQuoteTarget(detail);
                  }}
                >
                  ✦ Soumettre mon coût de fabrication
                </button>
              </div>
            )}

            {detail.state === "quoted" && (
              <div
                style={{
                  background: "var(--teal-light)",
                  borderRadius: "var(--radius-sm)",
                  padding: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 18 }}>✓</span>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--teal)",
                    }}
                  >
                    Coût soumis : {formatAmount(detail.myQuote)}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-mid)" }}>
                    En attente de validation MGTS
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quote modal */}
      {quoteTarget && (
        <div className="modal-overlay" onClick={() => setQuoteTarget(null)}>
          <div
            className="card"
            style={{ width: 500, padding: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: 20 }}>
              <div
                className="modal-icon"
                style={{
                  background: "var(--orange-light)",
                  color: "var(--orange)",
                }}
              >
                ✦
              </div>
              <div className="modal-title">Soumettre votre coût</div>
              <div className="modal-desc">
                {quoteTarget.title} · {quoteTarget.qty} unités
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                marginBottom: 22,
              }}
            >
              <div className="form-group">
                <label className="form-label">
                  Coût de fabrication total (MAD) *
                </label>
                <input
                  className="form-input"
                  placeholder="Ex : 7200"
                  value={quoteForm.cost}
                  onChange={(e) => setQ("cost", e.target.value)}
                />
                <span style={{ fontSize: 11, color: "var(--text-soft)" }}>
                  Prix usine hors transport — MGTS ajoutera les frais
                  logistiques et sa marge.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Délai de fabrication</label>
                <input
                  className="form-input"
                  placeholder="Ex : 30 jours"
                  value={quoteForm.leadTime}
                  onChange={(e) => setQ("leadTime", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Validité de l'offre (jours)
                </label>
                <select
                  className="form-select"
                  value={quoteForm.validity}
                  onChange={(e) => setQ("validity", e.target.value)}
                >
                  {["15", "30", "45", "60"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Notes & conditions</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: 70 }}
                  placeholder="Conditions particulières, options disponibles, contraintes techniques…"
                  value={quoteForm.notes}
                  onChange={(e) => setQ("notes", e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn btn-orange"
                style={{ flex: 1 }}
                onClick={submitQuote}
                disabled={submitting}
              >
                {submitting ? "Envoi en cours…" : "Envoyer le coût"}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setQuoteTarget(null)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </SupplierLayout>
  );
}
