// src/components/shared/ContentRenderer.tsx
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
    MessageSquare, 
    Phone, 
    Truck, 
    Wallet, 
    MapPin, 
    Package,
    Gem,
    Mail,
    Instagram,
    Share2,
    FileText,
    HandHeart,
    BoxIcon
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils"; // Убедимся, что cn импортирован, он может понадобиться

// ИСПРАВЛЕНИЕ 1: Регулярное выражение теперь поддерживает многострочность
// `[\s\S]` означает "любой пробельный или не-пробельный символ", включая переносы строк
const commandRegex = /\[(\w+)\s+([\s\S]+)\]/;

// Функция для парсинга атрибутов внутри команды
const parseAttributes = (attrsString: string): Record<string, string> => {
  const attrs: Record<string, string> = {};
  const regex = /\s*(\w+)=(["'‘’”])(.*?)\2/gs; // `s` флаг для многострочности

  let match;
  while ((match = regex.exec(attrsString)) !== null) {
    // ИСПРАВЛЕНИЕ 2: Обрезаем лишние пробелы и переносы строк у ключа и значения
    const key = match[1].trim();
    const value = match[3].trim();
    attrs[key] = value;
  }
  return attrs;
};

// Карта для сопоставления текстовых ключей с React-компонентами иконок
const iconMap: { [key: string]: React.ReactNode } = {
    truck: <Truck className="h-6 w-6 text-primary" />,
    wallet: <Wallet className="h-6 w-6 text-primary" />,
    'map-pin': <MapPin className="h-6 w-6 text-primary" />,
    package: <Package className="h-6 w-6 text-primary" />,
    gem: <Gem className="h-6 w-6 text-primary" />,
    envelope: <Mail className="h-6 w-6 text-primary" />,
    instagram: <Instagram className="h-6 w-6 text-primary" />,
    pinterest: <Share2 className="h-6 w-6 text-primary" />,
    filetext: <FileText className="h-6 w-6 text-primary" />,
    hearthand: <HandHeart className="h-6 w-6 text-primary" />,
    box: <BoxIcon className="h-6 w-6 text-primary" />,

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
          <Button className="w-full h-12 text-base my-2"> <MessageSquare className="mr-2 h-5 w-5" /> {attrs.text || 'Написать в Telegram'} </Button>
        </a>
      );
      
    case 'phone_btn':
      if (!attrs.number) return <span dangerouslySetInnerHTML={{ __html: content }} />;
      return (
        <a href={`tel:${attrs.number}`} className="no-underline">
           <Button variant="outline" className="w-full h-12 text-base my-2"> <Phone className="mr-2 h-5 w-5" /> {attrs.text || attrs.number} </Button>
        </a>
      );
      
    case 'internal_link_btn':
        if(!attrs.to) return <span dangerouslySetInnerHTML={{ __html: content }} />;
        return (
            <Link to={attrs.to} className="no-underline">
                <Button variant="secondary" className="w-full h-12 text-base my-2">{attrs.text || 'Перейти'}</Button>
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