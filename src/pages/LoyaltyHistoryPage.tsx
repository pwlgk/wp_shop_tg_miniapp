// src/pages/LoyaltyHistoryPage.tsx
import { useQuery } from '@tanstack/react-query';
import { getLoyaltyHistory } from '@/api/services/user.api';
import { useBackButton } from "@/hooks/useBackButton";
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDownLeft, ArrowUpRight, Gift, ShoppingCart, Users, Cake, AlertTriangle } from 'lucide-react';
import type { LoyaltyHistory, LoyaltyTransaction } from '@/types';
import { formatRelativeDate } from '@/lib/utils';
import { Fragment } from 'react';

// --- ОБНОВЛЕННЫЙ КОМПОНЕНТ ДЛЯ ОДНОЙ ТРАНЗАКЦИИ ---
const TransactionItem = ({ transaction }: { transaction: LoyaltyTransaction }) => {
  const isAccrual = transaction.points > 0;

  // Новая, детализированная логика для иконок и заголовков
  const getTransactionDetails = () => {
    switch (transaction.type) {
      // НАЧИСЛЕНИЯ
      case 'order_earn':
        return { 
            icon: <ShoppingCart className="h-5 w-5 text-blue-500" />, 
            title: `Кешбэк за заказ №${transaction.order_id_wc}` 
        };
      case 'referral_earn':
        return { 
            icon: <Users className="h-5 w-5 text-indigo-500" />, 
            title: 'Бонус за друга' 
        };
      case 'promo_referral_welcome':
        return { 
            icon: <Gift className="h-5 w-5 text-teal-500" />, 
            title: 'Бонус за регистрацию' 
        };
      case 'promo_birthday':
        return { 
            icon: <Cake className="h-5 w-5 text-pink-500" />, 
            title: 'Подарок на день рождения' 
        };
      case 'admin_adjust_add':
        return { 
            icon: <Gift className="h-5 w-5 text-green-500" />, 
            title: 'Начисление от менеджера' 
        };
      
      // СПИСАНИЯ
      case 'order_spend':
        return { 
            icon: <ShoppingCart className="h-5 w-5 text-destructive" />, 
            title: `Оплата заказа №${transaction.order_id_wc}` 
        };
      case 'expired':
        return { 
            icon: <AlertTriangle className="h-5 w-5 text-amber-500" />, 
            title: 'Сгорание баллов' 
        };
      case 'admin_adjust_sub':
        return { 
            icon: <ArrowDownLeft className="h-5 w-5 text-destructive" />, 
            title: 'Списание от менеджера'
        };

      // По умолчанию, на случай непредвиденных типов
      default:
        return { 
            icon: isAccrual ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />, 
            title: isAccrual ? 'Прочее начисление' : 'Прочее списание'
        };
    }
  };

  const { icon, title } = getTransactionDetails();

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          {icon}
        </div>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(transaction.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
      <span className={`font-bold text-lg ${isAccrual ? 'text-green-600' : 'text-destructive'}`}>
        {isAccrual ? '+' : ''}{transaction.points}
      </span>
    </div>
  );
};


// --- Скелетон для страницы (без изменений) ---
const LoyaltyHistorySkeleton = () => (
    <div className="p-4 animate-pulse">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-6 w-1/4 mt-2 mb-6" />
        <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded-3xl" />
            <Skeleton className="h-16 w-full rounded-3xl" />
            <Skeleton className="h-16 w-full rounded-3xl" />
            <Skeleton className="h-16 w-full rounded-3xl" />
        </div>
    </div>
);


// --- Основной компонент страницы (без изменений) ---
export const LoyaltyHistoryPage = () => {
    useBackButton();

    const { data: history, isLoading, isError } = useQuery<LoyaltyHistory, Error>({
        queryKey: ['loyaltyHistory'],
        queryFn: getLoyaltyHistory,
    });

    const groupedTransactions = history?.transactions.reduce((acc, transaction) => {
        const dateKey = new Date(transaction.created_at).toDateString();
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(transaction);
        return acc;
    }, {} as Record<string, LoyaltyTransaction[]>);

    if (isLoading) {
        return <LoyaltyHistorySkeleton />;
    }

    if (isError || !history) {
        return <div className="p-4 text-center text-destructive">Ошибка загрузки истории баллов.</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">История баллов</h1>
            <div className="flex items-baseline gap-2 mt-1 mb-6">
                <span className="text-3xl font-bold text-primary">{history.balance}</span>
                <span className="text-xl text-muted-foreground">баллов</span>
            </div>

            {Object.keys(groupedTransactions || {}).length > 0 ? (
                <div className="space-y-4">
                    {Object.entries(groupedTransactions || {}).map(([dateKey, transactions]) => (
                        <Fragment key={dateKey}>
                            <h2 className="font-semibold text-muted-foreground">{formatRelativeDate(dateKey)}</h2>
                            <div className="divide-y border rounded-3xl px-2">
                                {transactions.map((tx, index) => <TransactionItem key={`${tx.created_at}-${index}`} transaction={tx} />)}
                            </div>
                        </Fragment>
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground pt-16">
                    <p>У вас еще нет истории начислений или списаний.</p>
                </div>
            )}
        </div>
    );
};