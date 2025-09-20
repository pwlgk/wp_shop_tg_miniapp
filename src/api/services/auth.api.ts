// src/api/services/auth.api.ts
import api from '@/api';
import type { TokenResponse } from '@/types';

interface TelegramLoginData {
  init_data: string;
}

export const loginViaTelegram = async (initData: string): Promise<TokenResponse> => {
  const { data } = await api.post<TokenResponse>('/auth/telegram', {
    init_data: initData,
  } as TelegramLoginData);
  return data;
};