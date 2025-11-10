// src/api/services/favorites.api.ts
import api from '@/api/client';
import type { PaginatedFavorites } from '@/types';

// Добавление товара в избранное (уже есть)
export const addFavorite = async (productId: number): Promise<void> => {
  await api.post('/favorites/items', { product_id: productId });
};

// Удаление товара из избранного (уже есть)
export const removeFavorite = async (productId: number): Promise<void> => {
  await api.delete(`/favorites/items/${productId}`);
};

// НОВАЯ ФУНКЦИЯ: Получение списка избранных с пагинацией
interface GetFavoritesParams {
  page?: number;
  size?: number;
}

export const getFavorites = async ({ page = 1, size = 10 }: GetFavoritesParams): Promise<PaginatedFavorites> => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  const { data } = await api.get<PaginatedFavorites>('/favorites', { params });
  return data;
};