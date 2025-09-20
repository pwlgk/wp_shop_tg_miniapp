// src/components/layouts/MainLayout.tsx
import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, LayoutGrid, ShoppingCart, User, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useAppCounters } from '@/hooks/useAppCounters';

export const MainLayout = () => {
  const cartItemCount = useCartStore((state) => state.totalItems);
  const favoriteItemCount = useFavoritesStore((state) => state.totalItems);
  
  // ИСПРАВЛЕНИЕ: Убран лишний апостроф
  const { hasActiveOrders } = useAppCounters();

  useEffect(() => {
    try {
      const tgWebApp = (window as any).Telegram?.WebApp;
      if (tgWebApp && !tgWebApp.isExpanded) {
        tgWebApp.expand();
      }
    } catch (error) {
      console.error("Failed to expand Telegram Web App:", error);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow pb-20 pt-[var(--tg-viewport-header-height)]">
        <Outlet />
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t z-50">
        <nav className="flex justify-around items-center h-16">
          
          {/* Главная */}
          <NavLink to="/">
            {({ isActive }) => (
              <div className="flex flex-col items-center gap-1 w-full transition-all duration-300">
                <Home className={cn("h-6 w-6", isActive ? "text-primary scale-110" : "text-muted-foreground")} />
                <span className={cn("text-xs", isActive ? "font-semibold text-primary" : "font-normal text-muted-foreground")}>Главная</span>
              </div>
            )}
          </NavLink>
          
          {/* Каталог */}
          <NavLink to="/catalog">
            {({ isActive }) => (
              <div className="flex flex-col items-center gap-1 w-full transition-all duration-300">
                <LayoutGrid className={cn("h-6 w-6", isActive ? "text-primary scale-110" : "text-muted-foreground")} />
                <span className={cn("text-xs", isActive ? "font-semibold text-primary" : "font-normal text-muted-foreground")}>Каталог</span>
              </div>
            )}
          </NavLink>

          {/* Избранное */}
          <NavLink to="/favorites">
            {({ isActive }) => (
              <div className="relative flex flex-col items-center gap-1 w-full transition-all duration-300">
                <Heart className={cn("h-6 w-6", isActive ? "text-primary scale-110 fill-primary/10" : "text-muted-foreground")} />
                <span className={cn("text-xs", isActive ? "font-semibold text-primary" : "font-normal text-muted-foreground")}>Избранное</span>
                {favoriteItemCount > 0 && (
                  <span className="absolute -top-1 right-2.5 bg-primary text-primary-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                    {favoriteItemCount > 9 ? '9+' : favoriteItemCount}
                  </span>
                )}
              </div>
            )}
          </NavLink>
          
          {/* Корзина */}
          <NavLink to="/cart">
            {({ isActive }) => (
               <div className="relative flex flex-col items-center gap-1 w-full transition-all duration-300">
                <ShoppingCart className={cn("h-6 w-6", isActive ? "text-primary scale-110" : "text-muted-foreground")} />
                <span className={cn("text-xs", isActive ? "font-semibold text-primary" : "font-normal text-muted-foreground")}>Корзина</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 right-2.5 bg-primary text-primary-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </div>
            )}
          </NavLink>
          
          {/* Профиль */}
          <NavLink to="/profile">
            {({ isActive }) => (
              <div className="relative flex flex-col items-center gap-1 w-full transition-all duration-300">
                <User className={cn("h-6 w-6", isActive ? "text-primary scale-110" : "text-muted-foreground")} />
                <span className={cn("text-xs", isActive ? "font-semibold text-primary" : "font-normal text-muted-foreground")}>Профиль</span>
                {hasActiveOrders && (
                  <span className="absolute -top-0 right-3 bg-primary rounded-full h-2 w-2" />
                )}
              </div>
            )}
          </NavLink>

        </nav>
      </footer>
    </div>
  );
};