// src/hooks/useMainButton.ts
import { mainButton } from "@telegram-apps/sdk";
import { useEffect } from "react";

interface MainButtonParams {
  text: string;
  onClick: () => void;
  isVisible?: boolean;
  isProgressVisible?: boolean;
  isDisabled?: boolean;
}

/**
 * Хук для управления нативной главной кнопкой Telegram.
 */
export const useMainButton = ({ 
  text, 
  onClick, 
  isVisible = false,
  isProgressVisible = false,
  isDisabled = false 
}: MainButtonParams) => {

  // Этот useEffect отвечает за подписку/отписку от клика и базовую инициализацию.
  useEffect(() => {
    // Монтируем компонент. Безопасно вызывать многократно.
    mainButton.mount();

    // Подписываемся на клик и получаем функцию для отписки.
    const offClick = mainButton.onClick(onClick);

    // Функция очистки, которая отписывается от события.
    return () => {
      offClick();
    };
  }, [onClick]);
  
  // Этот useEffect отвечает за визуальное состояние кнопки.
  useEffect(() => {
    // Используем единый метод setParams для установки всех свойств.
    mainButton.setParams({
        text: text,
        isVisible: isVisible, 
        isEnabled: !isDisabled,
        isLoaderVisible: isProgressVisible,
    });

    // Функция очистки, которая гарантирует, что кнопка скроется,
    // когда компонент, использующий этот хук, будет размонтирован.
    return () => {
        // ИСПОЛЬЗУЕМ ПРАВИЛЬНЫЙ МЕТОД: setParams({ isVisible: false })
        mainButton.setParams({ isVisible: false });
    }
  }, [text, isVisible, isProgressVisible, isDisabled]);
};