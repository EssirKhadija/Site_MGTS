import api from "./axios";

export const ordersAPI = {
  // Client
  create: (data) => api.post("/client/orders", data),
  getMyOrders: () => api.get("/client/orders"),
  getById: (id) => api.get(`/client/orders/${id}`),
  respond: (id, data) => api.post(`/client/orders/${id}/respond`, data),

  // Supplier
  getSupplierOrders: () => api.get("/supplier/orders"),
  addSupplierQuote: (id, data) =>
    api.post(`/supplier/orders/${id}/quote`, data),

  // Transport
  getTransportOrders: () => api.get("/transport/orders"),
  addTransportQuote: (id, data) =>
    api.post(`/transport/orders/${id}/quote`, data),

  // Transitaire
  getTransitaireOrders: () => api.get("/transitaire/orders"),
  addTransitaireQuote: (id, data) =>
    api.post(`/transitaire/orders/${id}/quote`, data),

  // Admin
  getAll: (params) => api.get("/admin/orders", { params }),
  assignSupplier: (id, data) =>
    api.post(`/admin/orders/${id}/assign-supplier`, data),
  assignTransport: (id, data) =>
    api.post(`/admin/orders/${id}/assign-transport`, data),
  assignTransitaire: (id, data) =>
    api.post(`/admin/orders/${id}/assign-transitaire`, data),
  calculate: (id, data) => api.post(`/admin/orders/${id}/calculate`, data),
};
