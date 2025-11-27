import { create } from "zustand";
import axios from "axios";
import { useNavigate } from "react-router";
interface AuthState {
  isLoggedIn: boolean;
  loading: boolean;
  access_token: string;
  errors: Record<string, Array<string>>;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const storedToken = localStorage.getItem("access_token") || "";
  if (storedToken) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
  }
  return {
    isLoggedIn: !!storedToken,
    loading: false,
    errors: {},
    access_token: storedToken,

    login: async (data) => {
      set({ loading: true, errors: {} });
      try {
        console.log("baseURL:" + axios.defaults.baseURL);
        const res = await axios.post("auth/login", data);
        set({
          access_token: res.data.data.access_token,
          isLoggedIn: true,
        });
        localStorage.setItem("access_token", res.data.data.access_token);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${res.data.data.access_token}`;
      } catch (e: any) {
        if (e.response?.status === 422) {
          set({ errors: e.response.data.errors });
        }
      } finally {
        set({ loading: false });
      }
    },

    register: async (data) => {
      set({ loading: true, errors: {} });
      try {
        const res = await axios.post("auth/register", data);
        set({
          access_token: res.data.data.access_token,
          isLoggedIn: true,
        });
        localStorage.setItem("access_token", res.data.data.access_token);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${res.data.data.access_token}`;
      } catch (e: any) {
        if (e.response?.status === 422) {
          set({ errors: e.response.data.errors });
        }
      }
    },

    logout: () => {
      set({ access_token: "", isLoggedIn: false });
      localStorage.removeItem("access_token");
      delete axios.defaults.headers.common["Authorization"];
    },

    refreshToken: async () => {
      try {
        const res = await axios.post("auth/refresh");
        set({ access_token: res.data.data.access_token });
        localStorage.setItem("access_token", res.data.data.access_token);
      } catch {
        get().logout();
      }
    },
  };
});
