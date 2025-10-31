// src/components/shared/BrandHeader.tsx

export const BrandHeader = () => {
    return (
        // --- ИЗМЕНЕНИЕ 1: Внешний контейнер ---
        // Его единственная задача - создать отступ, равный высоте "челки" Telegram.
        // Он невидимый и не имеет других стилей.
        <div 
            className="sticky pt-9"
        >
            {/* --- ИЗМЕНЕНИЕ 2: Внутренний контейнер --- */}
            {/* 
              Этот div отвечает за весь визуал: фон, отступы и центрирование.
              pt-2 и pb-2 создают "воздух" вокруг логотипа.
            */}
            <div className="w-full flex justify-center pt-2 pb-2">
                <img 
                    src="/logo.png" // Ваша заглушка
                    alt="Logo"
                    className="h-8 w-8 rounded-full object-cover"
                />
            </div>
        </div>
    );
};