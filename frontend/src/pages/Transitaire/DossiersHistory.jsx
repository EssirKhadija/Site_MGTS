import { useState, useEffect } from "react";
import { ordersAPI } from "../../api/orders.api";

const modeIcon = { sea: "🚢", air: "✈️", road: "🚛" };

const historyStyles = {
  filterBar: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  search: {
    flex: 1,
    minWidth: 250,
    maxWidth: 360,
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: "8px 10px",
    background: "var(--bg-alt)",
  },
  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 13,
    color: "var(--text-dark)",
    fontFamily: "var(--font)",
  },
  filterGroup: { display: "flex", gap: 8, flexWrap: "wrap" },
  filterBtn: (selected) => ({
    padding: "7px 16px",
    borderRadius: 20,
    border: `1.5px solid ${selected ? "var(--ac)" : "var(--border)"}`,
    background: selected ? "var(--ac-light)" : "transparent",
    color: selected ? "var(--ac)" : "var(--text-mid)",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--font)",
    transition: "all .15s",
  }),
};

export default function DossiersHistory() {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("Tous");
  const [loading, setLoading] = useState(true);

  // ── Fetch completed orders ────────────────────────────────
  useEffect(() => {
    ordersAPI
      .getTransitaireOrders()
      .then((res) => {
        const completed = (res.data || []).filter((o) =>
          ["paid", "waiting_validation"].includes(o.status)
        );
        setHistory(completed);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalFees = history.reduce(
    (s, h) => s + parseFloat(h.customsCost || 0),
    0
  );

  const filtered = history.filter((h) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      String(h.id).includes(q) ||
      (h.productName || "").toLowerCase().includes(q) ||
      (h.clientName || "").toLowerCase().includes(q);
    const matchMode = modeFilter === "Tous" || h.mode === modeFilter;
    return matchSearch && matchMode;
  });

  const formatAmount = (v) =>
    v ? `${parseFloat(v).toLocaleString("fr")} MAD` : "—";
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  const formatId = (id) => `DOS-${String(id).padStart(6, "0")}`;

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

  // ── Detail view ───────────────────────────────────────────
  if (selected) {
    return (
      <div className="page-content">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 28,
          }}
        >
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setSelected(null)}
          >
            ← Retour
          </button>
          <div>
            <div
              className="mono"
              style={{ fontSize: 11, color: "var(--text-soft)" }}
            >
              {formatId(selected.id)}
            </div>
            <h1
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: "var(--text-dark)",
              }}
            >
              {selected.productName || "Commande personnalisée"}
            </h1>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <span
              className="badge"
              style={{
                color: "var(--teal)",
                background: "var(--teal-light)",
                fontSize: 12,
                padding: "6px 14px",
              }}
            >
              ✓ Clôturé
            </span>
          </div>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
        >
          <div className="card card-pad">
            <div className="form-label" style={{ marginBottom: 16 }}>
              Informations du dossier
            </div>
            <div
              style={{
                background: "var(--ac-xlight)",
                borderRadius: 10,
                padding: "14px 20px",
                marginBottom: 18,
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
                  Chine
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22 }}>🚢</div>
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
                  Maroc
                </div>
              </div>
            </div>
            <div className="form-grid">
              {[
                ["Client", selected.clientName || "—"],
                ["Fournisseur", selected.supplierName || "—"],
                ["Incoterm", selected.incoterm || "—"],
                ["Quantité", `${selected.quantity} u`],
                ["Date clôture", formatDate(selected.updatedAt)],
                ["Frais douaniers", formatAmount(selected.customsCost)],
                ["Coût fournisseur", formatAmount(selected.productionCost)],
                ["Frais transport", formatAmount(selected.transportCost)],
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

          <div className="card card-pad">
            <div className="form-label" style={{ marginBottom: 16 }}>
              Validation de l'importation
            </div>
            {[
              "Facture commerciale conforme",
              "Packing list vérifiée",
              "Connaissement validé",
              "Certificat d'origine vérifié",
              "Code SH confirmé",
              "Valeur en douane vérifiée",
              "Restrictions vérifiées",
              "Conformité CE/UE validée",
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  background: "var(--teal-light)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--teal)",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "var(--teal)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}
                  >
                    ✓
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--teal-dark)",
                  }}
                >
                  {item}
                </span>
              </div>
            ))}
            <hr className="divider" />
            <button className="btn btn-ghost btn-sm">
              Télécharger le dossier complet
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── List view ─────────────────────────────────────────────
  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Historique des dossiers</h1>
          <p>
            {history.length} dossiers traités · {formatAmount(totalFees)} de
            frais total
          </p>
        </div>
        <button className="btn btn-ghost">Exporter CSV</button>
      </div>

      {/* Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {[
          {
            label: "Dossiers traités",
            value: history.length,
            color: "var(--ac)",
            bg: "var(--ac-light)",
          },
          {
            label: "Fret maritime",
            value: history.filter((h) => h.mode === "sea").length,
            color: "var(--teal)",
            bg: "var(--teal-light)",
          },
          {
            label: "Fret aérien",
            value: history.filter((h) => h.mode === "air").length,
            color: "var(--orange)",
            bg: "var(--orange-light)",
          },
          {
            label: "Frais total",
            value: formatAmount(totalFees),
            color: "#F5A623",
            bg: "#FEF6E8",
          },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 18 }}>
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
                    marginBottom: 6,
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
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  background: s.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  color: s.color,
                }}
              >
                ✦
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={historyStyles.filterBar}>
        <div className="navbar-search" style={historyStyles.search}>
          <span style={{ color: "var(--text-soft)" }}>⌕</span>
          <input
            style={historyStyles.searchInput}
            type="text"
            placeholder="Rechercher par ID, produit, client…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={historyStyles.filterGroup}>
          {["Tous", "sea", "air", "road"].map((m) => (
            <button
              key={m}
              onClick={() => setModeFilter(m)}
              style={historyStyles.filterBtn(modeFilter === m)}
            >
              {m === "Tous"
                ? "Tous"
                : modeIcon[m] + " " + m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div
          className="table-header"
          style={{ gridTemplateColumns: "1fr 130px 130px 80px 90px" }}
        >
          <span>Dossier</span>
          <span>Client</span>
          <span>Incoterm</span>
          <span>Frais</span>
          <span>Date</span>
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
            Aucun dossier trouvé.
          </div>
        ) : (
          filtered.map((h) => (
            <div
              key={h.id}
              className="table-row"
              style={{ gridTemplateColumns: "1fr 130px 130px 80px 90px" }}
              onClick={() => setSelected(h)}
            >
              <div>
                <div className="row-id">{formatId(h.id)}</div>
                <div className="row-title">
                  {h.productName || "Commande personnalisée"}
                </div>
                <div className="row-sub">🚢 Chine → Maroc</div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-mid)" }}>
                {h.clientName || "—"}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-soft)" }}>
                {h.incoterm || "—"}
              </div>
              <div className="row-amount" style={{ fontSize: 12 }}>
                {formatAmount(h.customsCost)}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-soft)" }}>
                {formatDate(h.updatedAt)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
