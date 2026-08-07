import { create } from 'zustand'

// Store global do app. Nesta fase (P1) só existe o essencial;
// consulta/pediatria/admin ganham seus próprios slices nas próximas fases.
interface AppState {
  sidebarAberta: boolean
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarAberta: true,
  toggleSidebar: () => set((s) => ({ sidebarAberta: !s.sidebarAberta })),
}))
