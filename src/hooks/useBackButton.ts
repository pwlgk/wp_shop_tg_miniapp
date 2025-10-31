// src/hooks/useBackButton.ts
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { backButton } from '@telegram-apps/sdk';

export const useBackButton = (visible = true) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBackClick = () => {
      if (location.key === 'default') {
        navigate('/');
      } else {
        navigate(-1);
      }
    };

    // Монтируем компонент. Это безопасно, так как повторные вызовы игнорируются.
    backButton.mount();
    
    let offClick: (() => void) | undefined;

    if (visible) {
      // ИСПОЛЬЗУЕМ ПРАВИЛЬНЫЙ МЕТОД: onClick
      // Он возвращает функцию для отписки
      offClick = backButton.onClick(handleBackClick);
      backButton.show();
    }

    // Функция очистки эффекта
    return () => {
      // Если была создана подписка, отписываемся
      if (offClick) {
        offClick();
      }
      backButton.hide();
    };
  }, [visible, navigate, location.key]);
};