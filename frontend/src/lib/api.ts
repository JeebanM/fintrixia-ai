import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────────
export const googleLogin = (token: string) =>
  api.post("/api/auth/google", { token });

// ─── Dashboard ───────────────────────────────────────
export const getDashboardSummary = () =>
  api.get("/api/dashboard/summary");

export const getCategoryBreakdown = () =>
  api.get("/api/dashboard/category-breakdown");

export const getSpendingOverTime = () =>
  api.get("/api/dashboard/spending-over-time");

// ─── Transactions ─────────────────────────────────────
export const getTransactions = (params?: Record<string, any>) =>
  api.get("/api/transactions", { params });

export const createTransaction = (data: any) =>
  api.post("/api/transactions", data);

export const updateTransaction = (txnId: string, data: any) =>
  api.patch(`/api/transactions/${txnId}`, data);

export const deleteTransaction = (txnId: string) =>
  api.delete(`/api/transactions/${txnId}`);

// ─── Budgets ─────────────────────────────────────────
export const getBudgets = () => api.get("/api/budgets");

export const createBudget = (data: any) =>
  api.post("/api/budgets", data);

export const deleteBudget = (category: string) =>
  api.delete(`/api/budgets/${category}`);

// ─── Notifications ────────────────────────────────────
export const getNotifications = () =>
  api.get("/api/notifications");

export const markNotifRead = (id: string) =>
  api.patch(`/api/notifications/${id}/read`);

export const clearNotifications = () =>
  api.delete("/api/notifications/clear");

// ─── AI ──────────────────────────────────────────────
export const sendAIQuery = (query: string) =>
  api.post("/api/ai/query", { query });

export const getInsights = () =>
  api.get("/api/ai/insights");

export const getRecommendations = () =>
  api.get("/api/ai/recommendations");

export default api;
