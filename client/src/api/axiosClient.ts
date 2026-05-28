import axios from 'axios';
import { storage } from '@/utils/storage';
import { API_BASE_URL } from '@/utils/constants';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - tự động gắn token
axiosClient.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - xử lý lỗi chung
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // Token hết hạn hoặc không hợp lệ (không tự động redirect khi đang cố gắng đăng nhập/đăng ký)
      if (status === 401 && !error.config?.url?.includes('/auth/login') && !error.config?.url?.includes('/auth/register')) {
        storage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
