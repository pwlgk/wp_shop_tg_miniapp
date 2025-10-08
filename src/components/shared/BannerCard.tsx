// src/components/shared/BannerCard.tsx
import type { Story } from '@/types';
import { Link } from 'react-router-dom';
// AspectRatio больше не нужен
// import { AspectRatio } from '@/components/ui/aspect-ratio';

export const BannerCard = ({ story }: { story: Story }) => {
    return (
        // 1. Добавляем h-full к Link, чтобы он занимал всю высоту ячейки грида
        <Link to={story.link_url || '#'} className="block h-full">
            <div className="relative rounded-2xl overflow-hidden h-full shadow-sm hover:shadow-md transition-shadow bg-muted">
                {/* 2. Убираем AspectRatio. Теперь img/video будут растягиваться на h-full родителя */}
                {story.content_type === 'video' ? (
                    <video 
                        src={story.media_url} 
                        className="w-full h-full object-cover" // object-cover гарантирует заполнение
                        autoPlay muted loop playsInline
                        preload="metadata" // Оптимизация: загружаем только метаданные
                    />
                ) : (
                    <img 
                        src={story.media_url} 
                        alt={story.title}
                        className="w-full h-full object-cover" // object-cover гарантирует заполнение
                        loading="lazy" // Оптимизация: ленивая загрузка
                    />
                )}
            </div>
        </Link>
    );
};