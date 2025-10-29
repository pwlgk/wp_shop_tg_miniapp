// src/components/shared/ReviewForm.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReview, uploadMedia } from "@/api/services/reviews.api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Star, Loader2, ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

const reviewSchema = z.object({
  rating: z.number().min(1, { message: "Пожалуйста, поставьте оценку." }),
  review: z.string().min(10, { message: "Отзыв должен содержать не менее 10 символов." }).max(1000, "Отзыв слишком длинный."),
});

interface ReviewFormProps {
  productId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReviewForm = ({ productId, open, onOpenChange }: ReviewFormProps) => {
  const queryClient = useQueryClient();
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
      handleClose();
    },
    onError: (error: any) => {
      toast.error("Не удалось отправить отзыв", { description: error.response?.data?.detail || error.message });
    },
  });
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files).slice(0, 5 - imageFiles.length);
      setImageFiles(prev => [...prev, ...files]);
      const urls = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...urls]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(files => files.filter((_, i) => i !== index));
    setImagePreviews(previews => previews.filter((_, i) => i !== index));
  };
  
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

  const handleClose = () => {
    form.reset();
    setImageFiles([]);
    setImagePreviews([]);
    onOpenChange(false);
  }

  const isLoading = uploadMutation.isPending || reviewMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Оставить отзыв</DialogTitle>
          <DialogDescription>Поделитесь вашим мнением о товаре</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <FormItem>
                  <FormLabel>Текст отзыва</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Расскажите о своих впечатлениях..." {...field} className="h-24" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem>
                <FormLabel>Прикрепить фото (до 5 шт.)</FormLabel>
                <FormControl>
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
                        {imagePreviews.map((src, index) => (
                            <div key={index} className="relative h-20 w-20 shrink-0">
                                <img src={src} className="h-full w-full object-cover rounded-lg" />
                                <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => removeImage(index)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {imageFiles.length < 5 && (
                          <Label htmlFor="review-images" className="cursor-pointer h-20 w-20 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary shrink-0">
                              <ImagePlus className="h-8 w-8" />
                          </Label>
                        )}
                        <Input id="review-images" type="file" multiple accept="image/*" className="sr-only" onChange={handleFileChange} />
                    </div>
                </FormControl>
            </FormItem>
            
            <DialogFooter className="pt-2">
              <Button type="submit" disabled={isLoading} className="w-full h-control-md rounded-2xl">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Отправить отзыв
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};