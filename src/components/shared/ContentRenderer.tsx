// src/components/shared/ContentRenderer.tsx
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
    MessageSquare, 
    Phone, 
    Truck, 
    Wallet, 
    MapPin, 
    Package 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Регулярное выражение для поиска "команд" вида [type attr='value']
const commandRegex = /\[(\w+)\s+([^\]]+)\]/;

// Надежная функция для парсинга атрибутов, которая работает с разными типами кавычек
const parseAttributes = (attrsString: string): Record<string, string> => {
  const attrs: Record<string, string> = {};
  const regex = /\s*(\w+)=(["'‘’”])(.*?)\2/g;

  let match;
  while ((match = regex.exec(attrsString)) !== null) {
    // match[1] - это ключ (например, "user")
    // match[3] - это значение (например, "@testuser")
    attrs[match[1]] = match[3];
  }
  return attrs;
};

// Карта для сопоставления текстовых ключей с React-компонентами иконок
const iconMap: { [key: string]: React.ReactNode } = {
    truck: <Truck className="h-6 w-6 text-primary" />,
    wallet: <Wallet className="h-6 w-6 text-primary" />,
    'map-pin': <MapPin className="h-6 w-6 text-primary" />,
    package: <Package className="h-6 w-6 text-primary" />,
    default: <Package className="h-6 w-6 text-primary" />, // Иконка по умолчанию
};

interface ContentRendererProps {
  content: string;
}

export const ContentRenderer = ({ content }: ContentRendererProps) => {
  // Пытаемся найти нашу команду в строке
  const match = content.match(commandRegex);

  // Если команда не найдена, просто рендерим исходный HTML-контент
  if (!match) {
    return <span dangerouslySetInnerHTML={{ __html: content }} />;
  }

  // Если команда найдена, извлекаем ее тип и строку с атрибутами
  const [, type, attrsString] = match;
  const attrs = parseAttributes(attrsString);

  // Рендерим специальные компоненты в зависимости от типа команды
  switch (type) {
    case 'telegram_btn':
      // Проверяем наличие обязательного атрибута 'user'
      if (!attrs.user) return <span dangerouslySetInnerHTML={{ __html: content }} />;
      return (
        <a href={`https://t.me/${attrs.user.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="no-underline">
          <Button className="w-full h-12 text-base my-2 rounded-2xl">
            <MessageSquare className="mr-2 h-5 w-5" />
            {attrs.text || 'Написать в Telegram'}
          </Button>
        </a>
      );
      
    case 'phone_btn':
      // Проверяем наличие обязательного атрибута 'number'
      if (!attrs.number) return <span dangerouslySetInnerHTML={{ __html: content }} />;
      return (
        <a href={`tel:${attrs.number}`} className="no-underline rounded-2xl">
           <Button variant="outline" className="w-full h-12 text-base my-2">
            <Phone className="mr-2 h-5 w-5" />
            {attrs.text || attrs.number}
          </Button>
        </a>
      );
      
    case 'internal_link_btn':
        // Проверяем наличие обязательного атрибута 'to'
        if(!attrs.to) return <span dangerouslySetInnerHTML={{ __html: content }} />;
        return (
            <Link to={attrs.to} className="no-underline">
                <Button variant="secondary" className="w-full h-12 text-base my-2">
                    {attrs.text || 'Перейти'}
                </Button>
            </Link>
        )

    case 'info_card':
      // Проверяем наличие обязательных атрибутов 'title' и 'text'
      if (!attrs.title || !attrs.text) return <span dangerouslySetInnerHTML={{ __html: content }} />;
      
      const icon = iconMap[attrs.icon] || iconMap.default;
      
      return (
        <Card className="my-4 not-prose rounded-3xl"> {/* not-prose отключает стили типографики для карточки */}
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                {icon}
                <CardTitle>{attrs.title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{attrs.text}</p>
            </CardContent>
        </Card>
      );

    default:
      // Если тип команды неизвестен, рендерим как обычный текст
      return <span dangerouslySetInnerHTML={{ __html: content }} />;
  }
};