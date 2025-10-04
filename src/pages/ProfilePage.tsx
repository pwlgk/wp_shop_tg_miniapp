// src/pages/ProfilePage.tsx
import { useQuery } from '@tanstack/react-query';
import { getMe, getDashboard } from '@/api/services/user.api';
import { getActiveOrders } from '@/api/services/orders.api';
import { LoyaltyCard } from '@/components/shared/LoyaltyCard';
import { ActiveOrdersCarousel, OrderHistoryCard, ActiveOrdersCarouselSkeleton } from '@/components/shared/ActiveOrdersCarousel';
import { EditProfileSheet } from '@/components/shared/EditProfileSheet';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useBackButton } from '@/hooks/useBackButton';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Info, Mail, Shield, Truck, User, Bell, Users } from 'lucide-react';

const ProfilePageSkeleton = () => (
    <div className="p-4 space-y-6 animate-pulse">
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <ActiveOrdersCarouselSkeleton />
        <div className="space-y-2 pt-6 border-t">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
        </div>
    </div>
);

const ProfileLink = ({ to, icon, label, hasIndicator = false, onClick }: { to: string; icon: React.ReactNode; label: string; hasIndicator?: boolean; onClick?: (e: React.MouseEvent) => void; }) => (
    <Link to={to} onClick={onClick} className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl hover:bg-muted transition-colors">
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
  const navigate = useNavigate(); // <-- Вызываем хуки до всех условий
  const [isEditSheetOpen, setEditSheetOpen] = useState(false);

  // --- ИСПРАВЛЕНИЕ: ВСЕ ХУКИ useQuery ВЫНЕСЕНЫ НАВЕРХ ---
  const { data: user, isLoading: isUserLoading } = useQuery({ queryKey: ['me'], queryFn: getMe });
  const { data: dashboard, isLoading: isDashboardLoading } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });
  const { data: activeOrders, isLoading: isActiveOrdersLoading } = useQuery({ 
      queryKey: ['activeOrders'], 
      queryFn: getActiveOrders,
      // Запрашиваем активные заказы, только если в дашборде есть флаг
      enabled: !!dashboard?.has_active_orders,
  });
  
  const isLoading = isUserLoading || isDashboardLoading;
  // Мы больше не ждем activeOrders, так как их может и не быть

  // --- УСЛОВНЫЕ БЛОКИ ТЕПЕРЬ ИДУТ ПОСЛЕ ВСЕХ ХУКОВ ---
  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  if (!user || !dashboard) {
    return <div className="p-4 text-center">Ошибка загрузки профиля</div>;
  }

  const hasActiveOrders = dashboard.has_active_orders && activeOrders && activeOrders.length > 0;
  const hasUnreadNotifications = dashboard.has_unread_notifications;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Здравствуйте, {user.first_name || 'пользователь'}!</h1>
      
      <LoyaltyCard dashboardData={dashboard} />

      {/* Показываем скелетон, пока грузятся именно заказы */}
      {isActiveOrdersLoading && <ActiveOrdersCarouselSkeleton />}
      {hasActiveOrders && activeOrders && <ActiveOrdersCarousel orders={activeOrders} />}
      {!dashboard.has_active_orders && <OrderHistoryCard />}


      <div className="space-y-2 pt-6 border-t">
        <ProfileLink 
            to="/notifications" 
            icon={<Bell className="h-5 w-5 text-primary" />} 
            label="Уведомления" 
            hasIndicator={hasUnreadNotifications}
        />
        <ProfileLink 
            to="/profile/details" 
            icon={<User className="h-5 w-5 text-primary" />} 
            label="Мои данные"
            onClick={(e) => {
                e.preventDefault();
                navigate('/profile/details');
            }}
        />
        <ProfileLink to="/referral" icon={<Users className="h-5 w-5 text-primary" />} label="Пригласить друга" />
        
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