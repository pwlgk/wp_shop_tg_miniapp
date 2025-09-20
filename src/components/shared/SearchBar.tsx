// src/components/shared/SearchBar.tsx
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const SearchBar = () => {
  const navigate = useNavigate();

  const handleFocus = () => {
    navigate('/search');
  };

  return (
    // ИСПРАВЛЕНИЕ: Убираем "-mt-10 relative z-10" и лишний padding.
    // Теперь это простой блок, который будет вести себя предсказуемо.
    <div className="px-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Найти товары..."
          className="pl-10 h-12 text-base"
          onFocus={handleFocus}
          readOnly
        />
      </div>
    </div>
  );
};