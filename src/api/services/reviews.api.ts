// src/api/services/reviews.api.ts
import api from '@/api/client';
import type { PaginatedReviews, ReviewCreate, ProductReview, MediaUploadResponse } from '@/types';

// Получение отзывов
export const getReviews = async (productId: number, page: number = 1): Promise<PaginatedReviews> => {
    const { data } = await api.get<PaginatedReviews>(`/products/${productId}/reviews?page=${page}`);
    return data;
};

// Создание отзыва
export const createReview = async (productId: number, reviewData: ReviewCreate): Promise<ProductReview> => {
    const { data } = await api.post<ProductReview>(`/products/${productId}/reviews`, reviewData);
    return data;
};

// Загрузка изображений
export const uploadMedia = async (files: File[]): Promise<MediaUploadResponse[]> => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('files', file);
    });
    const { data } = await api.post<MediaUploadResponse[]>('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};