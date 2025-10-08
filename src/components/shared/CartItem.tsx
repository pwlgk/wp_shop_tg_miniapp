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
  const stockQuantity = item.product.stock_quantity;
  const isIncrementDisabled = isUpdating || (stockQuantity !== null && item.quantity >= stockQuantity);

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
    <div className="relative overflow-hidden mb-4">
        {/* Фон, который появляется при свайпе */}
        <div className="absolute inset-0 bg-destructive flex items-center justify-end px-6">
            <Trash2 className="h-6 w-6 text-destructive-foreground" />
        </div>

        {/* Основной контент, который можно свайпать */}
        <motion.div
            drag="x" // Разрешаем свайп по горизонтали
            dragConstraints={{ left: 0, right: 0 }} // Ограничиваем свайп, чтобы не вылетал
            onDragEnd={(_event, info) => {
                // Если свайпнули влево больше чем на 100px, вызываем удаление
                if (info.offset.x < -100) {
                    onRemove();
                }
            }}
            className="relative bg-background"
        >
            <Link to={`/product/${item.product.id}`} className="block py-4 hover:bg-muted rounded-2xl">
                <div className="flex items-start gap-4">
                    <img 
                        src={item.product.images[0]?.src || '/placeholder.png'} 
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-lg border"
                        loading="lazy"
                    />
                    <div className="flex-grow flex flex-col justify-between h-24">
                        <div>
                            <p className="font-semibold leading-tight line-clamp-2">{item.product.name}</p>
                            <p className="text-primary font-bold mt-1">{parseFloat(item.product.price).toFixed(0)} ₽</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
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