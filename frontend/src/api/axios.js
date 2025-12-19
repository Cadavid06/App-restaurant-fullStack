import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const tenantId = localStorage.getItem("selectedRestaurantId");

  if (tenantId && tenantId !== "null") {
    // Aseguramos que sea string para el header
    config.headers["x-tenant-id"] = tenantId.toString();
  }

  return config;
});

export default instance;