import axiosClient from './axiosClient';
import type { PromoValidationResult } from '@/types/promotion';
import type { ApiResponse } from '@/types/api';

export interface ValidatePromoRequest {
  code: string;
  tourId: string;
  subtotal: number;
}

export const promotionApi = {
  validate: (data: ValidatePromoRequest): Promise<ApiResponse<PromoValidationResult>> => {
    return axiosClient.post('/promotions/validate', data);
  },
};
