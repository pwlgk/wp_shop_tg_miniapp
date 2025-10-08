// src/components/shared/CouponInput.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Tag, X } from 'lucide-react';

interface CouponInputProps {
  appliedCouponCode: string | null;
  onApply: (code: string) => void;
  onRemove: () => void;
  isLoading: boolean;
}

export const CouponInput = ({ appliedCouponCode, onApply, onRemove, isLoading }: CouponInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleApply = () => {
    if (!inputValue.trim()) return;
    onApply(inputValue.trim());
    setInputValue('');
  };

  if (appliedCouponCode) {
    return (
      <div className="flex items-center justify-between text-sm h-control-sm px-3 border rounded-2xl bg-muted">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-green-600" />
          <p>
            Промокод <span className="font-bold">{appliedCouponCode}</span> применен
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-control-xs w-control-xs" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        placeholder="Введите промокод"
        className="w-full h-control-sm rounded-2xl bg-muted pl-10 pr-12 text-base"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === 'Enter' && handleApply()}
      />
      <div className="absolute right-1 top-1/2 -translate-y-1/2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9" 
          onClick={handleApply}
          disabled={isLoading || !inputValue.trim()}
        >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
};