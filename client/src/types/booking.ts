import type { Tour } from './tour';

export type BookingStatus = 'pending' | 'success' | 'failed' | 'cancelled';

export interface PriceBreakdown {
  adultTotal: number;
  childTotal: number;
  singleRoomSurcharge: number;
  discount: number;
  total: number;
}

export interface Passengers {
  adults: number;
  children: number;
  infants: number;
}

export interface Booking {
  _id: string;
  userId: string;
  tourId?: Pick<Tour, '_id' | 'title' | 'slug' | 'destination' | 'thumbnail' | 'price' | 'duration' | 'departureFrom'> | string;
  departureId?: string;
  passengers: Array<{
    fullName: string;
    type: 'adult' | 'child' | 'infant';
  }>;
  totalAdults: number;
  totalChildren: number;
  totalInfants: number;
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
  departureId?: string;
  passengers: Passengers;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  specialRequests?: string;
  singleRoom?: boolean;
  paymentMethod?: 'vnpay' | 'cash';
}
