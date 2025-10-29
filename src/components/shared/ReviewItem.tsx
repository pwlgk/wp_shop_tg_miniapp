// src/components/shared/ReviewItem.tsx
import { useState, useMemo } from "react";
import type { ProductReview } from "@/types";
import { StarRating } from "./StarRating";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { ImageViewer } from "./ImageViewer";
import { stripHtml } from "@/lib/utils"; // Убедитесь, что импорт правильный

const LONG_REVIEW_THRESHOLD = 200; // Уменьшим порог для наглядности

export const ReviewItem = ({ review }: { review: ProductReview }) => {
  const [initialImageId, setInitialImageId] = useState<number | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // --- ФИНАЛЬНАЯ ЛОГИКА ОБРАБОТКИ ТЕКСТА ---
  const { isLongReview, fullText, truncatedText } = useMemo(() => {
    // 1. Текст для превью: чистый, в одну строку
    const cleanOneLineText = stripHtml(review.review);
    const isLong = cleanOneLineText.length > LONG_REVIEW_THRESHOLD;
    
    // 2. Текст для полного просмотра: сохраняем переносы строк
    const fullTextWithNewlines = review.review.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').trim();

    return {
      isLongReview: isLong,
      fullText: fullTextWithNewlines, // Полный текст с переносами
      truncatedText: `${cleanOneLineText.substring(0, LONG_REVIEW_THRESHOLD)}...`, // Обрезанный текст без переносов
    };
  }, [review.review]);

  const openImageViewer = (imageId: number) => {
    setInitialImageId(imageId);
    setIsViewerOpen(true);
  };

  const closeImageViewer = () => {
    setIsViewerOpen(false);
    setInitialImageId(null);
  };

  return (
    <>
      <div className="py-6">
        <div className="flex items-center justify-between">
          <span className="font-semibold">{review.reviewer}</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(review.date_created), "dd.MM.yyyy", { locale: ru })}
          </span>
        </div>
        <div className="mt-1">
          <StarRating rating={review.rating} />
        </div>
        
        {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mt-3 -mx-4 px-4 overflow-x-auto scrollbar-hide">
                {review.images.map(image => (
                    <button key={image.id} onClick={() => openImageViewer(image.id)}>
                        <img 
                            src={image.src} 
                            alt={`Review image ${image.id}`}
                            className="h-20 w-20 rounded-lg object-cover shrink-0" 
                            loading="lazy" 
                        />
                    </button>
                ))}
            </div>
        )}

        <div className="mt-3">
            <p 
                // break-words: гарантирует перенос длинных слов
                // whitespace-pre-wrap: нужен только для развернутого текста
                className="text-sm text-muted-foreground break-words" 
                style={{ whiteSpace: isExpanded ? 'pre-wrap' : 'normal' }}
            >
              {isExpanded ? fullText : (isLongReview ? truncatedText : fullText)}
            </p>

            {isLongReview && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-sm font-semibold text-primary mt-2 hover:underline"
                >
                    {isExpanded ? 'Свернуть' : 'Читать далее'}
                </button>
            )}
        </div>
      </div>

      <ImageViewer 
        isOpen={isViewerOpen}
        onClose={closeImageViewer}
        images={review.images || []}
        initialImageId={initialImageId ?? undefined} 
      />
    </>
  );
};