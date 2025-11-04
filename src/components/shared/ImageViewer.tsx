// src/components/shared/ImageViewer.tsx

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import type { ProductImage } from "@/types";

// --- ИЗМЕНЕНИЕ 1: Импортируем хук и иконку ---
import { useTelegramSafeArea } from "@/hooks/useTelegramSafeArea";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageViewerProps {
  images: ProductImage[];
  initialImageId?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageViewer = ({ images, initialImageId, isOpen, onClose }: ImageViewerProps) => {
  const [api, setApi] = useState<CarouselApi>();
  
  // --- ИЗМЕНЕНИЕ 2: Получаем безопасные отступы ---
  const safeArea = useTelegramSafeArea();

  useEffect(() => {
    if (!api) {
      return;
    }
    const setInitialSlide = () => {
      const initialIndex = initialImageId ? images.findIndex(img => img.id === initialImageId) : 0;
      if (initialIndex !== -1 && api.selectedScrollSnap() !== initialIndex) {
        api.scrollTo(initialIndex, true);
      }
    };
    api.on("init", setInitialSlide);
    setInitialSlide();
    return () => {
      api.off("init", setInitialSlide);
    };
  }, [api, initialImageId, images]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  // --- ИЗМЕНЕНИЕ 3: Создаем стили для кнопки закрытия ---
  const closeButtonStyle = {
    // Позиционируем кнопку с учетом отступа "челки"
    // Добавляем 16px (1rem) для визуального отступа от края
    top: `${(safeArea.top || 0) + 16}px`,
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="bg-background/80 backdrop-blur-sm p-0 w-screen h-screen max-w-full flex items-center justify-center border-none rounded-none"
      >
        <VisuallyHidden asChild>
          <DialogTitle>Просмотр изображений</DialogTitle>
        </VisuallyHidden>
        
        {/* --- ИЗМЕНЕНИЕ 4: Добавляем кастомную кнопку закрытия --- */}
        <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 rounded-full z-50 bg-background/50 hover:bg-background/75"
            style={closeButtonStyle}
            aria-label="Закрыть"
        >
            <X className="h-5 w-5" />
        </Button>

        <div className="flex items-center justify-center w-full h-full">
          <Carousel setApi={setApi} className="max-w-5xl w-full">
            <CarouselContent className="flex items-center">
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