import axiosClient from './axiosClient';
import type { Departure } from '@/types/departure';
import type { ApiResponse } from '@/types/api';

export const departureApi = {
  getByTour: (tourId: string): Promise<ApiResponse<Departure[]>> => {
    return axiosClient.get(`/departures/tour/${tourId}`);
  },

  getById: (id: string): Promise<ApiResponse<Departure>> => {
    return axiosClient.get(`/departures/${id}`);
  },
};
