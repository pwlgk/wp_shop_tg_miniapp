// src/components/shared/ReviewItem.tsx

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { ProductReview } from "@/types";
import { StarRating } from "./StarRating";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
// --- ИЗМЕНЕНИЕ 1: Удаляем неиспользуемый импорт `stripHtml` ---

const LONG_REVIEW_THRESHOLD = 200;

export const ReviewItem = ({ review }: { review: ProductReview }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const { isLongReview, fullText, truncatedText } = useMemo(() => {
    // Эта логика уже не использует stripHtml, поэтому она корректна
    const fullTextWithNewlines = review.review
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .trim();

    const cleanOneLineText = fullTextWithNewlines.replace(/\n/g, ' ');
    const isLong = cleanOneLineText.length > LONG_REVIEW_THRESHOLD;

    return {
      isLongReview: isLong,
      fullText: fullTextWithNewlines,
      truncatedText: `${cleanOneLineText.substring(0, LONG_REVIEW_THRESHOLD)}...`,
    };
  }, [review.review]);

  const openImageViewer = (imageId: number) => {
    navigate('/gallery', {
      state: {
        images: review.images,
        initialImageId: imageId,
      },
    });
  };

  return (
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
                  <button key={image.id} onClick={() => openImageViewer(image.id)} aria-label={`Просмотреть изображение ${image.id}`}>
                      <img 
                          src={image.src} 
                          // --- ИЗМЕНЕНИЕ 2: Убираем `image.alt` ---
                          // Предоставляем осмысленный alt-текст по умолчанию для доступности
                          alt={`Изображение к отзыву от ${review.reviewer}`}
                          className="h-20 w-20 rounded-lg object-cover shrink-0" 
                          loading="lazy" 
                      />
                  </button>
              ))}
          </div>
      )}

      <div className="mt-3">
          <p 
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
  );
};