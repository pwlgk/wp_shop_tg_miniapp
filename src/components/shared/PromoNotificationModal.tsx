// src/components/shared/PromoNotificationModal.tsx
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Notification } from "@/types";
import { PromoStory } from "./PromoStory";
import { BirthdayStory } from "./BirthdayStory";

interface PromoNotificationModalProps {
  notification: Notification | null;
  onClose: () => void;
}

export const PromoNotificationModal = ({ notification, onClose }: PromoNotificationModalProps) => {
  if (!notification) return null;
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) onClose();
  };

  const isBirthday = notification.title.toLowerCase().includes('днем рождения');

  return (
    <Dialog open={!!notification} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 border-none bg-transparent shadow-none w-screen h-screen max-w-full max-h-full">
        {/* Кнопка "X" остается для универсальности */}
        {/* <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4 z-50 bg-black/20 hover:bg-black/40 text-white rounded-full" 
          onClick={onClose}
        >
          <X />
        </Button> */}
        
        {isBirthday 
            ? <BirthdayStory notification={notification} onClose={onClose} />
            : <PromoStory notification={notification} onClose={onClose} />
        }
      </DialogContent>
    </Dialog>
  );
};