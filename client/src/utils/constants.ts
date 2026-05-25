// API
export const API_BASE_URL = '/api';

// Route paths - Public
export const ROUTES = {
  HOME: '/',
  TOURS: '/tours',
  TOUR_DETAIL: '/tours/:slug',
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Protected
  PROFILE: '/profile',
  CHANGE_PASSWORD: '/profile/change-password',
  BOOKING: '/booking/:tourId',
  MY_BOOKINGS: '/my-bookings',

  // Admin
  ADMIN_DASHBOARD: '/admin',
  ADMIN_TOURS: '/admin/tours',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_USERS: '/admin/users',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 12;

// Tour types
export const TOUR_TYPE_LABELS: Record<string, string> = {
  domestic: 'Trong nước',
  international: 'Quốc tế',
  adventure: 'Phiêu lưu',
  cultural: 'Văn hóa',
};

// Booking status
export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã hủy',
  success: 'Thành công',
};

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-600 bg-yellow-50',
  confirmed: 'text-blue-600 bg-blue-50',
  cancelled: 'text-red-600 bg-red-50',
  success: 'text-green-600 bg-green-50',
};
