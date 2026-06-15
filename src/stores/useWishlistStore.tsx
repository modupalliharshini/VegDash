import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type WishlistStateType = {
  list: any[];
  addToWishlist: (course: any) => void;
  removeFromWishlist: (course: any) => void;
};

export const useWishlistStore = create<WishlistStateType>()(
  persist(
    (set) => ({
      list: [],
      addToWishlist: (course) => {
        set((state) => {
          const inWishlist = state.list.find((item) => item?.id === course.id);
          if (!inWishlist) return { ...state, list: [...state.list, course] };
          return state;
        });
      },
      removeFromWishlist: (course) => {
        set((state) => ({ ...state, list: state.list.filter((item) => item?.id !== course.id) }));
      },
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
