// api/backupApi.js
import api from "./axios";

export const backupApi = {
  create: (data) => api.post("/client/backups", data),
  getAll: () => api.get("/client/backups"),
};