import { isAxiosError } from 'axios';

export const getErrorMessage = (err: unknown, fallback: string): string => {
  if (isAxiosError(err) && typeof err.response?.data?.message === 'string') {
    return err.response.data.message;
  }
  return fallback;
};
