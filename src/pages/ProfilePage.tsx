// src/pages/ProfilePage.tsx
import { useQuery } from '@tanstack/react-query';
import { getMe, getDashboard } from '@/api/services/user.api';
import { getActiveOrders } from '@/api/services/orders.api';
import { LoyaltyCard } from '@/components/shared/LoyaltyCard';
import { ActiveOrdersCarousel, OrderHistoryCard, ActiveOrdersCarouselSkeleton } from '@/components/shared/ActiveOrdersCarousel';
import { EditProfileSheet } from '@/components/shared/EditProfileSheet';
import { useState, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useBackButton } from '@/hooks/useBackButton';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Info, Mail, Shield, Truck, User, Bell, Users, UserCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const ProfilePageSkeleton = () => (
    <div className="p-4 space-y-6 animate-pulse">
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <ActiveOrdersCarouselSkeleton />
        <div className="space-y-2 pt-6 border-t">
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
    </div>
);

const ProfileLink = ({ to, icon, label, hasIndicator = false, onClick }: { to: string; icon: React.ReactNode; label: string; hasIndicator?: boolean; onClick?: (e: React.MouseEvent) => void; }) => (
    <Link to={to} onClick={onClick} className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl hover:bg-muted transition-colors">
        <div className="flex items-center gap-4">
            {icon}
            <span className="font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
            {hasIndicator && (
                <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold">
                    !
                </div>
            )}
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
    </Link>
);

export const ProfilePage = () => {
    useBackButton();
    const navigate = useNavigate();
    const [isEditSheetOpen, setEditSheetOpen] = useState(false);

    //   const queryClient = useQueryClient();
    //   const webApp = (window as any).Telegram?.WebApp;

    const { data: user, isLoading: isUserLoading } = useQuery({ queryKey: ['me'], queryFn: getMe });
    const { data: dashboard, isLoading: isDashboardLoading } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });
    const { data: activeOrders, isLoading: isActiveOrdersLoading } = useQuery({
        queryKey: ['activeOrders'],
        queryFn: getActiveOrders,
        enabled: !!dashboard?.has_active_orders,
    });

    const clickCount = useRef(0);
    const clickTimer = useRef<NodeJS.Timeout | null>(null);

    const handleVersionClick = () => {
        if (clickTimer.current) clearTimeout(clickTimer.current);
        clickCount.current += 1;
        if (clickCount.current >= 20) {
            clickCount.current = 0;
            navigate('/developer');
        }
        clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 2000);
    };

    const isLoading = isUserLoading || isDashboardLoading;

    if (isLoading) {
        return <ProfilePageSkeleton />;
    }
    if (!user || !dashboard) {
        return <div className="p-4 text-center">Ошибка загрузки профиля</div>;
    }

    const hasActiveOrders = dashboard.has_active_orders && activeOrders && activeOrders.length > 0;
    const hasUnreadNotifications = dashboard.has_unread_notifications;
    const showProfileIndicator =
        dashboard.profile_completion_status === 'incomplete_profile_indicator' ||
        dashboard.profile_completion_status === 'new_user_prompt';

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-bold">Здравствуйте, {user.first_name || 'пользователь'}!</h1>

            <LoyaltyCard dashboardData={dashboard} />

            {isActiveOrdersLoading && <ActiveOrdersCarouselSkeleton />}
            {hasActiveOrders && activeOrders && <ActiveOrdersCarousel orders={activeOrders} />}
            {!dashboard.has_active_orders && <OrderHistoryCard />}

            <div className="space-y-2 pt-6 border-t">
                {/* --- НОВЫЙ БАННЕР-ПРИГЛАШЕНИЕ --- */}
                {dashboard.profile_completion_status === 'new_user_prompt' && (
                    <Alert className="rounded-2xl border-primary/50">
                        <UserCheck className="h-4 w-4" />
                        <AlertTitle className="font-semibold">Заполните профиль</AlertTitle>
                        <AlertDescription>
                            Укажите имя, телефон и дату рождения, чтобы мы могли быстрее обрабатывать ваши заказы и начислять вам бонусные баллы ко дню рождения.
                            <Button asChild variant="link" className="p-0 h-auto ml-1 font-bold">
                                <Link to="/profile/details">Перейти</Link>
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

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
                    hasIndicator={showProfileIndicator}
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

            <div className="pt-4 text-center">
                <p
                    className="text-xs text-muted-foreground cursor-pointer select-none"
                    onClick={handleVersionClick}
                >
                    Kosynka Store v{import.meta.env.VITE_APP_VERSION} by pwlgk
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