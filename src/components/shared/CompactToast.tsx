// src/components/shared/CompactToast.tsx
import type { Notification } from '@/types';

interface CompactToastProps {
  notification: Notification;
  icon: React.ReactNode;
  onClick: () => void;
}

export const CompactToast = ({ notification, icon, onClick }: CompactToastProps) => {
  return (
    <div 
      onClick={onClick}
      className="w-full bg-background border rounded-2xl shadow-lg p-3 flex items-start gap-3 cursor-pointer"
    >
      <div className="mt-1">{icon}</div>
      <div className="flex-grow">
        <h3 className="font-semibold">{notification.title}</h3>
        {notification.message && <p className="text-sm text-muted-foreground">{notification.message}</p>}
      </div>
    </div>
  );
};