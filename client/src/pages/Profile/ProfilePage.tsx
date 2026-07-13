import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Tài khoản của tôi</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Avatar + Name */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <span className="text-white text-3xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
              <p className="text-blue-100">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-500">Họ và tên</label>
              <p className="mt-1 text-slate-900 font-medium">{user?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">Email</label>
              <p className="mt-1 text-slate-900 font-medium">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">Số điện thoại</label>
              <p className="mt-1 text-slate-900 font-medium">{user?.phone || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">Vai trò</label>
              <p className="mt-1">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${user?.role === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                  {user?.role === 'admin' ? 'Admin' : 'Người dùng'}
                </span>
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-3">
            <Link
              to={ROUTES.MY_BOOKINGS}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 font-medium rounded-xl hover:bg-blue-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Đơn đặt tour của tôi
            </Link>
            <Link
              to={ROUTES.CHANGE_PASSWORD}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Đổi mật khẩu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
