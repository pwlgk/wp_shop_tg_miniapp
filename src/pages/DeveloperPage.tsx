// src/pages/DeveloperPage.tsx
import { useBackButton } from "@/hooks/useBackButton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Code, Trash2 } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { BrandHeader } from "@/components/shared/BrandHeader";

export const DeveloperPage = () => {
    useBackButton();
    const queryClient = useQueryClient();

    const handleClearAllData = () => {
        queryClient.clear();
        localStorage.clear();
        sessionStorage.clear();
        toast.success("Все данные очищены!", {
            description: "Приложение будет перезагружено.",
            duration: 2000,
            onAutoClose: () => window.location.reload(),
            onDismiss: () => window.location.reload(),
        });
    };

    return (
        <div>
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
            <div className="p-4 space-y-6">
                <div className="flex items-center gap-4">
                    <Code className="h-8 w-8 text-muted-foreground" />
                    <h1 className="text-2xl font-bold">Для разработчика</h1>
                </div>
                <p className="text-sm text-muted-foreground">
                    Этот раздел предназначен для отладки и тестирования. Будьте осторожны, некоторые действия могут привести к сбросу ваших данных.
                </p>

                <div className="border-t pt-6 space-y-4">
                    <h2 className="font-semibold text-lg">Действия</h2>
                    <Button
                        variant="destructive"
                        className="w-full justify-start h-control-md rounded-2xl"
                        onClick={handleClearAllData}
                    >
                        <Trash2 className="mr-2 h-5 w-5" />
                        Очистить кэш и хранилище
                    </Button>
                    <ThemeToggle />
                </div>
            </div>
        </div>
    );
};