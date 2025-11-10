// src/components/shared/ThemeToggle.tsx
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

// Последовательность тем для переключения
// const themes = ["light", "dark", "system"];
const themes = ["light", "dark"];


export function ThemeToggle() {
  // Получаем текущую тему и функцию для ее изменения
  const { theme, setTheme } = useTheme();

  const handleToggle = () => {
    // Находим индекс текущей темы в массиве
    const currentIndex = themes.indexOf(theme ?? 'system');
    // Вычисляем индекс следующей темы, зацикливаясь в конец массива
    const nextIndex = (currentIndex + 1) % themes.length;
    // Устанавливаем следующую тему
    setTheme(themes[nextIndex]);
  };

  // Функция для отображения правильной иконки и текста
  const renderContent = () => {
    switch (theme) {
      case 'light':
        return { icon: <Sun className="mr-2 h-5 w-5" />, text: 'Светлая тема' };
      case 'dark':
        return { icon: <Moon className="mr-2 h-5 w-5" />, text: 'Темная тема' };
      case 'system':
      default:
        return { icon: <Monitor className="mr-2 h-5 w-5" />, text: 'Системная тема' };
    }
  };

  const { icon, text } = renderContent();

  return (
    <Button 
      variant="outline" 
      onClick={handleToggle}
      className="w-full justify-start h-12"
    >
      {icon}
      <span>{text}</span>
    </Button>
  );
}