export type DepartureStatus = 'open' | 'confirmed' | 'full' | 'cancelled';

export interface Departure {
  _id: string;
  tourId: string;
  departureDate: string;
  returnDate: string;
  status: DepartureStatus;
  maxSlots: number;
  bookedSlots: number;
  availableSlots: number;
  priceOverride?: {
    adult?: number;
    child?: number;
  };
  guide?: {
    name?: string;
    phone?: string;
    avatar?: string;
  };
  vehicle?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
