// src/api/services/cart.api.ts
import api from '@/api';
import type { CartResponse } from '@/types';

// Получение содержимого корзины

interface GetCartParams {
  pointsToSpend?: number;
  couponCode?: string;
}

export const getCart = async (params: GetCartParams = {}): Promise<CartResponse> => {
  const { pointsToSpend, couponCode } = params;
  const searchParams = new URLSearchParams();

  if (pointsToSpend && pointsToSpend > 0) {
    searchParams.append('points_to_spend', String(pointsToSpend));
  }
  if (couponCode) {
    searchParams.append('coupon_code', couponCode);
  }

  const { data } = await api.get<CartResponse>('/cart', { params: searchParams });
  return data;
};

// Добавление/обновление товара
export const updateCartItem = async (productId: number, quantity: number): Promise<void> => {
  await api.post('/cart/items', { product_id: productId, quantity });
};

// Удаление товара
export const removeCartItem = async (productId: number): Promise<void> => {
  await api.delete(`/cart/items/${productId}`);
};

