import { User, UserCreateData, UserUpdateData } from "@/models/user";
import axios from "axios";
import { create } from "zustand";
import { CrudTableStore } from "@/shared/components/CrudTable";

interface UsersState extends CrudTableStore<User> {
  // Алиасы для совместимости с CrudTableStore
  items: User[]; // алиас для users
  users: User[]; // оригинальное поле

  links?: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };

  // Методы управления
  setLoading: (loading: boolean) => void;

  // Дополнительные CRUD методы (специфичные для User)
  createUser: (data: UserCreateData) => Promise<void>;
  updateUser: (id: number, data: UserUpdateData) => Promise<void>;
  deleteUser: (id: number) => Promise<void>; // алиас для deleteOne
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  items: [], // синхронизируется с users
  loading: false,
  error: null,

  params: {
    page: 1,
    per_page: 10,
  },

  setParams: (params) => {
    set({ params: { ...get().params, ...params } });
  },

  setLoading: (loading) => {
    set({ loading });
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
      set({
        users: data.data,
        items: data.data, // синхронизируем items
        meta: data.meta,
        links: data.links,
      });
    } catch (error: any) {
      set({ error: error.message || "Failed to fetch users." });
    } finally {
      set({ loading: false });
    }
  },
  createUser: async (_data) => {},
  updateUser: async (_id, _data) => {},
  deleteUser: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`users/${id}`);
    } catch (error: any) {
      set({ error: error.message || "Failed to delete user." });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  deleteOne: async (id) => {
    return get().deleteUser(Number(id));
  },
  deleteMany: async (ids) => {
    const numericIds = ids.map(Number);
    set({ loading: true, error: null });
    try {
      await axios.post("users/bulk-delete", { ids: numericIds });
    } catch (error: any) {
      set({ error: error.message || "Failed to delete users." });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
