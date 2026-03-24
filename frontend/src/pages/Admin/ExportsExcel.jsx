import { useState } from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import "../../styles/Admin.css";
import api from "../../api/axios";

const exportTemplates = [
  {
    id: "EXP-01",
    icon: "◆",
    title: "Rapport commandes complet",
    desc: "Toutes les commandes avec statut, intervenants, montants, dates ETD/ETA.",
    fields: [
      "ID",
      "Date",
      "Client",
      "Fournisseur",
      "Transporteur",
      "Transitaire",
      "Produit",
      "Montant",
      "Commission",
      "Statut",
      "Incoterm",
      "Origine",
      "Destination",
    ],
    category: "commandes",
    endpoint: "/admin/export/orders",
    filename: "commandes",
  },
  {
    id: "EXP-02",
    icon: "◉",
    title: "Rapport utilisateurs",
    desc: "Liste complète des utilisateurs avec rôles, statuts, dates d'inscription.",
    fields: [
      "ID",
      "Nom",
      "Email",
      "Rôle",
      "Entreprise",
      "Statut",
      "Date inscription",
      "Nb commandes",
    ],
    category: "utilisateurs",
    endpoint: "/admin/users",
    filename: "utilisateurs",
  },
  {
    id: "EXP-03",
    icon: "💶",
    title: "Rapport financier — paiements",
    desc: "Toutes les transactions, commissions MGTS, statuts de paiement.",
    fields: [
      "ID Paiement",
      "Commande",
      "Type",
      "Partie",
      "Montant",
      "Commission",
      "Statut",
      "Date",
      "Méthode",
    ],
    category: "finances",
    endpoint: "/admin/payments",
    filename: "paiements",
  },
  {
    id: "EXP-04",
    icon: "✦",
    title: "Rapport fournisseurs",
    desc: "Produits publiés, coûts de fabrication soumis, commandes associées.",
    fields: [
      "ID",
      "Nom",
      "Pays",
      "Catégories",
      "Produits actifs",
      "Commandes",
      "CA total",
      "Statut",
    ],
    category: "fournisseurs",
    endpoint: "/admin/users?role=supplier",
    filename: "fournisseurs",
  },
  {
    id: "EXP-05",
    icon: "✦",
    title: "Frais logistiques & douaniers",
    desc: "Détail de tous les frais transport et douane par commande.",
    fields: [
      "Commande",
      "Transporteur",
      "Fret",
      "Manutention",
      "Assurance",
      "THC",
      "BAF",
      "Droits douane",
      "TVA",
      "Honoraires",
      "Total",
    ],
    category: "logistique",
    endpoint: "/admin/export/orders",
    filename: "frais-logistiques",
  },
  {
    id: "EXP-06",
    icon: "▦",
    title: "Dashboard KPIs mensuel",
    desc: "Résumé statistique mensuel : CA, commandes, commissions, taux de livraison.",
    fields: [
      "Mois",
      "CA",
      "Nb commandes",
      "Livrées",
      "En cours",
      "Commissions",
      "Nouveaux clients",
      "Fournisseurs actifs",
    ],
    category: "kpi",
    endpoint: "/admin/dashboard",
    filename: "kpis",
  },
];

const categories = [
  "Tous",
  "commandes",
  "utilisateurs",
  "finances",
  "fournisseurs",
  "logistique",
  "kpi",
];

