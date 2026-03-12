import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Client.css";
import ClientLayout from "../../components/Client/ClientLayout";

const categories = ["Tous", "Stockage", "Mécanique", "Emballage", "Électronique", "Textile"];

const products = [
  { id: "PRD-001", name: "Conteneur de stockage standard",   category: "Stockage",    moq: 10,   price: "85 €/u",   lead: "30j", img: "🗳️",  desc: "Conteneur polyvalent en acier galvanisé, empilable, IP65." },
  { id: "PRD-002", name: "Pièce mécanique usinée CNC",       category: "Mécanique",   moq: 50,   price: "12 €/u",   lead: "25j", img: "⚙️",  desc: "Pièce usinée sur mesure, tolérance ±0.05 mm, acier 304." },
  { id: "PRD-003", name: "Emballage carton sur mesure",      category: "Emballage",   moq: 500,  price: "0.80 €/u", lead: "18j", img: "📦",  desc: "Boîte kraft recyclable, impression quadrichromie disponible." },
  { id: "PRD-004", name: "Carte électronique PCB",           category: "Électronique",moq: 100,  price: "6.50 €/u", lead: "35j", img: "🔌",  desc: "PCB double couche, certification RoHS, livraison testée." },
  { id: "PRD-005", name: "Tissu technique non-tissé",        category: "Textile",     moq: 1000, price: "1.20 €/m", lead: "22j", img: "🧵",  desc: "Non-tissé PP 80g/m², résistant à l'humidité, bobines 500m." },
  { id: "PRD-006", name: "Palette bois EPAL",                category: "Stockage",    moq: 20,   price: "14 €/u",   lead: "14j", img: "🏗️",  desc: "Palette EPAL 1200×800, traitement phytosanitaire HT." },
];

export default function Products() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [search, setSearch] = useState("");

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === "Tous" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <ClientLayout>
      <div className="page-header">
        <div>
          <h1>Catalogue produits</h1>
          <p>{products.length} produits disponibles pour commande directe.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/new")}>
          ✦ Demande personnalisée
        </button>
      </div>

      {/* Search + filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "8px 14px", width: 260, transition: "border-color .2s" }}
          onFocus={() => {}} onBlur={() => {}}>
          <span style={{ color: "var(--text-soft)", fontSize: 15 }}>⌕</span>
          <input
            style={{ border: "none", background: "none", fontSize: 13, color: "var(--text-dark)", width: "100%", outline: "none" }}
            placeholder="Rechercher un produit…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "7px 16px",
                borderRadius: 20,
                border: `1.5px solid ${activeCategory === cat ? "var(--teal)" : "var(--border)"}`,
                background: activeCategory === cat ? "var(--teal-light)" : "transparent",
                color: activeCategory === cat ? "var(--teal)" : "var(--text-mid)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--font)",
                transition: "all .15s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {filtered.map((p) => (
          <div key={p.id} className="card" style={{ padding: 20, transition: "box-shadow .2s, transform .2s", cursor: "pointer" }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = "none"; }}>

            {/* Product icon */}
            <div style={{ width: "100%", height: 90, borderRadius: 10, background: "var(--sky-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, marginBottom: 14 }}>
              {p.img}
            </div>

            {/* Category pill */}
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: "var(--teal)", background: "var(--teal-light)", padding: "3px 9px", borderRadius: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px" }}>
                {p.category}
              </span>
            </div>

            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-dark)", marginBottom: 6 }}>{p.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-mid)", lineHeight: 1.5, marginBottom: 16 }}>{p.desc}</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              {[["MOQ", p.moq + " u"], ["Prix", p.price], ["Délai", p.lead]].map(([k, v]) => (
                <div key={k} style={{ background: "var(--bg)", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 10, color: "var(--text-soft)", marginBottom: 2, textTransform: "uppercase", letterSpacing: ".5px" }}>{k}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-dark)" }}>{v}</div>
                </div>
              ))}
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={() => navigate("/new", { state: { product: p } })}
            >
              Commander
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-soft)" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>◈</div>
          <p>Aucun produit trouvé. <span style={{ color: "var(--teal)", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/new")}>Créer une demande sur mesure →</span></p>
        </div>
      )}
    </ClientLayout>
  );
}