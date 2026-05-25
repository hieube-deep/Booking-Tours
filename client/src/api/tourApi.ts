import axiosClient from './axiosClient';
import type { Tour, TourFilters } from '@/types/tour';
import type { PaginatedResponse, ApiResponse } from '@/types/api';

export const tourApi = {
  getAll: (filters?: TourFilters): Promise<PaginatedResponse<Tour>> => {
    return axiosClient.get('/tours', { params: filters });
  },

  getBySlug: (slug: string): Promise<ApiResponse<Tour>> => {
    return axiosClient.get(`/tours/${slug}`);
  },

  getFeatured: (): Promise<ApiResponse<Tour[]>> => {
    return axiosClient.get('/tours', { params: { isFeatured: true, limit: 6 } });
  },
};
