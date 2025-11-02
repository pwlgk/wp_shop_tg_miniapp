// src/api/errorHandler.ts (создайте этот файл)

import { toast } from "sonner";
import { AxiosError } from "axios";

// Определяем тип для большей ясности
type ApiError = AxiosError<{ detail?: string; message?: string }>;

export const handleApiError = (error: unknown) => {
  // Проверяем, является ли ошибка ошибкой Axios
  if (!(error instanceof AxiosError)) {
    // Если это не ошибка сети, а, например, ошибка в коде
    console.error("An unexpected error occurred:", error);
    toast.error("Произошла непредвиденная ошибка");
    return;
  }

  const axiosError = error as ApiError;
  const status = axiosError.response?.status;
  const message = axiosError.response?.data?.detail || axiosError.response?.data?.message || "Пожалуйста, попробуйте снова.";

  switch (status) {
    case 429:
      toast.error("Слишком много запросов", {
        description: "Выполняйте действия медленнее и попробуйте снова через несколько секунд.",
      });
      break;
    case 400:
      toast.error("Неверные данные", { description: message });
      break;
    case 403:
      toast.error("Доступ запрещен", { description: message });
      break;
    case 404:
      toast.warning("Не найдено", { description: "Запрашиваемый ресурс не существует." });
      break;
    case 500:
    case 502:
    case 503:
      toast.error("Ошибка на сервере", { description: "Мы уже работаем над этим. Пожалуйста, попробуйте позже." });
      break;
    default:
      toast.error("Ошибка сети", { description: message });
  }
};