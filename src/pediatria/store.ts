import { create } from 'zustand'

export type AbaPediatria = 'calculadora' | 'calendario_vacinal' | 'marcos_desenvolvimento' | 'condutas'

// Estado da calculadora pediátrica. Não usa `persist` (localStorage) de propósito —
// peso é específico do paciente que está na sua frente agora, não deve sobreviver
// a um F5 amanhã com outra criança. "Persistido durante a sessão" = enquanto o app
// está aberto, o que o Zustand já garante sozinho (o estado não é recriado ao navegar
// entre Consulta/Pediatria/Admin, só ao recarregar a página).
interface PediatriaState {
  // Qual sub-aba do módulo está aberta — não persiste no localStorage de propósito, mesmo
  // raciocínio do peso: começa sempre na Calculadora quando o app é recarregado.
  abaAberta: AbaPediatria
  setAbaAberta: (v: AbaPediatria) => void

  // Data de nascimento — compartilhada entre Calendário vacinal e Marcos do
  // desenvolvimento, pra não pedir duas vezes ao trocar de aba na mesma consulta.
  dataNascimento: string | null
  setDataNascimento: (v: string | null) => void

  pesoKg: number | null
  setPesoKg: (v: number | null) => void

  busca: string
  setBusca: (v: string) => void

  // Frequência de doses/dia escolhida por medicamento (id -> tomadas/dia). Default é 3x/dia.
  tomadasPorMedicamento: Record<number, number>
  setTomadasPorMedicamento: (medicamentoId: number, tomadas: number) => void
}

export const usePediatriaStore = create<PediatriaState>((set) => ({
  abaAberta: 'calculadora',
  setAbaAberta: (abaAberta) => set({ abaAberta }),

  dataNascimento: null,
  setDataNascimento: (dataNascimento) => set({ dataNascimento }),

  pesoKg: null,
  setPesoKg: (pesoKg) => set({ pesoKg }),

  busca: '',
  setBusca: (busca) => set({ busca }),

  tomadasPorMedicamento: {},
  setTomadasPorMedicamento: (medicamentoId, tomadas) =>
    set((s) => ({ tomadasPorMedicamento: { ...s.tomadasPorMedicamento, [medicamentoId]: tomadas } })),
}))
