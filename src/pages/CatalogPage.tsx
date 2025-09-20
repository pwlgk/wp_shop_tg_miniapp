// src/pages/CatalogPage.tsx
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/api/services/catalog.api';
import type { ProductCategory } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useBackButton } from '@/hooks/useBackButton';
import { useNavigate } from 'react-router-dom';
import { CategorySection } from '@/components/shared/CategorySection';
import { HomePageHeader } from '@/components/shared/HomePageHeader';

const CatalogPageSkeleton = () => (
    <div className="space-y-8 animate-pulse">
        <div className="p-4"><Skeleton className="h-9 w-1/2" /></div>
        <div className="space-y-4 px-4">
            <Skeleton className="h-8 w-1/3" />
            <div className="flex gap-2">
                <Skeleton className="h-10 w-24 rounded-full" />
                <Skeleton className="h-10 w-28 rounded-full" />
            </div>
            <div className="flex gap-4">
                <Skeleton className="h-64 w-1/2 rounded-2xl" />
                <Skeleton className="h-64 w-1/2 rounded-2xl" />
            </div>
        </div>
    </div>
);

export const CatalogPage = () => {
    useBackButton();
    
    const { data: categories, isLoading, isError } = useQuery<ProductCategory[]>({
        queryKey: ['categories'],
        queryFn: getCategories,
    });
    
    if (isLoading) {
        return <CatalogPageSkeleton />;
    }

    if (isError) {
        return <div className="p-4 text-center text-destructive">Не удалось загрузить категории.</div>;
    }

    // ИСПРАВЛЕНИЕ: API уже возвращает корневые категории.
    // Просто используем `categories` как есть.
    const rootCategories = categories ?? [];

    return (
        <div className="pb-8">
           
            <HomePageHeader />

            {/* Список секций */}
            <div className="space-y-8 mt-4">
                {rootCategories.map(category => (
                    <CategorySection key={category.id} category={category} />
                ))}
            </div>
        </div>
    );
};