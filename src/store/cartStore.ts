// src/store/cartStore.ts
import { create } from 'zustand';
import type { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  totalItems: number;
  setCart: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  updateItemQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
}

const calculateTotalItems = (items: CartItem[]) => 
  items.reduce((total, item) => total + item.quantity, 0);

export const useCartStore = create<CartState>((set) => ({
  items: [],
  totalItems: 0,
  setCart: (items) => set({ 
    items, 
    totalItems: calculateTotalItems(items) 
  }),
  addItem: (item) => set((state) => {
    const existingItem = state.items.find(i => i.product.id === item.product.id);
    let newItems;
    if (existingItem) {
      newItems = state.items.map(i => 
        i.product.id === item.product.id 
          ? { ...i, quantity: i.quantity + item.quantity } 
          : i
      );
    } else {
      newItems = [...state.items, item];
    }
    return { items: newItems, totalItems: calculateTotalItems(newItems) };
  }),
  updateItemQuantity: (productId, quantity) => set((state) => {
    const newItems = state.items.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    );
    return { items: newItems, totalItems: calculateTotalItems(newItems) };
  }),
  removeItem: (productId) => set((state) => {
    const newItems = state.items.filter(item => item.product.id !== productId);
    return { items: newItems, totalItems: calculateTotalItems(newItems) };
  }),
}));