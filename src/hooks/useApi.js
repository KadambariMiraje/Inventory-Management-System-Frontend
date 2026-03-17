import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.0.155:8083/api",
});

/* ===== INTERCEPTOR (IMPORTANT) ===== */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ===== AUTH APIs ===== */
export const authAPI = {
  login: (data) => API.post("/user/login", data),
  register: (data) => API.post("/user/signup", data),
};

export default API;