// src/pages/ProductReviewsPage.tsx
import { useParams, useLocation } from "react-router-dom";
import { useBackButton } from "@/hooks/useBackButton";
import { ReviewList } from "@/components/shared/ReviewList";

export const ProductReviewsPage = () => {
    useBackButton();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    
    // Получаем название товара и количество отзывов, переданные со страницы товара
    const { productName, ratingCount } = location.state || {};
    const productId = Number(id);

    return (
        <div>
            <div className="p-4 border-b">
                <h1 className="text-2xl font-bold">Отзывы ({ratingCount || ''})</h1>
                {productName && <p className="text-muted-foreground truncate pt-2">{productName}</p>}
            </div>
            <div className="px-4">
                <ReviewList productId={productId} />
            </div>
        </div>
    );
};