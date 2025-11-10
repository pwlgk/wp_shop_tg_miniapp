// src/pages/CatalogPage.tsx
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/api/services/catalog.api';
import type { ProductCategory } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useBackButton } from '@/hooks/useBackButton';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryBannerCard } from '@/components/shared/CategoryBannerCard';
import { BrandHeader } from '@/components/shared/BrandHeader';

// --- НОВЫЙ КОМПОНЕНТ: Скелетон страницы ---
const CatalogPageSkeleton = () => (
    <>
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-8 w-1/3" /> {/* h-8 для text-2xl */}
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-40 w-full rounded-2xl" />
                <Skeleton className="h-40 w-full rounded-2xl" />
                <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
        </div>
    </>
);

export const CatalogPage = () => {
    useBackButton();
    const navigate = useNavigate();
    
    const { data: categories, isLoading, isError } = useQuery<ProductCategory[]>({
        queryKey: ['categories'],
        queryFn: getCategories,
    });
    
    if (isLoading) {
        return <CatalogPageSkeleton />;
    }

    if (isError) {
        return (
            <>
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
                <div className="p-4 text-center text-destructive">Не удалось загрузить категории.</div>
            </>
        );
    }

    // API уже возвращает корневые категории на верхнем уровне.
    const rootCategories = categories ?? [];

    return (
        <div className="pb-8">
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>

            {/* Шапка страницы: Заголовок и кнопка поиска */}
            <div className="p-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Каталог</h1>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/search')}>
                    <Search className="h-5 w-5" />
                </Button>
            </div>

            {/* Вертикальный список карточек-категорий */}
            <div className="space-y-4 px-4">
                {rootCategories.map(category => (
                    // Мы рендерим карточку-баннер, только если у категории есть фото
                    category.image_src && <CategoryBannerCard key={category.id} category={category} />
                ))}
            </div>
        </div>
    );
};