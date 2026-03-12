import { useState } from "react";
import ProductCard from "../../components/Fournisseur/ProductCard";
import SupplierLayout from "../../components/Fournisseur/SupplierLayout";
import "../../styles/Supplier.css";

const initialProducts = [
  { id:"PRD-S-001", name:"Conteneur acier galvanisé 200L",  description:"Conteneur industriel en acier galvanisé, revêtement époxy, étanche IP65, empilable jusqu'à 5 unités.", price:"85 €/u",  moq:10,  category:"Stockage",    status:"published", emoji:"🗳️", views:142, orders:3 },
  { id:"PRD-S-002", name:"Pièce mécanique CNC aluminium",   description:"Usinage CNC 5 axes, alliage alu 6061, tolérance ±0.02 mm, traitement anodisé disponible.", price:"22 €/u",  moq:50,  category:"Mécanique",   status:"published", emoji:"⚙️", views:87,  orders:7 },
  { id:"PRD-S-003", name:"Profilé acier inox 304 — 3m",     description:"Profilé en U acier inoxydable 304, finition brossée, disponible en 1.5/2/3 mm d'épaisseur.", price:"14 €/u",  moq:100, category:"Mécanique",   status:"draft",     emoji:"📐", views:0,   orders:0 },
  { id:"PRD-S-004", name:"Boîtier plastique ABS sur mesure",description:"Injection plastique ABS, moule sur demande, coloris RAL personnalisé, insert métal possible.", price:"6.50 €/u",moq:200, category:"Plastique",   status:"published", emoji:"📦", views:53,  orders:1 },
];

const emptyForm = { name:"", description:"", price:"", moq:"", category:"", emoji:"📦", status:"draft" };
const categories = ["Stockage","Mécanique","Plastique","Emballage","Textile","Électronique","Autre"];

