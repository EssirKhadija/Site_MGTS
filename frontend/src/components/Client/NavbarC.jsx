import { useState } from "react";
import { useLocation } from "react-router-dom";
import "../../styles/Client.css";

const pageTitles = {
  "/":         "Tableau de bord",
  "/products": "Produits",
  "/new":      "Nouvelle demande",
  "/quotes":   "Devis",
  "/orders":   "Commandes",
  "/messages": "Messagerie",
  "/profile":  "Mon profil",
};

export default function Navbar({ onNotifClick }) {
  const location  = useLocation();
  const [search, setSearch] = useState("");
  const title = pageTitles[location.pathname] ?? "Espace Client";

  return (
    <header className="navbar">
      {/* Page title */}
      <span className="navbar-title">{title}</span>

      {/* Search */}
      <div className="navbar-search">
        <span className="navbar-search-icon">⌕</span>
        <input
          placeholder="Rechercher une commande, produit…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Notifications */}
      <button
        className="navbar-icon-btn"
        title="Notifications"
        onClick={onNotifClick}
      >
        🔔
        <span className="navbar-badge">3</span>
      </button>

      {/* Messages shortcut */}
      <button className="navbar-icon-btn" title="Messages">
        ◎
        <span className="navbar-badge">2</span>
      </button>

      {/* Help */}
      <button className="navbar-icon-btn" title="Aide">?</button>
    </header>
  );
}