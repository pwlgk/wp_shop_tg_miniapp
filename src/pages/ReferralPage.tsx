// src/pages/ReferralPage.tsx
import { useQuery } from '@tanstack/react-query';
import { getReferralInfo } from '@/api/services/user.api';
import { getSettings } from '@/api/services/settings.api';
import { useBackButton } from '@/hooks/useBackButton';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Gift,  Share2, Sparkles, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { BrandHeader } from '@/components/shared/BrandHeader';

const ReferralPageSkeleton = () => (
    <>
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
        <div className="p-4 space-y-8 animate-pulse">
            <div className="text-center space-y-3">
                <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                <Skeleton className="h-8 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-full max-w-md mx-auto" />
            </div>
            <Skeleton className="h-control-md w-full rounded-2xl" />
            <div className="space-y-4">
                <Skeleton className="h-6 w-1/2 mx-auto" />
                <div className="grid grid-cols-3 gap-2">
                    <Skeleton className="h-28 w-full rounded-2xl" />
                    <Skeleton className="h-28 w-full rounded-2xl" />
                    <Skeleton className="h-28 w-full rounded-2xl" />
                </div>
            </div>
        </div>
    </>
);

const StatCard = ({ icon, value, label }: { icon: React.ReactNode, value: number, label: string }) => (
    <Card className="text-center rounded-2xl">
        <CardContent className="p-4">
            <div className="mx-auto h-10 w-10 mb-2 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                {icon}
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </CardContent>
    </Card>
);

export const ReferralPage = () => {
    useBackButton();

    const { data: referralInfo, isLoading: isReferralLoading } = useQuery({ queryKey: ['referralInfo'], queryFn: getReferralInfo });
    const { data: settings, isLoading: isSettingsLoading } = useQuery({ queryKey: ['settings'], queryFn: getSettings });

    const isLoading = isReferralLoading || isSettingsLoading;

    const handleCopyLink = () => {
        if (!referralInfo) return;
        navigator.clipboard.writeText(referralInfo.referral_link).then(() => {
            toast.success("Реферальная ссылка скопирована!");
        });
    };

    if (isLoading) {
        return <ReferralPageSkeleton />;
    }

    if (!referralInfo || !settings) {
        return (
            <>
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
                <div className="p-4 text-center">Не удалось загрузить данные.</div>
            </>
        );
    }

    return (
        <div>
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
            <div className="p-4 space-y-8">
                <section className="text-center space-y-3">
                    <Gift className="h-16 w-16 text-primary mx-auto" strokeWidth={1.5} />
                    <h1 className="text-2xl font-bold">Дарим баллы вам и друзьям!</h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Ваш друг получит <span className="font-bold text-primary">{settings.referral_welcome_bonus}</span> баллов за регистрацию, а вы — <span className="font-bold text-primary">{settings.referrer_bonus}</span> баллов после его первого заказа.
                    </p>
                </section>
                
                <section className="space-y-3">
                    <div className="relative">
                        <input 
                            readOnly 
                            value={referralInfo.referral_link}
                            className="w-full h-control-md pr-12 pl-4 rounded-2xl bg-muted border-none text-center font-mono text-sm"
                        />
                        <Button variant="ghost" size="icon" className="absolute top-1/2 right-1 -translate-y-1/2 h-control-sm w-control-sm" onClick={handleCopyLink}>
                            <Copy className="h-5 w-5" />
                        </Button>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-center">Ваша статистика</h2>
                    <div className="grid grid-cols-3 gap-2">
                        <StatCard icon={<UserPlus />} value={referralInfo.completed_referrals} label="Друзей с заказом" />
                        <StatCard icon={<UserPlus strokeWidth={1.5} />} value={referralInfo.pending_referrals} label="Ожидают заказа" />
                        <StatCard icon={<Sparkles />} value={referralInfo.total_earned} label="Всего заработано" />
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-center">Как это работает?</h2>
                    <div className="space-y-4 text-center">
                        <div className="p-4 bg-muted rounded-2xl">
                            <Share2 className="h-8 w-8 text-primary mx-auto mb-2" />
                            <h3 className="font-semibold">1. Поделитесь ссылкой</h3>
                            <p className="text-sm text-muted-foreground">Отправьте вашу персональную ссылку другу любым удобным способом.</p>
                        </div>
                        <div className="p-4 bg-muted rounded-2xl">
                            <Gift className="h-8 w-8 text-primary mx-auto mb-2" />
                            <h3 className="font-semibold">2. Друг получает бонус</h3>
                            <p className="text-sm text-muted-foreground">Он регистрируется по ссылке и получает {settings.referral_welcome_bonus} баллов.</p>
                        </div>
                        <div className="p-4 bg-muted rounded-2xl">
                            <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
                            <h3 className="font-semibold">3. Вы получаете бонус</h3>
                            <p className="text-sm text-muted-foreground">Мы начислим вам {settings.referrer_bonus} баллов после первого заказа друга.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};