// src/pages/ContentPage.tsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPageBySlug } from '@/api/services/cms.api';
import { useBackButton } from '@/hooks/useBackButton';
import { Skeleton } from '@/components/ui/skeleton';
import type { ContentBlock } from '@/types';
import { ContentRenderer } from '@/components/shared/ContentRenderer';

// Компонент для рендеринга одного блока контента
const BlockRenderer = ({ block }: { block: ContentBlock }) => {
    // Мы убираем стили отсюда, так как родительский div с классом 'prose'
    // будет автоматически стилизовать все теги.
    switch (block.type) {
        case 'h1': return <h1 dangerouslySetInnerHTML={{ __html: block.content }} />;
        case 'h2': return <h2 dangerouslySetInnerHTML={{ __html: block.content }} />;
        case 'h3': return <h3 dangerouslySetInnerHTML={{ __html: block.content }} />;
        case 'p': return <p><ContentRenderer content={block.content} /></p>;
        case 'ul': return <ul>{block.items.map((item, i) => <li key={i}><ContentRenderer content={item} /></li>)}</ul>;
        case 'ol': return <ol>{block.items.map((item, i) => <li key={i}><ContentRenderer content={item} /></li>)}</ol>;
        case 'hr': return <hr />;
        default: return null;
    }
};

// Скелетон для страницы
const ContentPageSkeleton = () => (
    <div className="animate-pulse">
        <Skeleton className="h-48 w-full" />
        <div className="p-4 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full mt-4" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full mt-2" />
        </div>
    </div>
);


export const ContentPage = () => {
    const { slug } = useParams<{ slug: string }>();
    useBackButton();

    const { data: page, isLoading, isError } = useQuery({
        queryKey: ['page', slug],
        queryFn: () => getPageBySlug(slug!),
        enabled: !!slug,
    });

    if (isLoading) return <ContentPageSkeleton />;
    if (isError || !page) return <div className="p-4 text-center">Не удалось загрузить страницу.</div>;
    
    // Проверяем, нужно ли дублировать заголовок в контенте.
    // Если первый блок - это h1 с таким же текстом, как у страницы, мы его пропускаем.
    const shouldSkipFirstBlock = page.blocks[0]?.type === 'h1' && page.blocks[0]?.content === page.title;
    const contentBlocks = shouldSkipFirstBlock ? page.blocks.slice(1) : page.blocks;

    return (
        <div>
            {/* --- НОВЫЙ "ГЕРОЙ-БЛОК" --- */}
            {page.image_url ? (
                // Если есть изображение, создаем блок с наложением
                <div className="relative w-full h-48">
                    <img src={page.image_url} alt={page.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4">
                        <h1 className="text-3xl font-bold text-white shadow-lg">{page.title}</h1>
                    </div>
                </div>
            ) : (
                // Если изображения нет, показываем простой заголовок
                <div className="p-4 border-b">
                    <h1 className="text-3xl font-bold">{page.title}</h1>
                </div>
            )}

            {/* --- НОВЫЙ КОНТЕЙНЕР ДЛЯ КОНТЕНТА --- */}
            {/* 
              Класс 'prose' из плагина @tailwindcss/typography автоматически
              добавит красивые стили ко всем h1, p, ul, ol и т.д. внутри.
            */}
            <article className="prose prose-sm dark:prose-invert max-w-none p-4">
                {contentBlocks.map((block, index) => <BlockRenderer key={index} block={block} />)}
            </article>
        </div>
    );
};