// src/components/shared/QuantitySelector.tsx
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
  maxQuantity?: number | null;
  isUpdating: boolean;
  className?: string;
}

export const QuantitySelector = ({ quantity, onDecrement, onIncrement, maxQuantity, isUpdating, className }: QuantitySelectorProps) => {
  const isIncrementDisabled = isUpdating || (maxQuantity !== null && quantity >= (maxQuantity ?? Infinity));
  
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex items-center gap-1 border rounded-md p-0.5"> {/* Уменьшили gap и padding */}
        <Button variant="ghost" size="icon" className="h-7 w-10 shrink-0" onClick={onDecrement} disabled={isUpdating}> {/* Уменьшили h/w */}
          <Minus className="h-4 w-4" />
        </Button>
        <span className="font-bold text-base w-8 text-center">{quantity}</span> {/* Уменьшили text-size */}
        <Button variant="ghost" size="icon" className="h-7 w-10 shrink-0" onClick={onIncrement} disabled={isIncrementDisabled}> {/* Уменьшили h/w */}
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};