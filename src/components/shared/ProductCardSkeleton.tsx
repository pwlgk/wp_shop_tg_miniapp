// src/components/shared/ProductCardSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';

export const ProductCardSkeleton = () => {
  return (
    // Корневой div повторяет структуру ProductCard: с тенью и скруглениями.
    <div className="group relative overflow-hidden rounded-3xl shadow-sm">
      <div className="flex flex-col h-full bg-background animate-pulse">
        
        {/* Блок с изображением и фейковой кнопкой "Избранное" */}
        <div className="relative">
          <AspectRatio ratio={1 / 1} className="bg-muted">
            {/* Скелетон для изображения не нужен, так как AspectRatio уже имеет фон */}
          </AspectRatio>
          
          {/* Скелетон для кнопки "Избранное" */}
          <div className="absolute top-2 right-2">
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>

        {/* Информационный блок */}
        <div className="p-3 flex flex-col flex-grow">
          {/* Скелетон для названия */}
          <Skeleton className="h-4 w-4/5" />
          
          <div className="mt-2 flex justify-between items-center">
            {/* Скелетон для цены */}
            <div className="space-y-1">
              <Skeleton className="h-5 w-16" />
              {/* Мы не добавляем скелетон для старой цены, чтобы не усложнять */}
            </div>
            
            {/* Скелетон для кнопки "В корзину" */}
            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};