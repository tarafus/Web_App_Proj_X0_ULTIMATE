import axios from "axios";
import { useAuthStore } from "../store/authStore.ts";

// URL dynamique : si tu accèdes via http://localhost:5173, baseURL = http://localhost:8080
// Si ton frère accède via http://192.168.1.42:5173, baseURL = http://192.168.1.42:8080
export const api = axios.create({
  baseURL: `http://${window.location.hostname}:8080`,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});