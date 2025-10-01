// src/pages/SearchPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getProducts, getCategories } from '@/api/services/catalog.api';
import { getStories } from '@/api/services/stories.api';
import { useBackButton } from '@/hooks/useBackButton';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchInput } from '@/components/shared/SearchInput';
import { ProductCard } from '@/components/shared/ProductCard';
import { BannerCard } from '@/components/shared/BannerCard';
import { ProductCardSkeleton } from '@/components/shared/ProductCardSkeleton';
import { interleaveArrays, type FeedItem } from '@/lib/utils';
import type { ProductCategory, Story, Product } from '@/types';

// --- Вложенный Компонент для "Таблеток" Категорий ---
const CategoryPills = ({ categories, isLoading }: { categories: ProductCategory[], isLoading: boolean }) => {
    const navigate = useNavigate();
    
    if (isLoading) {
        return (
            <div className="flex flex-wrap gap-2 px-4">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-9 w-24 rounded-full" />)}
            </div>
        );
    }

    if (!categories || categories.length === 0) return null;
    
    return (
        <div className="flex flex-wrap gap-2 px-4">
            {categories.map(cat => (
                <Button 
                    key={cat.id} 
                    variant="secondary" 
                    className="rounded-full" // Делаем таблетки овальными
                    onClick={() => navigate(`/catalog/${cat.id}`)}
                >
                    {cat.name}
                </Button>
            ))}
        </div>
    );
};

// --- Вложенный Компонент для Ленты Товаров ---
const Feed = ({ feed, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading }: any) => {
    const { ref, inView } = useInView();
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

    if (isLoading) {
        return <div className="px-4 grid grid-cols-2 gap-4">{Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div>;
    }
    if (feed.length === 0) {
        return <div className="text-center py-10 text-muted-foreground">Ничего не найдено.</div>;
    }
    return (
        <div className="px-4 grid grid-cols-2 gap-4">
            {feed.map((item: FeedItem, index: number) => {
                const key = `${item.type}-${item.data.id}-${index}`;
                const content = item.type === 'product'
                    ? <ProductCard product={item.data as Product} />
                    : <BannerCard story={item.data as Story} />;
                if (index === feed.length - 1) {
                    return <div ref={ref} key={key}>{content}</div>;
                }
                return <div key={key}>{content}</div>;
            })}
            {isFetchingNextPage && <><ProductCardSkeleton /><ProductCardSkeleton /></>}
        </div>
    );
};

// --- Основной Компонент Страницы Поиска ---
export const SearchPage = () => {
    useBackButton();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

    // Запрос 1: Категории (для начального экрана)
    const { data: categories, isLoading: areCategoriesLoading } = useQuery<ProductCategory[]>({
        queryKey: ['categories'],
        queryFn: getCategories,
    });
    // ИСПРАВЛЕНИЕ: Берем ВСЕ категории, а не только корневые
    const allCategories = categories?.flatMap(cat => [cat, ...(cat.children ?? [])]) ?? [];

    // Запрос 2: Сторис (для начального экрана)
    const { data: stories } = useQuery<Story[]>({
        queryKey: ['stories'],
        queryFn: getStories,
    });

    // Запрос 3: Рекомендуемые товары (для начального экрана)
    const recommendedQuery = useInfiniteQuery({
        queryKey: ['products', 'recommended'],
        queryFn: ({ pageParam = 1 }) => getProducts({ page: pageParam, orderby: 'popularity' }),
        getNextPageParam: (lastPage) => lastPage.current_page < lastPage.total_pages ? lastPage.current_page + 1 : undefined,
        initialPageParam: 1,
        enabled: !debouncedSearchTerm.trim(),
    });

    // Запрос 4: Результаты поиска
    const searchQuery = useInfiniteQuery({
        queryKey: ['search', debouncedSearchTerm],
        queryFn: ({ pageParam = 1 }) => getProducts({ page: pageParam, search: debouncedSearchTerm }),
        getNextPageParam: (lastPage) => lastPage.current_page < lastPage.total_pages ? lastPage.current_page + 1 : undefined,
        initialPageParam: 1,
        enabled: !!debouncedSearchTerm.trim(),
    });

    const recommendedProducts = recommendedQuery.data?.pages.flatMap(p => p.items) ?? [];
    const searchResults = searchQuery.data?.pages.flatMap(p => p.items) ?? [];

    const recommendedFeed = useMemo(() => {
        if (!recommendedProducts.length) return [];
        return interleaveArrays(recommendedProducts, stories ?? [], 7);
    }, [recommendedProducts, stories]);
    
    const searchFeed = searchResults.map(p => ({ type: 'product', data: p })) as FeedItem[];
    const isSearching = !!debouncedSearchTerm.trim();

    return (
        <div>
            {/* ИСПРАВЛЕНИЕ: Добавляем `rounded-b-2xl` к "липкой" шапке */}
            <header className="sticky top-2 mx-3 bg-background/80 backdrop-blur-sm z-30 rounded-3xl" style={{ paddingTop: 'var(--tg-viewport-header-height)' }}>
                <div className="py-1 px-1 mb-3">
                    <SearchInput 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClear={() => setSearchTerm('')}
                        autoFocus
                    />
                </div>
            </header>

            <main className="space-y-6 py-4">
                {isSearching ? (
                    <div>
                        <h2 className="text-xl font-bold px-4 mb-4">Результаты поиска</h2>
                        <Feed 
                            feed={searchFeed}
                            fetchNextPage={searchQuery.fetchNextPage}
                            hasNextPage={searchQuery.hasNextPage}
                            isFetchingNextPage={searchQuery.isFetchingNextPage}
                            isLoading={searchQuery.isLoading}
                        />
                    </div>
                ) : (
                    <div>
                        <h2 className="text-xl font-bold px-4 mb-4">Популярные категории</h2>
                        <CategoryPills categories={allCategories} isLoading={areCategoriesLoading} />

                        <h2 className="text-xl font-bold px-4 mt-6 mb-4">Рекомендуем для вас</h2>
                        <Feed 
                            feed={recommendedFeed}
                            fetchNextPage={recommendedQuery.fetchNextPage}
                            hasNextPage={recommendedQuery.hasNextPage}
                            isFetchingNextPage={recommendedQuery.isFetchingNextPage}
                            isLoading={recommendedQuery.isLoading}
                        />
                    </div>
                )}
            </main>
        </div>
    );
};