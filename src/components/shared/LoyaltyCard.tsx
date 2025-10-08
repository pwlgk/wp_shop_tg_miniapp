// src/components/shared/LoyaltyCard.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { UserDashboard } from '@/types';
import { useNavigate } from 'react-router-dom'; // Используем для перехода
import { ChevronRight } from 'lucide-react';

interface LoyaltyCardProps {
  dashboardData: UserDashboard;
}

// Функция для перевода уровней, теперь возвращает только текст
const translateLevel = (level: string): string => {
    const levelMap: { [key: string]: string } = {
        'bronze': 'Бронзовый',
        'silver': 'Серебряный',
        'gold': 'Золотой',
    };
    return levelMap[level] || level;
}

export const LoyaltyCard = ({ dashboardData }: LoyaltyCardProps) => {
  const navigate = useNavigate();
  const progress = dashboardData.loyalty_progress;

  const progressValue = progress.spending_to_next_level !== null && (progress.current_spending + progress.spending_to_next_level) > 0
    ? (progress.current_spending / (progress.current_spending + progress.spending_to_next_level)) * 100
    : 100;

  const handleCardClick = () => {
    navigate('/loyalty-history'); // Переходим на страницу истории
  };

  return (
    <Card 
      onClick={handleCardClick} 
      className="cursor-pointer hover:bg-muted transition-colors rounded-2xl"
    >
      <CardContent className="p-4">
        {/* Верхний блок: Баланс и уровень */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">Бонусный баланс</p>
            <p className="text-3xl font-bold">{dashboardData.balance} <span className="text-xl font-medium text-muted-foreground">баллов</span></p>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <span>{translateLevel(dashboardData.level)} уровень</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </div>
        </div>

        {/* Нижний блок: Прогресс до следующего уровня */}
        <div className="mt-4">
          <Progress value={progressValue} className="h-2" />
          <div className="flex justify-between text-xs mt-1 text-muted-foreground">
            {progress.next_level ? (
                <>
                  <span>{progress.current_spending.toFixed(0)} ₽</span>
                  <span>
                    До уровня "{translateLevel(progress.next_level)}" осталось {progress.spending_to_next_level?.toFixed(0)} ₽
                  </span>
                </>
            ) : (
                <span className="w-full text-center">Вы достигли максимального уровня!</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};