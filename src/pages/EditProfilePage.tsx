// src/pages/EditProfilePage.tsx
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, parse, isValid } from "date-fns";
import { ru } from "date-fns/locale";
import { getMe, updateMe } from "@/api/services/user.api";
import type { UserUpdate } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useBackButton } from "@/hooks/useBackButton";
import { useNavigate } from "react-router-dom";
import { formatDateInput, isDateComplete } from "@/lib/utils";

const profileSchema = z.object({
  first_name: z.string().min(2, { message: "Имя слишком короткое." }).regex(/^[a-zA-Zа-яА-ЯёЁ\s-]*$/, { message: "Недопустимые символы." }).trim(),
  last_name: z.string().min(2, { message: "Фамилия слишком короткая." }).regex(/^[a-zA-Zа-яА-ЯёЁ\s-]*$/, { message: "Недопустимые символы." }).trim(),
  phone: z.string().min(10, { message: "Введите корректный номер." }).regex(/^(\+?\d{1,3})?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}$/, { message: "Неверный формат." }),
  email: z.string().email({ message: "Неверный формат почты." }).or(z.literal('')),
  city: z.string().min(2, { message: "Название города слишком короткое." }).trim(),
  birth_date: z.date({ invalid_type_error: "Пожалуйста, выберите корректную дату." }).optional(),
});

export const EditProfilePage = () => {
  useBackButton();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user, isLoading: isUserLoading } = useQuery({ queryKey: ['me'], queryFn: getMe });

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '', last_name: '', phone: '', email: '', city: '', birth_date: undefined,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        first_name: user.first_name || '',
        last_name: user.last_name || user.billing.last_name || '',
        phone: user.billing.phone || '',
        email: user.email?.endsWith('@telegram.user') ? '' : user.email || '',
        city: user.billing.city || '',
        birth_date: user.birth_date ? new Date(user.birth_date) : undefined,
      });
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: UserUpdate) => updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success("Профиль успешно обновлен!");
      navigate(-1);
    },
    onError: (error) => {
      toast.error("Ошибка обновления", { description: error.message || "Не удалось сохранить изменения." });
    },
  });

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    const payload: UserUpdate = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email || user?.email,
      birth_date: values.birth_date ? format(values.birth_date, 'yyyy-MM-dd') : undefined,
      billing: { first_name: values.first_name, last_name: values.last_name, phone: values.phone, city: values.city },
      shipping: { first_name: values.first_name, last_name: values.last_name, phone: values.phone, city: values.city },
    };
    updateProfileMutation.mutate(payload);
  };

  if (isUserLoading) {
    return <div className="p-4 text-center">Загрузка данных профиля...</div>;
  }

  const canEditBirthDate = !user?.birth_date;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Редактирование</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="first_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Имя</FormLabel>
                <FormControl><Input placeholder="Имя" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="last_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Фамилия</FormLabel>
                <FormControl><Input placeholder="Фамилия" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem>
              <FormLabel>Телефон</FormLabel>
              <FormControl><Input placeholder="+7 (999) 999-99-99" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email (необязательно)</FormLabel>
              <FormControl><Input placeholder="your@email.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="city" render={({ field }) => (
            <FormItem>
              <FormLabel>Город</FormLabel>
              <FormControl><Input placeholder="Город доставки" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {canEditBirthDate && (
            <FormField
              control={form.control}
              name="birth_date"
              render={({ field }) => {
                // Локальное состояние для управления текстом в поле ввода
                const [inputValue, setInputValue] = useState(
                  field.value ? format(field.value, 'dd.MM.yyyy') : ''
                );

                // Синхронизируем локальное состояние, если дата меняется извне (например, через календарь)
                useEffect(() => {
                  if (field.value) {
                    setInputValue(format(field.value, 'dd.MM.yyyy'));
                  } else {
                    setInputValue('');
                  }
                }, [field.value]);

                return (
                  <FormItem className="flex flex-col">
                    <FormLabel>Дата рождения</FormLabel>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="ДД.ММ.ГГГГ"
                        value={inputValue} // Input использует локальное состояние
                        onChange={(e) => {
                          const formatted = formatDateInput(e.target.value);
                          setInputValue(formatted); // Обновляем локальное состояние немедленно

                          // Если дата введена полностью, пытаемся обновить состояние формы
                          if (isDateComplete(formatted)) {
                            const date = parse(formatted, 'dd.MM.yyyy', new Date());
                            if (isValid(date)) {
                              field.onChange(date); // Обновляем react-hook-form
                            }
                          }
                        }}
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="outline" size="icon" className="shrink-0">
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date); // При выборе обновляем состояние формы
                            }}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                            locale={ru}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormDescription>Укажите, чтобы получить бонус на день рождения. Изменить дату позже будет нельзя.</FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          )}

          <Button type="submit" disabled={updateProfileMutation.isPending} className="w-full h-control-md text-base rounded-2xl"
          >
            {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Сохранить изменения
          </Button>
        </form>
      </Form>
    </div>
  );
};