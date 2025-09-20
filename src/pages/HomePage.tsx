// src/pages/HomePage.tsx
import { useEffect, useState, useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getCategories, getProducts } from '@/api/services/catalog.api';
import { getStories } from '@/api/services/stories.api'; // Убедитесь, что этот файл существует и экспортирует getStories
import { ProductCard } from '@/components/shared/ProductCard';
import { ProductCardSkeleton } from '@/components/shared/ProductCardSkeleton';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ListFilter } from 'lucide-react';
import type { PaginatedProducts, ProductCategory, Product, Story } from '@/types';
import { useSearchParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { HomePageHeader } from '@/components/shared/HomePageHeader';
import type { InfiniteData } from '@tanstack/react-query';
import { interleaveArrays, type FeedItem } from '@/lib/utils';
import { BannerCard } from '@/components/shared/BannerCard';
import { BannersCarousel } from '@/components/shared/BannersCarousel';

const sortOptions = {
    popularity: 'Популярные',
    date: 'Новинки',
    'price-asc': 'Сначала дешевые',
    'price-desc': 'Сначала дорогие',
};
type SortKey = keyof typeof sortOptions;

export const HomePage = () => {

    
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryIdFromUrl = searchParams.get('category');
    
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
        categoryIdFromUrl ? Number(categoryIdFromUrl) : null
    );
    const [sortBy, setSortBy] = useState<SortKey>('popularity');

    // 1. Запрашиваем категории для фильтров
    const { data: categories, isLoading: areCategoriesLoading } = useQuery<ProductCategory[]>({
        queryKey: ['categories'],
        queryFn: getCategories,
    });
    
    // 2. Запрашиваем баннеры/сторис для вставки в ленту
    const { data: stories } = useQuery<Story[]>({
        queryKey: ['stories'],
        queryFn: getStories,
    });

    // 3. Запрашиваем товары с бесконечной загрузкой
    const {
        data: productsData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: areProductsLoading,
    } = useInfiniteQuery<PaginatedProducts, Error, InfiniteData<PaginatedProducts>, any, number>({
        queryKey: ['products', selectedCategoryId, sortBy],
        queryFn: ({ pageParam = 1 }) => {
            const orderby = sortBy.includes('price') ? 'price' : sortBy;
            const order = sortBy === 'price-asc' ? 'asc' : 'desc';
            return getProducts({ page: pageParam, category: selectedCategoryId ?? undefined, orderby, order });
        },
        getNextPageParam: (lastPage) => (lastPage.current_page < lastPage.total_pages ? lastPage.current_page + 1 : undefined),
        initialPageParam: 1,
    });

    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

    useEffect(() => {
        if (selectedCategoryId) {
            setSearchParams({ category: String(selectedCategoryId) }, { replace: true });
        } else {
            setSearchParams({}, { replace: true });
        }
    }, [selectedCategoryId, setSearchParams]);

    const allProducts = productsData?.pages?.flatMap((page) => page.items) ?? [];
    const allCategories = categories?.flatMap(cat => [cat, ...(cat.children ?? [])]) ?? [];
    
    // 4. "Смешиваем" товары и баннеры в единую ленту
    const mixedFeed = useMemo(() => {
        if (!allProducts.length || !stories?.length) {
            return allProducts.map(p => ({ type: 'product', data: p })) as FeedItem[];
        }
        // Вставляем баннер после каждых 5-х товаров
        return interleaveArrays(allProducts, stories, 5);
    }, [allProducts, stories]);

    return (
        <div className="relative">
            <HomePageHeader />
            
            <main className="space-y-6 pb-4">
                <BannersCarousel />
                {/* Панель фильтров (не липкая) */}
                <div className="px-4 overflow-x-auto scrollbar-hide">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="shrink-0 rounded-2xl"><ListFilter className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as SortKey)}>
                                    {Object.entries(sortOptions).map(([key, value]) => (
                                        <DropdownMenuRadioItem key={key} value={key}>{value}</DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            variant={selectedCategoryId === null ? 'default' : 'outline'}
                            onClick={() => setSelectedCategoryId(null)}
                            className="shrink-0 rounded-3xl"
                        >
                            Все
                        </Button>
                        {areCategoriesLoading 
                            ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-24 rounded-3xl" />)
                            : allCategories.map((category) => (
                                <Button
                                    key={category.id}
                                    variant={selectedCategoryId === category.id ? 'default' : 'outline'}
                                    onClick={() => setSelectedCategoryId(category.id)}
                                    className="shrink-0 rounded-3xl"
                                >
                                    {category.name}
                                </Button>
                            ))}
                    </div>
                </div>

                {/* Единая "смешанная" лента */}
                <div className="px-2 pt-4 grid grid-cols-2 gap-2">
                    {areProductsLoading ? (
                        Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
                    ) : (
                        mixedFeed.map((item, index) => {
                            const key = `${item.type}-${item.data.id}-${index}`;
                            const isLastElement = index === mixedFeed.length - 1;

                            const content = item.type === 'product'
                                ? <ProductCard product={item.data as Product} />
                                : <BannerCard story={item.data as Story} />;

                            if (isLastElement) {
                                return <div ref={ref} key={key}>{content}</div>;
                            }
                            return <div key={key}>{content}</div>;
                        })
                    )}
                </div>
                
                {isFetchingNextPage && (
                    <div className="px-2 pt-4 grid grid-cols-2 gap-2">
                        <ProductCardSkeleton /><ProductCardSkeleton />
                    </div>
                )}
                {!hasNextPage && !areProductsLoading && allProducts.length > 0 && (
                    <p className="text-center text-muted-foreground py-4">Вы посмотрели все товары</p>
                )}
                {!areProductsLoading && allProducts.length === 0 && (
                    <div className="text-center text-muted-foreground py-10"><p>Товары не найдены</p></div>
                )}
            </main>
        </div>
    );
};