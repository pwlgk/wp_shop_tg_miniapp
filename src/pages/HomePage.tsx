// src/pages/HomePage.tsx
import { Fragment, useEffect, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getCategories, getProducts } from '@/api/services/catalog.api';
import { ProductCard } from '@/components/shared/ProductCard';
import { ProductCardSkeleton } from '@/components/shared/ProductCardSkeleton';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { BannersCarousel } from '@/components/shared/BannersCarousel';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ListFilter } from 'lucide-react';
import type { PaginatedProducts, ProductCategory } from '@/types';
import { useSearchParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { HomePageHeader } from '@/components/shared/HomePageHeader';
import type { InfiniteData } from '@tanstack/react-query';
// УДАЛЕНО: `getStories`, `Story`, `interleaveArrays`, `FeedItem`, `BannerCard`

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

    const { data: categories, isLoading: areCategoriesLoading } = useQuery<ProductCategory[]>({
        queryKey: ['categories'],
        queryFn: getCategories,
    });

    // УДАЛЕН: Запрос для `stories`

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

    // ТЕПЕРЬ ПРОСТО СПИСОК ТОВАРОВ
    const allProducts = productsData?.pages?.flatMap((page) => page.items) ?? [];
    const allCategories = categories?.flatMap(cat => [cat, ...(cat.children ?? [])]) ?? [];

    // УДАЛЕН: `mixedFeed` и `useMemo`

    return (
        <div className="relative">
            <HomePageHeader />
            
            <main className="space-y-6 pb-4">
                {/* Компонент BannersCarousel (бывшие сторис) остается здесь */}
                <div>
                    <BannersCarousel />
                </div>

                <div className="px-4 overflow-x-auto scrollbar-hide">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="shrink-0 rounded-full"><ListFilter className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-background">
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
                            className="shrink-0 rounded-full"
                        >
                            Все
                        </Button>
                        {areCategoriesLoading 
                            ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-control-sm w-24 rounded-full" />)
                            : allCategories.map((category) => (
                                <Button
                                    key={category.id}
                                    variant={selectedCategoryId === category.id ? 'default' : 'outline'}
                                    onClick={() => setSelectedCategoryId(category.id)}
                                    className="shrink-0 rounded-full"
                                >
                                    {category.name}
                                </Button>
                            ))}
                    </div>
                </div>

                {/* ЛЕНТА ТЕПЕРЬ СОСТОИТ ТОЛЬКО ИЗ ТОВАРОВ */}
                <div className="px-4 pt-4 grid grid-cols-2 gap-3">
                    {areProductsLoading ? (
                        Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
                    ) : (
                        allProducts.map((product, index) => (
                            <Fragment key={product.id}>
                                {index === allProducts.length - 1
                                    ? <div ref={ref}><ProductCard product={product} /></div>
                                    : <ProductCard product={product} />
                                }
                            </Fragment>
                        ))
                    )}
                </div>
                
                {isFetchingNextPage && (
                    <div className="px-4 pt-4 grid grid-cols-2 gap-3">
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