// src/pages/ProfilePage.tsx
import { useQuery } from '@tanstack/react-query';
import { getMe, getDashboard } from '@/api/services/user.api';
import { getActiveOrders } from '@/api/services/orders.api';
import { LoyaltyCard } from '@/components/shared/LoyaltyCard';
import { ActiveOrdersCarousel, OrderHistoryCard, ActiveOrdersCarouselSkeleton } from '@/components/shared/ActiveOrdersCarousel';
import { EditProfileSheet } from '@/components/shared/EditProfileSheet';
import { useState } from 'react';
// import { Button } from '@/components/ui/button'; // <-- ИСПРАВЛЕНИЕ: Удаляем неиспользуемый импорт
import { Skeleton } from '@/components/ui/skeleton';
import { useBackButton } from '@/hooks/useBackButton';
import { Link } from 'react-router-dom';
import { ChevronRight, Info, Mail, Shield, Truck, User, Bell } from 'lucide-react';

const ProfilePageSkeleton = () => (
    <div className="p-4 space-y-6 animate-pulse">
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <ActiveOrdersCarouselSkeleton />
        <div className="space-y-2 pt-6 border-t">
            <Skeleton className="h-12 w-full rounded-3xl" />
            <Skeleton className="h-12 w-full rounded-3xl" />
        </div>
    </div>
);

const ProfileLink = ({ to, icon, label, hasIndicator = false, onClick }: { to: string; icon: React.ReactNode; label: string; hasIndicator?: boolean; onClick?: (e: React.MouseEvent) => void; }) => (
    <Link to={to} onClick={onClick} className="flex items-center justify-between p-4 bg-muted/50 rounded-3xl hover:bg-muted transition-colors">
        <div className="flex items-center gap-4 relative">
            {icon}
            <span className="font-medium">{label}</span>
            {hasIndicator && <div className="absolute -top-1 -right-3 h-2 w-2 rounded-full bg-primary animate-pulse" />}
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </Link>
);

export const ProfilePage = () => {
  useBackButton();
  const [isEditSheetOpen, setEditSheetOpen] = useState(false);

  const { data: user, isLoading: isUserLoading } = useQuery({ queryKey: ['me'], queryFn: getMe });
  const { data: dashboard, isLoading: isDashboardLoading } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });
  const { data: activeOrders, isLoading: isActiveOrdersLoading } = useQuery({ queryKey: ['activeOrders'], queryFn: getActiveOrders });
  
  const isLoading = isUserLoading || isDashboardLoading || isActiveOrdersLoading;

  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  if (!user || !dashboard) {
    return <div className="p-4 text-center">Ошибка загрузки профиля</div>;
  }

  const hasActiveOrders = activeOrders && activeOrders.length > 0;
  const hasUnreadNotifications = dashboard.has_unread_notifications;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold">Здравствуйте, {user.first_name || 'пользователь'}!</h1>
      
      <LoyaltyCard dashboardData={dashboard} />

      {/* ИСПРАВЛЕНИЕ: Добавляем проверку, что activeOrders не undefined перед рендерингом */}
      {hasActiveOrders && activeOrders ? (
        <ActiveOrdersCarousel orders={activeOrders} />
      ) : (
        <OrderHistoryCard />
      )}

      <div className="space-y-2 pt-6 border-t">
        <ProfileLink 
            to="/notifications" 
            icon={<Bell className="h-5 w-5 text-primary" />} 
            label="Уведомления" 
            hasIndicator={hasUnreadNotifications}
        />
        {/* 
          Обновили ProfileLink, чтобы он мог открывать Sheet.
          Мы передаем to="/profile/details", но onClick перехватывает событие.
        */}
        <ProfileLink 
            to="/profile/details" 
            icon={<User className="h-5 w-5 text-primary" />} 
            label="Мои данные"
            
        />
        
        <div className="border-t pt-4 mt-4 space-y-2">
            <ProfileLink to="/page/about" icon={<Info className="h-5 w-5 text-primary" />} label="О магазине" />
            <ProfileLink to="/page/delivery" icon={<Truck className="h-5 w-5 text-primary" />} label="Доставка и оплата" />
            <ProfileLink to="/page/privacy-policy" icon={<Shield className="h-5 w-5 text-primary" />} label="Политика конфиденциальности" />
            <ProfileLink to="/page/contacts" icon={<Mail className="h-5 w-5 text-primary" />} label="Контакты" />
        </div>
      </div>
      
      <EditProfileSheet 
        user={user}
        open={isEditSheetOpen}
        onOpenChange={setEditSheetOpen}
      />
    </div>
  );
};