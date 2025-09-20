// src/pages/ErrorPage.tsx
import { Button } from "@/components/ui/button";
import { AlertTriangle, ServerCrash, ShieldOff } from "lucide-react";

interface ErrorPageProps {
  statusCode: number;
  message?: string;
}

// Карта для иконок и заголовков
const errorDetails = {
    403: {
        icon: <ShieldOff className="h-20 w-20 text-destructive" />,
        title: "Доступ запрещен",
        defaultMessage: "У вас нет прав для просмотра этой страницы."
    },
    500: {
        icon: <ServerCrash className="h-20 w-20 text-destructive" />,
        title: "Ошибка на сервере",
        defaultMessage: "Что-то пошло не так. Мы уже работаем над этим."
    },
    default: {
        icon: <AlertTriangle className="h-20 w-20 text-destructive" />,
        title: "Произошла ошибка",
        defaultMessage: "Пожалуйста, попробуйте обновить страницу."
    }
}

export const ErrorPage = ({ statusCode, message }: ErrorPageProps) => {
    const details = errorDetails[statusCode as keyof typeof errorDetails] || errorDetails.default;

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen text-center p-4">
            {details.icon}
            <h1 className="text-4xl font-bold mt-4">{statusCode}</h1>
            <h2 className="text-2xl font-semibold mt-2">{details.title}</h2>
            <p className="text-muted-foreground mt-2 max-w-sm">
                {message || details.defaultMessage}
            </p>
            <Button onClick={handleRefresh} className="mt-6 h-12 text-base">
                Обновить страницу
            </Button>
        </div>
    );
};