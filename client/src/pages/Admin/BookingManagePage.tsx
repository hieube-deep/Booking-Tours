import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { adminApi, type AdminBooking } from '@/api/adminApi';
import Loading from '@/components/ui/Loading';
import { formatDateTime, formatPrice } from '@/utils/formatters';

const statusLabels: Record<AdminBooking['status'], string> = {
  pending: 'Chờ xử lý',
  success: 'Thành công',
  failed: 'Thất bại',
  cancelled: 'Đã hủy',
};

const statusClasses: Record<AdminBooking['status'], string> = {
  pending: 'bg-amber-50 text-amber-700',
  success: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-700',
  cancelled: 'bg-slate-100 text-slate-600',
};

export default function BookingManagePage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getBookings({ limit: 100, status });
      setBookings(res.data ?? []);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách booking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [status]);

  const totalRevenue = useMemo(
    () => bookings.filter((booking) => booking.status === 'success').reduce((sum, booking) => sum + (booking.priceBreakdown?.total ?? 0), 0),
    [bookings]
  );

  const handleStatusChange = async (bookingId: string, nextStatus: AdminBooking['status']) => {
    try {
      await adminApi.updateBookingStatus(bookingId, nextStatus);
      toast.success('Đã cập nhật trạng thái booking');
      await fetchBookings();
    } catch (err) {
      console.error(err);
      toast.error('Không thể cập nhật trạng thái booking');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Booking</h1>
          <p className="text-slate-500 mt-1">{bookings.length} đơn trong bộ lọc hiện tại, doanh thu thành công {formatPrice(totalRevenue)}</p>
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="w-full sm:w-56 rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          <option value="all">Tất cả trạng thái</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <Loading text="Đang tải booking..." />
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Chưa có booking phù hợp.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Khách hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Tour</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Số khách</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Tổng tiền</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Ngày đặt</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 min-w-64">
                      <p className="font-semibold text-slate-900">{booking.contactInfo?.name || booking.userId?.name || 'Khách hàng'}</p>
                      <p className="text-sm text-slate-500">{booking.contactInfo?.email || booking.userId?.email}</p>
                      <p className="text-sm text-slate-500">{booking.contactInfo?.phone || booking.userId?.phone}</p>
                    </td>
                    <td className="px-4 py-4 min-w-64">
                      <p className="font-medium text-slate-900">{booking.departureId?.tourId?.title || 'Chưa có tour'}</p>
                      <p className="text-sm text-slate-500">{booking.departureId?.tourId?.destination || 'Chưa có điểm đến'}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {booking.totalAdults} người lớn, {booking.totalChildren} trẻ em, {booking.totalInfants} em bé
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">{formatPrice(booking.priceBreakdown?.total ?? 0)}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{formatDateTime(booking.createdAt)}</td>
                    <td className="px-4 py-4 min-w-44">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[booking.status]}`}>
                          {statusLabels[booking.status]}
                        </span>
                        <select
                          value={booking.status}
                          onChange={(event) => handleStatusChange(booking._id, event.target.value as AdminBooking['status'])}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                        >
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
