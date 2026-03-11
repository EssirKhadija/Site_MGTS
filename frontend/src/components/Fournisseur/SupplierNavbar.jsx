import { useState } from "react";
import { useLocation } from "react-router-dom";
import "../../styles/Supplier.css";

const pageTitles = {
  "/supplier":          "Tableau de bord",
  "/supplier/products": "Mes produits",
  "/supplier/demands":  "Demandes clients",
  "/supplier/orders":   "Commandes",
  "/supplier/messages": "Messagerie",
  "/supplier/profile":  "Mon compte",
};

export default function SupplierNavbar() {
  const location = useLocation();
  const [search, setSearch] = useState("");
  const title = pageTitles[location.pathname] ?? "Espace Fournisseur";

  return (
    <header className="navbar">
      <span className="navbar-title">{title}</span>

      {/* Search */}
      <div className="navbar-search">
        <span style={{ color: "var(--text-soft)", fontSize: 15 }}>⌕</span>
        <input
          placeholder="Rechercher un produit, demande…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Notifications */}
      <button className="navbar-icon-btn" title="Notifications">
        🔔
        <span className="navbar-badge">2</span>
      </button>

      {/* Messages */}
      <button className="navbar-icon-btn" title="Messagerie">
        ◎
        <span className="navbar-badge">2</span>
      </button>

      {/* Help */}
      <button className="navbar-icon-btn" title="Aide">?</button>
    </header>
  );
}