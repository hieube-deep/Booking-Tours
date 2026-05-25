import axiosClient from './axiosClient';
import type { Booking, CreateBookingRequest } from '@/types/booking';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

export const bookingApi = {
  create: (data: CreateBookingRequest): Promise<ApiResponse<Booking>> => {
    return axiosClient.post('/bookings', data);
  },

  getMyBookings: (page = 1, limit = 10): Promise<PaginatedResponse<Booking>> => {
    return axiosClient.get('/bookings/my', { params: { page, limit } });
  },

  getById: (id: string): Promise<ApiResponse<Booking>> => {
    return axiosClient.get(`/bookings/${id}`);
  },

  cancel: (id: string): Promise<ApiResponse<Booking>> => {
    return axiosClient.put(`/bookings/${id}/cancel`);
  },
};
