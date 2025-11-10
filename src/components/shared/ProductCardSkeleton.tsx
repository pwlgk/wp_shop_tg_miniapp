// src/components/shared/ProductCardSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';

export const ProductCardSkeleton = () => {
  return (
    // Корневой div повторяет структуру ProductCard: с тенью и скруглениями.
    <div className="relative border rounded-2xl overflow-hidden h-full flex flex-col animate-pulse">
        
        {/* Блок с изображением и фейковой кнопкой "Избранное" */}
        <div className="relative">
          <AspectRatio ratio={4 / 5} className="bg-muted rounded-t-2xl">
            {/* Скелетон для изображения не нужен, так как AspectRatio уже имеет фон */}
          </AspectRatio>
          
          {/* Скелетон для кнопки "Избранное" */}
          <div className="absolute top-2 right-2">
            <Skeleton className="h-control-xs w-control-xs rounded-full" />
          </div>
        </div>

        {/* Информационный блок */}
        <div className="p-3 flex-grow flex flex-col">
            <div className="flex-grow">
              {/* Скелетон для цены */}
              <Skeleton className="h-5 w-16" />
              {/* Скелетон для названия */}
              <Skeleton className="h-10 w-full mt-1" />
            </div>
        </div>
    </div>
  );
};