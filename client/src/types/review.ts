export interface Review {
  _id: string;
  user: string | {
    _id: string;
    name: string;
    avatar?: string;
  };
  tour: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  tourId: string;
  rating: number;
  comment: string;
}
