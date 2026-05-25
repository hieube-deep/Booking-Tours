import { Link } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import Button from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-4">
          404
        </h1>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy trang</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <Link to={ROUTES.HOME}>
          <Button size="lg">Về trang chủ</Button>
        </Link>
      </div>
    </div>
  );
}
