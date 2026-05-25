export default function DashboardPage() {
  const stats = [
    { label: 'Tổng người dùng', value: '—', icon: '👥', color: 'from-blue-500 to-blue-600' },
    { label: 'Tổng booking', value: '—', icon: '📋', color: 'from-green-500 to-emerald-600' },
    { label: 'Doanh thu tháng', value: '—', icon: '💰', color: 'from-orange-500 to-amber-600' },
    { label: 'Tour đang hoạt động', value: '—', icon: '🌍', color: 'from-purple-500 to-violet-600' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Tổng quan hệ thống</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{stat.icon}</span>
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl opacity-10`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Placeholder content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center text-slate-400">
        <p className="text-lg">Dashboard content sẽ được phát triển thêm...</p>
      </div>
    </div>
  );
}
