// src/types/index.ts

// Тип для ответа от эндпоинта /auth/telegram
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Тип для данных дашборда с /users/me/dashboard
export interface UserDashboard {
  first_name: string | null;
  last_name: string | null;
  is_blocked: boolean;
  is_bot_accessible: boolean;
  balance: number;
  level: string;
  has_unread_notifications: boolean;
  profile_completion_status: 'complete' | 'new_user_prompt' | 'incomplete_profile_indicator';
  has_active_orders: boolean;
  loyalty_progress: {
    current_spending: number;
    next_level: string | null;
    spending_to_next_level: number | null;
  };
  counters: {
    cart_items_count: number;
    favorite_items_count: number;
  };
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  image_src: string | null;
  // Добавляем children, чтобы TypeScript знал о вложенности
  children?: ProductCategory[]; 
}

export interface ProductImage {
  id: number;
  src: string;
  alt: string;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  short_description: string;
  description: string;
  stock_quantity: number | null; 
  images: ProductImage[];
  categories: ProductCategory[];
  is_favorite: boolean;
  sku: string | null;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
}

// Тип для ответа от эндпоинта /products с пагинацией
export interface PaginatedProducts {
  total_items: number;
  total_pages: number;
  current_page: number;
  size: number;
  items: Product[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartNotification {
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export interface CartResponse {
  items: CartItem[];
  total_items_price: number;
  discount_amount: number;
  final_price: number;
  notifications: CartNotification[];
  min_order_amount: number;
  is_min_amount_reached: boolean;
  max_points_to_spend: number;
  points_to_earn?: number;
  applied_coupon_code: string | null; // <-- Новое важное поле
}



export interface Banner {
  id: number;
  title: string;
  content_type: 'image' | 'video'; // <-- Новое поле
  media_url: string; // <-- Переименовано с image_url
  link_url?: string | null;
}

export interface PaginatedFavorites {
  total_items: number;
  total_pages: number;
  current_page: number;
  size: number;
  items: Product[]; // Используем тот же тип Product
}

export interface Address {
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  address_1: string | null;
  address_2: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
  country: string | null;
  email: string | null;
  phone: string | null;
}

export interface PaginatedResponse {
    total_items: number;
    total_pages: number;
    current_page: number;
    size: number;
}

export interface PaginatedOrders extends PaginatedResponse {
  items: Order[];
}

export interface UserProfile {
  telegram_id: number;
  username: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  billing: Address;
  shipping: Address;
  counters: {
    cart_items_count: number;
    favorite_items_count: number;
  };
  birth_date: string | null;
}

// Тело запроса для обновления пользователя
export interface UserUpdate {
  first_name?: string;
  last_name?: string; // <-- Добавляем фамилию
  email?: string;
  birth_date?: string; // <-- Добавляем дату рождения
  billing?: Partial<Address>;
  shipping?: Partial<Address>;
}

// Упрощенный тип для карточки заказа
export interface OrderLineItem {
  product_id: number;
  name: string;
  quantity: number;
  price: string | number;
  total: string | number;
  image_url?: string | null;
}

export interface Order {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
  payment_method_title: string;
  billing: Address; // Убедитесь, что тип Address существует
  line_items: OrderLineItem[];
  can_be_cancelled: boolean;
}

export interface PaginatedOrders extends PaginatedResponse { // Убедитесь, что PaginatedResponse существует
  items: Order[];
}

export interface LoyaltyTransaction {
  points: number;
  type: string;
  order_id_wc: number | null;
  created_at: string; // ISO 8601 date string
  expires_at: string | null;
}

export interface LoyaltyHistory {
  balance: number;
  level: string;
  transactions: LoyaltyTransaction[];
}


interface HeadingBlock { type: 'h1' | 'h2' | 'h3' | 'h4'; content: string; }
interface ParagraphBlock { type: 'p'; content: string; }
interface ListBlock { type: 'ul' | 'ol'; items: string[]; }
interface SeparatorBlock { type: 'hr'; }

// Объединяем все типы блоков в один
export type ContentBlock = HeadingBlock | ParagraphBlock | ListBlock | SeparatorBlock;

// Тип для ответа от /pages/{slug}
export interface StructuredPage {
  id: number;
  slug: string;
  title: string;
  image_url: string | null;
  blocks: ContentBlock[];
}

export interface Notification {
  id: number;
  type: 'order_status_update' | 'points_earned' | 'promo' | 'points_update' | string; // Добавляем string для будущих типов
  title: string;
  message: string | null;
  created_at: string;
  image_url: string | null;
  is_read: boolean;
  action_url: string | null;
  related_entity_id: string | null; // Может быть ID заказа
  action_text?: string;     // Текст для основной кнопки (например, "К товарам")
  promo_code?: string;      // Промокод, если он есть
  duration?: number;        // Длительность показа сторис в секундах
}
export interface PaginatedNotifications extends PaginatedResponse {
  items: Notification[];
}

export interface Story {
  id: number;
  title: string;
  description: string;
  content_type: 'image' | 'video';
  media_url: string;
  link_url: string | null;
}

export interface OrderCreate {
  payment_method_id: string;
  points_to_spend?: number;
  coupon_code?: string | null;
}

export interface ReferralInfo {
  referral_link: string;
  pending_referrals: number;
  completed_referrals: number;
  total_earned: number;
}

export interface ShopSettings {
  min_order_amount: number;
  welcome_bonus_amount: number;
  is_welcome_bonus_active: boolean;
  max_points_payment_percentage: number;
  referral_welcome_bonus: number; // <-- Нам нужно это
  referrer_bonus: number; // <-- И это
  birthday_bonus_amount: number;
  client_data_version: number;
}