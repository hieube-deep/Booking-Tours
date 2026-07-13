import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import { adminApi, type AdminDeparturePayload } from '@/api/adminApi';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Modal from '@/components/ui/Modal';
import type { Departure, DepartureStatus } from '@/types/departure';
import type { Tour } from '@/types/tour';
import { formatDate } from '@/utils/formatters';
import { getErrorMessage } from '@/utils/errors';

const statusLabels: Record<DepartureStatus, string> = {
  open: 'Đang mở',
  confirmed: 'Đã xác nhận',
  full: 'Đã đầy',
  cancelled: 'Đã hủy',
};

const toDateInputValue = (value?: string) => (value ? value.slice(0, 10) : '');

const emptyForm = (tourId: string): AdminDeparturePayload => ({
  tourId,
  departureDate: '',
  returnDate: '',
  status: 'open',
  maxSlots: 20,
  bookedSlots: 0,
});

export default function DepartureManagePage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedTourId, setSelectedTourId] = useState('');
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeparture, setEditingDeparture] = useState<Departure | null>(null);
  const [form, setForm] = useState<AdminDeparturePayload>(emptyForm(''));

  const fetchTours = async () => {
    try {
      const res = await adminApi.getTours({ limit: 100 });
      const list = res.data ?? [];
      setTours(list);
      if (list.length > 0) {
        setSelectedTourId((prev) => prev || list[0]._id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách tour');
    }
  };

  const fetchDepartures = async (tourId: string) => {
    if (!tourId) return;
    setLoading(true);
    try {
      const res = await adminApi.getDepartures({ tourId, limit: 100 });
      setDepartures(res.data ?? []);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải lịch khởi hành');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  useEffect(() => {
    if (selectedTourId) fetchDepartures(selectedTourId);
  }, [selectedTourId]);

  const openCreateModal = () => {
    setEditingDeparture(null);
    setForm(emptyForm(selectedTourId));
    setIsModalOpen(true);
  };

  const openEditModal = (departure: Departure) => {
    setEditingDeparture(departure);
    setForm({
      tourId: departure.tourId,
      departureDate: toDateInputValue(departure.departureDate),
      returnDate: toDateInputValue(departure.returnDate),
      status: departure.status,
      maxSlots: departure.maxSlots,
      bookedSlots: departure.bookedSlots,
      priceOverride: departure.priceOverride,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.departureDate || !form.returnDate || !form.maxSlots) {
      toast.warning('Vui lòng nhập đầy đủ ngày khởi hành, ngày về và số chỗ tối đa');
      return;
    }

    setSaving(true);
    try {
      if (editingDeparture) {
        await adminApi.updateDeparture(editingDeparture._id, form);
        toast.success('Đã cập nhật lịch khởi hành');
      } else {
        await adminApi.createDeparture(form);
        toast.success('Đã thêm lịch khởi hành mới');
      }
      setIsModalOpen(false);
      await fetchDepartures(selectedTourId);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Không thể lưu lịch khởi hành'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (departure: Departure) => {
    if (!window.confirm(`Xóa lịch khởi hành ${formatDate(departure.departureDate)}?`)) return;

    try {
      await adminApi.deleteDeparture(departure._id);
      toast.success('Đã xóa lịch khởi hành');
      await fetchDepartures(selectedTourId);
    } catch (err) {
      console.error(err);
      toast.error('Không thể xóa lịch khởi hành');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Lịch khởi hành</h1>
          <p className="text-slate-500 mt-1">{departures.length} lịch khởi hành cho tour đang chọn</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedTourId}
            onChange={(event) => setSelectedTourId(event.target.value)}
            className="w-full sm:w-72 rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            {tours.map((tour) => (
              <option key={tour._id} value={tour._id}>{tour.title}</option>
            ))}
          </select>
          <Button onClick={openCreateModal} disabled={!selectedTourId}>+ Thêm lịch khởi hành</Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <Loading text="Đang tải lịch khởi hành..." />
        ) : departures.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Tour này chưa có lịch khởi hành nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Ngày đi</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Ngày về</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Chỗ tối đa</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Đã đặt</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Trạng thái</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departures.map((departure) => (
                  <tr key={departure._id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-sm font-medium text-slate-900">{formatDate(departure.departureDate)}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{formatDate(departure.returnDate)}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{departure.maxSlots}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{departure.bookedSlots}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700">
                        {statusLabels[departure.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditModal(departure)}>Sửa</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(departure)}>Xóa</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDeparture ? 'Sửa lịch khởi hành' : 'Thêm lịch khởi hành'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Ngày khởi hành</span>
              <input type="date" value={form.departureDate} onChange={(e) => setForm({ ...form, departureDate: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Ngày về</span>
              <input type="date" value={form.returnDate} onChange={(e) => setForm({ ...form, returnDate: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Số chỗ tối đa</span>
              <input type="number" min="1" value={form.maxSlots} onChange={(e) => setForm({ ...form, maxSlots: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Đã đặt</span>
              <input type="number" min="0" value={form.bookedSlots} onChange={(e) => setForm({ ...form, bookedSlots: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">Trạng thái</span>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as DepartureStatus })} className="w-full rounded-lg border border-slate-200 px-3 py-2">
                {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Giá người lớn riêng (tùy chọn)</span>
              <input type="number" min="0" value={form.priceOverride?.adult ?? ''} onChange={(e) => setForm({ ...form, priceOverride: { ...form.priceOverride, adult: e.target.value ? Number(e.target.value) : undefined } })} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Giá trẻ em riêng (tùy chọn)</span>
              <input type="number" min="0" value={form.priceOverride?.child ?? ''} onChange={(e) => setForm({ ...form, priceOverride: { ...form.priceOverride, child: e.target.value ? Number(e.target.value) : undefined } })} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit" isLoading={saving}>{editingDeparture ? 'Lưu thay đổi' : 'Thêm lịch khởi hành'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
