import { useEffect, useMemo, useState } from 'react';
import { adminApi, type DashboardStats } from '@/api/adminApi';
import Loading from '@/components/ui/Loading';
import { formatPrice } from '@/utils/formatters';

const statusLabels: Record<string, string> = {
  pending: 'Chờ xử lý',
  success: 'Thành công',
  failed: 'Thất bại',
  cancelled: 'Đã hủy',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminApi.getDashboard();
        setStats(res.data ?? null);
      } catch (err) {
        console.error(err);
        setError('Không thể tải thống kê dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const cards = useMemo(() => [
    { label: 'Người dùng', value: stats?.totalUsers ?? 0, tone: 'bg-blue-50 text-blue-700', icon: '👥' },
    { label: 'Booking', value: stats?.totalBookings ?? 0, tone: 'bg-emerald-50 text-emerald-700', icon: '📋' },
    { label: 'Doanh thu tháng', value: formatPrice(stats?.monthRevenue ?? 0), tone: 'bg-amber-50 text-amber-700', icon: '₫' },
    { label: 'Tour hoạt động', value: stats?.activeTours ?? 0, tone: 'bg-rose-50 text-rose-700', icon: '✈' },
  ], [stats]);

  if (loading) return <Loading text="Đang tải dashboard..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Tổng quan hoạt động đặt tour</p>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{card.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-lg font-bold ${card.tone}`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-white rounded-lg shadow-sm border border-slate-100 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Booking theo trạng thái</h2>
          <div className="space-y-3">
            {(stats?.bookingsByStatus ?? []).length === 0 && (
              <p className="text-sm text-slate-500">Chưa có dữ liệu booking.</p>
            )}
            {(stats?.bookingsByStatus ?? []).map((item) => (
              <div key={item._id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <span className="text-sm text-slate-600">{statusLabels[item._id] ?? item._id}</span>
                <span className="font-semibold text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-slate-100 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">So sánh tháng</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-100 p-4">
              <p className="text-sm text-slate-500">Booking tháng này</p>
              <p className="text-xl font-bold text-slate-900 mt-2">{stats?.monthBookings ?? 0}</p>
            </div>
            <div className="rounded-lg border border-slate-100 p-4">
              <p className="text-sm text-slate-500">Booking tháng trước</p>
              <p className="text-xl font-bold text-slate-900 mt-2">{stats?.lastMonthBookings ?? 0}</p>
            </div>
            <div className="rounded-lg border border-slate-100 p-4 col-span-2">
              <p className="text-sm text-slate-500">Doanh thu tháng trước</p>
              <p className="text-xl font-bold text-slate-900 mt-2">{formatPrice(stats?.lastMonthRevenue ?? 0)}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
