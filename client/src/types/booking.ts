export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'success';

export interface PriceBreakdown {
  adult: number;
  child: number;
  infant: number;
  singleRoomSurcharge: number;
  total: number;
}

export interface Passengers {
  adults: number;
  children: number;
  infants: number;
}

export interface Booking {
  _id: string;
  user: string;
  tour: string;
  departure: string;
  passengers: Passengers;
  priceBreakdown: PriceBreakdown;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  specialRequests?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  tourId: string;
  departureId: string;
  passengers: Passengers;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  specialRequests?: string;
}
