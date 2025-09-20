// src/api/index.ts
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

// <-- 1. ДОБАВЛЯЕМ ЛОГ ПРИ ЗАГРУЗКЕ МОДУЛЯ
console.log(
  `%c[Axios] Module loaded. VITE_API_URL is: "${import.meta.env.VITE_API_URL}"`, 
  'color: orange; font-weight: bold;'
);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    
    // ДОБАВЛЯЕМ ЛОГ С УСЛОВИЕМ
    if (config.url?.includes('dashboard')) {
        console.log(
            '%c[Axios Interceptor for Dashboard] Token from store is:', 
            'color: red; font-weight: bold;', 
            token ? 'EXISTS' : 'NULL'
        );
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;