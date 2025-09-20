// src/components/shared/SlideCounter.tsx
interface SlideCounterProps {
  current: number;
  total: number;
}

export const SlideCounter = ({ current, total }: SlideCounterProps) => {
  if (total <= 1) return null; // Не показываем, если слайд один

  return (
    <div className="absolute bottom-4 right-4 z-10 rounded-full bg-background/60 px-3 py-1 text-xs text-foreground backdrop-blur-sm">
      {current} / {total}
    </div>
  );
};