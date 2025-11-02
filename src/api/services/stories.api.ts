// src/api/services/stories.api.ts
import api from '@/api/client';
import type { Story } from '@/types';

export const getStories = async (): Promise<Story[]> => {
    const { data } = await api.get<Story[]>('/stories');
    return data;
};