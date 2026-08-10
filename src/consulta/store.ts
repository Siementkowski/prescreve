import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ModoTratamento } from '../admin/types'

// Estado de navegação/filtro da tela de consulta. Os DADOS (áreas, patologias, medicamentos,
// tratamentos, itens) não moram mais aqui — vêm do core/sync.ts, que cuida do cache offline.
// Esse store só sabe "o que está selecionado" e "como filtrar", nunca busca nada da rede.
interface ConsultaState {
  // Toggle ambulatorial/hospitalar — persistido entre sessões.
  modo: ModoTratamento
  setModo: (modo: ModoTratamento) => void

  // Toggle "paciente gestante" — persistido, com indicação visual permanente enquanto ativo.
  gestante: boolean
  setGestante: (v: boolean) => void
  ocultarContraindicados: boolean
  setOcultarContraindicados: (v: boolean) => void

  // Navegação — três painéis no desktop, pilha no mobile.
  areaSelecionadaId: number | null
  patologiaSelecionadaId: number | null
  selecionarArea: (id: number | null) => void
  selecionarPatologia: (id: number | null) => void
  irPara: (areaId: number, patologiaId: number) => void
  voltar: () => void

  // Esquema escolhido ("Escolha um esquema", único) + complementos marcados ("Adicione se
  // precisar", múltiplo). Nunca persiste — é da consulta atual, zera ao trocar de patologia
  // ou de modo (o esquema de outra patologia não faz sentido continuar marcado).
  principalSelecionadoId: number | null
  complementosSelecionadosIds: number[]
  selecionarPrincipal: (id: number | null) => void
  toggleComplemento: (id: number) => void
}

export const useConsultaStore = create<ConsultaState>()(
  persist(
    (set, get) => ({
      modo: 'ambulatorial',
      setModo: (modo) =>
        set({
          modo,
          areaSelecionadaId: null,
          patologiaSelecionadaId: null,
          principalSelecionadoId: null,
          complementosSelecionadosIds: [],
        }),

      gestante: false,
      setGestante: (gestante) => set({ gestante }),
      ocultarContraindicados: false,
      setOcultarContraindicados: (ocultarContraindicados) => set({ ocultarContraindicados }),

      areaSelecionadaId: null,
      patologiaSelecionadaId: null,
      selecionarArea: (id) =>
        set({
          areaSelecionadaId: id,
          patologiaSelecionadaId: null,
          principalSelecionadoId: null,
          complementosSelecionadosIds: [],
        }),
      selecionarPatologia: (id) =>
        set({ patologiaSelecionadaId: id, principalSelecionadoId: null, complementosSelecionadosIds: [] }),
      irPara: (areaId, patologiaId) =>
        set({
          areaSelecionadaId: areaId,
          patologiaSelecionadaId: patologiaId,
          principalSelecionadoId: null,
          complementosSelecionadosIds: [],
        }),
      voltar: () => {
        const { patologiaSelecionadaId, areaSelecionadaId } = get()
        if (patologiaSelecionadaId != null) set({ patologiaSelecionadaId: null })
        else if (areaSelecionadaId != null) set({ areaSelecionadaId: null })
      },

      principalSelecionadoId: null,
      complementosSelecionadosIds: [],
      selecionarPrincipal: (id) =>
        set((s) => ({ principalSelecionadoId: s.principalSelecionadoId === id ? null : id })),
      toggleComplemento: (id) =>
        set((s) => ({
          complementosSelecionadosIds: s.complementosSelecionadosIds.includes(id)
            ? s.complementosSelecionadosIds.filter((x) => x !== id)
            : [...s.complementosSelecionadosIds, id],
        })),
    }),
    {
      name: 'prescreve-consulta',
      partialize: (state) => ({
        modo: state.modo,
        gestante: state.gestante,
        ocultarContraindicados: state.ocultarContraindicados,
      }),
    }
  )
)
