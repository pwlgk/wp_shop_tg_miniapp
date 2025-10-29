// src/components/shared/ImageViewer.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import type { ProductImage } from "@/types";

interface ImageViewerProps {
  images: ProductImage[];
  initialImageId?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageViewer = ({ images, initialImageId, isOpen, onClose }: ImageViewerProps) => {
  const [api, setApi] = useState<CarouselApi>();

  // --- ИСПРАВЛЕНИЕ 1: Надежная инициализация слайда ---
  useEffect(() => {
    if (!api) {
      return;
    }

    // Функция для установки начального слайда
    const setInitialSlide = () => {
      const initialIndex = initialImageId ? images.findIndex(img => img.id === initialImageId) : 0;
      if (initialIndex !== -1 && api.selectedScrollSnap() !== initialIndex) {
        api.scrollTo(initialIndex, true); // Мгновенно переключаемся на нужный слайд
      }
    };

    // Подписываемся на событие init. Если карусель уже готова, оно не сработает.
    api.on("init", setInitialSlide);

    // Поэтому на всякий случай вызываем его сразу.
    setInitialSlide();

    // Отписываемся при размонтировании
    return () => {
      api.off("init", setInitialSlide);
    };
  }, [api, initialImageId, images]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        // --- ИСПРАВЛЕНИЕ 2: Правильный фон ---
        className="bg-background/80 backdrop-blur-sm p-0 w-screen h-screen max-w-full flex items-center justify-center border-none rounded-none"
      >
        <VisuallyHidden asChild>
          <DialogTitle>Просмотр изображений</DialogTitle>
        </VisuallyHidden>

        {/* Ваша идеальная верстка для центрирования сохранена */}
        <div className="flex items-center justify-center w-full h-full">
          <Carousel setApi={setApi} className="max-w-5xl w-full">
            <CarouselContent className="flex items-center"> {/* Убран justify-center отсюда */}
              {images.map((image) => (
                <CarouselItem key={image.id} className="flex items-center justify-center">
                  <img
                    src={image.src}
                    alt={image.alt || `Review image ${image.id}`}
                    className="max-w-full max-h-[80vh] object-contain"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </DialogContent>
    </Dialog>
  );
};