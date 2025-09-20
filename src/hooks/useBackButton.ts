// src/hooks/useBackButton.ts
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBackButton as useTmaBackButton } from '@tma.js/sdk-react';

export const useBackButton = (visible = true) => {
  const navigate = useNavigate();
  const location = useLocation();
  const backButton = useTmaBackButton();

  useEffect(() => {
    if (!backButton) return;
    const handleBackClick = () => {
      // Если это первая запись в истории, идем на главную
      if (location.key === 'default') {
        navigate('/');
      } else {
        navigate(-1);
      }
    };

    if (visible) {
      backButton.on('click', handleBackClick);
      backButton.show();
    }

    return () => {
      if (visible) {
        backButton.off('click', handleBackClick);
        backButton.hide();
      }
    };
  }, [visible, backButton, navigate, location.key]);
};