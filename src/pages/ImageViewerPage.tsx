// src/pages/ImageViewerPage.tsx

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ImageViewer } from '@/components/shared/ImageViewer';
import { useBackButton } from '@/hooks/useBackButton';
import type { ProductImage } from '@/types';
import { BrandHeader } from '@/components/shared/BrandHeader';
import { Skeleton } from '@/components/ui/skeleton';

// Скелетон остается таким же, он хорошо вписывается в концепцию
const ImageViewerPageSkeleton = () => (
    <div className="h-dvh flex flex-col">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm">
            <BrandHeader />
        </header>
        <div className="flex-grow flex items-center justify-center">
            <Skeleton className="h-64 w-64 rounded-2xl" />
        </div>
    </div>
);


export const ImageViewerPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // useBackButton будет обрабатывать нажатие на нативную кнопку "Назад" в Telegram
    useBackButton();

    const [isLoading, setIsLoading] = useState(true);

    const { images, initialImageId } = (location.state || {}) as {
        images?: ProductImage[];
        initialImageId?: number;
    };

    useEffect(() => {
        if (!images || images.length === 0) {
            console.warn("[ImageViewerPage] No images found. Navigating back.");
            navigate(-1);
        } else {
            setTimeout(() => setIsLoading(false), 0);
        }
    }, [images, navigate]);


    if (isLoading) {
        return <ImageViewerPageSkeleton />;
    }
    
    if (!images) return null;


    return (
        // --- ИЗМЕНЕНИЕ: Основной контейнер с темным фоном ---
        <div className="bg-background h-dvh flex flex-col">
            {/* 1. Шапка, прилипающая к верху */}
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm">
                <BrandHeader />
            </header>
            
            {/* 2. Контейнер для карусели, занимающий все оставшееся место */}
            <main className="flex-grow min-h-0">
                <ImageViewer 
                    images={images}
                    initialImageId={initialImageId}
                />
            </main>
        </div>
    );
};