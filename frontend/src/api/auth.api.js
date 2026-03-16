import api from "./axios";

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  verify2FA: (data) => api.post("/auth/verify-2fa", data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  logout: (data) => api.post("/auth/logout", data),
  getMe: () => api.get("/auth/me"),
  setup2FA: () => api.post("/auth/setup-2fa"),
  enable2FA: (data) => api.post("/auth/enable-2fa", data),
};
