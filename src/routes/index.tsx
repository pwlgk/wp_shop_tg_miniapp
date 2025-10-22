// src/routes/index.tsx
import { Route, Routes } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { HomePage } from '@/pages/HomePage';
import { CatalogPage } from '@/pages/CatalogPage';
import { CartPage } from '@/pages/CartPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SearchPage } from '@/pages/SearchPage';
import { ProductPage } from '@/pages/ProductPage';
import { ProductListPage } from '@/pages/ProductListPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { LoyaltyHistoryPage } from '@/pages/LoyaltyHistoryPage';
import { ContentPage } from '@/pages/ContentPage';
import { ProfileDetailsPage } from '@/pages/ProfileDetailsPage'; // <-- Импорт
import { EditProfilePage } from '@/pages/EditProfilePage'; // <-- Импорт
import { OrderDetailPage } from '@/pages/OrderDetailPage';
import { OrderListPage } from '@/pages/OrderListPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrderSuccessPage } from '@/pages/OrderSuccessPage';
import { ReferralPage } from '@/pages/ReferralPage';
import { DeveloperPage } from '@/pages/DeveloperPage';


export const AppRoutes = () => {
    return (
        <Routes>
            {/* 
        Все страницы, которым нужен MainLayout (нижнее меню и отступ сверху)
        теперь находятся здесь.
      */}

            <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="catalog" element={<CatalogPage />} />
                <Route path="catalog/:categoryId" element={<ProductListPage />} />
                <Route path="favorites" element={<FavoritesPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="cart" element={<CartPage />} />

            </Route>

            {/* Страницы без MainLayout */}
            <Route path="/search" element={<SearchPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/loyalty-history" element={<LoyaltyHistoryPage />} />
            <Route path="/profile/details" element={<ProfileDetailsPage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/page/:slug" element={<ContentPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
            <Route path="/referral" element={<ReferralPage />} />
            <Route path="orders" element={<OrderListPage />} />
            <Route path="/developer" element={<DeveloperPage />} /> {/* <-- НОВЫЙ РОУТ */}

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};