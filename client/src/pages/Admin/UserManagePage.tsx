import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { adminApi } from '@/api/adminApi';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import type { User } from '@/types/user';
import { formatDate } from '@/utils/formatters';

export default function UserManagePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({ limit: 100, search: search || undefined });
      setUsers(res.data ?? []);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const adminCount = useMemo(() => users.filter((user) => user.role === 'admin').length, [users]);

  const handleRoleChange = async (user: User, role: User['role']) => {
    try {
      await adminApi.updateUserRole(user._id, role);
      toast.success('Đã cập nhật vai trò người dùng');
      await fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error('Không thể cập nhật vai trò');
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Xóa tài khoản "${user.name}"?`)) return;

    try {
      await adminApi.deleteUser(user._id);
      toast.success('Đã xóa người dùng');
      await fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error('Không thể xóa người dùng');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Users</h1>
          <p className="text-slate-500 mt-1">{users.length} tài khoản, {adminCount} admin</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && fetchUsers()}
            placeholder="Tìm tên, email, số điện thoại..."
            className="w-full sm:w-80 rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <Button variant="outline" onClick={fetchUsers}>Tìm</Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <Loading text="Đang tải người dùng..." />
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Chưa có người dùng phù hợp.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Người dùng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Liên hệ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Xác thực</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Ngày tạo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Vai trò</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 min-w-64">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">{user.name}</p>
                          <p className="text-sm text-slate-500">{user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 min-w-64">
                      <p className="text-sm text-slate-700">{user.email}</p>
                      <p className="text-sm text-slate-500">{user.phone || 'Chưa có số điện thoại'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {user.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-4">
                      <select
                        value={user.role}
                        onChange={(event) => handleRoleChange(user, event.target.value as User['role'])}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button size="sm" variant="danger" onClick={() => handleDelete(user)}>Xóa</Button>
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
