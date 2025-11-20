import { User, UserCreateData, UserUpdateData } from "@/models/user";
import { create } from "zustand";

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;

  // Параметры запроса (отправляются на бэк)
  params: {
    page: number;
    per_page: number;
    search?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
  };

  meta: {
    total: number;
    current_page: number;
    last_page: number;
  };

  // CRUD методы
  fetchUsers: () => Promise<void>;
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

  meta: {
    total: 0,
    current_page: 1,
    last_page: 1,
  },

  fetchUsers: async () => {
    set({ loading: true, error: null });
  },
  createUser: async (data) => {},
  updateUser: async (id, data) => {},
  deleteUser: async (id) => {},
}));
