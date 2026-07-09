import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import { adminApi, type AdminTourPayload } from '@/api/adminApi';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Modal from '@/components/ui/Modal';
import type { Tour, TourType } from '@/types/tour';
import { formatPrice } from '@/utils/formatters';

const emptyForm: AdminTourPayload = {
  title: '',
  slug: '',
  description: '',
  destination: '',
  departureFrom: '',
  duration: { days: 1, nights: 0 },
  type: 'domestic',
  price: { adult: 0, child: 0, infant: 0, singleRoomSurcharge: 0 },
  maxGroupSize: 0,
  minGroupSize: 0,
  thumbnail: '',
  images: [],
  highlights: [],
  includes: [],
  excludes: [],
  tags: [],
  isActive: true,
  isFeatured: false,
};

const tourTypeLabels: Record<TourType, string> = {
  domestic: 'Trong nước',
  international: 'Quốc tế',
  adventure: 'Phiêu lưu',
  cultural: 'Văn hóa',
};

const splitLines = (value: string) => value.split('\n').map((item) => item.trim()).filter(Boolean);
const splitComma = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);
const joinLines = (value?: string[]) => (value ?? []).join('\n');
const joinComma = (value?: string[]) => (value ?? []).join(', ');

export default function TourManagePage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [form, setForm] = useState({
    ...emptyForm,
    imagesText: '',
    highlightsText: '',
    includesText: '',
    excludesText: '',
    tagsText: '',
  });

  const fetchTours = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getTours({ limit: 100, search: search || undefined });
      setTours(res.data ?? []);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách tour');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  const activeCount = useMemo(() => tours.filter((tour) => tour.isActive).length, [tours]);

  const openCreateModal = () => {
    setEditingTour(null);
    setForm({
      ...emptyForm,
      imagesText: '',
      highlightsText: '',
      includesText: '',
      excludesText: '',
      tagsText: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (tour: Tour) => {
    setEditingTour(tour);
    setForm({
      title: tour.title,
      slug: tour.slug,
      description: tour.description ?? '',
      destination: tour.destination ?? '',
      departureFrom: tour.departureFrom ?? '',
      duration: tour.duration,
      type: tour.type,
      price: {
        adult: tour.price.adult,
        child: tour.price.child ?? 0,
        infant: tour.price.infant ?? 0,
        singleRoomSurcharge: tour.price.singleRoomSurcharge ?? 0,
      },
      maxGroupSize: tour.maxGroupSize ?? 0,
      minGroupSize: tour.minGroupSize ?? 0,
      thumbnail: tour.thumbnail ?? '',
      images: tour.images ?? [],
      highlights: tour.highlights ?? [],
      includes: tour.includes ?? [],
      excludes: tour.excludes ?? [],
      tags: tour.tags ?? [],
      isActive: tour.isActive,
      isFeatured: tour.isFeatured,
      imagesText: joinComma(tour.images),
      highlightsText: joinLines(tour.highlights),
      includesText: joinLines(tour.includes),
      excludesText: joinLines(tour.excludes),
      tagsText: joinComma(tour.tags),
    });
    setIsModalOpen(true);
  };

  const buildPayload = (): AdminTourPayload => ({
    title: form.title.trim(),
    slug: form.slug?.trim() || form.title.trim().toLowerCase().replace(/\s+/g, '-'),
    description: form.description?.trim(),
    destination: form.destination?.trim(),
    departureFrom: form.departureFrom?.trim(),
    duration: {
      days: Number(form.duration.days) || 1,
      nights: Number(form.duration.nights) || 0,
    },
    type: form.type,
    price: {
      adult: Number(form.price.adult) || 0,
      child: Number(form.price.child) || 0,
      infant: Number(form.price.infant) || 0,
      singleRoomSurcharge: Number(form.price.singleRoomSurcharge) || 0,
    },
    maxGroupSize: Number(form.maxGroupSize) || undefined,
    minGroupSize: Number(form.minGroupSize) || undefined,
    thumbnail: form.thumbnail?.trim(),
    images: splitComma(form.imagesText),
    highlights: splitLines(form.highlightsText),
    includes: splitLines(form.includesText),
    excludes: splitLines(form.excludesText),
    tags: splitComma(form.tagsText),
    isActive: form.isActive,
    isFeatured: form.isFeatured,
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = buildPayload();

    if (!payload.title || payload.price.adult <= 0) {
      toast.warning('Vui lòng nhập tên tour và giá người lớn hợp lệ');
      return;
    }

    setSaving(true);
    try {
      if (editingTour) {
        await adminApi.updateTour(editingTour._id, payload);
        toast.success('Đã cập nhật tour');
      } else {
        await adminApi.createTour(payload);
        toast.success('Đã thêm tour mới');
      }
      setIsModalOpen(false);
      await fetchTours();
    } catch (err) {
      console.error(err);
      toast.error('Không thể lưu tour');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tour: Tour) => {
    if (!window.confirm(`Xóa tour "${tour.title}"?`)) return;

    try {
      await adminApi.deleteTour(tour._id);
      toast.success('Đã xóa tour');
      await fetchTours();
    } catch (err) {
      console.error(err);
      toast.error('Không thể xóa tour');
    }
  };

  const handleToggleActive = async (tour: Tour) => {
    const payload: AdminTourPayload = {
      ...tour,
      isActive: !tour.isActive,
    };

    try {
      await adminApi.updateTour(tour._id, payload);
      toast.success('Đã cập nhật trạng thái tour');
      await fetchTours();
    } catch (err) {
      console.error(err);
      toast.error('Không thể cập nhật trạng thái tour');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Tour</h1>
          <p className="text-slate-500 mt-1">{tours.length} tour, {activeCount} đang hoạt động</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && fetchTours()}
            placeholder="Tìm theo tên, điểm đến..."
            className="w-full sm:w-72 rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <Button variant="outline" onClick={fetchTours}>Tìm</Button>
          <Button onClick={openCreateModal}>+ Thêm Tour</Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <Loading text="Đang tải tour..." />
        ) : tours.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Chưa có tour phù hợp.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Tour</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Loại</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Thời lượng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Giá</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Trạng thái</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tours.map((tour) => (
                  <tr key={tour._id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3 min-w-72">
                        <img src={tour.thumbnail || tour.images?.[0] || '/vite.svg'} alt={tour.title} className="w-14 h-14 rounded-lg object-cover bg-slate-100" />
                        <div>
                          <p className="font-semibold text-slate-900">{tour.title}</p>
                          <p className="text-sm text-slate-500">{tour.destination || 'Chưa có điểm đến'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{tourTypeLabels[tour.type] ?? tour.type}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{tour.duration.days} ngày {tour.duration.nights} đêm</td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">{formatPrice(tour.price.adult)}</td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleToggleActive(tour)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${tour.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                      >
                        {tour.isActive ? 'Đang mở' : 'Đang ẩn'}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditModal(tour)}>Sửa</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(tour)}>Xóa</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTour ? 'Sửa tour' : 'Thêm tour'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Tên tour</span>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Slug</span>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Loại tour</span>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TourType })} className="w-full rounded-lg border border-slate-200 px-3 py-2">
                {Object.entries(tourTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Điểm đến</span>
              <input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Khởi hành từ</span>
              <input value={form.departureFrom} onChange={(e) => setForm({ ...form, departureFrom: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Số ngày</span>
              <input type="number" min="1" value={form.duration.days} onChange={(e) => setForm({ ...form, duration: { ...form.duration, days: Number(e.target.value) } })} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Số đêm</span>
              <input type="number" min="0" value={form.duration.nights} onChange={(e) => setForm({ ...form, duration: { ...form.duration, nights: Number(e.target.value) } })} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Giá người lớn</span>
              <input type="number" min="0" value={form.price.adult} onChange={(e) => setForm({ ...form, price: { ...form.price, adult: Number(e.target.value) } })} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Giá trẻ em</span>
              <input type="number" min="0" value={form.price.child} onChange={(e) => setForm({ ...form, price: { ...form.price, child: Number(e.target.value) } })} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Ảnh thumbnail</span>
              <input value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Danh sách ảnh, cách nhau bằng dấu phẩy</span>
              <input value={form.imagesText} onChange={(e) => setForm({ ...form, imagesText: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Mô tả</span>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Điểm nổi bật, mỗi dòng một ý</span>
              <textarea value={form.highlightsText} onChange={(e) => setForm({ ...form, highlightsText: e.target.value })} rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Đang hoạt động
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
              Tour nổi bật
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit" isLoading={saving}>{editingTour ? 'Lưu thay đổi' : 'Thêm tour'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
