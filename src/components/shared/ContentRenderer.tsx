// src/components/shared/ContentRenderer.tsx

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
    // Базовые иконки
    MessageSquare, Phone, Mail, Instagram, Share2, FileText,
    // Расширенный набор иконок для интернет-магазина
    Truck, Wallet, MapPin, Package, Gem, HandHeart, BoxIcon, CreditCard,
    ShieldCheck, Star, Award, Leaf, Sparkles, Tag, Percent, Receipt,
    ShoppingCart, Heart, User, Settings, Search, Home, Info, HelpCircle,
    Headset, LifeBuoy, Gift, Crown, Rocket, LogIn, LogOut, Calendar, Clock,
    CheckCircle2, XCircle, AlertTriangle, ArrowLeftRight, PackageCheck, Warehouse
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const commandRegex = /\[(\w+)\s+([\s\S]+)\]/;

const parseAttributes = (attrsString: string): Record<string, string> => {
  const attrs: Record<string, string> = {};
  const regex = /\s*(\w+)=(["'‘’”])(.*?)\2/gs;
  let match;
  while ((match = regex.exec(attrsString)) !== null) {
    const key = match[1].trim();
    const value = match[3].trim();
    attrs[key] = value;
  }
  return attrs;
};

// ========================================================================
// КАРТА ИКОНОК ДЛЯ ИНТЕРНЕТ-МАГАЗИНА
// ========================================================================
const iconMap: { [key: string]: React.ReactNode } = {
    // --- Доставка и Логистика ---
    truck: <Truck className="h-6 w-6 text-primary" />,
    package: <Package className="h-6 w-6 text-primary" />,
    box: <BoxIcon className="h-6 w-6 text-primary" />,
    'package-check': <PackageCheck className="h-6 w-6 text-primary" />,
    'map-pin': <MapPin className="h-6 w-6 text-primary" />,
    calendar: <Calendar className="h-6 w-6 text-primary" />,
    clock: <Clock className="h-6 w-6 text-primary" />,
    warehouse: <Warehouse className="h-6 w-6 text-primary" />,

    // --- Оплата и Финансы ---
    wallet: <Wallet className="h-6 w-6 text-primary" />,
    'credit-card': <CreditCard className="h-6 w-6 text-primary" />,
    receipt: <Receipt className="h-6 w-6 text-primary" />,
    tag: <Tag className="h-6 w-6 text-primary" />,
    percent: <Percent className="h-6 w-6 text-primary" />,

    // --- Качество и Гарантии ---
    gem: <Gem className="h-6 w-6 text-primary" />,
    'shield-check': <ShieldCheck className="h-6 w-6 text-primary" />,
    star: <Star className="h-6 w-6 text-primary" />,
    award: <Award className="h-6 w-6 text-primary" />,
    leaf: <Leaf className="h-6 w-6 text-primary" />, // Эко-товары
    sparkles: <Sparkles className="h-6 w-6 text-primary" />, // Новинки

    // --- Коммуникация и Соцсети ---
    envelope: <Mail className="h-6 w-6 text-primary" />,
    mail: <Mail className="h-6 w-6 text-primary" />, // Алиас для envelope
    instagram: <Instagram className="h-6 w-6 text-primary" />,
    pinterest: <Share2 className="h-6 w-6 text-primary" />,
    share: <Share2 className="h-6 w-6 text-primary" />, // Алиас для pinterest

    // --- Поддержка и Сервис ---
    hearthand: <HandHeart className="h-6 w-6 text-primary" />,
    headset: <Headset className="h-6 w-6 text-primary" />,
    'help-circle': <HelpCircle className="h-6 w-6 text-primary" />,
    'life-buoy': <LifeBuoy className="h-6 w-6 text-primary" />,
    'arrow-left-right': <ArrowLeftRight className="h-6 w-6 text-primary" />, // Обмен и возврат

    // --- Пользовательский интерфейс и Аккаунт ---
    user: <User className="h-6 w-6 text-primary" />,
    'shopping-cart': <ShoppingCart className="h-6 w-6 text-primary" />,
    heart: <Heart className="h-6 w-6 text-primary" />, // Избранное
    settings: <Settings className="h-6 w-6 text-primary" />,
    search: <Search className="h-6 w-6 text-primary" />,
    home: <Home className="h-6 w-6 text-primary" />,
    'log-in': <LogIn className="h-6 w-6 text-primary" />,
    'log-out': <LogOut className="h-6 w-6 text-primary" />,
    filetext: <FileText className="h-6 w-6 text-primary" />, // Документы, реквизиты
    info: <Info className="h-6 w-6 text-primary" />,

    // --- Программы лояльности и Подарки ---
    gift: <Gift className="h-6 w-6 text-primary" />,
    crown: <Crown className="h-6 w-6 text-primary" />,
    rocket: <Rocket className="h-6 w-6 text-primary" />,

    // --- Статусы и Уведомления ---
    'check-circle': <CheckCircle2 className="h-6 w-6 text-primary" />, // Успех
    'x-circle': <XCircle className="h-6 w-6 text-primary" />, // Ошибка
    'alert-triangle': <AlertTriangle className="h-6 w-6 text-primary" />, // Предупреждение

    // --- Иконка по умолчанию ---
    default: <Package className="h-6 w-6 text-primary" />,
};

interface ContentRendererProps {
  content: string;
}

export const ContentRenderer = ({ content }: ContentRendererProps) => {
  const match = content.match(commandRegex);

  if (!match) {
    return <span dangerouslySetInnerHTML={{ __html: content }} />;
  }

  const [, type, attrsString] = match;
  const attrs = parseAttributes(attrsString);

  switch (type) {
    case 'telegram_btn':
      if (!attrs.user) return <span dangerouslySetInnerHTML={{ __html: content }} />;
      return (
        <a href={`https://t.me/${attrs.user.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="no-underline">
          <Button className="w-full h-control-md text-base my-2 rounded-2xl"> <MessageSquare className="mr-2 h-5 w-5" /> {attrs.text || 'Написать в Telegram'} </Button>
        </a>
      );
      
    case 'phone_btn':
      if (!attrs.number) return <span dangerouslySetInnerHTML={{ __html: content }} />;
      return (
        <a href={`tel:${attrs.number}`} className="no-underline">
           <Button variant="outline" className="w-full h-control-md text-base my-2 rounded-2xl"> <Phone className="mr-2 h-5 w-5" /> {attrs.text || attrs.number} </Button>
        </a>
      );
      
    case 'internal_link_btn':
        if(!attrs.to) return <span dangerouslySetInnerHTML={{ __html: content }} />;
        return (
            <Link to={attrs.to} className="no-underline">
                <Button variant="secondary" className="w-full h-control-md text-base my-2 rounded-2xl">{attrs.text || 'Перейти'}</Button>
            </Link>
        );

    case 'info_card':
      if (!attrs.title || !attrs.text) return <span dangerouslySetInnerHTML={{ __html: content }} />;
      
      const icon = iconMap[attrs.icon] || iconMap.default;
      const isEmail = attrs.text.includes('@');
      
      return (
        <Card className="my-4 not-prose rounded-2xl">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                {icon}
                <CardTitle>{attrs.title}</CardTitle>
            </CardHeader>
            <CardContent>
                {isEmail ? (
                    <a href={`mailto:${attrs.text}`} className="text-muted-foreground hover:text-primary"> {attrs.text} </a>
                ) : (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: attrs.text }} />
                )}
            </CardContent>
        </Card>
      );

    default:
      return <span dangerouslySetInnerHTML={{ __html: content }} />;
  }
};