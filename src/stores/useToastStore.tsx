import {create} from 'zustand';

interface ToastState {
  message: string;
  visible: boolean;
  type?: 'success' | 'error' | 'info';
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

let hideTimer: ReturnType<typeof setTimeout> | null = null;
let clearTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set, get) => ({
  message: '',
  visible: false,
  type: 'success',

  showToast: (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    if (clearTimer) {
      clearTimeout(clearTimer);
      clearTimer = null;
    }

    set({ message, visible: true, type });

    hideTimer = setTimeout(() => {
      get().hideToast();
    }, 3000);
  },

  hideToast: () => {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }

    set({ visible: false });

    clearTimer = setTimeout(() => {
      set({ message: '', type: 'success' });
    }, 500);
  },
}));
