import { useQuery } from '@tanstack/react-query';
import { departureApi } from '@/api/departureApi';

export function useDeparturesByTour(tourId?: string) {
  return useQuery({
    queryKey: ['departures', tourId],
    queryFn: () => departureApi.getByTour(tourId || ''),
    enabled: !!tourId,
  });
}

export function useDeparture(departureId?: string) {
  return useQuery({
    queryKey: ['departure', departureId],
    queryFn: () => departureApi.getById(departureId || ''),
    enabled: !!departureId,
  });
}
