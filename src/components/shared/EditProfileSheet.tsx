// src/components/shared/EditProfileSheet.tsx
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

// 1. Zod-схема для валидации формы
const profileSchema = z.object({
  first_name: z.string()
    .min(2, { message: "Имя должно содержать не менее 2 символов." })
    .regex(/^[a-zA-Zа-яА-ЯёЁ\s-]*$/, { message: "Имя содержит недопустимые символы." })
    .trim(),
  phone: z.string()
    .min(10, { message: "Введите корректный номер телефона." })
    .regex(/^(\+?\d{1,3})?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}$/, { message: "Неверный формат номера." }),
  email: z.string().email({ message: "Неверный формат почты." }).or(z.literal('')),
});

interface EditProfileSheetProps {
  user: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditProfileSheet = ({ user, open, onOpenChange }: EditProfileSheetProps) => {
  const queryClient = useQueryClient();
  const webApp = (window as any).Telegram?.WebApp;

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    // 2. Устанавливаем значения по умолчанию, обрабатывая "технический" email
    defaultValues: {
      first_name: user.first_name || '',
      phone: user.billing.phone || '',
      email: user.email?.endsWith('@telegram.user') ? '' : user.email || '',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: UserUpdate) => updateMe(data),
    onSuccess: () => {
      // При успехе инвалидируем кэши, чтобы все компоненты получили свежие данные
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success("Профиль успешно обновлен!");
      onOpenChange(false); // Закрываем панель
    },
    onError: (error) => {
      toast.error("Ошибка обновления", {
        description: error.message || "Не удалось сохранить изменения.",
      });
    },
  });

  // 3. Функция для запроса контакта через Telegram
  const handlePhoneRequest = () => {
    if (webApp?.requestContact) {
      webApp.requestContact((isShared: boolean) => {
        if (isShared) {
          // Telegram не возвращает номер напрямую, а вызывает событие
          // Поэтому мы подписываемся на него
          const listener = (event: { data: string }) => {
            if (event.data) {
              // Устанавливаем полученный номер в поле формы
              form.setValue('phone', event.data, { shouldValidate: true });
            }
            webApp.offEvent('contact_received', listener);
          };
          webApp.onEvent('contact_received', listener);
        } else {
            toast.info("Вы отменили передачу номера телефона.");
        }
      });
    } else {
        toast.warning("Функция доступна только в приложении Telegram.");
    }
  };

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    // 4. Формируем тело запроса, дублируя имя и телефон во все нужные поля
    const payload: UserUpdate = {
      first_name: values.first_name,
      last_name: '', // Как и просили, фамилию оставляем пустой
      email: values.email || user.email, // Если пользователь стер почту, оставляем старую "техническую"
      // Дублируем телефон в billing, так как API может ожидать его там
      billing: { phone: values.phone },
      shipping: { phone: values.phone },
    };
    updateProfileMutation.mutate(payload);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Редактировать профиль</SheetTitle>
          <SheetDescription>
            Ваши данные будут использоваться для оформления заказов.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имя</FormLabel>
                  <FormControl>
                    <Input placeholder="Ваше имя" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Телефон</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="+7 (999) 999-99-99" {...field} />
                    </FormControl>
                    {webApp?.isVersionAtLeast('6.9') && (
                       <Button type="button" variant="outline" onClick={handlePhoneRequest}>
                         Заполнить
                       </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (необязательно)</FormLabel>
                  <FormControl>
                    <Input placeholder="your@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
              <Button type="submit" disabled={updateProfileMutation.isPending} className="w-full">
                {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Сохранить
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};