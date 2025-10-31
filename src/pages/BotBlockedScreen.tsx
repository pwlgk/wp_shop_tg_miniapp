// src/pages/BotBlockedScreen.tsx
import { Button } from "@/components/ui/button";
import { Bot, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from '@tanstack/react-query';
import { copyTextToClipboard } from '@telegram-apps/sdk'; // <-- 1. Импортируем новую функцию

const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'YourBotUsername';

interface BotBlockedScreenProps {
    onDismiss: () => void;
}

export const BotBlockedScreen = ({ onDismiss }: BotBlockedScreenProps) => {
    const queryClient = useQueryClient();

    // 2. Делаем обработчик асинхронным
    const handleCopyUsername = async () => {
        try {
            // 3. Используем новую функцию. Она вернет Promise.
            await copyTextToClipboard(`@${BOT_USERNAME}`);
            toast.success("Имя бота скопировано!");
        } catch (error) {
            // Если SDK по какой-то причине не сработает (например, вне Telegram),
            // используем стандартный метод браузера как фолбэк.
            console.error("SDK copy failed, falling back to navigator:", error);
            navigator.clipboard.writeText(`@${BOT_USERNAME}`).then(() => {
                toast.success("Имя бота скопировано!");
            }).catch(err => {
                toast.error("Не удалось скопировать");
                console.error("Fallback copy failed:", err);
            });
        }
    };

    const handleRefresh = () => {
        // Принудительно перезапрашиваем дашборд, чтобы проверить статус
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        onDismiss();
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen text-center p-6 bg-background">
            <Bot className="h-20 w-20 text-destructive mb-4" />
            
            <h1 className="text-2xl font-bold">Бот заблокирован</h1>
            <p className="mt-2 max-w-sm text-muted-foreground">
                Чтобы мы могли отправлять вам уведомления о заказах, пожалуйста, перезапустите нашего бота.
            </p>

            <div className="mt-8 w-full max-w-sm space-y-4 text-left">
                <p className="text-sm font-semibold">Как это сделать:</p>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
                    <li>Нажмите кнопку ниже, чтобы скопировать имя бота.</li>
                    <li>Вставьте его в поиск в Telegram.</li>
                    <li>Перейдите в чат и нажмите <strong>"Запустить"</strong> или <strong>"Start"</strong>.</li>
                </ol>

                <div className="flex items-center gap-2 p-3 border rounded-2xl bg-muted">
                    <span className="font-mono text-base flex-grow">@{BOT_USERNAME}</span>
                    <Button variant="ghost" size="icon" onClick={handleCopyUsername}>
                        <Copy className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <div className="mt-8 w-full max-w-sm space-y-3">
                <Button 
                    size="lg" 
                    className="w-full h-12 text-base rounded-2xl"
                    onClick={handleRefresh}
                >
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Я перезапустил(а) бота
                </Button>
                <Button 
                    variant="ghost" 
                    size="lg" 
                    className="w-full h-12 text-base"
                    onClick={onDismiss}
                >
                    Напомнить позже
                </Button>
            </div>
        </div>
    );
};