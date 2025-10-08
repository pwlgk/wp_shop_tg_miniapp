// src/components/shared/ProductNotFound.tsx
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PackageX } from "lucide-react"; // Иконка "коробка с крестиком"

export const ProductNotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center p-4">
            <PackageX className="h-20 w-20 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold">Товар не найден</h1>
            <p className="text-muted-foreground mt-2 max-w-sm">
                Возможно, он был снят с продажи, или ссылка, по которой вы перешли, устарела.
            </p>
            <Button asChild className="mt-6 h-12 text-base rounded-2xl">
                <Link to="/catalog">Вернуться в каталог</Link>
            </Button>
        </div>
    );
};