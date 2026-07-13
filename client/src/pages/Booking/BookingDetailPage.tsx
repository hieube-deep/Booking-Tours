import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { bookingApi } from '@/api/bookingApi';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS } from '@/utils/constants';
import { formatDate, formatDateTime, formatPrice } from '@/utils/formatters';
import { getErrorMessage } from '@/utils/errors';

const passengerTypeLabels: Record<string, string> = {
  adult: 'Người lớn',
  child: 'Trẻ em',
  infant: 'Em bé',
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingApi.getById(id || ''),
    enabled: !!id,
  });

  const booking = data?.data;
  const tour = booking && typeof booking.tourId === 'object' ? booking.tourId : undefined;
  const departure = booking && typeof booking.departureId === 'object' ? booking.departureId : undefined;

  const handleCancel = async () => {
    if (!booking) return;

    const result = await Swal.fire({
      title: 'Bạn có chắc muốn huỷ đơn đặt tour này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Huỷ đơn',
      cancelButtonText: 'Đóng',
    });

    if (!result.isConfirmed) return;

    try {
      await bookingApi.cancel(booking._id);
      toast.success('Đã huỷ đơn đặt tour');
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Không thể huỷ đơn đặt tour'));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading text="Đang tải thông tin đơn đặt tour..." />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Không tìm thấy đơn đặt tour</h1>
        <Link to="/my-bookings" className="mt-6 inline-flex">
          <Button>Quay lại danh sách đơn</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <button onClick={() => navigate('/my-bookings')} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              ← Đơn đặt tour của tôi
            </button>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">{tour?.title || 'Chi tiết đơn đặt tour'}</h1>
          </div>
          <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ${BOOKING_STATUS_COLORS[booking.status]}`}>
            {BOOKING_STATUS_LABELS[booking.status]}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            {departure && (
              <section className="bg-white rounded-lg border border-slate-100 shadow-sm p-5 sm:p-6">
                <h2 className="text-lg font-bold text-slate-900">Lịch khởi hành</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {formatDate(departure.departureDate || '')} - {formatDate(departure.returnDate || '')}
                </p>
              </section>
            )}

            <section className="bg-white rounded-lg border border-slate-100 shadow-sm p-5 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900">Thông tin liên hệ</h2>
              <div className="mt-3 space-y-1 text-sm text-slate-600">
                <p>Họ tên: <span className="font-medium text-slate-800">{booking.contactInfo.name}</span></p>
                <p>Email: <span className="font-medium text-slate-800">{booking.contactInfo.email}</span></p>
                <p>Điện thoại: <span className="font-medium text-slate-800">{booking.contactInfo.phone}</span></p>
              </div>
            </section>

            <section className="bg-white rounded-lg border border-slate-100 shadow-sm p-5 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900">Danh sách hành khách</h2>
              <div className="mt-3 divide-y divide-slate-100">
                {booking.passengers.map((passenger, index) => (
                  <div key={index} className="flex items-center justify-between py-2 text-sm">
                    <span className="font-medium text-slate-800">{passenger.fullName}</span>
                    <span className="text-slate-500">{passengerTypeLabels[passenger.type] || passenger.type}</span>
                  </div>
                ))}
              </div>
            </section>

            {booking.specialRequests && (
              <section className="bg-white rounded-lg border border-slate-100 shadow-sm p-5 sm:p-6">
                <h2 className="text-lg font-bold text-slate-900">Yêu cầu đặc biệt</h2>
                <p className="mt-2 text-sm text-slate-600">{booking.specialRequests}</p>
              </section>
            )}
          </div>

          <aside className="bg-white rounded-lg border border-slate-100 shadow-sm p-5 sm:p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-slate-900">Chi tiết thanh toán</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4"><span>Người lớn / trẻ em / em bé</span><span>{formatPrice(booking.priceBreakdown.adultTotal)}</span></div>
              <div className="flex justify-between gap-4"><span>Phụ thu phòng đơn</span><span>{formatPrice(booking.priceBreakdown.singleRoomSurcharge)}</span></div>
              {booking.priceBreakdown.discount > 0 && (
                <div className="flex justify-between gap-4 text-emerald-600">
                  <span>Giảm giá{booking.promoCode ? ` (${booking.promoCode})` : ''}</span>
                  <span>-{formatPrice(booking.priceBreakdown.discount)}</span>
                </div>
              )}
              <div className="border-t border-slate-100 pt-3 flex justify-between gap-4 text-base font-bold text-slate-900">
                <span>Tổng cộng</span>
                <span className="text-blue-600">{formatPrice(booking.priceBreakdown.total)}</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400">Đặt ngày: {formatDateTime(booking.createdAt)}</p>

            {booking.status === 'pending' && (
              <Button variant="outline" className="mt-5 w-full" onClick={handleCancel}>
                Huỷ đơn đặt tour
              </Button>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
