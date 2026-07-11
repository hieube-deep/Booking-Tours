import { Link, useSearchParams } from 'react-router-dom';
import Button from '@/components/ui/Button';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const bookingId = searchParams.get('bookingId');
  const isSuccess = status === 'success';

  return (
    <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl rounded-lg border border-slate-100 bg-white p-8 text-center shadow-sm">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${isSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {isSuccess ? (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        <h1 className="mt-5 text-2xl font-bold text-slate-900">
          {isSuccess ? 'Thanh toán thành công' : 'Thanh toán chưa thành công'}
        </h1>
        <p className="mt-3 text-slate-600">
          {isSuccess
            ? 'Cảm ơn bạn đã đặt tour. Chúng tôi sẽ liên hệ xác nhận thông tin trong thời gian sớm nhất.'
            : 'Giao dịch VNPAY chưa hoàn tất hoặc đã bị hủy. Bạn có thể đặt lại tour hoặc liên hệ hỗ trợ để được kiểm tra.'}
        </p>

        {bookingId && (
          <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Mã booking: <span className="font-semibold text-slate-800">{bookingId}</span>
          </p>
        )}

        <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
          <Link to="/tours">
            <Button variant="outline">Xem tour khác</Button>
          </Link>
          <Link to="/profile">
            <Button>Về trang cá nhân</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
