// src/components/shared/ImageViewer.tsx

import { useState, useEffect } from "react";
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import type { ProductImage } from "@/types";

interface ImageViewerProps {
  images: ProductImage[];
  initialImageId?: number;
}

export const ImageViewer = ({ images, initialImageId }: ImageViewerProps) => {
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) return;

    // Логика для установки начального слайда
    const setInitialSlide = () => {
      const initialIndex = initialImageId ? images.findIndex(img => img.id === initialImageId) : 0;
      if (initialIndex !== -1 && api.selectedScrollSnap() !== initialIndex) {
        api.scrollTo(initialIndex, true);
      }
    };
    
    // Подписываемся и вызываем
    api.on("init", setInitialSlide);
    setInitialSlide();

    // Очистка
    return () => { 
      if (api) {
        api.off("init", setInitialSlide);
      }
    };
  }, [api, initialImageId, images]);

  return (
    // Теперь это просто карусель без позиционирования
    <div className="flex items-center justify-center w-full h-full">
      <Carousel setApi={setApi} className="max-w-5xl w-full">
        <CarouselContent className="flex items-center">
          {images.map((image) => (
            <CarouselItem key={image.id} className="flex items-center justify-center">
              <img
                src={image.src}
                alt={`Изображение к отзыву`}
                // Высота теперь рассчитывается относительно родителя, а не viewport
                className="max-w-full max-h-[85dvh] object-contain"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};