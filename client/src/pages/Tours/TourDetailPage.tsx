import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTourDetail } from '@/hooks/useTours';
import { useDeparturesByTour } from '@/hooks/useDepartures';
import { reviewApi } from '@/api/reviewApi';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/ui/Loading';
import Button from '@/components/ui/Button';
import { toast } from 'react-toastify';
import { TOUR_TYPE_LABELS } from '@/utils/constants';
import { formatDate } from '@/utils/formatters';
import type { Departure } from '@/types/departure';

export default function TourDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();


  const [expandedDays, setExpandedDays] = useState<number[]>([1]);

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [singleRoom, setSingleRoom] = useState(false);
  const [selectedDepartureId, setSelectedDepartureId] = useState<string | null>(null);


  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState<number | null>(null);


  const { data: tourResponse, isLoading, isError } = useTourDetail(slug || '');
  const tour = (tourResponse as any)?.tour || tourResponse?.data;

  const { data: departuresResponse } = useDeparturesByTour(tour?._id);
  const departures = departuresResponse?.data || [];


  const { data: reviewsResponse, isLoading: isReviewsLoading } = useQuery({
    queryKey: ['reviews', tour?._id],
    queryFn: () => reviewApi.getByTour(tour?._id || ''),
    enabled: !!tour?._id,
  });
  const reviews = reviewsResponse?.data || [];


  const createReviewMutation = useMutation({
    mutationFn: (data: { tourId: string; rating: number; comment: string }) => reviewApi.create(data),
    onSuccess: (res) => {
      toast.success(res.message || 'Đăng đánh giá thành công!');
      setComment('');
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ['reviews', tour?._id] });
      queryClient.invalidateQueries({ queryKey: ['tour', slug] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Đã xảy ra lỗi khi đăng đánh giá.');
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading text={`Đang tải thông tin chi tiết tour...`} />
      </div>
    );
  }

  if (isError || !tour) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Không tìm thấy thông tin tour</h2>
        <p className="text-slate-500 mb-8">Đường dẫn không tồn tại hoặc tour này đã ngừng hoạt động.</p>
        <Link to="/tours">
          <Button variant="primary">Quay lại danh sách Tour</Button>
        </Link>
      </div>
    );
  }


  const adultPrice = tour.price.adult;
  const childPrice = tour.price.child || 0;
  const infantPrice = tour.price.infant || 0;
  const singleRoomSurcharge = tour.price.singleRoomSurcharge || 0;

  const totalPrice =
    adults * adultPrice +
    children * childPrice +
    infants * infantPrice +
    (singleRoom ? singleRoomSurcharge * adults : 0);


  const toggleDay = (day: number) => {
    if (expandedDays.includes(day)) {
      setExpandedDays(expandedDays.filter((d) => d !== day));
    } else {
      setExpandedDays([...expandedDays, day]);
    }
  };

  const expandAll = () => {
    const allDays = tour.itinerary.map((item: any) => item.day);
    setExpandedDays(allDays);
  };

  const collapseAll = () => {
    setExpandedDays([]);
  };

  const handleBooking = () => {
    if (departures.length > 0 && !selectedDepartureId) {
      toast.warning('Vui lòng chọn ngày khởi hành trước khi đặt tour.');
      return;
    }
    const departureParam = selectedDepartureId ? `&departureId=${selectedDepartureId}` : '';
    navigate(`/booking/${tour._id}?adults=${adults}&children=${children}&infants=${infants}&singleRoom=${singleRoom ? 1 : 0}${departureParam}`);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.warning('Vui lòng viết nội dung nhận xét trước khi gửi.');
      return;
    }
    createReviewMutation.mutate({
      tourId: tour._id,
      rating,
      comment: comment.trim()
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">

      <div className="bg-white border-b border-slate-100 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link to="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
            <span>/</span>
            <Link to="/tours" className="hover:text-blue-600 transition-colors">Tour du lịch</Link>
            <span>/</span>
            <span className="text-slate-800 font-medium truncate max-w-[200px] sm:max-w-xs">{tour.title}</span>
          </div>
          <Link to="/tours" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại danh sách tour
          </Link>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-[300px]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-blue-50 text-blue-600 uppercase mb-3 border border-blue-100">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
              {TOUR_TYPE_LABELS[tour.type] || tour.type}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {tour.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-500">

              <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg font-semibold border border-amber-100">
                <svg className="w-4 h-4 fill-amber-400 stroke-amber-400" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <span>{tour.rating?.toFixed(1) || '0.0'}</span>
                <span className="text-slate-400 font-normal">/ 5.0</span>
                <span className="text-xs text-slate-400 font-normal ml-0.5">({tour.reviewCount || 0} đánh giá)</span>
              </div>

              <div className="hidden sm:block text-slate-300">|</div>

              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Khởi hành: <span className="font-semibold text-slate-700">{tour.departureFrom}</span></span>
              </div>

              <div className="hidden sm:block text-slate-300">|</div>

              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21a2 2 0 012 2v10a2 2 0 01-2 2h-9l-1-1H5a2 2 0 01-2 2zm9-11a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Điểm đến: <span className="font-semibold text-slate-700">{tour.destination}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {tour.images && tour.images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-2xl overflow-hidden shadow-md">

            <div className="md:col-span-2 h-[260px] sm:h-[350px] md:h-[450px] relative overflow-hidden group">
              <img
                src={tour.images[0]}
                alt={`${tour.title} primary`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="hidden md:flex flex-col gap-3 h-[450px]">
              <div className="flex-1 relative overflow-hidden group">
                <img
                  src={tour.images[1] || tour.images[0]}
                  alt={`${tour.title} detail 1`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex-1 relative overflow-hidden group">
                <img
                  src={tour.images[2] || tour.images[0]}
                  alt={`${tour.title} detail 2`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-64 bg-slate-200 rounded-2xl flex items-center justify-center">
            <span className="text-slate-400 text-lg">Chưa cập nhật hình ảnh</span>
          </div>
        )}
      </div>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">


          <div className="lg:col-span-2 space-y-8">


            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Thời gian</p>
                  <p className="text-sm font-bold text-slate-700">{tour.duration.days} Ngày {tour.duration.nights} Đêm</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Phương tiện</p>
                  <p className="text-sm font-bold text-slate-700">Xe du lịch</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Số người tối đa</p>
                  <p className="text-sm font-bold text-slate-700">{tour.maxGroupSize || 20} người</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Bảo hiểm</p>
                  <p className="text-sm font-bold text-slate-700">Có đầy đủ</p>
                </div>
              </div>
            </div>


            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-4 mb-4">Mô tả Tour</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line text-justify">
                {tour.description}
              </p>
            </div>


            {tour.highlights && tour.highlights.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-4 mb-5">Điểm nổi bật hành trình</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tour.highlights.map((highlight: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-600 text-sm">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="leading-tight">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}


            {tour.itinerary && tour.itinerary.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-4 border-l-4 border-blue-600 pl-4 mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Lịch trình chi tiết</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={expandAll}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Mở rộng tất cả
                    </button>
                    <button
                      onClick={collapseAll}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Thu gọn tất cả
                    </button>
                  </div>
                </div>

                <div className="relative border-l border-slate-200 ml-3 pl-6 space-y-6">
                  {tour.itinerary.map((dayItem: any) => {
                    const isExpanded = expandedDays.includes(dayItem.day);
                    return (
                      <div key={dayItem.day} className="relative">

                        <div className={`absolute -left-[35px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all duration-300 ${isExpanded
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
                          : 'bg-white border-slate-300 text-slate-400'
                          }`}>
                          {dayItem.day}
                        </div>


                        <button
                          onClick={() => toggleDay(dayItem.day)}
                          className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer group"
                        >
                          <div className="pr-4">
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Ngày {dayItem.day}</span>
                            <h3 className="text-base sm:text-lg font-bold text-slate-800 mt-0.5 group-hover:text-blue-600 transition-colors">
                              {dayItem.title}
                            </h3>
                          </div>
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-all bg-slate-50 group-hover:bg-blue-50 ${isExpanded ? 'rotate-180 text-blue-600' : 'text-slate-400'}`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                          </span>
                        </button>


                        <div className={`mt-3 space-y-4 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                          }`}>
                          <p className="text-slate-600 text-sm leading-relaxed text-justify bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                            {dayItem.description}
                          </p>

                          <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                            {dayItem.accommodation && (
                              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                                🏠 Lưu trú: <span className="font-bold text-slate-700">{dayItem.accommodation}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                              🍽️ Ăn uống:
                              <span className="flex gap-1 ml-1">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-extrabold ${dayItem.meals?.breakfast ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400 line-through'}`}>Sáng</span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-extrabold ${dayItem.meals?.lunch ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400 line-through'}`}>Trưa</span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-extrabold ${dayItem.meals?.dinner ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400 line-through'}`}>Tối</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}


            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-4 mb-6">Điều khoản dịch vụ</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                <div>
                  <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">✓</span>
                    Dịch vụ bao gồm
                  </h3>
                  <ul className="space-y-3">
                    {tour.includes?.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2.5 text-slate-600 text-sm">
                        <span className="text-emerald-500 font-bold mt-0.5">✔</span>
                        <span className="leading-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-red-600">✕</span>
                    Dịch vụ không bao gồm
                  </h3>
                  <ul className="space-y-3">
                    {tour.excludes?.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2.5 text-slate-600 text-sm">
                        <span className="text-red-500 font-bold mt-0.5">✘</span>
                        <span className="leading-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>


            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-4 mb-6">Đánh giá từ khách hàng</h2>


              {isReviewsLoading ? (
                <div className="py-6 flex items-center justify-center">
                  <Loading size="sm" text="Đang tải đánh giá..." />
                </div>
              ) : reviews.length > 0 ? (
                <div className="divide-y divide-slate-100 mb-8 space-y-6">
                  {reviews.map((review: any) => {
                    const authorName = review.user?.name || 'Thành viên ẩn danh';
                    const avatarLetter = authorName.charAt(0).toUpperCase();
                    return (
                      <div key={review._id} className="pt-6 first:pt-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-3">

                            {review.user?.avatar ? (
                              <img
                                src={review.user.avatar}
                                alt={authorName}
                                className="w-10 h-10 rounded-full object-cover shadow-inner"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center font-bold text-sm shadow">
                                {avatarLetter}
                              </div>
                            )}
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm">{authorName}</h4>
                              <div className="flex items-center gap-2 mt-1">

                                <div className="flex text-amber-400">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400 stroke-amber-400' : 'text-slate-200 fill-transparent'}`}
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                  ))}
                                </div>
                                <span className="text-[11px] text-slate-400">
                                  {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm mt-3 pl-13 leading-relaxed whitespace-pre-line text-justify">
                          {review.comment}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 mb-8">
                  <p className="text-slate-400 text-sm mb-1">Chưa có đánh giá nào cho tour này.</p>
                  <p className="text-slate-500 font-medium text-xs">Hãy để lại trải nghiệm đầu tiên của bạn!</p>
                </div>
              )}

              <div className="border-t border-slate-100 pt-8">
                <h3 className="font-bold text-slate-800 text-lg mb-4">Gửi đánh giá của bạn</h3>
                {isAuthenticated ? (
                  <form onSubmit={handleSubmitReview} className="space-y-4">

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-500">Đánh giá của bạn:</span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const starVal = i + 1;
                          const isLit = hoverRating !== null ? starVal <= hoverRating : starVal <= rating;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setRating(starVal)}
                              onMouseEnter={() => setHoverRating(starVal)}
                              onMouseLeave={() => setHoverRating(null)}
                              className="text-2xl focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                            >
                              <svg
                                className={`w-7 h-7 transition-colors duration-150 ${isLit ? 'fill-amber-400 stroke-amber-400' : 'text-slate-200 fill-transparent'}`}
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                            </button>
                          );
                        })}
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
                        {rating} / 5
                      </span>
                    </div>


                    <div>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Hãy chia sẻ chi tiết về trải nghiệm chuyến đi của bạn (khách sạn, hướng dẫn viên, phương tiện...)"
                        rows={4}
                        className="w-full rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400 bg-slate-50/50 focus:bg-white"
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        isLoading={createReviewMutation.isPending}
                      >
                        Gửi đánh giá
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="p-6 bg-blue-50/55 border border-blue-100 rounded-xl text-center">
                    <p className="text-slate-600 text-sm mb-3">Bạn cần đăng nhập tài khoản để có thể đánh giá tour này.</p>
                    <Link to="/login" state={{ from: `/tours/${slug}` }}>
                      <Button variant="outline" size="sm">Đăng nhập ngay</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

          </div>
          <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">


            <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-5 text-white">
                <p className="text-xs uppercase tracking-wider font-extrabold text-blue-100">Giá tour trọn gói</p>
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <span className="text-2xl sm:text-3xl font-black">{adultPrice.toLocaleString('vi-VN')}</span>
                  <span className="text-sm font-semibold text-blue-50">đ / khách</span>
                </div>
              </div>

              <div className="p-6 space-y-5">

                {departures.length > 0 && (
                  <div className="space-y-3 border-b border-slate-100 pb-5">
                    <p className="text-sm font-bold text-slate-800">Chọn ngày khởi hành</p>
                    <div className="space-y-2">
                      {departures.map((departure: Departure) => {
                        const isSelected = selectedDepartureId === departure._id;
                        const isFull = departure.availableSlots <= 0;
                        return (
                          <button
                            key={departure._id}
                            type="button"
                            disabled={isFull}
                            onClick={() => setSelectedDepartureId(departure._id)}
                            className={`w-full text-left rounded-lg border px-4 py-2.5 transition-colors ${isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : isFull
                                ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                                : 'border-slate-200 hover:border-blue-300'
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-slate-800">
                                {formatDate(departure.departureDate)} - {formatDate(departure.returnDate)}
                              </span>
                              <span className={`text-xs font-semibold ${isFull ? 'text-red-500' : 'text-emerald-600'}`}>
                                {isFull ? 'Hết chỗ' : `Còn ${departure.availableSlots} chỗ`}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-4 border-b border-slate-100 pb-5">


                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Người lớn</p>
                      <p className="text-[11px] text-slate-400">Từ 12 tuổi trở lên</p>
                    </div>
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden h-9">
                      <button
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        className="w-9 h-full bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-500 font-bold border-r border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-bold text-slate-700 text-sm">{adults}</span>
                      <button
                        onClick={() => setAdults(adults + 1)}
                        className="w-9 h-full bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-500 font-bold border-l border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>


                  {tour.price.child !== undefined && (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Trẻ em</p>
                        <p className="text-[11px] text-slate-400">Từ 2 đến dưới 12 tuổi ({(tour.price.child).toLocaleString('vi-VN')} đ)</p>
                      </div>
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden h-9">
                        <button
                          onClick={() => setChildren(Math.max(0, children - 1))}
                          className="w-9 h-full bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-500 font-bold border-r border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-bold text-slate-700 text-sm">{children}</span>
                        <button
                          onClick={() => setChildren(children + 1)}
                          className="w-9 h-full bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-500 font-bold border-l border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}


                  {tour.price.infant !== undefined && (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Em bé</p>
                        <p className="text-[11px] text-slate-400">Dưới 2 tuổi ({(tour.price.infant).toLocaleString('vi-VN')} đ)</p>
                      </div>
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden h-9">
                        <button
                          onClick={() => setInfants(Math.max(0, infants - 1))}
                          className="w-9 h-full bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-500 font-bold border-r border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-bold text-slate-700 text-sm">{infants}</span>
                        <button
                          onClick={() => setInfants(infants + 1)}
                          className="w-9 h-full bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-500 font-bold border-l border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}


                  {tour.price.singleRoomSurcharge !== undefined && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Phụ thu phòng đơn</p>
                        <p className="text-[11px] text-slate-400">Yêu cầu phòng riêng (+{(tour.price.singleRoomSurcharge).toLocaleString('vi-VN')} đ / khách)</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={singleRoom}
                        onChange={(e) => setSingleRoom(e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                      />
                    </div>
                  )}

                </div>

                {/* Total Price Display */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-bold text-slate-500">Tổng cộng tạm tính:</span>
                  <span className="text-xl font-extrabold text-blue-600">{totalPrice.toLocaleString('vi-VN')} đ</span>
                </div>

                {/* Submit Booking button */}
                <Button
                  onClick={handleBooking}
                  className="w-full text-center py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-base rounded-xl transition-all shadow-md shadow-blue-100 hover:shadow-lg transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Đặt tour ngay
                </Button>

                <p className="text-[11px] text-center text-slate-400">
                  Đặt giữ chỗ miễn phí &bull; Hỗ trợ khách hàng 24/7 &bull; Không thu phí giao dịch
                </p>

              </div>
            </div>

            {/* Support Box */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <h4 className="font-bold text-slate-800 text-sm">Hỗ trợ quý khách hàng</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 text-xs">📞</div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase leading-none">Điện thoại</p>
                    <p className="text-xs font-bold text-slate-700 mt-1">1900 6000 (08:00 - 22:00)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600 shrink-0 text-xs">✉</div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase leading-none">Email</p>
                    <p className="text-xs font-bold text-slate-700 mt-1">support@booking-tours.com</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
