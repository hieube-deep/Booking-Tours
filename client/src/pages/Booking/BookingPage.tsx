import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { bookingApi } from '@/api/bookingApi';
import { promotionApi } from '@/api/promotionApi';
import { useTourDetail } from '@/hooks/useTours';
import { useDeparture } from '@/hooks/useDepartures';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { formatDate, formatPrice } from '@/utils/formatters';
import { getErrorMessage } from '@/utils/errors';
import type { PassengerInput } from '@/types/booking';

const toPositiveNumber = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const resizeNames = (names: string[], count: number) => {
  const next = names.slice(0, count);
  while (next.length < count) next.push('');
  return next;
};

export default function BookingPage() {
  const { tourId } = useParams<{ tourId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const departureId = searchParams.get('departureId') || undefined;

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

  const [adultNames, setAdultNames] = useState<string[]>(() => resizeNames([], adults));
  const [childNames, setChildNames] = useState<string[]>(() => resizeNames([], children));
  const [infantNames, setInfantNames] = useState<string[]>(() => resizeNames([], infants));

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);

  useEffect(() => setAdultNames((prev) => resizeNames(prev, adults)), [adults]);
  useEffect(() => setChildNames((prev) => resizeNames(prev, children)), [children]);
  useEffect(() => setInfantNames((prev) => resizeNames(prev, infants)), [infants]);

  const { data: tourResponse, isLoading, isError } = useTourDetail(tourId || '');
  const tour = (tourResponse as any)?.tour || tourResponse?.data;

  const { data: departureResponse } = useDeparture(departureId);
  const departure = departureResponse?.data;

  const price = useMemo(() => {
    const adult = departure?.priceOverride?.adult ?? tour?.price?.adult ?? 0;
    const child = departure?.priceOverride?.child ?? tour?.price?.child ?? 0;
    const infant = tour?.price?.infant || 0;
    const room = tour?.price?.singleRoomSurcharge || 0;
    const adultTotal = adults * adult;
    const childTotal = children * child + infants * infant;
    const singleRoomSurcharge = singleRoom ? adults * room : 0;
    const subtotal = adultTotal + childTotal + singleRoomSurcharge;
    const discount = appliedPromo?.discount || 0;

    return {
      adult,
      child,
      infant,
      room,
      adultTotal,
      childTotal,
      singleRoomSurcharge,
      subtotal,
      discount,
      total: Math.max(subtotal - discount, 0),
    };
  }, [adults, children, infants, singleRoom, tour, departure, appliedPromo]);

  const applyPromoMutation = useMutation({
    mutationFn: () => promotionApi.validate({
      code: promoCodeInput.trim(),
      tourId: tourId || '',
      subtotal: price.subtotal,
    }),
    onSuccess: (res) => {
      if (res.data) {
        setAppliedPromo({ code: res.data.code, discount: res.data.discount });
        toast.success(res.message || 'Áp dụng mã giảm giá thành công!');
      }
    },
    onError: (err) => {
      setAppliedPromo(null);
      toast.error(getErrorMessage(err, 'Mã giảm giá không hợp lệ.'));
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: () => {
      const passengers: PassengerInput[] = [
        ...adultNames.map((fullName) => ({ fullName: fullName.trim(), type: 'adult' as const })),
        ...childNames.map((fullName) => ({ fullName: fullName.trim(), type: 'child' as const })),
        ...infantNames.map((fullName) => ({ fullName: fullName.trim(), type: 'infant' as const })),
      ];

      return bookingApi.create({
        tourId: tourId || '',
        departureId,
        passengers,
        contactInfo,
        specialRequests: specialRequests.trim() || undefined,
        singleRoom,
        paymentMethod: 'vnpay',
        promoCode: appliedPromo?.code,
      });
    },
    onSuccess: (res) => {
      toast.success('Đã tạo booking. Đang chuyển sang VNPAY...');
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
        return;
      }

      navigate(`/payment-result?status=pending&bookingId=${res.data?._id || ''}`);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Không thể tạo booking. Vui lòng thử lại.'));
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!contactInfo.name.trim() || !contactInfo.email.trim() || !contactInfo.phone.trim()) {
      toast.warning('Vui lòng nhập đầy đủ họ tên, email và số điện thoại liên hệ.');
      return;
    }

    const allNames = [...adultNames, ...childNames, ...infantNames];
    if (allNames.some((name) => !name.trim())) {
      toast.warning('Vui lòng nhập đầy đủ họ tên cho tất cả hành khách.');
      return;
    }

    if (departure && adults + children + infants > departure.availableSlots) {
      toast.warning('Số lượng khách vượt quá số chỗ còn lại của chuyến khởi hành này.');
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
            {departure && (
              <section className="bg-white rounded-lg border border-slate-100 shadow-sm p-5 sm:p-6">
                <h2 className="text-lg font-bold text-slate-900">Ngày khởi hành đã chọn</h2>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-blue-50 px-4 py-3">
                  <span className="text-sm font-semibold text-blue-800">
                    {formatDate(departure.departureDate)} - {formatDate(departure.returnDate)}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600">
                    Còn {departure.availableSlots} chỗ
                  </span>
                </div>
              </section>
            )}

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
              <h2 className="text-lg font-bold text-slate-900">Thông tin hành khách</h2>
              <div className="mt-5 space-y-4">
                {adultNames.map((name, index) => (
                  <label key={`adult-${index}`} className="block">
                    <span className="text-sm font-medium text-slate-700">Người lớn {index + 1}</span>
                    <input
                      value={name}
                      onChange={(event) => setAdultNames((prev) => prev.map((n, i) => (i === index ? event.target.value : n)))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="Họ và tên"
                    />
                  </label>
                ))}
                {childNames.map((name, index) => (
                  <label key={`child-${index}`} className="block">
                    <span className="text-sm font-medium text-slate-700">Trẻ em {index + 1}</span>
                    <input
                      value={name}
                      onChange={(event) => setChildNames((prev) => prev.map((n, i) => (i === index ? event.target.value : n)))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="Họ và tên"
                    />
                  </label>
                ))}
                {infantNames.map((name, index) => (
                  <label key={`infant-${index}`} className="block">
                    <span className="text-sm font-medium text-slate-700">Em bé {index + 1}</span>
                    <input
                      value={name}
                      onChange={(event) => setInfantNames((prev) => prev.map((n, i) => (i === index ? event.target.value : n)))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="Họ và tên"
                    />
                  </label>
                ))}
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

            <div className="mt-4">
              <span className="text-sm font-medium text-slate-700">Mã giảm giá</span>
              <div className="mt-1.5 flex gap-2">
                <input
                  value={promoCodeInput}
                  onChange={(event) => setPromoCodeInput(event.target.value.toUpperCase())}
                  className="flex-1 min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="VD: WELCOME10"
                />
                <Button
                  type="button"
                  variant="outline"
                  isLoading={applyPromoMutation.isPending}
                  onClick={() => promoCodeInput.trim() && applyPromoMutation.mutate()}
                >
                  Áp dụng
                </Button>
              </div>
              {appliedPromo && (
                <p className="mt-1.5 text-xs font-semibold text-emerald-600">
                  Đã áp dụng mã "{appliedPromo.code}" — giảm {formatPrice(appliedPromo.discount)}
                </p>
              )}
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4"><span>Người lớn</span><span>{formatPrice(price.adultTotal)}</span></div>
              <div className="flex justify-between gap-4"><span>Trẻ em / em bé</span><span>{formatPrice(price.childTotal)}</span></div>
              <div className="flex justify-between gap-4"><span>Phụ thu phòng đơn</span><span>{formatPrice(price.singleRoomSurcharge)}</span></div>
              {price.discount > 0 && (
                <div className="flex justify-between gap-4 text-emerald-600"><span>Giảm giá</span><span>-{formatPrice(price.discount)}</span></div>
              )}
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
