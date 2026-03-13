import { useState } from "react";
import DossierCard from "../../components/Transitaire/DossierCard";

const initialDossiers = [
  {
    id: "DOS-2024-031", product: "Conteneurs de stockage industriels",  mode: "sea",
    origin: "Shenzhen, CN", destination: "Le Havre, FR", incoterm: "FOB",
    value: "21 500 €", weight: "2 400 kg", volume: "18 m³",
    supplier: "Shenzhen MetalTech Co.", client: "Dupont Industries",
    etd: "18 Nov 2024", eta: "10 Déc 2024", status: "new",
    customsRegime: "Mise en libre pratique", hsCode: "7309.00",
    documents: ["Facture commerciale", "Packing list"],
    transport: "CMA CGM Logistics", transportFees: "1 485 €",
    supplierCost: "18 000 €", mgtsMargin: "2 000 €",
  },
  {
    id: "DOS-2024-030", product: "Pièces mécaniques CNC aluminium",     mode: "sea",
    origin: "Guangzhou, CN", destination: "Marseille, FR", incoterm: "CIF",
    value: "8 200 €", weight: "850 kg", volume: "5 m³",
    supplier: "Guangzhou Precision", client: "MetalPro France",
    etd: "22 Nov 2024", eta: "18 Déc 2024", status: "in_progress",
    customsRegime: "Mise en libre pratique", hsCode: "8466.93",
    documents: ["Facture commerciale", "Packing list", "BL"],
    transport: "CMA CGM Logistics", transportFees: "780 €",
    supplierCost: "6 900 €", mgtsMargin: "820 €",
  },
  {
    id: "DOS-2024-029", product: "Boîtiers plastique ABS sur mesure",   mode: "sea",
    origin: "Ningbo, CN", destination: "Bordeaux, FR", incoterm: "FOB",
    value: "6 400 €", weight: "1 200 kg", volume: "9 m³",
    supplier: "Ningbo PlasticTech", client: "LogiPack SAS",
    etd: "25 Nov 2024", eta: "22 Déc 2024", status: "customs_check",
    customsRegime: "Entrepôt douanier", hsCode: "3926.90",
    documents: ["Facture commerciale", "Packing list", "BL", "Certificat d'origine"],
    transport: "CMA CGM Logistics", transportFees: "1 120 €",
    supplierCost: "5 300 €", mgtsMargin: "580 €",
  },
  {
    id: "DOS-2024-028", product: "Profilés acier inox 316L",             mode: "air",
    origin: "Shanghai, CN", destination: "Paris CDG, FR", incoterm: "EXW",
    value: "12 800 €", weight: "320 kg", volume: "2.1 m³",
    supplier: "Shanghai Steel Ltd.", client: "InoxPro SAS",
    etd: "20 Nov 2024", eta: "23 Nov 2024", status: "new",
    customsRegime: "Mise en libre pratique", hsCode: "7222.20",
    documents: ["Facture commerciale"],
    transport: "Air France Cargo", transportFees: "2 140 €",
    supplierCost: "10 200 €", mgtsMargin: "1 250 €",
  },
];

const filters = ["Tous", "Nouveau", "En cours", "Contrôle douane", "Validé", "Clôturé"];
const stateMap = { new: "Nouveau", in_progress: "En cours", customs_check: "Contrôle douane", validated: "Validé", completed: "Clôturé" };

const modeIcon = { sea: "🚢", air: "✈️", road: "🚛" };

const feeTypes = [
  { key: "droits_douane",  label: "Droits de douane (ad valorem)",  required: true  },
  { key: "tva_import",     label: "TVA à l'importation (20%)",       required: true  },
  { key: "honoraires",     label: "Honoraires transitaire",          required: true  },
  { key: "magasinage",     label: "Frais de magasinage",             required: false },
  { key: "inspection",     label: "Frais d'inspection douanière",    required: false },
  { key: "doc_douanier",   label: "Déclaration en douane (DAU)",     required: false },
  { key: "autres",         label: "Autres frais douaniers",          required: false },
];

const emptyFees = Object.fromEntries(feeTypes.map(f => [f.key, ""]));

