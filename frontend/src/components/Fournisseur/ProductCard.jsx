import "../../styles/Supplier.css";

const statusMap = {
  published: { label: "Publié",        color: "#009189", bg: "#E0F5F4", bar: "#009189" },
  draft:     { label: "Brouillon",     color: "#89B5BE", bg: "#F0F8FA", bar: "#BAE4F0" },
  pending:   { label: "En révision",   color: "#F5A623", bg: "#FEF6E8", bar: "#F5A623" },
  archived:  { label: "Archivé",       color: "#CC3A00", bg: "#FFE8DC", bar: "#FF6500" },
};

/**
 * ProductCard — one supplier product tile.
 *
 * Props:
 *   product  {object}  — { id, name, description, price, moq, category, status, emoji, views, orders }
 *   onEdit   {fn}
 *   onDelete {fn}
 *   onToggle {fn}      — publish / unpublish
 */
export default function ProductCard({ product, onEdit, onDelete, onToggle }) {
  const s = statusMap[product.status] ?? statusMap.draft;

  return (
    <div className="card product-card">
      {/* Status bar */}
      <div className="product-status-bar" style={{ background: s.bar }} />

      {/* Image / emoji placeholder */}
      <div className="product-img">
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span>{product.emoji ?? "📦"}</span>
        }
      </div>

      {/* Body */}
      <div className="product-body">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div>
            <div className="row-id">{product.id}</div>
            <div className="product-name">{product.name}</div>
          </div>
          <span className="badge" style={{ color: s.color, background: s.bg, flexShrink: 0, marginLeft: 8 }}>
            {s.label}
          </span>
        </div>

        <div className="product-desc">{product.description}</div>

        {/* Category */}
        {product.category && (
          <span className="tag" style={{ background: "var(--sky-light)", color: "var(--teal)", marginBottom: 12 }}>
            {product.category}
          </span>
        )}

        <div className="product-meta">
          <div className="product-price">{product.price}</div>
          <div className="product-moq">MOQ : {product.moq} u.</div>
        </div>

        {/* Mini stats */}
        <div style={{ display: "flex", gap: 16, marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border-soft)" }}>
          <div style={{ fontSize: 11, color: "var(--text-soft)" }}>👁 {product.views ?? 0} vues</div>
          <div style={{ fontSize: 11, color: "var(--text-soft)" }}>◆ {product.orders ?? 0} commandes</div>
        </div>
      </div>

      {/* Actions */}
      <div className="product-actions">
        <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => onEdit?.(product)}>
          ✏ Modifier
        </button>
        <button
          className="btn btn-sm"
          style={{
            flex: 1,
            background: product.status === "published" ? "var(--orange-light)" : "var(--teal-light)",
            color: product.status === "published" ? "var(--orange)" : "var(--teal)",
            border: "none",
          }}
          onClick={() => onToggle?.(product)}
        >
          {product.status === "published" ? "⏸ Dépublier" : "▶ Publier"}
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete?.(product)}>✕</button>
      </div>
    </div>
  );
}