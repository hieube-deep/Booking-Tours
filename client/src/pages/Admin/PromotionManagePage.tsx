import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import { adminApi, type AdminPromotionPayload } from '@/api/adminApi';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Modal from '@/components/ui/Modal';
import type { Promotion, PromotionType } from '@/types/promotion';
import type { Tour } from '@/types/tour';
import { formatDate, formatPrice } from '@/utils/formatters';
import { getErrorMessage } from '@/utils/errors';

const toDateInputValue = (value?: string) => (value ? value.slice(0, 10) : '');

const emptyForm: AdminPromotionPayload = {
  code: '',
  type: 'percent',
  value: 10,
  minOrderValue: 0,
  maxDiscount: undefined,
  usageLimit: undefined,
  applicableTours: [],
  startDate: '',
  endDate: '',
  isActive: true,
};

export default function PromotionManagePage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [form, setForm] = useState<AdminPromotionPayload>(emptyForm);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPromotions({ limit: 100 });
      setPromotions(res.data ?? []);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  const fetchTours = async () => {
    try {
      const res = await adminApi.getTours({ limit: 100 });
      setTours(res.data ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPromotions();
    fetchTours();
  }, []);

  const openCreateModal = () => {
    setEditingPromotion(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setForm({
      code: promotion.code,
      type: promotion.type,
      value: promotion.value,
      minOrderValue: promotion.minOrderValue,
      maxDiscount: promotion.maxDiscount,
      usageLimit: promotion.usageLimit,
      applicableTours: promotion.applicableTours,
      startDate: toDateInputValue(promotion.startDate),
      endDate: toDateInputValue(promotion.endDate),
      isActive: promotion.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.code.trim() || !form.value) {
      toast.warning('Vui lòng nhập mã giảm giá và giá trị giảm hợp lệ');
      return;
    }

    const payload: AdminPromotionPayload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    };

    setSaving(true);
    try {
      if (editingPromotion) {
        await adminApi.updatePromotion(editingPromotion._id, payload);
        toast.success('Đã cập nhật mã giảm giá');
      } else {
        await adminApi.createPromotion(payload);
        toast.success('Đã thêm mã giảm giá mới');
      }
      setIsModalOpen(false);
      await fetchPromotions();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Không thể lưu mã giảm giá'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (promotion: Promotion) => {
    if (!window.confirm(`Xóa mã giảm giá "${promotion.code}"?`)) return;

    try {
      await adminApi.deletePromotion(promotion._id);
      toast.success('Đã xóa mã giảm giá');
      await fetchPromotions();
    } catch (err) {
      console.error(err);
      toast.error('Không thể xóa mã giảm giá');
    }
  };

  const handleToggleActive = async (promotion: Promotion) => {
    try {
      await adminApi.updatePromotion(promotion._id, { ...promotion, isActive: !promotion.isActive });
      toast.success('Đã cập nhật trạng thái mã giảm giá');
      await fetchPromotions();
    } catch (err) {
      console.error(err);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Mã giảm giá</h1>
          <p className="text-slate-500 mt-1">{promotions.length} mã giảm giá</p>
        </div>
        <Button onClick={openCreateModal}>+ Thêm mã giảm giá</Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <Loading text="Đang tải mã giảm giá..." />
        ) : promotions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Chưa có mã giảm giá nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Mã</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Giảm giá</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Đơn tối thiểu</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Đã dùng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Hạn dùng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Trạng thái</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {promotions.map((promotion) => (
                  <tr key={promotion._id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-semibold text-slate-900">{promotion.code}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {promotion.type === 'percent' ? `${promotion.value}%` : formatPrice(promotion.value)}
                      {promotion.maxDiscount ? ` (tối đa ${formatPrice(promotion.maxDiscount)})` : ''}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{formatPrice(promotion.minOrderValue || 0)}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{promotion.usedCount}{promotion.usageLimit ? ` / ${promotion.usageLimit}` : ''}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {promotion.endDate ? formatDate(promotion.endDate) : 'Không giới hạn'}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleToggleActive(promotion)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${promotion.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                      >
                        {promotion.isActive ? 'Đang bật' : 'Đang tắt'}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditModal(promotion)}>Sửa</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(promotion)}>Xóa</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPromotion ? 'Sửa mã giảm giá' : 'Thêm mã giảm giá'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Mã code</span>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full rounded-lg border border-slate-200 px-3 py-2 uppercase" placeholder="WELCOME10" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Loại giảm giá</span>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PromotionType })} className="w-full rounded-lg border border-slate-200 px-3 py-2">
                <option value="percent">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (đ)</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Giá trị giảm</span>
              <input type="number" min="0" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Giảm tối đa (đ, nếu là %)</span>
              <input type="number" min="0" value={form.maxDiscount ?? ''} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value ? Number(e.target.value) : undefined })} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Đơn hàng tối thiểu (đ)</span>
              <input type="number" min="0" value={form.minOrderValue ?? 0} onChange={(e) => setForm({ ...form, minOrderValue: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Giới hạn lượt dùng</span>
              <input type="number" min="0" value={form.usageLimit ?? ''} onChange={(e) => setForm({ ...form, usageLimit: e.target.value ? Number(e.target.value) : undefined })} className="w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="Không giới hạn" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Ngày bắt đầu</span>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Ngày kết thúc</span>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">Áp dụng cho tour (không chọn = áp dụng tất cả)</span>
              <select
                multiple
                value={form.applicableTours}
                onChange={(e) => setForm({ ...form, applicableTours: Array.from(e.target.selectedOptions, (o) => o.value) })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 h-28"
              >
                {tours.map((tour) => (
                  <option key={tour._id} value={tour._id}>{tour.title}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Đang bật
          </label>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit" isLoading={saving}>{editingPromotion ? 'Lưu thay đổi' : 'Thêm mã giảm giá'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
