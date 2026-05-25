import axiosClient from './axiosClient';
import type { Review, CreateReviewRequest } from '@/types/review';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

export const reviewApi = {
  getByTour: (tourId: string, page = 1, limit = 10): Promise<PaginatedResponse<Review>> => {
    return axiosClient.get(`/reviews/tour/${tourId}`, { params: { page, limit } });
  },

  create: (data: CreateReviewRequest): Promise<ApiResponse<Review>> => {
    return axiosClient.post('/reviews', data);
  },

  delete: (id: string): Promise<ApiResponse> => {
    return axiosClient.delete(`/reviews/${id}`);
  },
};
