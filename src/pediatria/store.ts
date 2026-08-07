import { create } from 'zustand'

// Estado da calculadora pediátrica. Não usa `persist` (localStorage) de propósito —
// peso é específico do paciente que está na sua frente agora, não deve sobreviver
// a um F5 amanhã com outra criança. "Persistido durante a sessão" = enquanto o app
// está aberto, o que o Zustand já garante sozinho (o estado não é recriado ao navegar
// entre Consulta/Pediatria/Admin, só ao recarregar a página).
interface PediatriaState {
  pesoKg: number | null
  setPesoKg: (v: number | null) => void

  busca: string
  setBusca: (v: string) => void

  // Frequência de doses/dia escolhida por medicamento (id -> tomadas/dia). Default é 3x/dia.
  tomadasPorMedicamento: Record<number, number>
  setTomadasPorMedicamento: (medicamentoId: number, tomadas: number) => void
}

export const usePediatriaStore = create<PediatriaState>((set) => ({
  pesoKg: null,
  setPesoKg: (pesoKg) => set({ pesoKg }),

  busca: '',
  setBusca: (busca) => set({ busca }),

  tomadasPorMedicamento: {},
  setTomadasPorMedicamento: (medicamentoId, tomadas) =>
    set((s) => ({ tomadasPorMedicamento: { ...s.tomadasPorMedicamento, [medicamentoId]: tomadas } })),
}))