// ── Convert JSON to CSV and download ─────────────────────────
const downloadCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data
    .map((row) =>
      Object.values(row)
        .map((v) => (typeof v === "string" ? `"${v.replace(/"/g, '""')}"` : v))
        .join(",")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + headers + "\n" + rows], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `MGTS_${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export default function ExportsExcel() {
  const [filter, setFilter] = useState("Tous");
  const [dateFrom, setDateFrom] = useState(
    new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10)
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10));
  const [exporting, setExporting] = useState(null);
  const [done, setDone] = useState({});
  const [error, setError] = useState(null);

  const handleExport = async (template) => {
    setExporting(template.id);
    setError(null);
    try {
      const params = { from: dateFrom, to: dateTo };
      const res = await api.get(template.endpoint, { params });

      // Extract array from response
      const raw = res.data;
      const data = Array.isArray(raw)
        ? raw
        : raw.orders || raw.users || raw.payments || raw.products || [raw];

      downloadCSV(data, template.filename);

      setDone((d) => ({ ...d, [template.id]: true }));
      setTimeout(
        () =>
          setDone((d) => {
            const n = { ...d };
            delete n[template.id];
            return n;
          }),
        3000
      );
    } catch (err) {
      console.error(err);
      setError(`Erreur lors de l'export : ${template.title}`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setExporting(null);
    }
  };

  // ── Export all ────────────────────────────────────────────
  const handleExportAll = async () => {
    for (const template of exportTemplates) {
      await handleExport(template);
      await new Promise((r) => setTimeout(r, 500));
    }
  };

  const filtered = exportTemplates.filter(
    (t) => filter === "Tous" || t.category === filter
  );

  return (
    <AdminLayout>
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Exports Excel</h1>
            <p>
              Générez et téléchargez les données de la plateforme au format .csv
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#FFE8DC",
              border: "1px solid var(--orange)",
              borderRadius: "var(--radius-sm)",
              padding: "12px 16px",
              marginBottom: 16,
              fontSize: 13,
              color: "var(--danger)",
            }}
          >
            ⚠ {error}
          </div>
        )}

        {/* Date range */}
        <div className="card card-pad" style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--text-soft)",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              marginBottom: 16,
              fontFamily: "var(--font-mono)",
            }}
          >
            Période d'export
          </div>
          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
              <label className="form-label">Du</label>
              <input
                className="form-input"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
              <label className="form-label">Au</label>
              <input
                className="form-input"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {[
                [
                  "Ce mois",
                  new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    .toISOString()
                    .slice(0, 10),
                  new Date().toISOString().slice(0, 10),
                ],
                ["Q4 2024", "2024-10-01", "2024-12-31"],
                ["Année 2024", "2024-01-01", "2024-12-31"],
              ].map(([l, f, t]) => (
                <button
                  key={l}
                  onClick={() => {
                    setDateFrom(f);
                    setDateTo(t);
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category filters */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              style={{
                padding: "5px 14px",
                borderRadius: "var(--radius-sm)",
                border: `1px solid ${
                  filter === c ? "var(--teal)" : "var(--border-mid)"
                }`,
                background: filter === c ? "var(--teal-light)" : "transparent",
                color: filter === c ? "var(--teal)" : "var(--text-soft)",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "var(--font)",
                transition: "all .15s",
                textTransform: "capitalize",
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Export cards */}
        <div className="grid-2">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="card card-pad"
              style={{
                transition: "border-color .2s",
                borderColor:
                  exporting === t.id ? "var(--teal)" : "var(--border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 14,
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "var(--radius-sm)",
                      background: "var(--teal-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      color: "var(--teal)",
                      flexShrink: 0,
                    }}
                  >
                    {t.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--text)",
                        marginBottom: 4,
                      }}
                    >
                      {t.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-soft)",
                        lineHeight: 1.5,
                      }}
                    >
                      {t.desc}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fields preview */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 5,
                  marginBottom: 14,
                }}
              >
                {t.fields.slice(0, 6).map((f) => (
                  <span
                    key={f}
                    style={{
                      fontSize: 9,
                      color: "var(--text-mid)",
                      background: "var(--bg-3)",
                      padding: "2px 7px",
                      borderRadius: 3,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {f}
                  </span>
                ))}
                {t.fields.length > 6 && (
                  <span
                    style={{
                      fontSize: 9,
                      color: "var(--text-soft)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    +{t.fields.length - 6} champs
                  </span>
                )}
              </div>

              {/* Meta */}
              <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--text-soft)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  📅 {dateFrom} → {dateTo}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--text-soft)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  📄 CSV
                </div>
              </div>

              {/* Export button */}
              {done[t.id] ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "9px 14px",
                    background: "var(--green-light)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid rgba(16,185,129,.2)",
                  }}
                >
                  <span style={{ color: "var(--green)", fontSize: 14 }}>✓</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--green)",
                    }}
                  >
                    Téléchargement lancé
                  </span>
                </div>
              ) : (
                <button
                  className="btn btn-primary btn-sm btn-full"
                  onClick={() => handleExport(t)}
                  disabled={!!exporting}
                  style={{ justifyContent: "center" }}
                >
                  {exporting === t.id ? (
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          border: "2px solid rgba(255,255,255,.3)",
                          borderTopColor: "#fff",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                      Génération…
                    </span>
                  ) : (
                    "↓ Exporter .csv"
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Bulk export */}
        <div
          className="card card-pad"
          style={{ marginTop: 20, borderColor: "rgba(0,145,137,.3)" }}
        >
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
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--text)",
                  marginBottom: 4,
                }}
              >
                Export global — tous les rapports
              </div>
              <div style={{ fontSize: 11, color: "var(--text-soft)" }}>
                Télécharge tous les rapports en fichiers CSV séparés.
              </div>
            </div>
            <button
              className="btn btn-teal"
              onClick={handleExportAll}
              disabled={!!exporting}
            >
              ↓ Tout exporter
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
