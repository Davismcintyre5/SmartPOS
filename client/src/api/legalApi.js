// legalApi
import api from "./axios";

export const legalApi = {
  getSection: (section) => api.get(`/public/landing/content/${section}`).then(r => r.data || r),
};