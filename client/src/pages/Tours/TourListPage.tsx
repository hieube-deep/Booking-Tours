import { tourApi } from '@/api/tourApi';
import Loading from '@/components/ui/Loading';
import type { Tour } from '@/types/tour';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';


export default function TourListPage() {
  const [tours, setTours] = useState<Tour[] | null>(null);
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await tourApi.getAll() as any;
        if (res && res.tours) {
          setTours(res.tours);
        }
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false);
      }
    }

    fetchTours();
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Tour du lịch</h1>
        <p className="text-slate-500 mt-2">Khám phá các tour hấp dẫn nhất</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        {['Tất cả', 'Trong nước', 'Quốc tế', 'Phiêu lưu', 'Văn hóa'].map((filter) => (
          <button
            key={filter}
            className="px-4 py-2 rounded-full text-sm font-medium border border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer first:bg-blue-600 first:text-white first:border-blue-600"
          >
            {filter}
          </button>
        ))}
      </div>

      {loading && <Loading text='Đang tải...' />}

      {loading === false && tours.length === 0 &&
        <p className='text-center text-slate-500 text-2l'>Không có tour nào</p>
      }

      {!loading && tours.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
          {tours.map((tour) => (
            <div
              key={tour._id}
              className="flex flex-col bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >

              <div className="relative w-full h-52 overflow-hidden">
                <img
                  src={tour.images[0]}
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
                    {tour.price.adult.toLocaleString('vi-VN')} đ
                  </span>

                  <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                    <Link to={`/tours/${tour.slug}`}>xem chi tiết</Link>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
