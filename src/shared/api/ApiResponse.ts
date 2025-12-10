export interface ApiResponse<T> {
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
