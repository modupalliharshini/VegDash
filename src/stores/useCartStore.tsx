import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DishType } from '../types';

export type CartStateType = {
  total: number;
  delivery: number;
  discount: number;
  subtotal: number;
  promoCode: string;
  list: DishType[];
  discountAmount: number;
  addToCart: (dish: DishType) => void;
  removeFromCart: (dish: DishType) => void;
  setDiscount: (discount: number) => void;
  resetCart: () => void;
  setPromoCode: (promoCode: string) => void;
};

const initialState: Omit<CartStateType, 'addToCart' | 'removeFromCart' | 'setDiscount' | 'resetCart' | 'setPromoCode'> = {
  total: 0,
  list: [],
  delivery: 0,
  discount: 0,
  subtotal: 0,
  promoCode: '',
  discountAmount: 0,
};

export const useCartStore = create<CartStateType>()(
  persist(
    (set) => ({
      ...initialState,
      addToCart: (dish) => {
        set((state) => {
          const inCart = state.list.find((item) => item.id === dish.id);
          if (inCart) {
            const newList = state.list.map((item) => {
              if (item.id === dish.id) return { ...item, quantity: (item.quantity || 0) + 1 };
              return item;
            });
            const newSubtotal = state.subtotal + Number(dish.price);
            const newTotal = state.total + Number(dish.price) * (1 - state.discount / 100);
            return { ...state, list: newList, subtotal: newSubtotal, total: newTotal };
          } else {
            const newList = [...state.list, { ...dish, quantity: 1 }];
            const newSubtotal = state.subtotal + Number(dish.price);
            const newTotal = state.total + Number(dish.price) * (1 - state.discount / 100);
            return { ...state, list: newList, subtotal: newSubtotal, total: newTotal };
          }
        });
      },
      removeFromCart: (dish) => {
        set((state) => {
          const newList = state.list.reduce((acc, item) => {
            if (item.id === dish.id) {
              if (item.quantity && item.quantity > 1) acc.push({ ...item, quantity: item.quantity - 1 });
            } else {
              acc.push(item);
            }
            return acc;
          }, [] as DishType[]);
          const newSubtotal = Math.max(0, state.subtotal - Number(dish.price));
          const newTotal = Math.max(0, state.total - Number(dish.price) * (1 - state.discount / 100));
          const discount = newList.length === 0 ? 0 : state.discount;
          const promoCode = newList.length === 0 ? '' : state.promoCode;
          return { ...state, list: newList, subtotal: newSubtotal, total: newTotal, discount, promoCode };
        });
      },
      setDiscount: (discount) => {
        set((state) => {
          const newTotal = state.subtotal * (1 - discount / 100);
          return { ...state, discount, total: newTotal, discountAmount: state.subtotal - newTotal };
        });
      },
      resetCart: () => set(() => ({ ...initialState })),
      setPromoCode: (promoCode) => set((state) => ({ ...state, promoCode })),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        total: state.total,
        delivery: state.delivery,
        discount: state.discount,
        subtotal: state.subtotal,
        promoCode: state.promoCode,
        list: state.list,
        discountAmount: state.discountAmount,
      }),
    },
  ),
);
