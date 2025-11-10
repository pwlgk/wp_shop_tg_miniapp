// src/components/shared/ReviewForm.tsx

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReview, uploadMedia } from "@/api/services/reviews.api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Star, ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const reviewSchema = z.object({
  rating: z.number().min(1, { message: "Пожалуйста, поставьте оценку." }),
  review: z.string().min(10, { message: "Отзыв должен содержать не менее 10 символов." }).max(1000, "Отзыв слишком длинный."),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 3;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface ReviewFormProps {
  productId: number;
  onSuccess: () => void;
  // Передаем id формы, чтобы связать с внешней кнопкой
  formId: string; 
}

export const ReviewForm = ({ productId, onSuccess, formId }: ReviewFormProps) => {
  const queryClient = useQueryClient();
  const [hoveredRating, setHoveredRating] = useState(0);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, review: "" },
  });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => uploadMedia(files),
    onError: () => toast.error("Ошибка загрузки изображений.")
  });

  const reviewMutation = useMutation({
    mutationFn: (data: { review: string; rating: number; image_ids?: number[] }) => createReview(productId, data),
    onSuccess: () => {
      toast.success("Спасибо за ваш отзыв!");
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      onSuccess(); // Вызываем колбэк для перехода на другую страницу
    },
    onError: (error: any) => toast.error("Не удалось отправить отзыв", { description: error.response?.data?.detail || error.message }),
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
            toast.error(`Файл "${file.name}" слишком большой.`, { description: `Максимальный размер файла: ${MAX_FILE_SIZE_MB} МБ.` });
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
    return () => { imagePreviews.forEach(url => URL.revokeObjectURL(url)) };
  }, [imagePreviews]);

  const onSubmit = (values: ReviewFormData) => {
    if (imageFiles.length > 0) {
      uploadMutation.mutate(imageFiles, {
        onSuccess: (uploadedImages) => {
          reviewMutation.mutate({ ...values, image_ids: uploadedImages.map(img => img.id) });
        },
      });
    } else {
      reviewMutation.mutate(values);
    }
  };

  //isLoading вынесем в родительский компонент, чтобы управлять кнопкой в футере
  
  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Поле "Ваша оценка" */}
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ваша оценка</FormLabel>
              <FormControl>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn("h-8 w-8 cursor-pointer transition-colors", (hoveredRating || field.value) >= star ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/50')}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => field.onChange(star)}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Поле "Текст отзыва" */}
        <FormField
          control={form.control}
          name="review"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Текст отзыва</FormLabel>
              <FormControl><Textarea placeholder="Расскажите о своих впечатлениях..." {...field} className="h-32 rounded-2xl" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Блок загрузки фото */}
        <FormItem>
          <FormLabel>Прикрепить фото (до {MAX_FILES} шт., макс. {MAX_FILE_SIZE_MB} МБ)</FormLabel>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(80px,1fr))] gap-3">
            {imagePreviews.map((src, index) => (
              <div key={src} className="relative aspect-square">
                <img src={src} className="h-full w-full object-cover rounded-lg" alt={`Preview ${index}`} />
                <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/50" onClick={() => removeImage(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {imageFiles.length < MAX_FILES && (
              <Label htmlFor="review-images" className="cursor-pointer aspect-square border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:border-primary">
                <ImagePlus className="h-8 w-8" />
              </Label>
            )}
            <Input id="review-images" type="file" multiple accept="image/*" className="sr-only" onChange={handleFileChange} />
          </div>
        </FormItem>
      </form>
    </Form>
  );
};