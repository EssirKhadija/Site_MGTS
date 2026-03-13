// =============================================
// MGTS - Constants
// =============================================

const ROLES = {
  CLIENT: 'client',
  SUPPLIER: 'supplier',
  TRANSPORT: 'transport',
  TRANSITAIRE: 'transitaire',
  ADMIN: 'admin',
};

const ORDER_STATUS = {
  PENDING: 'pending',               // Demande créée par le client
  SUPPLIER_REVIEW: 'supplier_review', // En attente du devis fournisseur
  TRANSPORT_REVIEW: 'transport_review', // En attente des frais transport
  TRANSITAIRE_REVIEW: 'transitaire_review', // En attente des frais douaniers
  QUOTE_READY: 'quote_ready',       // Devis final prêt pour le client
  QUOTE_ACCEPTED: 'quote_accepted', // Client a accepté
  QUOTE_REJECTED: 'quote_rejected', // Client a refusé
  PAYMENT_PENDING: 'payment_pending', // En attente de paiement
  PAYMENT_CONFIRMED: 'payment_confirmed', // Paiement confirmé par admin
  IN_PRODUCTION: 'in_production',   // En production chez le fournisseur
  SHIPPED: 'shipped',               // En transit
  IN_CUSTOMS: 'in_customs',         // En douane
  DELIVERED: 'delivered',           // Livré
  CANCELLED: 'cancelled',           // Annulé
};

const USER_STATUS = {
  PENDING: 'pending',     // En attente de validation admin (fournisseurs)
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
};

const REQUEST_TYPE = {
  EXISTING_PRODUCT: 'existing_product',
  CUSTOM: 'custom',
};

const INCOTERMS = ['EXW', 'FOB', 'CIF', 'DDP', 'DAP', 'FCA', 'CPT', 'CIP'];

module.exports = { ROLES, ORDER_STATUS, USER_STATUS, REQUEST_TYPE, INCOTERMS };
