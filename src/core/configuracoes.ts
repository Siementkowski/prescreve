import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MESES_PADRAO_ATE_REVISAR } from './revisao'

interface ConfiguracoesState {
  mesesAteRevisar: number
  setMesesAteRevisar: (v: number) => void
}

export const useConfiguracoesStore = create<ConfiguracoesState>()(
  persist(
    (set) => ({
      mesesAteRevisar: MESES_PADRAO_ATE_REVISAR,
      setMesesAteRevisar: (mesesAteRevisar) => set({ mesesAteRevisar: Math.max(1, mesesAteRevisar) }),
    }),
    { name: 'prescreve-configuracoes' }
  )
)
