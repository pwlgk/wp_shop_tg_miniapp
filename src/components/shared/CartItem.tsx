// src/components/shared/CartItem.tsx
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus } from 'lucide-react';
import type { CartItem as CartItemType } from '@/types';
import { motion } from 'framer-motion';

interface CartItemProps {
  item: CartItemType;
  onRemove: () => void;
  onUpdate: (quantity: number) => void;
  isUpdating: boolean;
}

export const CartItem = ({ item, onRemove, onUpdate, isUpdating }: CartItemProps) => {
  const isVariation = !!item.variation;
  
  const imageUrl = item.variation?.image?.src || item.product.images[0]?.src;
  const price = item.variation?.price || item.product.price;
  const stockQuantity = item.variation?.stock_quantity ?? item.product.stock_quantity;
  const isIncrementDisabled = isUpdating || (stockQuantity !== null && item.quantity >= stockQuantity);

  const attributesString = isVariation && item.variation
    ? item.variation.attributes.map(attr => attr.option).join(', ')
    : null;

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (item.quantity <= 1) onRemove();
    else onUpdate(item.quantity - 1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (isIncrementDisabled) return;
    onUpdate(item.quantity + 1);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    onRemove();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-destructive flex items-center justify-end px-6">
            <Trash2 className="h-6 w-6 text-destructive-foreground" />
        </div>

        <motion.div
            drag="x"
            dragConstraints={{ left: -100, right: 0 }}
            dragSnapToOrigin
            onDragEnd={(_event, info) => { if (info.offset.x < -80) onRemove(); }}
            className="relative bg-background w-full"
        >
            <Link to={`/product/${item.product.id}`} className="block py-4 px-4 hover:bg-muted transition-colors">
                <div className="flex items-start gap-4">
                    <img 
                        src={imageUrl || '/placeholder.svg'} 
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-lg border"
                        loading="lazy"
                    />
                    {/* --- ИЗМЕНЕНИЯ ЗДЕСЬ --- */}
                    <div className="flex-grow flex flex-col">
                        {/* 1. Убрали h-24 и justify-between */}
                        <div>
                            <p className="font-semibold leading-tight line-clamp-2">{item.product.name}</p>
                            {attributesString && (
                                <p className="text-sm text-muted-foreground mt-1">{attributesString}</p>
                            )}
                            <p className="text-primary font-bold mt-1">{parseFloat(price).toFixed(0)} ₽</p>
                        </div>
                        {/* 2. Добавили mt-auto, чтобы прижать этот блок к низу */}
                        <div className="flex items-center justify-between mt-auto pt-2">
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-control-xs w-control-xs" onClick={handleDecrement} disabled={isUpdating}><Minus className="h-4 w-4" /></Button>
                                <span className="font-bold w-8 text-center">{item.quantity}</span>
                                <Button variant="outline" size="icon" className="h-control-xs w-control-xs" onClick={handleIncrement} disabled={isIncrementDisabled}><Plus className="h-4 w-4" /></Button>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleRemove} disabled={isUpdating}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    </div>
  );
};