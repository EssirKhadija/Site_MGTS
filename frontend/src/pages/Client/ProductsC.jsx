import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Client.css";
import ClientLayout from "../../components/Client/ClientLayout";
import { productsAPI } from "../../api/products.api";

const categories = ["Tous"];

const ICONS = ["🗳️", "⚙️", "📦", "🔌", "🧵", "🏗️", "🔧", "🖥️", "🪵", "🧴"];

export default function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState(["Tous"]);
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ── Fetch products ────────────────────────────────────────
  useEffect(() => {
    productsAPI
      .getAll()
      .then((res) => {
        const list = res.data?.products || res.data || [];
        setProducts(list);

        // Build categories dynamically from products
        const cats = [
          "Tous",
          ...new Set(list.map((p) => p.category).filter(Boolean)),
        ];
        setAllCategories(cats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === "Tous" || p.category === activeCategory;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const getIcon = (id) => ICONS[(id - 1) % ICONS.length] || "📦";

  const formatPrice = (price) =>
    price ? `${parseFloat(price).toLocaleString()} MAD/u` : "Sur devis";

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <ClientLayout>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
          }}
        >
          <p
            style={{
              color: "var(--text-soft)",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
            }}
          >
            Chargement du catalogue...
          </p>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="page-header">
        <div>
          <h1>Catalogue produits</h1>
          <p>{products.length} produits disponibles pour commande directe.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/client/new-order")}
        >
          ✦ Demande personnalisée
        </button>
      </div>

      {/* Search + filters */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#fff",
            border: "1.5px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "8px 14px",
            width: 260,
            transition: "border-color .2s",
          }}
        >
          <span style={{ color: "var(--text-soft)", fontSize: 15 }}>⌕</span>
          <input
            style={{
              border: "none",
              background: "none",
              fontSize: 13,
              color: "var(--text-dark)",
              width: "100%",
              outline: "none",
            }}
            placeholder="Rechercher un produit…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "7px 16px",
                borderRadius: 20,
                border: `1.5px solid ${
                  activeCategory === cat ? "var(--teal)" : "var(--border)"
                }`,
                background:
                  activeCategory === cat ? "var(--teal-light)" : "transparent",
                color:
                  activeCategory === cat ? "var(--teal)" : "var(--text-mid)",
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}
      >
        {filtered.map((p) => (
          <div
            key={p.id}
            className="card"
            style={{
              padding: 20,
              transition: "box-shadow .2s, transform .2s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "var(--shadow-md)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "var(--shadow-sm)";
              e.currentTarget.style.transform = "none";
            }}
          >
            {/* Product image or icon */}
            <div
              style={{
                width: "100%",
                height: 90,
                borderRadius: 10,
                background: "var(--sky-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 38,
                marginBottom: 14,
                overflow: "hidden",
              }}
            >
              {p.images && JSON.parse(p.images || "[]").length > 0 ? (
                <img
                  src={`http://localhost:5000/${JSON.parse(p.images)[0]}`}
                  alt={p.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 10,
                  }}
                />
              ) : (
                getIcon(p.id)
              )}
            </div>

            {/* Category pill */}
            <div style={{ marginBottom: 8 }}>
              <span
                style={{
                  fontSize: 10,
                  color: "var(--teal)",
                  background: "var(--teal-light)",
                  padding: "3px 9px",
                  borderRadius: 10,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: ".5px",
                }}
              >
                {p.category || "Général"}
              </span>
            </div>

            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--text-dark)",
                marginBottom: 6,
              }}
            >
              {p.name}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-mid)",
                lineHeight: 1.5,
                marginBottom: 16,
              }}
            >
              {p.description?.slice(0, 90) || "—"}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {[
                ["MOQ", `${p.minQuantity} u`],
                ["Prix", formatPrice(p.priceIndicatif)],
                ["Délai", "Sur demande"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    background: "var(--bg)",
                    borderRadius: 8,
                    padding: "8px 10px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-soft)",
                      marginBottom: 2,
                      textTransform: "uppercase",
                      letterSpacing: ".5px",
                    }}
                  >
                    {k}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--text-dark)",
                    }}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={() =>
                navigate("/client/new-order", { state: { product: p } })
              }
            >
              Commander
            </button>
          </div>
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
          <p>
            Aucun produit trouvé.{" "}
            <span
              style={{
                color: "var(--teal)",
                cursor: "pointer",
                fontWeight: 600,
              }}
              onClick={() => navigate("/client/new-order")}
            >
              Créer une demande sur mesure →
            </span>
          </p>
        </div>
      )}
    </ClientLayout>
  );
}
