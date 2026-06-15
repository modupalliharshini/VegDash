import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, LoginPayload, RegisterPayload } from '../services/authService';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isPhoneVerified: boolean;
  addresses: any[];
  avatar?: string;
}

export type AuthStateType = {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  setPhoneVerified: (verified: boolean) => void;
  updateUser: (updatedUser: User) => void;
  clearError: () => void;
};

export const useAuthStore = create<AuthStateType>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      loading: false,
      error: null,

      login: async (payload) => {
        set({ loading: true, error: null });
        try {
          const data = await authService.login(payload);
          await AsyncStorage.setItem('vegdash_token', data.token);
          await AsyncStorage.setItem('vegdash_user', JSON.stringify(data.user));
          set({
            user: data.user,
            token: data.token,
            isLoggedIn: true,
            loading: false,
          });
        } catch (err: any) {
          const errMsg = err.response?.data?.message || err.message || 'Login failed';
          set({ error: errMsg, loading: false });
          throw new Error(errMsg);
        }
      },

      register: async (payload) => {
        set({ loading: true, error: null });
        try {
          const data = await authService.register(payload);
          await AsyncStorage.setItem('vegdash_token', data.token);
          await AsyncStorage.setItem('vegdash_user', JSON.stringify(data.user));
          set({
            user: data.user,
            token: data.token,
            isLoggedIn: true,
            loading: false,
          });
        } catch (err: any) {
          const errMsg = err.response?.data?.message || err.message || 'Registration failed';
          set({ error: errMsg, loading: false });
          throw new Error(errMsg);
        }
      },

      logout: async () => {
        await AsyncStorage.removeItem('vegdash_token');
        await AsyncStorage.removeItem('vegdash_user');
        set({
          user: null,
          token: null,
          isLoggedIn: false,
          loading: false,
          error: null,
        });
      },

      setPhoneVerified: (verified) => {
        const currentUser = get().user;
        if (currentUser) {
          const updated = { ...currentUser, isPhoneVerified: verified };
          AsyncStorage.setItem('vegdash_user', JSON.stringify(updated));
          set({ user: updated });
        }
      },

      updateUser: (updatedUser) => {
        AsyncStorage.setItem('vegdash_user', JSON.stringify(updatedUser));
        set({ user: updatedUser });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isLoggedIn: state.isLoggedIn,
      }),
    },
  ),
);

export default useAuthStore;
