// src/components/shared/CheckoutEditProfile.tsx
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateMe } from "@/api/services/user.api";
import type { UserProfile, UserUpdate } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"; // <-- Заменяем импорты
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

// Схема валидации (можно вынести в отдельный файл, чтобы не дублировать)
const profileSchema = z.object({
  first_name: z.string().min(2, "Имя слишком короткое.").trim(),
  last_name: z.string().min(2, "Фамилия слишком короткая.").trim(),
  phone: z.string().min(10, "Введите корректный номер.").trim(),
  city: z.string().min(2, "Название города слишком короткое.").trim(),
  email: z.string().email("Неверный формат почты.").or(z.literal('')),
});

interface CheckoutEditProfileProps {
  user: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CheckoutEditProfile = ({ user, open, onOpenChange }: CheckoutEditProfileProps) => {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user.first_name || '',
      last_name: user.last_name || user.billing.last_name || '',
      phone: user.billing.phone || '',
      email: user.email?.endsWith('@telegram.user') ? '' : user.email || '',
      city: user.billing.city || '',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: UserUpdate) => updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success("Данные обновлены!");
      onOpenChange(false);
    },
    onError: (error: any) => {
        toast.error("Ошибка обновления", { description: error.response?.data?.detail || "Не удалось сохранить изменения." });
    },
  });

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    const payload: UserUpdate = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email || user.email,
        billing: { first_name: values.first_name, last_name: values.last_name, phone: values.phone, city: values.city },
        shipping: { first_name: values.first_name, last_name: values.last_name, phone: values.phone, city: values.city },
    };
    updateProfileMutation.mutate(payload);
  };
  
  const handleOpenChange = (isOpen: boolean) => {
      // Предотвращаем закрытие во время загрузки
      if (updateProfileMutation.isPending) return;
      onOpenChange(isOpen);
  }

  return (
    // Заменяем Sheet на Dialog
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="h-screen w-screen max-w-full flex flex-col p-0 gap-0" // <-- Стили для полноэкранного режима
        onOpenAutoFocus={(e) => e.preventDefault()} // Предотвращаем авто-фокус на первом поле
      >
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Ваши данные</DialogTitle>
          <DialogDescription>Имя и телефон обязательны для связи.</DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto ">
            <Form {...form}>
            <form id="edit-profile-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
                <FormField name="first_name" render={({ field }) => ( <FormItem><FormLabel>Имя</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField name="last_name" render={({ field }) => ( <FormItem><FormLabel>Фамилия</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField name="phone" render={({ field }) => ( <FormItem><FormLabel>Телефон</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField name="city" render={({ field }) => ( <FormItem><FormLabel>Город</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
            </form>
            </Form>
        </div>

        <DialogFooter className="p-4 border-t">
          <Button 
            type="submit" 
            form="edit-profile-form" // Связываем кнопку с формой
            disabled={updateProfileMutation.isPending} 
            className="w-full h-12 text-base rounded-2xl"
          >
            {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}