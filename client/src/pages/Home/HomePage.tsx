import { Link } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import Button from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600">
        {/* Background pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              Khám phá Việt Nam
              <span className="block text-cyan-300">cùng BookingTours</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">
              Trải nghiệm những hành trình tuyệt vời với hàng trăm tour du lịch hấp dẫn.
              Đặt tour dễ dàng, giá tốt nhất, hỗ trợ 24/7.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to={ROUTES.TOURS}>
                <Button size="lg" className="border-white/30 text-white hover:bg-white/10 shadow-xl ">
                  Xem tất cả Tour
                </Button>
              </Link>
              <Link to={ROUTES.REGISTER}>
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                  Đăng ký ngay
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Tại sao chọn BookingTours?
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Chúng tôi mang đến trải nghiệm đặt tour tốt nhất cho bạn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🌍',
                title: 'Đa dạng điểm đến',
                desc: 'Hàng trăm tour trong nước và quốc tế để bạn lựa chọn',
              },
              {
                icon: '💰',
                title: 'Giá tốt nhất',
                desc: 'Cam kết giá tốt nhất thị trường, nhiều ưu đãi hấp dẫn',
              },
              {
                icon: '🛡️',
                title: 'An toàn & Tin cậy',
                desc: 'Đội ngũ hướng dẫn viên chuyên nghiệp, bảo hiểm toàn diện',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group p-8 rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300"
              >
                <div className="text-4xl mb-5">{feature.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Sẵn sàng cho chuyến đi tiếp theo?
          </h2>
          <p className="text-lg text-slate-500 mb-8">
            Đăng ký ngay để nhận ưu đãi đặc biệt và bắt đầu hành trình của bạn
          </p>
          <Link to={ROUTES.REGISTER}>
            <Button size="lg">Bắt đầu ngay</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
