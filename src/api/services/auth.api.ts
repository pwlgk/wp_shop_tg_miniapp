// src/api/services/auth.api.ts

import axios from 'axios';
// import apiClient from '../client';
import type { TokenPair } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL) {
    throw new Error("CRITICAL: VITE_API_BASE_URL is not defined.");
}

// --- loginViaTelegram ---
interface TelegramLoginPayload {
  init_data: string;
}
export const loginViaTelegram = async (initDataRaw: string): Promise<TokenPair> => {
  console.log('[AuthAPI] Sending login request via clean axios to avoid interceptors...');
  
  // --- ИЗМЕНЕНИЕ: Используем 'axios.post' напрямую, а не 'apiClient' ---
  // Это гарантирует, что никакие интерсепторы (например, добавляющие Authorization)
  // не будут применены к этому конкретному запросу.
  const response = await axios.post<TokenPair>(`${API_BASE_URL}/auth/telegram`, { 
    init_data: initDataRaw 
  } as TelegramLoginPayload);
  
  console.log('[AuthAPI] loginViaTelegram successful. Raw response data:', response.data);
  return response.data;
};


// --- refreshAccessToken ---
// Эта функция УЖЕ использует 'axios.post' напрямую, что правильно.
export const refreshAccessToken = async (refreshToken: string): Promise<TokenPair> => {
  const response = await axios.post<TokenPair>(`${API_BASE_URL}/auth/refresh`, { refresh_token: refreshToken });
  return response.data;
}