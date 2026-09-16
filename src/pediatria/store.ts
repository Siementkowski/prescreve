import { create } from 'zustand'
import type { FaixaId } from './dados/guiaPuericultura'

export type AbaPediatria = 'calculadora' | 'puericultura' | 'condutas' | 'sinais_alerta_tea'

// Puericultura virou um guia de consulta por faixa etária (mesmo espírito do Guia de
// Consulta do Gestantes) em vez de 5 abas soltas empilhadas numa segunda barra. As 5 telas
// antigas (Calendário vacinal, Marcos, Suplementação, Aleitamento, Exames) continuam
// existindo e acessíveis via "ver completo" dentro de cada bloco do guia — por isso ainda
// precisam de um jeito de saber qual delas está em tela cheia.
export type TelaReferenciaPuericultura = 'calendario_vacinal' | 'marcos_desenvolvimento' | 'suplementacao' | 'aleitamento' | 'exames'

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

  // Faixa etária escolhida no guia de Puericultura — null = tela de cards. Fica na store
  // (não useState local) pra sobreviver a sair pra outra aba de Pediatria (Calculadora,
  // Condutas, TEA) e voltar sem perder a consulta em andamento.
  faixaPuericultura: FaixaId | null
  setFaixaPuericultura: (v: FaixaId | null) => void

  // Qual tela antiga está em modo "ver completo" dentro de Puericultura — null = nenhuma
  // (mostrando o guia normalmente).
  telaReferenciaPuericultura: TelaReferenciaPuericultura | null
  setTelaReferenciaPuericultura: (v: TelaReferenciaPuericultura | null) => void

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

  faixaPuericultura: null,
  setFaixaPuericultura: (faixaPuericultura) => set({ faixaPuericultura }),

  telaReferenciaPuericultura: null,
  setTelaReferenciaPuericultura: (telaReferenciaPuericultura) => set({ telaReferenciaPuericultura }),

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
