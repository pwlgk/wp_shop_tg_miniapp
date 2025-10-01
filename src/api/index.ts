// src/api/index.ts
import axios, { type AxiosError } from 'axios';
import { useAuthStore } from '@/store/authStore';
import { loginViaTelegram } from './services/auth.api'; // <-- Импортируем функцию для ре-логина

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// --- Интерсептор для ЗАПРОСОВ (остается без изменений) ---
// Он добавляет токен в каждый исходящий запрос.
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- НОВЫЙ Интерсептор для ОТВЕТОВ ---
// Он будет "ловить" ошибки и пытаться их исправить.
api.interceptors.response.use(
  // Первый аргумент - обработчик успешных ответов. Нам он не нужен.
  (response) => response,
  
  // Второй аргумент - обработчик ошибок.
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Проверяем, что это ошибка 401 и что у нас еще нет флага о повторном запросе
    if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
        
        // Ставим флаг, чтобы избежать бесконечного цикла, если и ре-логин не удастся
        (originalRequest as any)._retry = true;

        console.log("Токен истек или невалиден. Попытка обновления...");

        try {
            // Пытаемся получить новый токен
            const initData = window.Telegram?.WebApp?.initData;
            if (!initData) {
                console.error("Не удалось найти initData для обновления токена.");
                // Если initData нет, выходим из системы (или просто выбрасываем ошибку)
                useAuthStore.getState().clearToken();
                return Promise.reject(error);
            }

            const { access_token: newAccessToken } = await loginViaTelegram(initData);
            
            // Сохраняем новый токен в Zustand
            useAuthStore.getState().setToken(newAccessToken);
            
            console.log("Токен успешно обновлен. Повторяем исходный запрос...");

            // Обновляем заголовок в оригинальном запросе
            if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            
            // Повторяем оригинальный запрос с новым токеном
            return api(originalRequest);

        } catch (refreshError) {
            console.error("Не удалось обновить токен:", refreshError);
            // Если и ре-логин не удался, чистим токен и выбрасываем ошибку
            useAuthStore.getState().clearToken();
            // Можно добавить редирект на страницу логина, если она есть
            // window.location.href = '/login';
            return Promise.reject(refreshError);
        }
    }

    // Для всех остальных ошибок (не 401) просто пробрасываем их дальше
    return Promise.reject(error);
  }
);


export default api;