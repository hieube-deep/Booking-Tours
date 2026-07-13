import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { bookingApi } from '@/api/bookingApi';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS } from '@/utils/constants';
import { formatDateTime, formatPrice } from '@/utils/formatters';
import { getErrorMessage } from '@/utils/errors';

export default function MyBookingsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings', page],
    queryFn: () => bookingApi.getMyBookings(page, 10),
  });

  const bookings = data?.data || [];
  const pagination = data?.pagination;

  const handleCancel = async (bookingId: string) => {
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
      await bookingApi.cancel(bookingId);
      toast.success('Đã huỷ đơn đặt tour');
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Không thể huỷ đơn đặt tour'));
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">Đơn đặt tour của tôi</h1>

        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Loading text="Đang tải danh sách đơn đặt tour..." />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <p className="text-slate-500 mb-4">Bạn chưa có đơn đặt tour nào.</p>
            <Link to="/tours">
              <Button>Khám phá tour ngay</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const tour = typeof booking.tourId === 'object' ? booking.tourId : undefined;
              return (
                <div key={booking._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex gap-4">
                      {tour?.thumbnail && (
                        <img src={tour.thumbnail} alt={tour.title} className="w-20 h-20 rounded-lg object-cover shrink-0" />
                      )}
                      <div>
                        <p className="font-bold text-slate-900">{tour?.title || 'Tour'}</p>
                        <p className="text-sm text-slate-500 mt-1">
                          {booking.totalAdults} người lớn, {booking.totalChildren} trẻ em, {booking.totalInfants} em bé
                        </p>
                        <p className="text-sm text-slate-500">Đặt ngày: {formatDateTime(booking.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${BOOKING_STATUS_COLORS[booking.status]}`}>
                        {BOOKING_STATUS_LABELS[booking.status]}
                      </span>
                      <p className="mt-2 text-lg font-bold text-blue-600">{formatPrice(booking.priceBreakdown.total)}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-3">
                    {booking.status === 'pending' && (
                      <Button variant="outline" size="sm" onClick={() => handleCancel(booking._id)}>
                        Huỷ đơn
                      </Button>
                    )}
                    <Link to={`/my-bookings/${booking._id}`}>
                      <Button size="sm">Xem chi tiết</Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: pagination.totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setPage(index + 1)}
                className={`w-9 h-9 rounded-lg text-sm font-semibold ${page === index + 1 ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
