// src/api/services/cms.api.ts
import api from '@/api';
import type { StructuredPage } from '@/types';

export const getPageBySlug = async (slug: string): Promise<StructuredPage> => {
    const { data } = await api.get<StructuredPage>(`/pages/${slug}`);
    return data;
};