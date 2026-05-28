export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  pagination?: PaginationMeta;
}

export const createResponse = <T>(
  data: T | null = null,
  message: string = 'Success',
  pagination?: PaginationMeta
): ApiResponse<T> => {
  return {
    success: true,
    message,
    data,
    ...(pagination && { pagination }),
  };
};

export const createErrorResponse = (
  message: string = 'Internal Server Error',
  data: any = null
): ApiResponse<null> => {
  return {
    success: false,
    message,
    data,
  };
};
