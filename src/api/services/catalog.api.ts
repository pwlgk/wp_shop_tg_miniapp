// src/api/services/catalog.api.ts
import api from '@/api';
import type { ProductCategory, PaginatedProducts, Product, Banner } from '@/types';

// Получение всех категорий
export const getCategories = async (): Promise<ProductCategory[]> => {
  const { data } = await api.get<ProductCategory[]>('/categories');
  return data;
};

// Получение товаров с пагинацией и фильтрами
interface GetProductsParams {
  page?: number;
  size?: number;
  category?: number;
  orderby?: string;
  order?: 'asc' | 'desc';
  search?: string;
  sku?: string; // <-- ДОБАВЛЯЕМ ПОИСК ПО АРТИКУЛУ
}

export const getProducts = async ({
  page = 1,
  size = 10,
  category,
  orderby,
  order,
  sku,
  search, // <-- ДОБАВЛЯЕМ НОВЫЙ ПАРАМЕТР
}: GetProductsParams): Promise<PaginatedProducts> => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (category) params.append('category', String(category));
  if (orderby) params.append('orderby', orderby);
  if (order) params.append('order', order);
  if (sku) params.append('sku', sku);
  if (search) params.append('search', search); // <-- ДОБАВЛЯЕМ ЛОГИКУ

  const { data } = await api.get<PaginatedProducts>('/products', { params });
  return data;
};

export const getProductById = async (productId: number): Promise<Product> => {
  const { data } = await api.get<Product>(`/products/${productId}`);
  return data;
};

export const getBanners = async (): Promise<Banner[]> => {
  const { data } = await api.get<Banner[]>('/banners');
  return data;
};