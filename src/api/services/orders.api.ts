// src/api/services/orders.api.ts
import api from '@/api';
// ИСПРАВЛЕНИЕ: Убедимся, что тип PaginatedOrders импортируется, если он нужен
import type { Order, OrderCreate, PaginatedOrders } from '@/types';

export const getActiveOrders = async (): Promise<Order[]> => {
    const params = new URLSearchParams({ status: 'processing,on-hold', size: '5' });
    const { data } = await api.get<PaginatedOrders>('/orders', { params });
    return data.items;
};


interface GetOrdersParams {
  page?: number;
  size?: number;
  status?: string;
}

export const getOrdersHistory = async ({ page = 1, size = 10, status }: GetOrdersParams): Promise<PaginatedOrders> => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (status) {
    params.append('status', status);
  }
  const { data } = await api.get<PaginatedOrders>('/orders', { params });
  return data;
};

// Функция для отмены заказа
export const cancelOrder = async (orderId: number): Promise<Order> => {
    const { data } = await api.post<Order>(`/orders/${orderId}/cancel`);
    return data;
};

export const getOrderById = async (orderId: number): Promise<Order> => {
    // Предполагаем, что такого эндпоинта еще нет в OpenAPI, но он будет
    // Если его нет, бэкенду нужно будет его добавить.
    const { data } = await api.get<Order>(`/orders/${orderId}`);
    return data;
};

export const createOrder = async (orderData: OrderCreate): Promise<Order> => {
    const { data } = await api.post<Order>('/orders', orderData);
    return data;
};