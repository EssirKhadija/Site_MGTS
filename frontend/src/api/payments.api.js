import api from "./axios";

export const paymentsAPI = {
  submit: (orderId, data) =>
    api.post(`/client/orders/${orderId}/payment`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  uploadProof: (orderId, data) =>
    api.post(`/client/orders/${orderId}/payment/proof`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  downloadInvoice: (orderId) =>
    api.get(`/client/orders/${orderId}/invoice`, {
      responseType: "blob",
    }),

  // Admin
  getAll: (params) => api.get("/admin/payments", { params }),
  validate: (id) => api.post(`/admin/payments/${id}/validate`),
  reject: (id, data) => api.post(`/admin/payments/${id}/reject`, data),
};
