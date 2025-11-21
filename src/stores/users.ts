import { User, UserCreateData, UserUpdateData } from "@/models/user";
import axios from "axios";
import { create } from "zustand";

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;

  params: {
    page?: number;
    per_page?: number;
    search?: string;
    filter?: Record<string, string | number | boolean>; // filter[field] = value для Spatie
    sort?: string;
  };

  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };

  links?: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };

  // CRUD методы
  fetchAll: () => Promise<void>;
  createUser: (data: UserCreateData) => Promise<void>;
  updateUser: (id: number, data: UserUpdateData) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  loading: false,
  error: null,

  params: {
    page: 1,
    per_page: 10,
  },

  fetchAll: async () => {
    set({ loading: true, error: null });

    try {
      const queryParams = new URLSearchParams();
      const params = get().params;

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === "filter" && typeof value === "object") {
              // Для Spatie Laravel Query Builder: filter[field]=value
              Object.entries(value).forEach(([field, fieldValue]) => {
                if (fieldValue !== undefined && fieldValue !== null) {
                  queryParams.append(`filter[${field}]`, String(fieldValue));
                }
              });
            } else {
              queryParams.append(key, String(value));
            }
          }
        });
      }

      const response = await axios(`users?${queryParams.toString()}`);
      const data = response.data;
      set({ users: data.data, meta: data.meta, links: data.links });
    } catch (error: any) {
      set({ error: error.message || "Failed to fetch users." });
    } finally {
      set({ loading: false });
    }
  },
  createUser: async (data) => {},
  updateUser: async (id, data) => {},
  deleteUser: async (id) => {},
}));
