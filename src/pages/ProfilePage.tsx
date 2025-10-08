// src/pages/ProfilePage.tsx
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMe, getDashboard } from '@/api/services/user.api';
import { getActiveOrders } from '@/api/services/orders.api';
import { LoyaltyCard } from '@/components/shared/LoyaltyCard';
import { ActiveOrdersCarousel, OrderHistoryCard, ActiveOrdersCarouselSkeleton } from '@/components/shared/ActiveOrdersCarousel';
import { EditProfileSheet } from '@/components/shared/EditProfileSheet';
import { useState, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useBackButton } from '@/hooks/useBackButton';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Info, Mail, Shield, Truck, User, Bell, Users } from 'lucide-react';
import { toast } from 'sonner';

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
  const navigate = useNavigate();
  const [isEditSheetOpen, setEditSheetOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const webApp = (window as any).Telegram?.WebApp;
  
  const { data: user, isLoading: isUserLoading } = useQuery({ queryKey: ['me'], queryFn: getMe });
  const { data: dashboard, isLoading: isDashboardLoading } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });
  const { data: activeOrders, isLoading: isActiveOrdersLoading } = useQuery({ 
      queryKey: ['activeOrders'], 
      queryFn: getActiveOrders,
      enabled: !!dashboard?.has_active_orders,
  });

  // --- ЛОГИКА ДЛЯ "ПАСХАЛКИ" ---
  const clickCount = useRef(0);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);
  
  const handleVersionClick = () => {
      if (clickTimer.current) {
          clearTimeout(clickTimer.current);
      }

      clickCount.current += 1;

      if (clickCount.current >= 10) {
          if (webApp && webApp.showConfirm) {
              webApp.showConfirm("Очистить все локальные данные и кэш приложения?", (isConfirmed: boolean) => {
                  if (isConfirmed) {
                      queryClient.clear();
                      localStorage.clear();
                      sessionStorage.clear();
                      toast.success("Данные очищены!", {
                          description: "Приложение будет перезагружено.",
                          duration: 2000,
                          onAutoClose: () => window.location.reload(),
                          onDismiss: () => window.location.reload(),
                      });
                  }
              });
          } else {
              if (confirm("Очистить все локальные данные?")) {
                  queryClient.clear();
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
              }
          }
          clickCount.current = 0;
      }

      clickTimer.current = setTimeout(() => {
          clickCount.current = 0;
      }, 2000); // 2-секундное окно для кликов
  };
  // --- КОНЕЦ ЛОГИКИ "ПАСХАЛКИ" ---

  const isLoading = isUserLoading || isDashboardLoading;

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
      <h1 className="text-3xl font-bold">Здравствуйте, {user.first_name || 'пользователь'}!</h1>
      
      <LoyaltyCard dashboardData={dashboard} />

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
      
      <div className="pt-8 text-center">
          <p 
            className="text-xs text-muted-foreground cursor-pointer"
            onClick={handleVersionClick}
          >
              v{import.meta.env.VITE_APP_VERSION} by nidma.project
          </p>
      </div>

      <EditProfileSheet 
        user={user}
        open={isEditSheetOpen}
        onOpenChange={setEditSheetOpen}
      />
    </div>
  );
};