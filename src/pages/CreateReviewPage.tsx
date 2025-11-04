// src/pages/CreateReviewPage.tsx

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createReview, uploadMedia } from "@/api/services/reviews.api";
import { getProductById } from "@/api/services/catalog.api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Star, Loader2, ImagePlus, X, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useBackButton } from "@/hooks/useBackButton";
import { useParams, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandHeader } from "@/components/shared/BrandHeader";

const reviewSchema = z.object({
  rating: z.number().min(1, { message: "Пожалуйста, поставьте оценку." }),
  review: z.string().min(10, { message: "Отзыв должен содержать не менее 10 символов." }).max(1000, "Отзыв слишком длинный."),
});

const CreateReviewPageSkeleton = () => (
  <>
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
    <div className="p-4 animate-pulse">
      <Skeleton className="h-8 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-6" />
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-control-md w-full rounded-2xl mt-4" />
      </div>
    </div>
  </>
);

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 3;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const CreateReviewPage = () => {
  useBackButton();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = Number(id);
  const queryClient = useQueryClient();

  const { data: product, isLoading: isProductLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProductById(productId),
    enabled: !!productId,
  });

  const [hoveredRating, setHoveredRating] = useState(0);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, review: "" },
  });

  const uploadMutation = useMutation({ mutationFn: (files: File[]) => uploadMedia(files) });

  const reviewMutation = useMutation({
    mutationFn: (data: { review: string; rating: number; image_ids?: number[] }) =>
      createReview(productId, data),
    onSuccess: () => {
      toast.success("Спасибо за ваш отзыв!");
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      navigate(`/product/${productId}`, { replace: true });
    },
    onError: (error: any) => {
      toast.error("Не удалось отправить отзыв", { description: error.response?.data?.detail || error.message });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const newFiles = Array.from(event.target.files);
    const validFiles: File[] = [];
    
    for (const file of newFiles) {
      if (imageFiles.length + validFiles.length >= MAX_FILES) {
        toast.warning(`Можно прикрепить не более ${MAX_FILES} изображений.`);
        break;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`Файл "${file.name}" слишком большой.`, {
          description: `Максимальный размер файла: ${MAX_FILE_SIZE_MB} МБ.`,
        });
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setImageFiles(prev => [...prev, ...validFiles]);
      const urls = validFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...urls]);
    }
    
    event.target.value = '';
  };

  const removeImage = (index: number) => {
    const previewToRemove = imagePreviews[index];
    URL.revokeObjectURL(previewToRemove);
    setImageFiles(files => files.filter((_, i) => i !== index));
    setImagePreviews(previews => previews.filter((_, i) => i !== index));
  };

  useEffect(() => {
    // Очищаем все URL-объекты при размонтировании компонента, чтобы избежать утечек памяти
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const onSubmit = (values: z.infer<typeof reviewSchema>) => {
    if (imageFiles.length > 0) {
      uploadMutation.mutate(imageFiles, {
        onSuccess: (uploadedImages) => {
          const image_ids = uploadedImages.map(img => img.id);
          reviewMutation.mutate({ ...values, image_ids });
        },
        onError: () => toast.error("Ошибка загрузки изображений.")
      });
    } else {
      reviewMutation.mutate(values);
    }
  };

  const isLoading = uploadMutation.isPending || reviewMutation.isPending;

  if (isProductLoading) {
    return <CreateReviewPageSkeleton />;
  }

  if (!product?.can_review) {
    return (
      <>
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center p-4">
          <ShieldAlert className="h-16 w-16 text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold">Невозможно оставить отзыв</h2>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Вы уже оставили отзыв на этот товар или еще не совершали его покупку.
          </p>
          <Button onClick={() => navigate(-1)} className="mt-6 h-control-md rounded-2xl">
            Вернуться назад
          </Button>
        </div>
      </>
    );
  }

  return (
    <div>
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
      <div className="p-4">
        <div className="pb-4 border-b mb-6">
          <h1 className="text-2xl font-bold">Оставить отзыв</h1>
          <p className="text-muted-foreground">Поделитесь вашим мнением о товаре</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ваша оценка</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-1" onMouseLeave={() => setHoveredRating(0)}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn("h-8 w-8 cursor-pointer transition-colors", (hoveredRating || field.value) >= star ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/50')}
                          onMouseEnter={() => setHoveredRating(star)}
                          onClick={() => field.onChange(star)}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="review"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>Текст отзыва</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Расскажите о своих впечатлениях..." {...field} className="h-32 rounded-2xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Прикрепить фото (до {MAX_FILES} шт., макс. {MAX_FILE_SIZE_MB} МБ)</FormLabel>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                {imagePreviews.map((src, index) => (
                  <div key={src} className="relative aspect-square">
                    <img src={src} className="h-full w-full object-cover rounded-lg" alt={`Preview ${index}`} />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/50 text-white hover:bg-black/70"
                      onClick={() => removeImage(index)}
                      aria-label={`Удалить изображение ${index + 1}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {imageFiles.length < MAX_FILES && (
                  <Label 
                    htmlFor="review-images" 
                    className="cursor-pointer aspect-square border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <ImagePlus className="h-8 w-8" />
                    <span className="sr-only">Добавить изображение</span>
                  </Label>
                )}
                <Input 
                  id="review-images" 
                  type="file" 
                  multiple 
                  accept="image/jpeg, image/png, image/webp" 
                  className="sr-only" 
                  onChange={handleFileChange} 
                />
              </div>
            </FormItem>

            <div className="pt-4">
              <Button type="submit" disabled={isLoading} className="w-full h-control-md rounded-2xl">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Отправить отзыв
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};