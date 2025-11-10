// src/components/shared/ProductPageSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { BrandHeader } from "./BrandHeader";

export const ProductPageSkeleton = () => (
    <div>
                    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>

        <main className="p-4 space-y-6 animate-pulse">
            {/* Скелетон для карусели */}
            <Skeleton className="w-full aspect-square rounded-2xl" />

            {/* Скелетон для категорий-бейджей */}
            <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-lg" />
                <Skeleton className="h-6 w-32 rounded-lg" />
            </div>

            {/* Скелетон для заголовка, цены и рейтинга */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-3/4" /> {/* h-8 для text-2xl */}
                <Skeleton className="h-9 w-1/3" /> {/* h-9 для text-3xl (цена) */}
                <Skeleton className="h-5 w-1/2" /> {/* Для рейтинга */}
            </div>

            {/* Скелетон для блока вариаций */}
            <div className="border-t pt-4 space-y-3">
                <Skeleton className="h-6 w-1/4" />
                <div className="flex gap-2">
                    <Skeleton className="h-control-sm w-20 rounded-full" />
                    <Skeleton className="h-control-sm w-24 rounded-full" />
                </div>
            </div>

            {/* Скелетон для блока описания */}
            <div className="border-t pt-4 space-y-2">
                <Skeleton className="h-8 w-1/3" /> {/* h-8 для text-2xl */}
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
        </main>
        
        {/* Скелетон для футера */}
        <div className="fixed bottom-0 left-0 right-0 p-3 border-t bg-background">
            <Skeleton className="h-control-md w-full rounded-2xl" />
        </div>
    </div>
);