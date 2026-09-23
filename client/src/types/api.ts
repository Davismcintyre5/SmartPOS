export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta: null | Record<string, unknown>;
}

export interface ApiPaginated<T> {
  success: true;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody;

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface NormalizedError {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}