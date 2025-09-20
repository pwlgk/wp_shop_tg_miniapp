// src/api/services/user.api.ts
import api from '@/api';
import type { LoyaltyHistory, UserDashboard, UserProfile, UserUpdate } from '@/types';

// Эта функция остаётся для HomePage
export const getDashboard = async (): Promise<UserDashboard> => {
  const { data } = await api.get<UserDashboard>('/users/me/dashboard');
  return data;
};

// ДОБАВЛЯЕМ НОВУЮ ФУНКЦИЮ. Ответ нам не важен, главное, чтобы запрос прошел (не было 401 ошибки)
export const checkAuth = async (): Promise<void> => {
  await api.get('/users/me'); 
};

// Получение полного профиля
export const getMe = async (): Promise<UserProfile> => {
    const { data } = await api.get<UserProfile>('/users/me');
    return data;
};

// Обновление профиля
export const updateMe = async (userData: UserUpdate): Promise<UserProfile> => {
    const { data } = await api.put<UserProfile>('/users/me', userData);
    return data;
};

export const getLoyaltyHistory = async (): Promise<LoyaltyHistory> => {
    const { data } = await api.get<LoyaltyHistory>('/users/me/loyalty-history');
    return data;
};