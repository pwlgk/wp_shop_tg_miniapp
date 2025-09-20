// src/components/shared/HomePageHeader.tsx
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '@/api/services/user.api';
import { SearchInput } from './SearchInput'; // <-- Импортируем

export const HomePageHeader = () => {
    const navigate = useNavigate();
    const { data: dashboard } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });

    return (
        <header 
            className="mx-3 my-2 bg-background/80 backdrop-blur-sm z-30 rounded-3xl"
            style={{ paddingTop: 'var(--tg-viewport-header-height)' }}
        >
            <div className="py-1 px-1 mb-3 flex items-center gap-2">
                <div className="flex-grow">
                    <SearchInput isLink />
                </div>
                <div className="shrink-0">
                    <Button variant="ghost" size="icon" className="relative" onClick={() => navigate('/notifications')}>
                        <Bell className="h-6 w-6" />
                        {dashboard?.has_unread_notifications && (
                            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
                        )}
                    </Button>
                </div>
            </div>
        </header>
    );
};