// src/components/shared/StarRating.tsx
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  starSize?: string; // 1. Добавляем новый необязательный prop
}

export const StarRating = ({ rating, starSize = 'h-5 w-5' }: StarRatingProps) => { // 2. Задаем значение по умолчанию
  const totalStars = 5;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        let fillClass = "text-muted-foreground/30"; // Цвет пустой звезды
        
        if (starValue <= fullStars) {
          fillClass = "text-amber-400 fill-amber-400"; // Цвет полной звезды
        } else if (hasHalfStar && starValue === fullStars + 1) {
          // Логика для половинчатой звезды (если понадобится в будущем)
          // Здесь можно использовать clip-path или другую иконку
          fillClass = "text-amber-400 fill-amber-400"; // Пока просто заполняем
        }

        return (
          <Star
            key={index}
            // 3. Применяем starSize к каждой звезде
            className={cn(starSize, fillClass)}
          />
        );
      })}
    </div>
  );
};