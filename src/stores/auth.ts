import { create } from "zustand";
import axios from "axios";

interface AuthState {
  isLoggedIn: boolean;
  loading: boolean;
  accessToken: string;
  errors: Record<string, string>;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  register: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  const storedToken = localStorage.getItem("accessToken") || "";
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
        const res = await axios.post("auth/login", data);
        set({
          accessToken: res.data.accessToken,
          isLoggedIn: true,
        });
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${res.data.accessToken}`;
      } catch (e: any) {
        if (e.response?.status === 400) {
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
          accessToken: res.data.accessToken,
          isLoggedIn: true,
        });
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${res.data.accessToken}`;
      } catch (e: any) {
        if (e.response?.status === 400) {
          set({ errors: e.response.data.errors });
        }
      }
    },

    logout: () => {
      set({ accessToken: "", isLoggedIn: false });
      delete axios.defaults.headers.common["Authorization"];
    },
  };
});
