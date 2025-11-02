// src/api/services/cart.api.ts
import api from '@/api/client';
import type { CartItemUpdate, CartResponse } from '@/types';

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
export const updateCartItem = async ({ productId, quantity, variationId }: { productId: number; quantity: number; variationId?: number }): Promise<void> => {
  const payload: CartItemUpdate = {
    product_id: productId,
    quantity,
  };
  if (variationId) {
    payload.variation_id = variationId;
  }
  await api.post('/cart/items', payload);
};

// Обновляем removeCartItem
export const removeCartItem = async ({ productId, variationId }: { productId: number; variationId?: number }): Promise<void> => {
    const params = new URLSearchParams();
    if (variationId) {
        params.append('variation_id', String(variationId));
    }
    await api.delete(`/cart/items/${productId}`, { params });
};

