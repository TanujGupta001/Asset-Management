import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  globalSearch: string;
  setGlobalSearch: (value: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  globalSearch: '',
  setGlobalSearch: (value: string) => set({ globalSearch: value }),
}));
