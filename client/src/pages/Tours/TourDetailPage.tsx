import { useParams } from 'react-router-dom';
import Loading from '@/components/ui/Loading';

export default function TourDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Loading text={`Đang tải thông tin tour "${slug}"...`} />
    </div>
  );
}
