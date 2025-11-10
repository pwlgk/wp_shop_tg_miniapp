// src/components/shared/CategorySection.tsx
import type { ProductCategory } from "@/types";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ProductCarousel } from "./ProductCarousel";

interface CategorySectionProps {
  category: ProductCategory;
}

export const CategorySection = ({ category }: CategorySectionProps) => {
    const navigate = useNavigate();

    return (
        <section className="space-y-4">
            {/* Заголовок секции */}
            <div className="flex justify-between items-center px-4">
                <h2 className="text-2xl font-bold">{category.name}</h2>
                <Button variant="ghost" asChild>
                    <Link to={`/catalog/${category.id}`}>
                        Все
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                </Button>
            </div>
            
            {/* "Таблетки" подкатегорий */}
            {category.children && category.children.length > 0 && (
                <div className="px-4 overflow-x-auto scrollbar-hide">
                    <div className="flex gap-2 whitespace-rap">
                        {category.children.map(subCategory => (
                            <Button
                                key={subCategory.id}
                                variant="secondary"
                                className="rounded-full"
                                onClick={() => navigate(`/catalog/${subCategory.id}`)}
                            >
                                {subCategory.name}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* Карусель с товарами из этой категории */}
            <ProductCarousel queryParams={{ category: category.id }} />
        </section>
    );
};