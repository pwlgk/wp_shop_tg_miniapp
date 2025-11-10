// src/pages/ProfileDetailsPage.tsx
import { useQuery } from '@tanstack/react-query';
import { getMe } from '@/api/services/user.api';
import { useBackButton } from '@/hooks/useBackButton';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Calendar, MapPin } from 'lucide-react';
import { BrandHeader } from '@/components/shared/BrandHeader';

const ProfileField = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | null | undefined }) => (
    <div className="flex items-center gap-4 border-b py-4">
        <div className="text-muted-foreground">{icon}</div>
        <div className="flex-grow">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium">{value || 'Не указано'}</p>
        </div>
    </div>
);

const ProfileDetailsSkeleton = () => (
    <>
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
        <div className="p-4 space-y-4 animate-pulse">
            <Skeleton className="h-8 w-1/2 mb-4" /> {/* h-8 для text-2xl */}
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-control-md w-full mt-8 rounded-2xl" />
        </div>
    </>
);

export const ProfileDetailsPage = () => {
    useBackButton();
    const { data: user, isLoading, isError } = useQuery({ queryKey: ['me'], queryFn: getMe });

    if (isLoading) {
        return <ProfileDetailsSkeleton />;
    }
    
    if (isError || !user) {
        return (
            <>
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
                <div className="p-4 text-center">Ошибка загрузки данных.</div>
            </>
        );
    }

    const displayEmail = user.email.endsWith('@telegram.user') ? null : user.email;
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');

    return (
        <div>
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-6">Мои данные</h1>

                <div className="space-y-2">
                    <ProfileField icon={<User />} label="ФИО" value={fullName} />
                    <ProfileField icon={<Phone />} label="Телефон" value={user.billing.phone} />
                    <ProfileField icon={<Mail />} label="Email" value={displayEmail} />
                    <ProfileField icon={<MapPin />} label="Город" value={user.billing.city} />
                    <ProfileField icon={<Calendar />} label="Дата рождения" value={user.birth_date} />
                </div>

                <Button asChild size="lg" className="w-full mt-8 h-control-md text-base rounded-2xl">
                    <Link to="/profile/edit">Изменить данные</Link>
                </Button>
            </div>
        </div>
    );
};