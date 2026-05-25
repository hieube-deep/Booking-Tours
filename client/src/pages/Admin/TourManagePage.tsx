export default function TourManagePage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Tour</h1>
          <p className="text-slate-500 mt-1">Thêm, sửa, xóa các tour du lịch</p>
        </div>
        <button className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer">
          + Thêm Tour
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 text-center text-slate-400">
          <p className="text-lg">Danh sách tour sẽ hiển thị ở đây...</p>
        </div>
      </div>
    </div>
  );
}
