// api/apiKeyApi.js
import api from "./axios";

export const apiKeyApi = {
  generate: (data) => api.post("/client/api-keys/generate", data),
  getAll: () => api.get("/client/api-keys"),
  revoke: (id) => api.delete(`/client/api-keys/${id}`),
};