import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { bookingApi } from '@/api/bookingApi';
import { useTourDetail } from '@/hooks/useTours';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { formatPrice } from '@/utils/formatters';

const toPositiveNumber = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

export default function BookingPage() {
  const { tourId } = useParams<{ tourId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [adults, setAdults] = useState(Math.max(toPositiveNumber(searchParams.get('adults'), 1), 1));
  const [children, setChildren] = useState(toPositiveNumber(searchParams.get('children'), 0));
  const [infants, setInfants] = useState(toPositiveNumber(searchParams.get('infants'), 0));
  const [singleRoom, setSingleRoom] = useState(searchParams.get('singleRoom') === '1');
  const [contactInfo, setContactInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [specialRequests, setSpecialRequests] = useState('');

  const { data: tourResponse, isLoading, isError } = useTourDetail(tourId || '');
  const tour = (tourResponse as any)?.tour || tourResponse?.data;

  const price = useMemo(() => {
    const adult = tour?.price?.adult || 0;
    const child = tour?.price?.child || 0;
    const infant = tour?.price?.infant || 0;
    const room = tour?.price?.singleRoomSurcharge || 0;
    const adultTotal = adults * adult;
    const childTotal = children * child + infants * infant;
    const singleRoomSurcharge = singleRoom ? adults * room : 0;

    return {
      adult,
      child,
      infant,
      room,
      adultTotal,
      childTotal,
      singleRoomSurcharge,
      total: adultTotal + childTotal + singleRoomSurcharge,
    };
  }, [adults, children, infants, singleRoom, tour]);

  const createBookingMutation = useMutation({
    mutationFn: () => bookingApi.create({
      tourId: tourId || '',
      passengers: { adults, children, infants },
      contactInfo,
      specialRequests: specialRequests.trim() || undefined,
      singleRoom,
      paymentMethod: 'vnpay',
    }),
    onSuccess: (res) => {
      toast.success('Đã tạo booking. Đang chuyển sang VNPAY...');
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
        return;
      }

      navigate(`/payment-result?status=pending&bookingId=${res.data?._id || ''}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Không thể tạo booking. Vui lòng thử lại.');
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!contactInfo.name.trim() || !contactInfo.email.trim() || !contactInfo.phone.trim()) {
      toast.warning('Vui lòng nhập đầy đủ họ tên, email và số điện thoại.');
      return;
    }

    createBookingMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading text="Đang tải thông tin đặt tour..." />
      </div>
    );
  }

  if (isError || !tour) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Không tìm thấy tour</h1>
        <p className="mt-2 text-slate-500">Tour không tồn tại hoặc đã ngừng hoạt động.</p>
        <Link to="/tours" className="mt-6 inline-flex">
          <Button>Quay lại danh sách tour</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Đặt tour và thanh toán VNPAY</p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">{tour.title}</h1>
          </div>
          <Link to={`/tours/${tour.slug || tourId}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            Quay lại chi tiết tour
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-lg border border-slate-100 shadow-sm p-5 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900">Thông tin liên hệ</h2>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Họ và tên</span>
                  <input
                    value={contactInfo.name}
                    onChange={(event) => setContactInfo({ ...contactInfo, name: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Nguyễn Văn A"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Email</span>
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={(event) => setContactInfo({ ...contactInfo, email: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="email@example.com"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Số điện thoại</span>
                  <input
                    value={contactInfo.phone}
                    onChange={(event) => setContactInfo({ ...contactInfo, phone: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="0901234567"
                  />
                </label>
              </div>
            </section>

            <section className="bg-white rounded-lg border border-slate-100 shadow-sm p-5 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900">Số lượng khách</h2>
              <div className="mt-5 space-y-4">
                {[
                  { label: 'Người lớn', note: formatPrice(price.adult), value: adults, min: 1, setValue: setAdults },
                  { label: 'Trẻ em', note: formatPrice(price.child), value: children, min: 0, setValue: setChildren },
                  { label: 'Em bé', note: formatPrice(price.infant), value: infants, min: 0, setValue: setInfants },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 p-4">
                    <div>
                      <p className="font-semibold text-slate-900">{item.label}</p>
                      <p className="text-sm text-slate-500">{item.note} / khách</p>
                    </div>
                    <div className="flex h-10 items-center overflow-hidden rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => item.setValue(Math.max(item.min, item.value - 1))}
                        className="h-full w-10 bg-slate-50 text-lg font-bold text-slate-500 hover:bg-slate-100"
                      >
                        -
                      </button>
                      <span className="w-12 text-center text-sm font-bold text-slate-800">{item.value}</span>
                      <button
                        type="button"
                        onClick={() => item.setValue(item.value + 1)}
                        className="h-full w-10 bg-slate-50 text-lg font-bold text-slate-500 hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}

                {price.room > 0 && (
                  <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 p-4">
                    <div>
                      <p className="font-semibold text-slate-900">Phụ thu phòng đơn</p>
                      <p className="text-sm text-slate-500">{formatPrice(price.room)} / người lớn</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={singleRoom}
                      onChange={(event) => setSingleRoom(event.target.checked)}
                      className="h-5 w-5 accent-blue-600"
                    />
                  </label>
                )}
              </div>
            </section>

            <section className="bg-white rounded-lg border border-slate-100 shadow-sm p-5 sm:p-6">
              <label className="block">
                <span className="text-lg font-bold text-slate-900">Yêu cầu đặc biệt</span>
                <textarea
                  value={specialRequests}
                  onChange={(event) => setSpecialRequests(event.target.value)}
                  rows={4}
                  className="mt-3 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Ví dụ: ăn chay, cần hỗ trợ xe đưa đón, ghi chú cho tư vấn viên..."
                />
              </label>
            </section>
          </div>

          <aside className="bg-white rounded-lg border border-slate-100 shadow-sm p-5 sm:p-6 lg:sticky lg:top-24">
            {tour.thumbnail && (
              <img src={tour.thumbnail} alt={tour.title} className="mb-4 h-40 w-full rounded-lg object-cover" />
            )}
            <h2 className="text-lg font-bold text-slate-900">Tóm tắt thanh toán</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4"><span>Người lớn</span><span>{formatPrice(price.adultTotal)}</span></div>
              <div className="flex justify-between gap-4"><span>Trẻ em / em bé</span><span>{formatPrice(price.childTotal)}</span></div>
              <div className="flex justify-between gap-4"><span>Phụ thu phòng đơn</span><span>{formatPrice(price.singleRoomSurcharge)}</span></div>
              <div className="border-t border-slate-100 pt-3 flex justify-between gap-4 text-base font-bold text-slate-900">
                <span>Tổng cộng</span>
                <span className="text-blue-600">{formatPrice(price.total)}</span>
              </div>
            </div>

            <div className="mt-5 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
              Thanh toán được thực hiện qua cổng VNPAY. Booking sẽ chuyển sang trạng thái thành công sau khi VNPAY xác nhận giao dịch.
            </div>

            <Button type="submit" className="mt-5 w-full" isLoading={createBookingMutation.isPending}>
              Thanh toán bằng VNPAY
            </Button>
          </aside>
        </form>
      </div>
    </div>
  );
}
