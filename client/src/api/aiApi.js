// api/aiApi.js
import api from "./axios";

export const aiApi = {
  chat: (data) => api.post("/client/ai/chat", data),
  command: (data) => api.post("/client/ai/command", data),
  getSettings: () => api.get("/client/ai/settings"),
  updateSettings: (data) => api.put("/client/ai/settings", data),
};