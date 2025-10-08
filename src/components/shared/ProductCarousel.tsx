// src/components/shared/ProductCarousel.tsx
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/api/services/catalog.api';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';

interface ProductCarouselProps {
  // Параметры для запроса товаров
  queryParams: {
    category?: number;
    orderby?: string;
    order?: 'asc' | 'desc';
    size?: number;
  };
}

export const ProductCarousel = ({ queryParams }: ProductCarouselProps) => {
  const { data, isLoading } = useQuery({
    // Ключ зависит от параметров, чтобы кэш был уникальным
    queryKey: ['products', 'carousel', queryParams],
    queryFn: () => getProducts({ size: 8, ...queryParams }), // Запрашиваем 8 товаров для карусели
  });

  const products = data?.items ?? [];

  if (isLoading) {
    // Скелетон теперь точно имитирует структуру карусели
    return (
      <div className="w-full overflow-hidden px-4">
          <div className="flex -ml-4">
              {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="pl-2 basis-1/2 md:basis-1/3 shrink-0">
                      <ProductCardSkeleton />
                  </div>
              ))}
          </div>
      </div>
    );
  }
  
  if (products.length === 0) return null;

  return (
    <Carousel opts={{ align: 'start' }} className="w-full px-4">
      <CarouselContent className="-ml-4">
        {products.map((product) => (
          <CarouselItem key={product.id} className="pl-2 basis-1/2 md:basis-1/3">
            <ProductCard product={product} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};