import axiosClient from './axiosClient';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Tour, TourType } from '@/types/tour';
import type { User } from '@/types/user';

export interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  activeTours: number;
  monthRevenue: number;
  monthBookings: number;
  lastMonthRevenue: number;
  lastMonthBookings: number;
  bookingsByStatus: Array<{ _id: string; count: number }>;
}

export interface AdminTourPayload {
  title: string;
  slug?: string;
  description?: string;
  destination?: string;
  departureFrom?: string;
  duration: {
    days: number;
    nights: number;
  };
  type?: TourType;
  price: {
    adult: number;
    child?: number;
    infant?: number;
    singleRoomSurcharge?: number;
  };
  maxGroupSize?: number;
  minGroupSize?: number;
  thumbnail?: string;
  images?: string[];
  highlights?: string[];
  includes?: string[];
  excludes?: string[];
  tags?: string[];
  isActive: boolean;
  isFeatured: boolean;
}

export interface AdminBooking {
  _id: string;
  userId?: Pick<User, '_id' | 'name' | 'email' | 'phone'>;
  departureId?: {
    _id: string;
    departureDate?: string;
    returnDate?: string;
    status?: string;
    tourId?: Pick<Tour, '_id' | 'title' | 'slug' | 'destination'>;
  };
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  passengers: Array<{
    fullName: string;
    type: 'adult' | 'child' | 'infant';
  }>;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  totalAdults: number;
  totalChildren: number;
  totalInfants: number;
  priceBreakdown: {
    adultTotal: number;
    childTotal: number;
    singleRoomSurcharge: number;
    discount: number;
    total: number;
  };
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

export const adminApi = {
  getDashboard: (): Promise<ApiResponse<DashboardStats>> => {
    return axiosClient.get('/admin/dashboard');
  },

  getTours: (params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Tour>> => {
    return axiosClient.get('/admin/tours', { params });
  },

  createTour: (data: AdminTourPayload) => {
    return axiosClient.post('/admin/tours', data);
  },

  updateTour: (id: string, data: AdminTourPayload) => {
    return axiosClient.put(`/admin/tours/${id}`, data);
  },

  deleteTour: (id: string) => {
    return axiosClient.delete(`/admin/tours/${id}`);
  },

  getBookings: (params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<AdminBooking>> => {
    return axiosClient.get('/admin/bookings', { params });
  },

  updateBookingStatus: (id: string, status: AdminBooking['status']): Promise<ApiResponse<AdminBooking>> => {
    return axiosClient.put(`/admin/bookings/${id}/status`, { status });
  },

  getUsers: (params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<User>> => {
    return axiosClient.get('/admin/users', { params });
  },

  updateUserRole: (id: string, role: User['role']): Promise<ApiResponse<User>> => {
    return axiosClient.put(`/admin/users/${id}/role`, { role });
  },

  deleteUser: (id: string): Promise<ApiResponse<User>> => {
    return axiosClient.delete(`/admin/users/${id}`);
  },
};
