/* ============================================
   UI Store — Global UI state
   ============================================ */
import { create } from 'zustand';

interface UIState {
  /* ---- Sidebar ---- */
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  /* ---- Command Palette ---- */
  commandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;

  /* ---- Modals ---- */
  activeModal: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;

  /* ---- Toast ---- */
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  /* ---- Theme ---- */
  isDark: boolean;
  toggleTheme: () => void;

  /* ---- Sound ---- */
  soundEnabled: boolean;
  toggleSound: () => void;

  /* ---- Mobile ---- */
  isMobile: boolean;
  setIsMobile: (val: boolean) => void;

  /* ---- Page transition ---- */
  isTransitioning: boolean;
  setTransitioning: (val: boolean) => void;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

let toastCounter = 0;

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  commandPaletteOpen: false,
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),

  activeModal: null,
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),

  toasts: [],
  addToast: (toast) => {
    const id = `toast-${++toastCounter}`;
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    // Auto-remove after duration
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, toast.duration || 4000);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  isDark: true,
  toggleTheme: () => set((s) => ({ isDark: !s.isDark })),

  soundEnabled: false,
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),

  isMobile: false,
  setIsMobile: (val) => set({ isMobile: val }),

  isTransitioning: false,
  setTransitioning: (val) => set({ isTransitioning: val }),
}));
