import { create } from 'zustand'
import { tratamentosApi } from './api'
import type { Tratamento } from './types'

interface RevisaoState {
  tratamentos: Tratamento[]
  carregando: boolean
  carregar: () => Promise<void>
  marcarRevisado: (id: number) => Promise<void>
}

/** Store dedicado só pra alimentar o contador de pendências no menu do admin e o painel
 *  de revisão — os dois precisam da mesma lista de tratamentos, então compartilham o fetch. */
export const useRevisaoStore = create<RevisaoState>((set, get) => ({
  tratamentos: [],
  carregando: false,

  async carregar() {
    if (get().carregando) return
    set({ carregando: true })
    try {
      const tratamentos = await tratamentosApi.list()
      set({ tratamentos, carregando: false })
    } catch {
      set({ carregando: false })
    }
  },

  async marcarRevisado(id: number) {
    const hoje = new Date().toISOString().slice(0, 10)
    const atualizado = await tratamentosApi.update(id, { revisado_em: hoje, precisa_revisao: false })
    set((s) => ({ tratamentos: s.tratamentos.map((t) => (t.id === id ? atualizado : t)) }))
  },
}))
