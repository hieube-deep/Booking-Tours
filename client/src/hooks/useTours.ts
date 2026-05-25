import { useQuery } from '@tanstack/react-query';
import { tourApi } from '@/api/tourApi';
import type { TourFilters } from '@/types/tour';

export function useTours(filters?: TourFilters) {
  return useQuery({
    queryKey: ['tours', filters],
    queryFn: () => tourApi.getAll(filters),
  });
}

export function useTourDetail(slug: string) {
  return useQuery({
    queryKey: ['tour', slug],
    queryFn: () => tourApi.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useFeaturedTours() {
  return useQuery({
    queryKey: ['tours', 'featured'],
    queryFn: () => tourApi.getFeatured(),
  });
}
