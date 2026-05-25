import axiosClient from './axiosClient';
import type { Tour } from '@/types/tour';
import type { ApiResponse } from '@/types/api';

export const wishlistApi = {
  getAll: (): Promise<ApiResponse<Tour[]>> => {
    return axiosClient.get('/wishlists');
  },

  add: (tourId: string): Promise<ApiResponse> => {
    return axiosClient.post('/wishlists', { tourId });
  },

  remove: (tourId: string): Promise<ApiResponse> => {
    return axiosClient.delete(`/wishlists/${tourId}`);
  },
};
