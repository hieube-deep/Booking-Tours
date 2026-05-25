export default function UserManagePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Quản lý Users</h1>
        <p className="text-slate-500 mt-1">Xem và quản lý tài khoản người dùng</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 text-center text-slate-400">
          <p className="text-lg">Danh sách người dùng sẽ hiển thị ở đây...</p>
        </div>
      </div>
    </div>
  );
}