export default function TransitaireOrders() {
  const [dossiers, setDossiers] = useState(initialDossiers);
  const [filter, setFilter]     = useState("Tous");
  const [detail, setDetail]     = useState(null);
  const [feeTarget, setFeeTarget] = useState(null);
  const [fees, setFees]         = useState(emptyFees);
  const [feeNotes, setFeeNotes] = useState("");

  const setFee = (k, v) => setFees(f => ({ ...f, [k]: v }));
  const total  = Object.values(fees).reduce((s, v) => s + (parseFloat(v.replace(",", ".")) || 0), 0);

  const submitFees = () => {
    setDossiers(prev => prev.map(d =>
      d.id === feeTarget.id
        ? { ...d, status: "in_progress", customsFees: { ...fees }, customsTotal: total.toLocaleString("fr") + " €", feeNotes }
        : d
    ));
    setFeeTarget(null);
    setFees(emptyFees);
    setFeeNotes("");
  };

  const filtered = dossiers.filter(d => {
    if (filter === "Tous") return true;
    return stateMap[d.status] === filter;
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Commandes</h1>
          <p>Consultez l'ensemble des commandes MGTS assignées à votre dossier.</p>
        </div>
      </div>

      {/* Alert */}
      {dossiers.filter(d => d.status === "new").length > 0 && (
        <div className="pending-banner">
          <div className="pending-banner-icon">✦</div>
          <div>
            <div className="pending-banner-title">
              {dossiers.filter(d => d.status === "new").length} dossier(s) en attente de frais douaniers
            </div>
            <div className="pending-banner-text">
              Saisissez les droits de douane, TVA et honoraires pour chaque dossier.
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 18px", borderRadius: 20, border: `1.5px solid ${filter === f ? "var(--ac)" : "var(--border)"}`, background: filter === f ? "var(--ac-light)" : "transparent", color: filter === f ? "var(--ac)" : "var(--text-mid)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font)", transition: "all .15s" }}>
            {f}
            {f === "Nouveau" && (
              <span style={{ marginLeft: 6, background: "var(--orange)", color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 8 }}>
                {dossiers.filter(d => d.status === "new").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid-2">
        {filtered.map(d => (
          <DossierCard
            key={d.id}
            dossier={d}
            onView={setDetail}
            onAddFees={dos => { setFeeTarget(dos); setFees(emptyFees); setFeeNotes(""); }}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-soft)" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>◈</div>
          <p>Aucun dossier dans cette catégorie.</p>
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="card" style={{ width: 620, padding: 30, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
              <div>
                <div className="mono" style={{ fontSize: 11, color: "var(--text-soft)", marginBottom: 4 }}>{detail.id}</div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-dark)" }}>{detail.product}</h2>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setDetail(null)}>✕ Fermer</button>
            </div>

            {/* Route */}
            <div style={{ background: "var(--ac-xlight)", border: "1px solid var(--ac-light)", borderRadius: 10, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "var(--text-soft)", marginBottom: 4 }}>ORIGINE</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-dark)" }}>{detail.origin}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24 }}>{modeIcon[detail.mode] ?? "🚢"}</div>
                <div style={{ fontSize: 10, color: "var(--ac)", fontWeight: 600, marginTop: 3 }}>{detail.incoterm}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "var(--text-soft)", marginBottom: 4 }}>DESTINATION</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-dark)" }}>{detail.destination}</div>
              </div>
            </div>

            {/* Full order info */}
            <div className="form-label" style={{ marginBottom: 14 }}>Informations complètes de la commande</div>
            <div className="form-grid" style={{ marginBottom: 20 }}>
              {[
                ["Fournisseur",     detail.supplier],
                ["Client final",    detail.client],
                ["Valeur marchande",detail.value],
                ["Poids / Volume",  `${detail.weight} / ${detail.volume}`],
                ["Code SH",         detail.hsCode],
                ["Régime douanier", detail.customsRegime],
                ["Transporteur",    detail.transport],
                ["Frais transport", detail.transportFees],
                ["Coût fournisseur",detail.supplierCost],
                ["ETD / ETA",       `${detail.etd} / ${detail.eta}`],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="form-label" style={{ marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)" }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Documents */}
            <div className="form-label" style={{ marginBottom: 10 }}>Documents disponibles</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {detail.documents?.map((doc, i) => (
                <button key={i} className="btn btn-ghost btn-sm">📄 {doc}</button>
              ))}
            </div>

            {/* Customs fees submitted */}
            {detail.customsFees && (
              <div style={{ background: "var(--ac-light)", borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "var(--ac)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
                  Frais douaniers soumis
                </div>
                {feeTypes.filter(ft => detail.customsFees[ft.key]).map(ft => (
                  <div key={ft.key} className="cost-line">
                    <span className="cost-label">{ft.label}</span>
                    <span className="cost-value">{detail.customsFees[ft.key]} €</span>
                  </div>
                ))}
                <div className="cost-line cost-total">
                  <span className="cost-label">TOTAL DOUANE</span>
                  <span className="cost-value">{detail.customsTotal}</span>
                </div>
              </div>
            )}

            {detail.status === "new" && (
              <button className="btn btn-primary btn-full" onClick={() => { setDetail(null); setFeeTarget(detail); }}>
                ✦ Saisir les frais douaniers
              </button>
            )}
          </div>
        </div>
      )}

      {/* Fee entry modal */}
      {feeTarget && (
        <div className="modal-overlay" onClick={() => setFeeTarget(null)}>
          <div className="card" style={{ width: 520, padding: 30, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: 22 }}>
              <div className="modal-icon" style={{ background: "var(--ac-light)", color: "var(--ac)" }}>✦</div>
              <div className="modal-title">Frais douaniers</div>
              <div className="modal-desc">
                {feeTarget.product}<br />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>Valeur marchande : {feeTarget.value} · Code SH : {feeTarget.hsCode}</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
              {feeTypes.map(ft => (
                <div key={ft.key} className="form-group">
                  <label className="form-label">
                    {ft.label} {ft.required && <span style={{ color: "var(--danger)" }}>*</span>}
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="form-input"
                      placeholder="0.00"
                      style={{ paddingRight: 36 }}
                      value={fees[ft.key]}
                      onChange={e => setFee(ft.key, e.target.value)}
                    />
                    <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "var(--text-soft)", fontFamily: "var(--font-mono)" }}>€</span>
                  </div>
                </div>
              ))}

              <div className="form-group">
                <label className="form-label">Notes & observations douanières</label>
                <textarea className="form-textarea" style={{ minHeight: 60 }} placeholder="Régime spécifique, exonérations, restrictions, observations…" value={feeNotes} onChange={e => setFeeNotes(e.target.value)} />
              </div>
            </div>

            {/* Live total */}
            <div style={{ background: "var(--ac-light)", borderRadius: "var(--radius-sm)", padding: "14px 18px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-dark)" }}>Total frais douaniers</span>
              <span style={{ fontSize: 20, fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--ac)" }}>
                {total.toLocaleString("fr")} €
              </span>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={submitFees} disabled={total === 0}>
                Soumettre les frais
              </button>
              <button className="btn btn-ghost" onClick={() => setFeeTarget(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}