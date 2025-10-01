// src/api/services/settings.api.ts
import api from '@/api';
import type { ShopSettings } from '@/types';

export const getSettings = async (): Promise<ShopSettings> => {
    const { data } = await api.get<ShopSettings>('/settings');
    return data;
};