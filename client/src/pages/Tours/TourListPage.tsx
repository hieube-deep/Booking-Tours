import Loading from '@/components/ui/Loading';

export default function TourListPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Tour du lịch</h1>
        <p className="text-slate-500 mt-2">Khám phá các tour hấp dẫn nhất</p>
      </div>

      {/* Filters - placeholder */}
      <div className="flex flex-wrap gap-3 mb-8">
        {['Tất cả', 'Trong nước', 'Quốc tế', 'Phiêu lưu', 'Văn hóa'].map((filter) => (
          <button
            key={filter}
            className="px-4 py-2 rounded-full text-sm font-medium border border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer first:bg-blue-600 first:text-white first:border-blue-600"
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Tours Grid - placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-full">
          <Loading text="Đang tải danh sách tour..." />
        </div>
      </div>
    </div>
  );
}
