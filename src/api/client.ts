// src/api/client.ts

import axios, { type AxiosRequestConfig, isAxiosError } from 'axios';
import { useAuthStore } from '@/store/authStore';

// --- 1. Получаем базовый URL из переменных окружения ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log(
  `%c[Axios] Module loaded. VITE_API_URL is: "${API_BASE_URL}"`, 
  'color: orange; font-weight: bold;'
);
// --- 2. Ранняя проверка на наличие URL ---
// Если переменная не задана в .env файле, приложение остановится с понятной ошибкой.
if (!API_BASE_URL) {
    throw new Error("CRITICAL: Переменная окружения VITE_API_BASE_URL не определена. Проверьте ваш .env файл.");
}

// --- 3. Создаем экземпляр Axios с базовым URL ---
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- 4. Интерсептор ЗАПРОСОВ: Добавляет Access Token в каждый запрос ---
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- 5. Интерсептор ОТВЕТОВ: Обрабатывает протухший Access Token ---
apiClient.interceptors.response.use(
  // Успешные ответы (статус 2xx) просто проходят дальше
  (response) => response,

  // Обработка ошибок
  async (error) => {
    // Убеждаемся, что это ошибка Axios
    if (!isAxiosError(error) || !error.response) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    const { refreshToken, setTokens, logout } = useAuthStore.getState();

    console.groupCollapsed(`[Interceptor] Request to ${originalRequest.url} failed with status ${error.response.status}`);
    console.log("Current state on error:", { 
      hasRefreshToken: !!refreshToken, 
      isRetried: !!originalRequest._retry 
    });
    console.groupEnd();
    
    // --- Основная логика обновления токена ---
    if (
      error.response.status === 401 &&      // Ошибка "Unauthorized"
      refreshToken &&                       // У нас есть Refresh Token для обновления
      originalRequest.url !== '/auth/refresh' && // Это не сам запрос на обновление (чтобы избежать цикла)
      !originalRequest._retry               // Это первая попытка повторить запрос
    ) {
      originalRequest._retry = true; // Помечаем, чтобы больше не пытаться
      
      console.groupCollapsed(`[Interceptor] Attempting to refresh token...`);
      try {
        console.log("Using refresh token:", refreshToken);

        // Отправляем запрос на обновление, используя голый axios и полный URL
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        
        console.log("Received new tokens from refresh API:", data);
        
        // Сохраняем новые токены в хранилище
        setTokens(data);
        console.log("New tokens have been set in the store.");

        // Обновляем заголовок авторизации в оригинальном запросе
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        }
        
        console.log("Retrying the original request to:", originalRequest.url);
        console.groupEnd();

        // Повторяем оригинальный запрос с новым токеном
        return apiClient(originalRequest);

      } catch (refreshError) {
        console.error("CRITICAL: Token refresh failed. Logging out.", refreshError);
        console.groupEnd();
        
        // Если обновление не удалось (например, refresh_token тоже протух), выходим из системы
        logout();
        
        // Пробрасываем ошибку, чтобы вызывающий код (например, react-query) мог ее обработать
        return Promise.reject(refreshError);
      }
    }

    // Для всех остальных ошибок (не 401, или если нет refresh_token) просто пробрасываем их дальше
    return Promise.reject(error);
  }
);

export default apiClient;