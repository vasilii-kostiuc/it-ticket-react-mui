import { create } from "zustand";
import axios from "axios";
import {
  User,
  UserProfile,
  UserProfileUpdateData,
} from "@/features/users/types/user";
import { ApiResponse } from "@/shared/api";
interface AuthStore {
  userProfile: UserProfile | null;
  isLoggedIn: boolean;
  loading: boolean;
  access_token: string | null;
  error: string | null;
  validationErrors?: Record<string, string[]> | null;
  initAuth: () => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  fetchProfile: () => Promise<UserProfile>;
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile>;
}

export const useAuthStore = create<AuthStore>((set, get) => {
  const storedToken = localStorage.getItem("access_token") || "";
  if (storedToken) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
  }
  return {
    isLoggedIn: !!storedToken,
    loading: false,
    errors: {},
    access_token: storedToken,
    userProfile: null,

    initAuth: async () => {
      const token = get().access_token;
      if (!token) return;

      set({ loading: true });
      try {
        await get().fetchProfile();
        set({ isLoggedIn: true, loading: false });
      } catch (error) {
        // Токен невалиден, очищаем
        localStorage.removeItem("access_token");
        set({ access_token: null, userProfile: null, loading: false });
      }
    },

    login: async (data) => {
      set({ loading: true, validationErrors: null });
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
          set({ validationErrors: e.response.data.errors });
        }
      } finally {
        set({ loading: false });
      }
    },

    register: async (data) => {
      set({ loading: true, validationErrors: null });
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
          set({ validationErrors: e.response.data.errors });
        }
      }
    },

    logout: () => {
      set({ access_token: "", isLoggedIn: false });
      localStorage.removeItem("access_token");
      delete axios.defaults.headers.common["Authorization"];
    },

    fetchProfile: async () => {
      const res = await axios.get<ApiResponse<UserProfile>>("auth/profile");
      set({ userProfile: res.data.data as UserProfile });
      return res.data.data;
    },

    updateProfile: async (data: UserProfileUpdateData) => {
      set({ loading: true, error: null, validationErrors: null });

      try {
        const formData = new FormData();
        if (data.name) formData.append("name", data.name);
        if (data.email) formData.append("email", data.email);
        if (data.avatar instanceof File) {
          formData.append("avatar", data.avatar);
        }
        //formData.append("_method", "PUT");

        const res = await axios.post<ApiResponse<UserProfile>>(
          "auth/profile",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        set({ userProfile: res.data as UserProfile });
        return res.data;
      } catch (e: any) {
        if (e.response?.status === 422) {
          set({ validationErrors: e.response.data.errors });
        } else {
          throw e;
        }
      } finally {
        set({ loading: false });
      }
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
