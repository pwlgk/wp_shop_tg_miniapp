// src/pages/SearchPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getProducts, getCategories } from '@/api/services/catalog.api';
import { getStories } from '@/api/services/stories.api';
import { useBackButton } from '@/hooks/useBackButton';
import { useInView } from 'react-intersection-observer';
import { createSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchInput } from '@/components/shared/SearchInput';
import { ProductCard } from '@/components/shared/ProductCard';
import { BannerCard } from '@/components/shared/BannerCard';
import { ProductCardSkeleton } from '@/components/shared/ProductCardSkeleton';
import { interleaveArrays, type FeedItem } from '@/lib/utils';
import type { ProductCategory, Story, Product } from '@/types';
import { BrandHeader } from '@/components/shared/BrandHeader';

const CategoryPills = ({ categories, isLoading }: { categories: ProductCategory[], isLoading: boolean }) => {
    const navigate = useNavigate();
     const findParent = (childId: number, allCategories: ProductCategory[]): ProductCategory | undefined => {
        for (const category of allCategories) {
            if (category.children?.some(child => child.id === childId)) {
                return category;
            }
        }
        return undefined;
    };
    
    const handleCategoryClick = (category: ProductCategory) => {
        // Ищем родителя среди всего списка категорий, который мы передали
        const parent = findParent(category.id, categories);

        if (parent) {
            navigate({
                pathname: `/catalog/${parent.id}`,
                search: createSearchParams({ subcategory: String(category.id) }).toString(),
            });
        } else {
            navigate(`/catalog/${category.id}`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-wrap gap-2">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-control-sm w-24 rounded-full" />)}
            </div>
        );
    }

    if (!categories || categories.length === 0) return null;
    
    return (
        <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
                <Button 
                    key={cat.id} 
                    variant="outline" 
                    className="rounded-full h-control-sm"
                    onClick={() => handleCategoryClick(cat)}
                >
                    {cat.name}
                </Button>
            ))}
        </div>
    );
};

const Feed = ({ feed, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading }: any) => {
    const { ref, inView } = useInView();
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

    if (isLoading) {
        return <div className="grid grid-cols-2 gap-3">{Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div>;
    }
    if (feed.length === 0) {
        return <div className="text-center py-10 text-muted-foreground">Ничего не найдено.</div>;
    }
    return (
        <div className="grid grid-cols-2 gap-3">
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

const isNumeric = (str: string) => /^\d+$/.test(str);

export const SearchPage = () => {
    useBackButton();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

    const { data: categories, isLoading: areCategoriesLoading } = useQuery<ProductCategory[]>({
        queryKey: ['categories'],
        queryFn: getCategories,
    });
    
    const allCategoriesAndSubcategories = useMemo(() => {
        if (!categories) return [];
        return categories.flatMap(cat => [cat, ...(cat.children ?? [])]);
    }, [categories]);

    const { data: stories } = useQuery<Story[]>({
        queryKey: ['stories'],
        queryFn: getStories,
    });

    const recommendedQuery = useInfiniteQuery({
        queryKey: ['products', 'recommended'],
        queryFn: ({ pageParam = 1 }) => getProducts({ page: pageParam, orderby: 'popularity' }),
        getNextPageParam: (lastPage) => lastPage.current_page < lastPage.total_pages ? lastPage.current_page + 1 : undefined,
        initialPageParam: 1,
        enabled: !debouncedSearchTerm.trim(),
    });

    const searchQuery = useInfiniteQuery({
        queryKey: ['search', debouncedSearchTerm],
        queryFn: ({ pageParam = 1 }) => {
            const trimmedSearch = debouncedSearchTerm.trim();
            const params: { page: number; search?: string; sku?: string } = { page: pageParam };
            if (isNumeric(trimmedSearch)) {
                params.sku = trimmedSearch;
            } else {
                params.search = trimmedSearch;
            }
            return getProducts(params);
        },
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
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader />
            <div className="px-4 py-2  border-b" style={{ top: 'var(--tg-viewport-header-height, 0px)' }}>
                <SearchInput 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClear={() => setSearchTerm('')}
                    autoFocus
                />
            </div></header>

            <main className="space-y-6 p-4">
                {isSearching ? (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Результаты поиска</h2>
                        <Feed 
                            feed={searchFeed}
                            fetchNextPage={searchQuery.fetchNextPage}
                            hasNextPage={searchQuery.hasNextPage}
                            isFetchingNextPage={searchQuery.isFetchingNextPage}
                            isLoading={searchQuery.isLoading}
                        />
                    </div>
                ) : (
                    <>
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Популярные категории</h2>
                            <CategoryPills categories={allCategoriesAndSubcategories} isLoading={areCategoriesLoading} />
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">Рекомендуем для вас</h2>
                            <Feed 
                                feed={recommendedFeed}
                                fetchNextPage={recommendedQuery.fetchNextPage}
                                hasNextPage={recommendedQuery.hasNextPage}
                                isFetchingNextPage={recommendedQuery.isFetchingNextPage}
                                isLoading={recommendedQuery.isLoading}
                            />
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};