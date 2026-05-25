import { Link } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to={ROUTES.HOME} className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">BT</span>
              </div>
              <span className="text-xl font-bold text-white">BookingTours</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Nền tảng đặt tour du lịch trực tuyến hàng đầu Việt Nam. Khám phá những hành trình tuyệt vời cùng chúng tôi.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Khám phá</h4>
            <ul className="space-y-2.5">
              <li><Link to={ROUTES.TOURS} className="text-sm hover:text-blue-400 transition-colors">Tour du lịch</Link></li>
              <li><a href="#" className="text-sm hover:text-blue-400 transition-colors">Tour trong nước</a></li>
              <li><a href="#" className="text-sm hover:text-blue-400 transition-colors">Tour quốc tế</a></li>
              <li><a href="#" className="text-sm hover:text-blue-400 transition-colors">Tour phiêu lưu</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-sm hover:text-blue-400 transition-colors">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="text-sm hover:text-blue-400 transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="text-sm hover:text-blue-400 transition-colors">Điều khoản sử dụng</a></li>
              <li><a href="#" className="text-sm hover:text-blue-400 transition-colors">Liên hệ</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                support@bookingtours.vn
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                1900 1234
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Hà Nội, Việt Nam
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} BookingTours. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
