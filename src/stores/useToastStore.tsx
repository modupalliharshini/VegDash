import {create} from 'zustand';

interface ToastState {
  message: string;
  visible: boolean;
  showToast: (message: string) => void;
  hideToast: () => void;
}

let hideTimer: ReturnType<typeof setTimeout> | null = null;
let clearTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set, get) => ({
  message: '',
  visible: false,

  showToast: (message: string) => {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    if (clearTimer) {
      clearTimeout(clearTimer);
      clearTimer = null;
    }

    set({message, visible: true});

    hideTimer = setTimeout(() => {
      get().hideToast();
    }, 3000);
  },

  hideToast: () => {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }

    set({visible: false});

    clearTimer = setTimeout(() => {
      set({message: ''});
    }, 500);
  },
}));
