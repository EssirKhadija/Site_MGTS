import api from "./axios";

export const productsAPI = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),

  // Supplier
  create: (data) =>
    api.post("/supplier/products", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getMine: () => api.get("/supplier/products"),
  update: (id, data) =>
    api.put(`/supplier/products/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/supplier/products/${id}`),

  // Admin
  review: (id, data) => api.post(`/admin/products/${id}/review`, data),
};
