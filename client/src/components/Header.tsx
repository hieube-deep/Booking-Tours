import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';
import Button from '@/components/ui/Button';
import Swal from 'sweetalert2';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };
  const handleConfirmLogout = async () => {
    const result = Swal.fire({
      title: "bạn có chắc muốn đăng xuất không",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy"
    })
    if ((await result).isConfirmed) {
      handleLogout();

    }
  }


  const navLinks = [
    { label: 'Trang chủ', path: ROUTES.HOME },
    { label: 'Tour du lịch', path: ROUTES.TOURS },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">BT</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              BookingTours
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-4 py-2 rounded-lg text-slate-600 font-medium hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {user?.role === 'admin' && (
                  <Link
                    to={ROUTES.ADMIN_DASHBOARD}
                    className="px-3 py-1.5 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to={ROUTES.MY_BOOKINGS}
                  className="px-3 py-1.5 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  Đơn đặt tour
                </Link>
                <Link
                  to={ROUTES.PROFILE}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-slate-700">{user?.name}</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleConfirmLogout} className='hover:text-red-500' >
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <>
                <Link to={ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm">Đăng nhập</Button>
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button size="sm">Đăng ký</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 animate-[fadeIn_0.2s_ease-out]">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="px-4 py-2.5 rounded-lg text-slate-600 font-medium hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2 px-4">
                {isAuthenticated ? (
                  <>
                    <Link
                      to={ROUTES.MY_BOOKINGS}
                      className="py-2 text-slate-600 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Đơn đặt tour
                    </Link>
                    <Link
                      to={ROUTES.PROFILE}
                      className="py-2 text-slate-600 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Tài khoản
                    </Link>
                    <button onClick={handleConfirmLogout} className="py-2 text-red-500 font-medium text-left cursor-pointer">
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link to={ROUTES.LOGIN} onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">Đăng nhập</Button>
                    </Link>
                    <Link to={ROUTES.REGISTER} onClick={() => setIsMobileMenuOpen(false)}>
                      <Button size="sm" className="w-full">Đăng ký</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
