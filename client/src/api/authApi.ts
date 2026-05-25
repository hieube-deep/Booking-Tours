import axiosClient from './axiosClient';
import type { LoginRequest, RegisterRequest, ChangePasswordRequest, AuthResponse } from '@/types/user';

export const authApi = {
  login: (data: LoginRequest): Promise<AuthResponse> => {
    return axiosClient.post('/auth/login', data);
  },

  register: (data: RegisterRequest): Promise<AuthResponse> => {
    return axiosClient.post('/auth/register', data);
  },

  changePassword: (data: ChangePasswordRequest) => {
    return axiosClient.put('/auth/change-password', data);
  },
};
