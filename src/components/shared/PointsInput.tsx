// src/components/shared/PointsInput.tsx
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface PointsToggleProps {
  // Максимальное кол-во баллов, которое можно списать в ЭТОЙ корзине
  maxPointsToSpend: number;
  // Общий баланс баллов пользователя
  userBalance: number;
  // Текущее состояние (списываем или нет)
  isApplied: boolean;
  // Функция, которая будет вызвана при изменении состояния
  onToggle: (apply: boolean) => void;
}

export const PointsToggle = ({ maxPointsToSpend, userBalance, isApplied, onToggle }: PointsToggleProps) => {
  // Реальное количество баллов, которое можно списать.
  // Это минимум из того, что разрешает корзина, и того, что есть у пользователя.
  const pointsAvailable = Math.min(maxPointsToSpend, userBalance);

  // Не показываем компонент, если списать ничего нельзя
  if (pointsAvailable <= 0) {
    return (
      <div className="flex items-center justify-between text-sm text-muted-foreground p-3 border rounded-2xl ">
        <span>Списать баллы</span>
        <span>У вас нет доступных баллов</span>
      </div>
    );
  }

  const handleToggle = (checked: boolean) => {
    onToggle(checked);
  };

  return (
    <div className="flex items-center  justify-between p-3 border rounded-2xl ">
      <Label htmlFor="points-toggle" className="cursor-pointer">
        <p className="font-medium">Списать {pointsAvailable} баллов</p>
        <p className="text-sm text-muted-foreground">
          Вы получите скидку {pointsAvailable} ₽
        </p>
      </Label>
      <Switch
        id="points-toggle"
        checked={isApplied}
        onCheckedChange={handleToggle}
      />
    </div>
  );
};