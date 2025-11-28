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
  data: T[];
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

export function createCrudStore<T extends { id: number | string }>(
  options: CrudStoreOptions<T>
) {
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
  const handleError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return (
        axiosError.response?.data?.message ||
        axiosError.message ||
        "An error occurred"
      );
    }
    if (error instanceof Error) {
      return error.message;
    }
    return "Unknown error occurred";
  };

  /**
   * Wrapper для установки loading state
   */
  const withLoading = async <R>(
    set: (partial: Partial<CrudTableStore<T>>) => void,
    action: () => Promise<R>
  ): Promise<R> => {
    set({ loading: true, error: null });
    try {
      return await action();
    } catch (error) {
      const errorMessage = handleError(error);
      set({ error: errorMessage, loading: false });
      throw error; // Re-throw для обработки в компонентах
    } finally {
      set({ loading: false });
    }
  };

  return create<CrudTableStore<T>>((set, get) => ({
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

        // Трансформация параметров если нужно
        if (transformParams) {
          params = transformParams(params);
        }

        const queryParams = buildQueryParams(params);
        const response = await axios.get<ApiResponse<T>>(
          `${endpoint}?${queryParams.toString()}`
        );

        let items = response.data.data;

        // Трансформация данных если нужно
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

    deleteOne: async (id) => {
      await withLoading(set, async () => {
        await axios.delete(`${endpoint}/${id}`);

        if (refetchAfterDelete) {
          await get().fetchAll();
        } else {
          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
          }));
        }
      });
    },

    deleteMany: async (ids) => {
      if (ids.length === 0) return;

      await withLoading(set, async () => {
        await axios.delete(`${endpoint}/batch-delete`, {
          params: { ids },
        });

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
