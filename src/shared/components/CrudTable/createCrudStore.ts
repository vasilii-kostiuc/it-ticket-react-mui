import { create } from "zustand";
import axios, { AxiosError } from "axios";
import type { CrudTableStore } from "./types";

interface CrudStoreOptions<T> {
  endpoint: string;

  transformResponse?: (data: any) => T[];

  transformParams?: (params: any) => any;

  refetchAfterDelete?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T[] | T | null | undefined;
  errors: Record<string, string>[] | null;

  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
  links?: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}

export function createCrudStore<
  T extends { id: number | string },
  TCreate = Partial<Omit<T, "id" | "created_at" | "updated_at">>,
  TUpdate = Partial<Omit<T, "id" | "created_at" | "updated_at">>
>(options: CrudStoreOptions<T>) {
  const {
    endpoint,
    transformResponse,
    transformParams,
    refetchAfterDelete = true,
  } = options;

  const buildQueryParams = (params: Record<string, any>): URLSearchParams => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (key === "filter" && typeof value === "object") {
        // Spatie Laravel Query Builder: filter[field]=value
        Object.entries(value).forEach(([field, fieldValue]) => {
          if (fieldValue !== undefined && fieldValue !== null) {
            queryParams.append(`filter[${field}]`, String(fieldValue));
          }
        });
      } else {
        queryParams.append(key, String(value));
      }
    });

    return queryParams;
  };

  /**
   * Обработка ошибок API
   */
  const handleError = (
    set: (partial: Partial<CrudTableStore<T, TCreate, TUpdate>>) => void,
    error: any
  ) => {
    console.error("API Error:", error);

    if (error.isAxiosError && (error as AxiosError).response) {
      error = error as AxiosError;
      if (error.response?.status === 422) {
        set({ validationErrors: error.response.data.errors, error: null });
      } else {
        set({
          error: error.response?.data?.message || error.message,
          validationErrors: null,
        });
      }
    } else {
      set({
        error: error.message || "An unexpected error occurred",
        validationErrors: null,
      });
    }
  };

  /**
   * Wrapper для установки loading state
   */
  const withLoading = async <R>(
    set: (partial: Partial<CrudTableStore<T, TCreate, TUpdate>>) => void,
    action: () => Promise<R>
  ): Promise<R> => {
    set({ loading: true, error: null, validationErrors: null });
    try {
      return await action();
    } catch (error) {
      handleError(set, error);
      throw error; // Re-throw для обработки в компонентах
    } finally {
      set({ loading: false });
    }
  };

  return create<CrudTableStore<T, TCreate, TUpdate>>((set, get) => ({
    // Initial state
    items: [],
    loading: false,
    error: null,
    meta: undefined,
    links: undefined,
    params: {
      page: 1,
      per_page: 10,
    },

    // Actions
    setParams: (newParams) => {
      set((state) => ({
        params: { ...state.params, ...newParams },
      }));
    },

    setLoading: (loading: boolean) => {
      set({ loading });
    },

    fetchAll: async () => {
      await withLoading(set, async () => {
        let params = get().params;

        if (transformParams) {
          params = transformParams(params);
        }

        const queryParams = buildQueryParams(params);
        const response = await axios.get<ApiResponse<T>>(
          `${endpoint}?${queryParams.toString()}`
        );

        let items = response.data.data as T[];

        if (transformResponse) {
          items = transformResponse(items);
        }

        set({
          items,
          meta: response.data.meta,
          links: response.data.links,
        });
      });
    },

    fetchOne: async (id: number | string) => {
      const item = await withLoading(set, async () => {
        set({ error: null, validationErrors: null });
        const response = await axios.get<ApiResponse<T>>(`${endpoint}/${id}`);
        return response.data.data as T;
      });

      return item;
    },

    createOne: async (data: TCreate) => {
      const item = await withLoading(set, async () => {
        set({ error: null, validationErrors: null });
        const response = await axios.post<T>(endpoint, data);
        return response.data;
      });
      return item;
    },

    updateOne: async (id: number | string, data: TUpdate) => {
      const item = await withLoading(set, async () => {
        set({ error: null, validationErrors: null });
        try {
          const response = await axios.put<T>(`${endpoint}/${id}`, data);
          return response.data;
        } catch (error) {
          handleError(set, error);
          throw error;
        }
      });
      return item;
    },

    deleteOne: async (id: number | string) => {
      return await withLoading(set, async () => {
        set({ error: null, validationErrors: null });
        try {
          await axios.delete(`${endpoint}/${id}`);
        } catch (error) {
          handleError(set, error);
          throw error;
        }

        if (refetchAfterDelete) {
          await get().fetchAll();
        } else {
          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
          }));
        }
      });
    },

    deleteMany: async (ids: Array<number | string>) => {
      if (ids.length === 0) return;

      await withLoading(set, async () => {
        set({ error: null, validationErrors: null });
        try {
          await axios.delete(`${endpoint}/batch-delete`, {
            params: { ids },
          });
        } catch (error) {
          handleError(set, error);
          throw error;
        }

        if (refetchAfterDelete) {
          await get().fetchAll();
        } else {
          const idsSet = new Set(ids);
          set((state) => ({
            items: state.items.filter((item) => !idsSet.has(item.id)),
          }));
        }
      });
    },
  }));
}
