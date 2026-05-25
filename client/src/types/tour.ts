export interface TourPrice {
  adult: number;
  child?: number;
  infant?: number;
  singleRoomSurcharge?: number;
}

export interface Meals {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

export interface ItineraryItem {
  day: number;
  title: string;
  description: string;
  meals: Meals;
  accommodation?: string;
}

export interface TourDuration {
  days: number;
  nights: number;
}

export type TourType = 'domestic' | 'international' | 'adventure' | 'cultural';

export interface Tour {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  highlights: string[];
  destination?: string;
  departureFrom?: string;
  duration: TourDuration;
  type: TourType;
  maxGroupSize?: number;
  minGroupSize?: number;
  price: TourPrice;
  includes: string[];
  excludes: string[];
  itinerary: ItineraryItem[];
  images: string[];
  thumbnail?: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TourFilters {
  type?: TourType;
  destination?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: number;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}
