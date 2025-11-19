import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import axios from "axios";
import { useAuthStore } from "./stores/auth.ts";

axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
axios.defaults.withCredentials = true;
axios.defaults.baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8876/api/v1/";

const { logout, refreshToken } = useAuthStore.getState();

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Сначала пытаемся обновить токен
      try {
        await refreshToken();
        // Если успешно - повторяем исходный запрос
        return axios.request(error.config);
      } catch (refreshError) {
        // Если refresh не удался - разлогиниваем
        logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
