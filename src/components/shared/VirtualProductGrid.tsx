// src/components/shared/VirtualProductGrid.tsx
import { useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { FeedItem } from '@/lib/utils';
import { ProductCard } from './ProductCard';
import { BannerCard } from './BannerCard';
import type { Product, Story } from '@/types';

interface VirtualProductGridProps {
  items: FeedItem[];
  // Callback для загрузки следующей страницы
  fetchNextPage: () => void;
  hasNextPage: boolean;
}

export const VirtualProductGrid = ({ items, fetchNextPage, hasNextPage }: VirtualProductGridProps) => {
    const parentRef = useRef<HTMLDivElement>(null);

    // 1. Создаем "виртуализатор" строк
    const rowVirtualizer = useVirtualizer({
        count: Math.ceil(items.length / 2), // Количество строк (по 2 элемента в ряду)
        getScrollElement: () => parentRef.current,
        estimateSize: () => 400, // Примерная высота одной строки с карточками
        overscan: 5, // Рендерим 5 "невидимых" строк сверху и снизу
    });

    // 2. Отслеживаем скролл
    useEffect(() => {
        const virtualItems = rowVirtualizer.getVirtualItems();
        if (virtualItems.length === 0) return;

        const lastItem = virtualItems[virtualItems.length - 1];
        // Если последняя виртуальная строка отрендерена и есть следующая страница, грузим
        if (lastItem.index >= Math.ceil(items.length / 2) - 1 && hasNextPage) {
            fetchNextPage();
        }
    }, [rowVirtualizer.getVirtualItems(), items.length, hasNextPage, fetchNextPage]);


    return (
        <div ref={parentRef} className="h-[calc(100vh_-_200px)] overflow-y-auto"> {/* Контейнер для скролла */}
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const firstItemIndex = virtualRow.index * 2;
                    const secondItemIndex = firstItemIndex + 1;
                    const firstItem = items[firstItemIndex];
                    const secondItem = items[secondItemIndex];

                    return (
                        <div
                            key={virtualRow.key}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                transform: `translateY(${virtualRow.start}px)`,
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '1rem',
                                padding: '0 1rem',
                            }}
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