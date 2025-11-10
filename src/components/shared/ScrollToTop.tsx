// src/components/shared/ScrollToTop.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Этот компонент автоматически прокручивает страницу наверх
 * при каждом изменении маршрута (переходе на новую страницу).
 */
export const ScrollToTop = () => {
  // Получаем доступ к текущему пути (URL)
  const { pathname } = useLocation();

  // Создаем эффект, который будет срабатывать каждый раз,
  // когда `pathname` изменяется.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]); // Массив зависимостей с `pathname` - ключ к работе

  // Компонент не рендерит никакой видимый JSX
  return null;
};