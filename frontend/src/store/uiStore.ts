import { create } from 'zustand';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIStore {
  isGlobalLoading: boolean;
  toasts: ToastMessage[];

  setGlobalLoading: (loading: boolean) => void;
  showToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isGlobalLoading: false,
  toasts: [],

  setGlobalLoading: (isGlobalLoading) => set({ isGlobalLoading }),

  showToast: (message, type = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    // Auto remove after 4 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  clearToasts: () => set({ toasts: [] }),
}));
