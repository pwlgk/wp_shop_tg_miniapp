// src/pages/CatalogPage.tsx
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/api/services/catalog.api';
import type { ProductCategory } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useBackButton } from '@/hooks/useBackButton';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryBannerCard } from '@/components/shared/CategoryBannerCard';
// import { HomePageHeader } from '@/components/shared/HomePageHeader';

const CatalogPageSkeleton = () => (
    <div className="animate-pulse">
        <div className="p-4"><Skeleton className="h-9 w-1/2" /></div>
        <div className="p-4 space-y-4">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
    </div>
);

// Карточка "Все товары"
const AllProductsCard = () => (
    <Link to="/" className="block group">
        <div className="relative overflow-hidden rounded-2xl p-4 h-full bg-muted/50 hover:bg-muted transition-colors flex flex-col items-center justify-center text-center">
            <Grid className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="font-semibold text-lg">Посмотреть все товары</h3>
            <p className="text-sm text-muted-foreground">Перейти в полный каталог</p>
        </div>
    </Link>
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
        return <div className="p-4 text-center text-destructive">Не удалось загрузить категории.</div>;
    }

    // API уже возвращает корневые категории на верхнем уровне.
    const rootCategories = categories ?? [];

    return (
        <div className="pb-8">
            {/* "Липкая" шапка */}
                        {/* <HomePageHeader /> */}

            <header className=" z-30 "
                style={{ paddingTop: 'var(--tg-viewport-header-height)' }}>
                <div className="p-4 flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Каталог</h1>
                    <Button variant="ghost" size="icon" onClick={() => navigate('/search')}>
                        <Search className="h-6 w-6" />
                    </Button>
                </div>
            </header>

            {/* Вертикальный список карточек-категорий */}
            <div className="space-y-4 p-4 pt-0 ">
                {rootCategories.map(category => (
                    // Мы рендерим карточку-баннер, только если у категории есть фото
                    category.image_src && <CategoryBannerCard key={category.id} category={category} />
                ))}

                {/* Финальная карточка "Все товары" */}
                <AllProductsCard />
            </div>
        </div>
    );
};