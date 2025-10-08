// src/pages/NotFoundPage.tsx
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";

export const NotFoundPage = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center p-4">
            <SearchX className="h-20 w-20 text-muted-foreground mb-4" />
            <h1 className="text-4xl font-bold">404</h1>
            <h2 className="text-2xl font-semibold mt-2">Страница не найдена</h2>
            <p className="text-muted-foreground mt-2 max-w-sm">
                К сожалению, страница, которую вы ищете, не существует или была перемещена.
            </p>
            <Button asChild className="mt-6 h-control-md text-base rounded-2xl">
                <Link to="/">Вернуться на главную</Link>
            </Button>
        </div>
    );
};