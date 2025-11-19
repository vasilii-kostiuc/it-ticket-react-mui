import { create } from "zustand";
import axios from "axios";

interface AuthState {
  isLoggedIn: boolean;
  loading: boolean;
  accessToken: string;
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
    accessToken: storedToken,

    login: async (data) => {
      set({ loading: true, errors: {} });
      try {
        console.log("baseURL:" + axios.defaults.baseURL);
        const res = await axios.post("auth/login", data);
        set({
          accessToken: res.data.data.access_token,
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
          accessToken: res.data.data.access_token,
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
      set({ accessToken: "", isLoggedIn: false });
      localStorage.removeItem("accessToken");
      delete axios.defaults.headers.common["Authorization"];
    },

    refreshToken: async () => {
      try {
        const res = await axios.post("auth/refresh");
        set({ accessToken: res.data.data.access_token });
        localStorage.setItem("accessToken", res.data.data.access_token);
      } catch {
        get().logout();
      }
    },
  };
});
