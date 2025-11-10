// src/store/favoritesStore.ts
import { create } from 'zustand';

interface FavoritesState {
  totalItems: number;
  setTotal: (total: number) => void;
}

export const useFavoritesStore = create<FavoritesState>((set) => ({
  totalItems: 0,
  setTotal: (total) => set({ totalItems: total }),
}));