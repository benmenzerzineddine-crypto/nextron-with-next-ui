// API Response types
export type ApiSuccessResult<T> = {
  success: true;
  data: T;
};

export type ApiErrorResult = {
  success: false;
  error: string;
};

export type ApiResult<T> = ApiSuccessResult<T> | ApiErrorResult;

// Helper function to check if response is error
export const isApiError = <T>(result: ApiResult<T>): result is ApiErrorResult => {
  return !result.success;
};