import { Link, useSearchParams } from 'react-router-dom';
import { useTours } from '@/hooks/useTours';
import Loading from '@/components/ui/Loading';
import type { TourType } from '@/types/tour';
import { formatPrice } from '@/utils/formatters';

const categories: Array<{ label: string; value?: TourType; icon: string }> = [
  { label: 'Tất cả', icon: '🗺️' },
  { label: 'Trong nước', value: 'domestic', icon: '🇻🇳' },
  { label: 'Quốc tế', value: 'international', icon: '✈️' },
  { label: 'Phiêu lưu', value: 'adventure', icon: '🏔️' },
  { label: 'Văn hóa', value: 'cultural', icon: '🏯' },
];

export default function TourListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeType = (searchParams.get('type') as TourType | null) || undefined;

  const { data, isLoading } = useTours({ type: activeType, limit: 24 });
  const tours = data?.data || [];

  const handleSelectCategory = (value?: TourType) => {
    if (value) {
      setSearchParams({ type: value });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Tour du lịch</h1>
        <p className="text-slate-500 mt-2">Khám phá các tour hấp dẫn nhất</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((category) => {
          const isActive = activeType === category.value;
          return (
            <button
              key={category.label}
              onClick={() => handleSelectCategory(category.value)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${isActive
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50'
                }`}
            >
              <span>{category.icon}</span>
              {category.label}
            </button>
          );
        })}
      </div>

      {isLoading && <Loading text="Đang tải..." />}

      {!isLoading && tours.length === 0 && (
        <p className="text-center text-slate-500 text-2xl py-16">Không có tour nào phù hợp</p>
      )}

      {!isLoading && tours.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
          {tours.map((tour) => (
            <Link
              key={tour._id}
              to={`/tours/${tour.slug}`}
              className="flex flex-col bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="relative w-full h-52 overflow-hidden">
                <img
                  src={tour.thumbnail || tour.images[0]}
                  alt={tour.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col flex-1 p-5">
                <h3 className="text-xl font-semibold text-slate-900 mb-2 line-clamp-1">
                  {tour.title}
                </h3>

                <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-1">
                  {tour.description}
                </p>

                <div className="space-y-1 mb-4 text-sm text-slate-500 border-b border-slate-100 pb-3">
                  <p>{tour.duration.days} ngày {tour.duration.nights} đêm</p>
                  <p>Khởi hành: {tour.departureFrom}</p>
                </div>

                <div className="flex justify-between items-center mt-auto">
                  <span className="text-blue-600 font-bold text-xl">
                    {formatPrice(tour.price.adult)}
                  </span>

                  <span className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    Xem chi tiết
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
