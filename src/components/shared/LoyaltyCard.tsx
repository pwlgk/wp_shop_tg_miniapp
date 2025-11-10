// src/components/shared/LoyaltyCard.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { UserDashboard } from '@/types';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge'; // <-- Импортируем Badge

interface LoyaltyCardProps {
  dashboardData: UserDashboard;
}

// Создаем "словарь" с данными для каждого уровня
const levelDetailsMap: { [key: string]: { name: string; cashbackPercent: number } } = {
    'bronze': { name: 'Бронзовый', cashbackPercent: 3 },
    'silver': { name: 'Серебряный', cashbackPercent: 5 },
    'gold': { name: 'Золотой', cashbackPercent: 7 },
};

// Функция для получения деталей уровня
const getLevelDetails = (level: string) => {
    return levelDetailsMap[level] || { name: level, cashbackPercent: 0 };
}

export const LoyaltyCard = ({ dashboardData }: LoyaltyCardProps) => {
  const navigate = useNavigate();
  const progress = dashboardData.loyalty_progress;
  const levelDetails = getLevelDetails(dashboardData.level);

  const progressValue = progress.spending_to_next_level !== null && (progress.current_spending + progress.spending_to_next_level) > 0
    ? (progress.current_spending / (progress.current_spending + progress.spending_to_next_level)) * 100
    : 100;

  const handleCardClick = () => {
    navigate('/loyalty-history');
  };

  return (
    <Card 
      onClick={handleCardClick} 
      className="cursor-pointer hover:bg-muted/50 transition-colors rounded-2xl"
    >
      <CardContent className="p-4">
        {/* Верхний блок: Баланс и уровень */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">Бонусный баланс</p>
            <p className="text-3xl font-bold">{dashboardData.balance} <span className="text-xl font-medium text-muted-foreground">баллов</span></p>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <span>Подробнее</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </div>
        </div>
        
        {/* Средний блок: Уровень и кешбэк */}
        <div className="flex items-center gap-2 mt-4">
            <Badge variant="secondary" className="text-base">
                {levelDetails.name} уровень
            </Badge>
            <p className="text-sm text-muted-foreground">
                Ваш кешбэк: <span className="font-bold text-primary">{levelDetails.cashbackPercent}%</span>
            </p>
        </div>

        {/* Нижний блок: Прогресс до следующего уровня */}
        <div className="mt-4">
          <Progress value={progressValue} className="h-2" />
          <div className="flex justify-between text-xs mt-1 text-muted-foreground">
            {progress.next_level ? (
                <>
                  <span>{progress.current_spending.toFixed(0)} ₽</span>
                  <span>
                    До уровня "{getLevelDetails(progress.next_level).name}" осталось {progress.spending_to_next_level?.toFixed(0)} ₽
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