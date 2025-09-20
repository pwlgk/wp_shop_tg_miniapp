// src/hooks/useMainButton.ts
import { useMainButton as useTmaMainButton } from "@tma.js/sdk-react";
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
  const mainButton = useTmaMainButton();

  useEffect(() => {
    if (!mainButton) return;
    mainButton.on('click', onClick);
    return () => {
      mainButton.off('click', onClick);
    };
  }, [mainButton, onClick]);
  
  useEffect(() => {
      if (!mainButton) return;
      
      mainButton.setText(text);
      mainButton.setParams({
          isVisible: isVisible, 
          // ИСПРАВЛЕНИЕ: Правильный параметр - isEnabled
          isEnabled: !isDisabled,
      });
      
      if (isProgressVisible) {
          mainButton.showLoader();
      } else {
          mainButton.hideLoader();
      }
      
  }, [mainButton, text, isVisible, isProgressVisible, isDisabled]);

  useEffect(() => {
      return () => {
          mainButton?.hide();
      }
  }, [mainButton]);
};