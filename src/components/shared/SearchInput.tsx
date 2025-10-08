// src/components/shared/SearchInput.tsx
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface SearchInputProps {
  isLink?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  autoFocus?: boolean;
}

export const SearchInput = ({ isLink = false, value, onChange, onClear, autoFocus = false }: SearchInputProps) => {
  const navigate = useNavigate();

  if (isLink) {
    return (
      <div 
        onClick={() => navigate('/search')}
        className="w-full h-control-sm rounded-2xl bg-muted pl-10 flex items-center text-muted-foreground cursor-pointer relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" />
        Поиск товаров
      </div>
    );
  }

  return (
    <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Поиск товаров..."
          className="w-full h-control-sm rounded-2xl bg-muted pl-10 pr-10 text-base"
          value={value}
          onChange={onChange}
          autoFocus={autoFocus}
        />
        {value && onClear && (
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-control-xs w-control-xs rounded-full"
            onClick={onClear}
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </Button>
        )}
    </div>
  );
};