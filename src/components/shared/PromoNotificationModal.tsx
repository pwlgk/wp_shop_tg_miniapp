// src/components/shared/PromoNotificationModal.tsx
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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
        className="bg-background h-auto max-h-[90vh] w-screen max-w-full p-4 flex flex-col border-none rounded-t-2xl bottom-0 top-auto translate-y-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom"
        // --- ИЗМЕНЕНИЕ ЗДЕСЬ: Предотвращаем закрытие по Escape ---
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* --- НОВЫЙ БЛОК: Скрываем стандартную кнопку "X" --- */}
        <DialogClose asChild className="hidden">
            {/* Этот пустой div нужен, чтобы asChild работал, но кнопка будет скрыта классом hidden */}
            <div></div>
        </DialogClose>

        <VisuallyHidden asChild>
          <DialogTitle>{notification.title}</DialogTitle>
        </VisuallyHidden>
        
        <div className="overflow-y-auto -mx-4 px-4">
            {isBirthday 
                ? <BirthdayStory notification={notification} onClose={onClose} />
                : <PromoStory notification={notification} onClose={onClose} />
            }
        </div>
      </DialogContent>
    </Dialog>
  );
};