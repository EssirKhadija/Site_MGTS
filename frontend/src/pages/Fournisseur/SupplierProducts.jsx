import { useState, useEffect } from "react";
import ProductCard from "../../components/Fournisseur/ProductCard";
import SupplierLayout from "../../components/Fournisseur/SupplierLayout";
import "../../styles/Supplier.css";
import { productsAPI } from "../../api/products.api";

const emptyForm = { name: "", description: "", priceIndicatif: "", minQuantity: "", category: "", status: "pending" };
const categories = ["Stockage", "Mécanique", "Plastique", "Emballage", "Textile", "Électronique", "Autre"];

export default function SupplierProducts() {
  const [products, setProducts]     = useState([]);
  const [modal, setModal]           = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [editId, setEditId]         = useState(null);
  const [filter, setFilter]         = useState("Tous");
  const [delConfirm, setDelConfirm] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [images, setImages]         = useState([]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // ── Fetch my products ─────────────────────────────────────
  useEffect(() => {
    productsAPI.getMine()
      .then(res => setProducts(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setImages([]);
    setModal("edit");
  };

  const openEdit = (product) => {
    setForm({
      name:          product.name        || "",
      description:   product.description || "",
      priceIndicatif:product.priceIndicatif || "",
      minQuantity:   product.minQuantity || "",
      category:      product.category   || "",
      status:        "pending",
    });
    setEditId(product.id);
    setImages([]);
    setModal("edit");
  };

  // ── Save product ──────────────────────────────────────────
  const saveProduct = async () => {
    if (!form.name.trim()) return;
    setSaving(true);

    try {
      const data = new FormData();
      data.append("name",           form.name);
      data.append("description",    form.description);
      data.append("priceIndicatif", form.priceIndicatif);
      data.append("minQuantity",    form.minQuantity);
      data.append("category",       form.category);
      images.forEach(img => data.append("images", img));

      if (editId) {
        await productsAPI.update(editId, data);
        setProducts(prev => prev.map(p =>
          p.id === editId ? { ...p, ...form, minQuantity: Number(form.minQuantity) } : p
        ));
      } else {
        const res = await productsAPI.create(data);
        const newProduct = {
          ...form,
          id: res.data?.productId,
          minQuantity: Number(form.minQuantity),
          status: "pending",
          views: 0, orders: 0,
        };
        setProducts(prev => [...prev, newProduct]);
      }
      setModal(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle status ─────────────────────────────────────────
  const toggleStatus = async (product) => {
    try {
      const data = new FormData();
      data.append("name",           product.name);
      data.append("description",    product.description);
      data.append("priceIndicatif", product.priceIndicatif);
      data.append("minQuantity",    product.minQuantity);
      await productsAPI.update(product.id, data);
      setProducts(prev => prev.map(p =>
        p.id === product.id ? { ...p, status: "pending" } : p
      ));
    } catch (err) {
      console.error(err);
    }
  };

  // ── Delete product ────────────────────────────────────────
  const deleteProduct = async (product) => {
    try {
      await productsAPI.delete(product.id);
      setProducts(prev => prev.filter(p => p.id !== product.id));
      setDelConfirm(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = products.filter((p) => {
    if (filter === "Tous")      return true;
    if (filter === "Publiés")   return p.status === "active";
    if (filter === "Brouillons")return p.status === "pending" || p.status === "inactive";
    return p.category === filter;
  });

  const publishedCount = products.filter(p => p.status === "active").length;
  const draftCount     = products.filter(p => p.status !== "active").length;

  if (loading) {
    return (
      <SupplierLayout>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
          <p style={{ color: "var(--text-soft)", fontSize: 13 }}>Chargement...</p>
        </div>
      </SupplierLayout>
    );
  }

  return (
    <SupplierLayout>
      <div className="page-header">
        <div>
          <h1>Mes produits</h1>
          <p>{publishedCount} publiés · {draftCount} en attente</p>
        </div>
        <button className="btn btn-orange" onClick={openAdd}>Ajouter un produit</button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {["Tous", "Publiés", "Brouillons", ...categories].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{ padding: "7px 16px", borderRadius: 20, border: `1.5px solid ${filter === f ? "var(--orange)" : "var(--border)"}`, background: filter === f ? "var(--orange-light)" : "transparent", color: filter === f ? "var(--orange)" : "var(--text-mid)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font)", transition: "all .15s" }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid-3">
        {filtered.map((p) => (
          <ProductCard
            key={p.id}
            product={{
              ...p,
              price:  p.priceIndicatif ? `${parseFloat(p.priceIndicatif).toLocaleString()} MAD/u` : "Sur devis",
              moq:    p.minQuantity,
              emoji:  "📦",
              status: p.status === "active" ? "published" : "draft",
            }}
            onEdit={() => openEdit(p)}
            onDelete={(p) => setDelConfirm(p)}
            onToggle={() => toggleStatus(p)}
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
                <label className="form-label">Prix indicatif (MAD) *</label>
                <input className="form-input" type="number" placeholder="Ex : 85" value={form.priceIndicatif} onChange={(e) => set("priceIndicatif", e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Quantité minimale (MOQ) *</label>
                <input className="form-input" type="number" placeholder="Ex : 50" value={form.minQuantity} onChange={(e) => set("minQuantity", e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Catégorie</label>
                <select className="form-select" value={form.category} onChange={(e) => set("category", e.target.value)}>
                  <option value="">-- Choisir --</option>
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Photo upload */}
              <div className="form-group full">
                <label className="form-label">Photos du produit</label>
                <div
                  className="upload-zone"
                  style={{ display: "flex", gap: 12, alignItems: "center", flexDirection: "row", textAlign: "left", padding: "14px 18px" }}
                  onClick={() => document.getElementById("product-images").click()}
                >
                  <div style={{ fontSize: 24, color: "var(--teal)" }}>📷</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-dark)" }}>
                      {images.length > 0 ? `${images.length} photo(s) sélectionnée(s)` : "Ajouter des photos"}
                    </div>
                    <div className="upload-zone-text">JPG, PNG — max 5 Mo par image · jusqu'à 8 photos</div>
                  </div>
                  <input
                    id="product-images"
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: "none" }}
                    onChange={(e) => setImages(Array.from(e.target.files))}
                  />
                </div>
              </div>
            </div>

            <hr className="divider" />
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-orange" onClick={saveProduct} disabled={saving}>
                {saving ? "Enregistrement…" : editId ? "Enregistrer les modifications" : "Créer le produit"}
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
            <div className="modal-desc">
              Vous allez supprimer définitivement <strong>"{delConfirm.name}"</strong>. Cette action est irréversible.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-orange" style={{ flex: 1 }} onClick={() => deleteProduct(delConfirm)}>
                Confirmer la suppression
              </button>
              <button className="btn btn-ghost" onClick={() => setDelConfirm(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </SupplierLayout>
  );
}