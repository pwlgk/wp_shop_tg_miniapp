// src/components/shared/VirtualFeed.tsx
import { useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Product, Story } from '@/types';
import { ProductCard } from './ProductCard';
import { BannerCard } from './BannerCard';
import type { FeedItem } from '@/lib/utils';

interface VirtualFeedProps {
  items: FeedItem[];
  fetchNextPage: () => void;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
}

export const VirtualFeed = ({ items, fetchNextPage, hasNextPage, isFetchingNextPage }: VirtualFeedProps) => {
    // 1. Ref для родительского элемента, который будет скроллиться
    const parentRef = useRef<HTMLDivElement>(null);
    
    // 2. Создаем "виртуализатор" для строк. У нас 2 элемента в ряду.
    const rowVirtualizer = useVirtualizer({
        count: Math.ceil(items.length / 2), // Количество строк
        getScrollElement: () => parentRef.current,
        estimateSize: () => 440, // Примерная высота одной строки карточек (подберите под ваш дизайн)
        overscan: 4, // Рендерим 4 "невидимые" строки сверху/снизу для плавности
    });

    // 3. Отслеживаем, когда пользователь доскроллил до конца
    useEffect(() => {
        const virtualItems = rowVirtualizer.getVirtualItems();
        if (virtualItems.length === 0) return;

        const lastItem = virtualItems[virtualItems.length - 1];
        if (lastItem && lastItem.index >= Math.ceil(items.length / 2) - 1 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [rowVirtualizer.getVirtualItems(), items.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        // 4. Родительский контейнер с фиксированной высотой и скроллом
        <div ref={parentRef} className="overflow-y-auto" style={{ height: `calc(100vh - 180px)` }}> {/* 180px - примерная высота хедера и футера */}
            {/* 5. Внутренний контейнер, который имитирует общую высоту */}
            <div
                className="relative w-full"
                style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
            >
                {/* 6. Рендерим только видимые элементы */}
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const firstItemIndex = virtualRow.index * 2;
                    const secondItemIndex = firstItemIndex + 1;
                    const firstItem = items[firstItemIndex];
                    const secondItem = items[secondItemIndex];

                    return (
                        <div
                            key={virtualRow.key}
                            className="absolute top-0 left-0 w-full grid grid-cols-2 gap-4 px-4"
                            style={{ transform: `translateY(${virtualRow.start}px)` }}
                        >
                            {firstItem && (
                                <div>
                                    {firstItem.type === 'product'
                                        ? <ProductCard product={firstItem.data as Product} />
                                        : <BannerCard story={firstItem.data as Story} />
                                    }
                                </div>
                            )}
                            {secondItem && (
                                <div>
                                    {secondItem.type === 'product'
                                        ? <ProductCard product={secondItem.data as Product} />
                                        : <BannerCard story={secondItem.data as Story} />
                                    }
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};