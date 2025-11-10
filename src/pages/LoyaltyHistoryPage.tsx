// src/pages/LoyaltyHistoryPage.tsx
import { useQuery } from '@tanstack/react-query';
import { getLoyaltyHistory } from '@/api/services/user.api';
import { useBackButton } from "@/hooks/useBackButton";
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDownLeft, ArrowUpRight, Gift, ShoppingCart, Users, Cake, AlertTriangle, Info } from 'lucide-react';
import type { LoyaltyHistory, LoyaltyTransaction } from '@/types';
import { formatRelativeDate } from '@/lib/utils';
import { Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BrandHeader } from '@/components/shared/BrandHeader';

const TransactionItem = ({ transaction }: { transaction: LoyaltyTransaction }) => {
  const isAccrual = transaction.points > 0;

  const getTransactionDetails = () => {
    switch (transaction.type) {
      case 'order_earn': return { icon: <ShoppingCart className="h-5 w-5 text-blue-500" />, title: `Кешбэк за заказ №${transaction.order_id_wc}` };
      case 'referral_earn': return { icon: <Users className="h-5 w-5 text-indigo-500" />, title: 'Бонус за друга' };
      case 'promo_referral_welcome': return { icon: <Gift className="h-5 w-5 text-teal-500" />, title: 'Бонус за регистрацию' };
      case 'promo_birthday': return { icon: <Cake className="h-5 w-5 text-pink-500" />, title: 'Подарок на день рождения' };
      case 'admin_adjust_add': return { icon: <Gift className="h-5 w-5 text-green-500" />, title: 'Начисление от менеджера' };
      case 'order_spend': return { icon: <ShoppingCart className="h-5 w-5 text-destructive" />, title: `Оплата заказа №${transaction.order_id_wc}` };
      case 'expired': return { icon: <AlertTriangle className="h-5 w-5 text-amber-500" />, title: 'Сгорание баллов' };
      case 'admin_adjust_sub': return { icon: <ArrowDownLeft className="h-5 w-5 text-destructive" />, title: 'Списание от менеджера'};
      default: return { icon: isAccrual ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />, title: isAccrual ? 'Прочее начисление' : 'Прочее списание'};
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

const LoyaltyHistorySkeleton = () => (
    <>
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
        <div className="p-4 animate-pulse">
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-6 w-1/3 mb-2 mt-4" />
                <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
        </div>
    </>
);

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
        return (
            <>
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
                <div className="p-4 text-center text-destructive">Ошибка загрузки истории баллов.</div>
            </>
        );
    }

    return (
        <div>
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
            <div className="p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">История баллов</h1>
                    <Button variant="ghost" size="icon" asChild className="rounded-full">
                        <Link to="/page/loyalty">
                            <Info className="h-6 w-6" />
                            <span className="sr-only">О программе лояльности</span>
                        </Link>
                    </Button>
                </div>

                {Object.keys(groupedTransactions || {}).length > 0 ? (
                    <div className="space-y-4">
                        {Object.entries(groupedTransactions || {}).map(([dateKey, transactions]) => (
                            <Fragment key={dateKey}>
                                <h2 className="font-semibold text-muted-foreground">{formatRelativeDate(dateKey)}</h2>
                                <div className="divide-y border rounded-2xl px-2">
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
        </div>
    );
};