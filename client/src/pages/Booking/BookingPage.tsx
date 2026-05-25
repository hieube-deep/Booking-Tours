import { useParams } from 'react-router-dom';
import Loading from '@/components/ui/Loading';

export default function BookingPage() {
  const { tourId } = useParams<{ tourId: string }>();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Đặt tour</h1>
      <Loading text={`Đang tải thông tin đặt tour "${tourId}"...`} />
    </div>
  );
}
