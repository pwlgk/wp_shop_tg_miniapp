// src/components/shared/CategoryCard.tsx
import type { ProductCategory } from "@/types";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface CategoryCardProps {
  category: ProductCategory;
  onClick: () => void;
}

export const CategoryCard = ({ category, onClick }: CategoryCardProps) => {
  return (
    <div onClick={onClick} className="group relative overflow-hidden rounded-3xl cursor-pointer">
      <AspectRatio ratio={16 / 9}>
        <img 
          src={category.image_src || '/placeholder.png'} 
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0" />
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="text-white text-lg font-bold">{category.name}</h3>
        </div>
      </AspectRatio>
    </div>
  );
};