export type PromotionType = 'percent' | 'fixed';

export interface Promotion {
  _id: string;
  code: string;
  type: PromotionType;
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  applicableTours: string[];
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromoValidationResult {
  code: string;
  discount: number;
}