export default function SupplierProducts() {
  const [products, setProducts]   = useState(initialProducts);
  const [modal, setModal]         = useState(null);   // null | "add" | "edit"
  const [form, setForm]           = useState(emptyForm);
  const [editId, setEditId]       = useState(null);
  const [filter, setFilter]       = useState("Tous");
  const [delConfirm, setDelConfirm] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openAdd  = ()        => { setForm(emptyForm); setEditId(null); setModal("edit"); };
  const openEdit = (product) => { setForm({ ...product, moq: String(product.moq) }); setEditId(product.id); setModal("edit"); };

  const saveProduct = () => {
    if (!form.name.trim()) return;
    if (editId) {
      setProducts((p) => p.map((x) => x.id === editId ? { ...x, ...form, moq: Number(form.moq) } : x));
    } else {
      const newId = "PRD-S-" + String(products.length + 1).padStart(3, "0");
      setProducts((p) => [...p, { ...form, id: newId, moq: Number(form.moq), views: 0, orders: 0 }]);
    }
    setModal(null);
  };

  const toggleStatus = (product) => {
    const next = product.status === "published" ? "draft" : "published";
    setProducts((p) => p.map((x) => x.id === product.id ? { ...x, status: next } : x));
  };

  const deleteProduct = (product) => {
    setProducts((p) => p.filter((x) => x.id !== product.id));
    setDelConfirm(null);
  };

  const filtered = filter === "Tous"
    ? products
    : products.filter((p) => p.category === filter || (filter === "Publiés" && p.status === "published") || (filter === "Brouillons" && p.status === "draft"));

  const filters = ["Tous", "Publiés", "Brouillons", ...categories];

  return (
    <SupplierLayout>
      <div className="page-header">
        <div>
          <h1>Mes produits</h1>
          <p>{products.filter(p => p.status === "published").length} publiés · {products.filter(p => p.status === "draft").length} brouillons</p>
        </div>
        <button className="btn btn-orange" onClick={openAdd}> Ajouter un produit</button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {["Tous","Publiés","Brouillons",...categories].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 16px", borderRadius: 20, border: `1.5px solid ${filter===f?"var(--orange)":"var(--border)"}`, background: filter===f?"var(--orange-light)":"transparent", color: filter===f?"var(--orange)":"var(--text-mid)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font)", transition: "all .15s" }}>
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid-3">
        {filtered.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onEdit={openEdit}
            onDelete={(p) => setDelConfirm(p)}
            onToggle={toggleStatus}
          />
        ))}

        {/* Add tile */}
        <div
          onClick={openAdd}
          style={{ border: "2px dashed var(--border)", borderRadius: "var(--radius)", minHeight: 260, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "border-color .2s, background .2s", gap: 10, color: "var(--text-soft)" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--orange)"; e.currentTarget.style.background = "var(--orange-light)"; e.currentTarget.style.color = "var(--orange)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-soft)"; }}
        >
          <div style={{ fontSize: 13, fontWeight: 600 }}>Ajouter un produit</div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modal === "edit" && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="card" style={{ width: 560, padding: 30, maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ marginBottom: 22 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-dark)" }}>
                {editId ? "Modifier le produit" : "Ajouter un produit"}
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-mid)", marginTop: 4 }}>
                Ce produit sera soumis à révision par MGTS avant publication.
              </p>
            </div>

            <div className="form-grid">
              <div className="form-group full">
                <label className="form-label">Nom du produit *</label>
                <input className="form-input" placeholder="Ex : Conteneur acier 200L" value={form.name} onChange={(e) => set("name", e.target.value)} />
              </div>

              <div className="form-group full">
                <label className="form-label">Description *</label>
                <textarea className="form-textarea" placeholder="Décrivez le produit, ses spécifications, finitions disponibles…" value={form.description} onChange={(e) => set("description", e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Prix indicatif *</label>
                <input className="form-input" placeholder="Ex : 85 €/u" value={form.price} onChange={(e) => set("price", e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Quantité minimale (MOQ) *</label>
                <input className="form-input" type="number" placeholder="Ex : 50" value={form.moq} onChange={(e) => set("moq", e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Catégorie</label>
                <select className="form-select" value={form.category} onChange={(e) => set("category", e.target.value)}>
                  <option value="">-- Choisir --</option>
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Emoji / Icône</label>
                <input className="form-input" placeholder="📦" value={form.emoji} onChange={(e) => set("emoji", e.target.value)} />
              </div>

              {/* Photo upload placeholder */}
              <div className="form-group full">
                <label className="form-label">Photos du produit</label>
                <div className="upload-zone" style={{ display: "flex", gap: 12, alignItems: "center", flexDirection: "row", textAlign: "left", padding: "14px 18px" }}>
                  <div style={{ fontSize: 24, color: "var(--teal)" }}>📷</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-dark)" }}>Ajouter des photos</div>
                    <div className="upload-zone-text">JPG, PNG — max 5 Mo par image · jusqu'à 8 photos</div>
                  </div>
                  <input type="file" accept="image/*" multiple style={{ display: "none" }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Statut initial</label>
                <select className="form-select" value={form.status} onChange={(e) => set("status", e.target.value)}>
                  <option value="draft">Brouillon</option>
                  <option value="pending">Soumettre à révision</option>
                </select>
              </div>
            </div>

            <hr className="divider" />
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-orange" onClick={saveProduct}>
                {editId ? "Enregistrer les modifications" : "Créer le produit"}
              </button>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {delConfirm && (
        <div className="modal-overlay" onClick={() => setDelConfirm(null)}>
          <div className="card modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon" style={{ background: "var(--orange-light)", color: "var(--orange)" }}>✕</div>
            <div className="modal-title">Supprimer le produit</div>
            <div className="modal-desc">Vous allez supprimer définitivement <strong>"{delConfirm.name}"</strong>. Cette action est irréversible.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-orange" style={{ flex: 1 }} onClick={() => deleteProduct(delConfirm)}>Confirmer la suppression</button>
              <button className="btn btn-ghost" onClick={() => setDelConfirm(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </SupplierLayout>
  );
}