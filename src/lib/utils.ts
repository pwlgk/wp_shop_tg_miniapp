import type { Product, Story } from "@/types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
  };

  if (date.toDateString() === today.toDateString()) {
    return 'Сегодня';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Вчера';
  }
  return new Intl.DateTimeFormat('ru-RU', options).format(date);
}


export const formatDateInput = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const chars = cleaned.split('');
  let formatted = '';

  if (chars.length > 0) formatted += chars.slice(0, 2).join('');
  if (chars.length > 2) formatted = `${formatted}.${chars.slice(2, 4).join('')}`;
  if (chars.length > 4) formatted = `${formatted}.${chars.slice(4, 8).join('')}`;
  
  return formatted;
};

// NUEVA FUNCIÓN de validación
export const isDateComplete = (value: string): boolean => {
    return /^\d{2}\.\d{2}\.\d{4}$/.test(value);
}


// Типы для функции
type ProductItem = { type: 'product'; data: Product };
type StoryItem = { type: 'story'; data: Story };
export type FeedItem = ProductItem | StoryItem;

/**
 * Вставляет элементы одного массива (stories) в другой (products)
 * с заданной периодичностью.
 */
export const interleaveArrays = (products: Product[], stories: Story[], every: number): FeedItem[] => {
    const mixedFeed: FeedItem[] = [];
    let storyIndex = 0;

    products.forEach((product, index) => {
        mixedFeed.push({ type: 'product', data: product });
        if ((index + 1) % every === 0 && storyIndex < stories.length) {
            mixedFeed.push({ type: 'story', data: stories[storyIndex] });
            storyIndex++;
        }
    });

    return mixedFeed;
};

/**
 * Очищает строку от HTML-тегов, превращая ее в одну строку текста.
 * @param htmlString - Входная строка с HTML.
 * @returns Очищенный текст в одну строку.
 */
export const stripHtml = (htmlString: string): string => {
  if (!htmlString) return '';
  
  // 1. Заменяем теги переноса на пробелы
  const textWithSpaces = htmlString.replace(/<br\s*\/?>/gi, ' ').replace(/<\/p>/gi, ' ');
  
  // 2. Удаляем все остальные HTML-теги
  const plainText = textWithSpaces.replace(/<[^>]*>/g, '');
  
  // 3. Сжимаем множественные пробелы в один и обрезаем по краям
  return plainText.replace(/\s+/g, ' ').trim();
};