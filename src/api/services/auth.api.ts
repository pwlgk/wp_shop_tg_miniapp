// src/api/services/auth.api.ts

import axios from 'axios';
import apiClient from '../client';
import type { TokenPair } from '@/types';

interface TelegramLoginPayload {
  init_data: string;
}

export const loginViaTelegram = async (initDataRaw: string): Promise<TokenPair> => {
  console.log('[AuthAPI] Attempting to login via Telegram...');
  try {
    const response = await apiClient.post<TokenPair>('/auth/telegram', { init_data: initDataRaw } as TelegramLoginPayload);
    console.log('[AuthAPI] loginViaTelegram successful. Raw response data:', response.data);
    if (!response.data.refresh_token) {
      console.error('[AuthAPI] CRITICAL: API response for login is missing refresh_token!');
    }
    return response.data;
  } catch (error) {
    console.error('[AuthAPI] loginViaTelegram failed:', error);
    throw error;
  }
};

interface RefreshTokenPayload {
  refresh_token: string;
}

// Эта функция будет вызываться напрямую из интерсептора
export const refreshAccessToken = async (refreshToken: string): Promise<TokenPair> => {
  console.log('[AuthAPI] Attempting to refresh access token...');
  try {
    const response = await axios.post<TokenPair>(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, { refresh_token: refreshToken } as RefreshTokenPayload);
    console.log('[AuthAPI] refreshAccessToken successful. Raw response data:', response.data);
    if (!response.data.refresh_token) {
      console.error('[AuthAPI] CRITICAL: API response for refresh is missing a new refresh_token!');
    }
    return response.data;
  } catch (error) {
    console.error('[AuthAPI] refreshAccessToken failed:', error);
    throw error;
  }
}