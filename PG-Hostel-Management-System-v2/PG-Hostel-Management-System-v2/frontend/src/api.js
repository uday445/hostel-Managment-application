import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api"
});

export const roomApi = {
  getAll: () => api.get("/rooms"),
  getBySharing: (type) => api.get(`/rooms/sharing/${type}`),
  create: (data) => api.post("/rooms", data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`)
};

export const candidateApi = {
  getAll: () => api.get("/candidates"),
  create: (data) => api.post("/candidates", data, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  update: (id, data) => api.put(`/candidates/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  delete: (id) => api.delete(`/candidates/${id}`)
};

export const feeApi = {
  getAll: () => api.get("/fees"),
  create: (candidateId, data) =>
    api.post(`/fees?candidateId=${candidateId}`, data),
  uploadPayment: (id, file) => {
    const formData = new FormData();
    formData.append("payment", file);
    return api.post(`/fees/${id}/payment`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  },
  delete: (id) => api.delete(`/fees/${id}`)
};

export default api;
