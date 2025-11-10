// src/api/services/notifications.api.ts
import api from '@/api/client';
import type { PaginatedNotifications } from '@/types';

interface GetNotificationsParams {
  page?: number;
  size?: number;
  unread_only?: boolean;
}

// Получение списка уведомлений
export const getNotifications = async ({ page = 1, size = 20, unread_only = false }: GetNotificationsParams): Promise<PaginatedNotifications> => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    unread_only: String(unread_only),
  });
  const { data } = await api.get<PaginatedNotifications>('/notifications', { params });
  return data;
};

// Пометить уведомление как прочитанное
export const readNotification = async (notificationId: number): Promise<void> => {
    await api.post(`/notifications/${notificationId}/read`);
};

// Пометить все как прочитанные
export const readAllNotifications = async (): Promise<void> => {
    await api.post('/notifications/read-all');
};