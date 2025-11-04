// src/components/shared/BrandHeader.tsx

import { useTelegramSafeArea } from "@/hooks/useTelegramSafeArea";

export const BrandHeader = () => {
    const safeArea = useTelegramSafeArea();

    const headerStyle = {
        // Устанавливаем ВЫСОТУ контейнера равной безопасной зоне + высота нашего контента
        // Высота контента = py-2 (16px) + h-8 (32px) = 48px
        height: `${(safeArea.top || 0) + 48}px`,
        // Отступ сверху для контента = безопасная зона
        paddingTop: `${safeArea.top || 0}px`,
    };

    return (
        <header 
            style={headerStyle}
            // `sticky` больше не нужен здесь, так как мы управляем высотой
            className="top-0 z-30 w-full"
        >
            {/* Внутренний контейнер для центрирования */}
            <div className="w-full h-full flex justify-center items-center">
                <img 
                    src="/logo.png"
                    alt="Logo"
                    className="h-8 w-8 rounded-full object-cover"
                />
            </div>
        </header>
    );
};