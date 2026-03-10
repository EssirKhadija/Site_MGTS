import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Client.css";
import ClientLayout from "../../components/Client/ClientLayout";

const incoterms = ["FOB", "CIF", "EXW", "DDP", "DAP", "CFR", "FCA", "CPT"];

const existingProducts = [
  "Conteneurs de stockage",
  "Pièces mécaniques",
  "Emballages industriels",
  "Équipements électroniques",
  "Textiles techniques",
  "Mobilier professionnel",
  "Outillage industriel",
];

export default function NewRequest() {
  const navigate = useNavigate();
  const [type, setType] = useState("existant");
  const [form, setForm] = useState({
    produit: "",
    description: "",
    quantite: "",
    dimensions: "",
    matiere: "",
    budget: "",
    incoterm: "FOB",
    notes: "",
  });
  const [files, setFiles] = useState({ images: [], pdf: null });
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    // TODO: connect to API
    setSubmitted(true);
    setTimeout(() => navigate("/orders"), 2000);
  };

  if (submitted) {
    return (
      <ClientLayout>
        <div className="page-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 24, height: 64, borderRadius: "50%", background: "var(--teal-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "var(--teal)", margin: "0 auto 16px" }}>✓</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-dark)", marginBottom: 8 }}>Demande envoyée !</h2>
            <p style={{ color: "var(--text-mid)", fontSize: 13 }}>Notre équipe analyse votre demande. Redirection en cours…</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="page-content">
            <h1>Nouvelle demande</h1>
            <p>Produit existant ou demande entièrement personnalisée.</p>
          
      </div>

      <div className="card card-pad">
        {/* Type toggle */}
        <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
          {["existant", "personnalisé"].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              style={{
                padding: "9px 22px",
                borderRadius: "var(--radius-sm)",
                border: `1.5px solid ${type === t ? "var(--teal)" : "var(--border)"}`,
                background: type === t ? "var(--teal-light)" : "transparent",
                color: type === t ? "var(--teal)" : "var(--text-mid)",
                fontFamily: "var(--font)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all .2s",
              }}
            >
              {t === "existant" ? "⬡ Produit existant" : "✦ Demande personnalisée"}
            </button>
          ))}
        </div>

        <div className="form-grid">
          {/* Product / Description */}
          {type === "existant" ? (
            <div className="form-group full">
              <label className="form-label">Sélectionner un produit *</label>
              <select
                className="form-select"
                value={form.produit}
                onChange={(e) => set("produit", e.target.value)}
              >
                <option value="">-- Choisir un produit --</option>
                {existingProducts.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-group full">
              <label className="form-label">Description du produit *</label>
              <textarea
                className="form-textarea"
                placeholder="Décrivez votre produit en détail : usage, contraintes techniques, finitions souhaitées…"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>
          )}

          {/* Quantity */}
          <div className="form-group">
            <label className="form-label">Quantité *</label>
            <input
              className="form-input"
              placeholder="Ex : 500 unités"
              value={form.quantite}
              onChange={(e) => set("quantite", e.target.value)}
            />
          </div>

          {/* Dimensions */}
          <div className="form-group">
            <label className="form-label">Dimensions</label>
            <input
              className="form-input"
              placeholder="Ex : 20 × 30 × 10 cm"
              value={form.dimensions}
              onChange={(e) => set("dimensions", e.target.value)}
            />
          </div>

          {/* Matière */}
          <div className="form-group">
            <label className="form-label">Matière / Matériaux</label>
            <input
              className="form-input"
              placeholder="Ex : Acier inoxydable 304"
              value={form.matiere}
              onChange={(e) => set("matiere", e.target.value)}
            />
          </div>

          {/* Budget */}
          <div className="form-group">
            <label className="form-label">Budget estimatif (€)</label>
            <input
              className="form-input"
              placeholder="Ex : 5 000"
              value={form.budget}
              onChange={(e) => set("budget", e.target.value)}
            />
          </div>

          {/* Incoterm */}
          <div className="form-group">
            <label className="form-label">Incoterm</label>
            <select
              className="form-select"
              value={form.incoterm}
              onChange={(e) => set("incoterm", e.target.value)}
            >
              {incoterms.map((i) => <option key={i}>{i}</option>)}
            </select>
          </div>

          {/* Notes */}
          <div className="form-group full">
            <label className="form-label">Notes complémentaires</label>
            <textarea
              className="form-textarea"
              placeholder="Informations supplémentaires, délais souhaités, contraintes logistiques…"
              style={{ minHeight: 70 }}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>

          {/* Image upload */}
          <div className="form-group">
            <label className="form-label">Images (optionnel)</label>
            <div
              className="upload-zone"
              onClick={() => document.getElementById("img-input").click()}
            >
              <div className="upload-zone-icon">⊕</div>
              <div className="upload-zone-text">
                {files.images.length > 0
                  ? `${files.images.length} fichier(s) sélectionné(s)`
                  : "Glisser ou cliquer pour uploader"}
              </div>
              <input
                id="img-input"
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={(e) =>
                  setFiles((f) => ({ ...f, images: Array.from(e.target.files) }))
                }
              />
            </div>
          </div>

          {/* PDF upload */}
          <div className="form-group">
            <label className="form-label">Fichier PDF (optionnel)</label>
            <div
              className="upload-zone"
              onClick={() => document.getElementById("pdf-input").click()}
            >
              <div className="upload-zone-icon">□</div>
              <div className="upload-zone-text">
                {files.pdf ? files.pdf.name : "Cahier des charges, plan technique…"}
              </div>
              <input
                id="pdf-input"
                type="file"
                accept=".pdf"
                style={{ display: "none" }}
                onChange={(e) =>
                  setFiles((f) => ({ ...f, pdf: e.target.files[0] ?? null }))
                }
              />
            </div>
          </div>
        </div>

        <hr className="divider" />

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-primary" onClick={handleSubmit}>
            ✦ Soumettre la demande
          </button>
          <button className="btn btn-ghost">
            Sauvegarder en brouillon
          </button>
          <button
            className="btn btn-ghost"
            style={{ marginLeft: "auto" }}
            onClick={() => navigate(-1)}
          >
            Annuler
          </button>
        </div>
      </div>
    </ClientLayout>
  );
}