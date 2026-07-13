import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Layouts
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import AdminLayout from '@/layouts/AdminLayout';

// Pages
import HomePage from '@/pages/Home/HomePage';
import LoginPage from '@/pages/Auth/LoginPage';
import RegisterPage from '@/pages/Auth/RegisterPage';
import TourListPage from '@/pages/Tours/TourListPage';
import TourDetailPage from '@/pages/Tours/TourDetailPage';
import BookingPage from '@/pages/Booking/BookingPage';
import MyBookingsPage from '@/pages/Booking/MyBookingsPage';
import BookingDetailPage from '@/pages/Booking/BookingDetailPage';
import ProfilePage from '@/pages/Profile/ProfilePage';
import ChangePasswordPage from '@/pages/Profile/ChangePasswordPage';
import DashboardPage from '@/pages/Admin/DashboardPage';
import TourManagePage from '@/pages/Admin/TourManagePage';
import BookingManagePage from '@/pages/Admin/BookingManagePage';
import UserManagePage from '@/pages/Admin/UserManagePage';
import DepartureManagePage from '@/pages/Admin/DepartureManagePage';
import PromotionManagePage from '@/pages/Admin/PromotionManagePage';
import NotFoundPage from '@/pages/NotFound/NotFoundPage';
import PaymentResultPage from '@/pages/Payment/PaymentResultPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 phút
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth Layout */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Admin Layout - Protected (admin only) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="tours" element={<TourManagePage />} />
              <Route path="bookings" element={<BookingManagePage />} />
              <Route path="users" element={<UserManagePage />} />
              <Route path="departures" element={<DepartureManagePage />} />
              <Route path="promotions" element={<PromotionManagePage />} />
            </Route>

            {/* Main Layout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/tours" element={<TourListPage />} />
              <Route path='/tours/:slug' element={<TourDetailPage />} />
              <Route path="/payment-result" element={<PaymentResultPage />} />

              {/* Protected Routes */}
              <Route
                path="/booking/:tourId"
                element={
                  <ProtectedRoute>
                    <BookingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings/:id"
                element={
                  <ProtectedRoute>
                    <BookingDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/change-password"
                element={
                  <ProtectedRoute>
                    <ChangePasswordPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

