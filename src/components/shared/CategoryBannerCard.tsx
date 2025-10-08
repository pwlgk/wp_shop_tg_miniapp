// src/components/shared/CategoryBannerCard.tsx
import type { ProductCategory } from "@/types";
import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ArrowRight } from "lucide-react";

interface CategoryBannerCardProps {
  category: ProductCategory;
}

export const CategoryBannerCard = ({ category }: CategoryBannerCardProps) => {
  return (
    <Link to={`/catalog/${category.id}`} className="block group">
      <div className="relative overflow-hidden rounded-2xl shadow-sm transition-all duration-300 group-hover:shadow-lg">
        <AspectRatio ratio={16 / 8} className="bg-muted">
          {category.image_src ? (
            <img
              src={category.image_src}
              alt={category.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy" // Оптимизация: ленивая загрузка
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted to-accent" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-4 md:p-6">
            <h3 className="text-white text-2xl font-bold text-shadow">
              {category.name}
            </h3>
          </div>
          <div className="absolute top-4 right-4 h-control-xs w-control-xs rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="h-5 w-5" />
          </div>
        </AspectRatio>
      </div>
    </Link>
  );
};