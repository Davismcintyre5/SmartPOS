// api/dashboardApi.js
import api from "./axios";

export const dashboardApi = {
  getDashboard: () => api.get("/client/dashboard"),
};