// src/components/providers/ThemeProvider.tsx
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Тип для пропсов берем прямо из компонента, который оборачиваем
type ThemeProviderProps = Parameters<typeof NextThemesProvider>[0];

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}