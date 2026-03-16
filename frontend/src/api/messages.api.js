import api from "./axios";

export const messagesAPI = {
  send: (orderId, data) => api.post(`/messages/orders/${orderId}`, data),
  getByOrder: (orderId) => api.get(`/messages/orders/${orderId}`),
  getUnreadCount: () => api.get("/messages/unread"),
  getNotifications: (params) => api.get("/messages/notifications", { params }),
  markRead: () => api.put("/messages/notifications/read"),
};
