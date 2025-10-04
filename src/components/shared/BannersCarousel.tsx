// src/components/shared/BannersCarousel.tsx
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBanners } from '@/api/services/catalog.api';
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Autoplay from "embla-carousel-autoplay"; // <-- 1. Импортируем плагин

// Скелетон для состояния загрузки
const BannerSkeleton = () => (
    <div className="px-4">
        {/* Изменяем ratio и скругление и здесь для консистентности */}
        <AspectRatio ratio={16 / 9}>
            <Skeleton className="w-full h-full rounded-3xl" />
        </AspectRatio>
    </div>
);

export const BannersCarousel = () => {
  const { data: banners, isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: getBanners,
  });

  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  
  // 2. Создаем ref для плагина
  const plugin = useRef(
    Autoplay({ delay: 10000, stopOnInteraction: true })
  );

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };
    api.on("select", handleSelect);
    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  if (isLoading) {
    return <BannerSkeleton />;
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="px-2">
      <Carousel 
        setApi={setApi} 
        opts={{ loop: banners.length > 1 }} 
        plugins={[plugin.current]} // <-- 3. Подключаем плагин
        onMouseEnter={() => plugin.current.stop()} // <-- 4. Останавливаем на десктопе
        onMouseLeave={() => plugin.current.reset()} // <-- 4. Возобновляем
        className="w-full relative"
      >
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id}>
              <Link to={banner.link_url || '#'}>
                <div className="overflow-hidden rounded-3xl relative"> {/* Увеличиваем скругление */}
                  <AspectRatio ratio={16 / 9} className="bg-muted"> {/* Увеличиваем высоту */}
                    {banner.content_type === 'video' ? (
                      <video
                        src={banner.media_url}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <img 
                        src={banner.media_url} 
                        alt={banner.title} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </AspectRatio>
                  {/* --- УДАЛЕН БЛОК С ЗАГОЛОВКОМ --- */}
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {banners.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 z-10 flex items-center justify-center gap-2">
            {Array.from({ length: count }).map((_, index) => (
                <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                    "h-2 w-2 rounded-full transition-all duration-300",
                    current === index ? "w-4 bg-white" : "bg-white/50"
                )}
                aria-label={`Перейти к слайду ${index + 1}`}
                />
            ))}
            </div>
        )}
      </Carousel>
    </div>
  );
};