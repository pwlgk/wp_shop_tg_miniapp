// src/components/shared/PromoNotificationModal.tsx
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"; // Добавляем DialogTitle
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"; // Импортируем для доступности
import type { Notification } from "@/types";
import { PromoStory } from "./PromoStory";
import { BirthdayStory } from "./BirthdayStory";

interface PromoNotificationModalProps {
  notification: Notification | null;
  onClose: () => void;
}

export const PromoNotificationModal = ({ notification, onClose }: PromoNotificationModalProps) => {
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };

  if (!notification) {
    return null;
  }
  
  const isBirthday = notification.title.toLowerCase().includes('днем рождения');

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent
        // Убрали анимацию отсюда
        className="p-0 border-none bg-transparent shadow-none w-screen h-screen max-w-full flex items-center justify-center data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      >
        {/* Решение проблемы доступности: добавляем скрытый заголовок */}
        <VisuallyHidden asChild>
          <DialogTitle>{notification.title}</DialogTitle>
        </VisuallyHidden>
        
        {/* Компоненты Story теперь отвечают за собственную анимацию */}
        {isBirthday 
            ? <BirthdayStory notification={notification} onClose={onClose} />
            : <PromoStory notification={notification} onClose={onClose} />
        }
      </DialogContent>
    </Dialog>
  );
};