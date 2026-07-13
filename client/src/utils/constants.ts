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
  WISHLIST: '/wishlist',
  // Admin
  ADMIN_DASHBOARD: '/admin',
  ADMIN_TOURS: '/admin/tours',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_USERS: '/admin/users',
  ADMIN_DEPARTURES: '/admin/departures',
  ADMIN_PROMOTIONS: '/admin/promotions',
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
  success: 'Thành công',
  failed: 'Thất bại',
  cancelled: 'Đã hủy',
};

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-600 bg-yellow-50',
  success: 'text-green-600 bg-green-50',
  failed: 'text-red-600 bg-red-50',
  cancelled: 'text-slate-600 bg-slate-100',
};
