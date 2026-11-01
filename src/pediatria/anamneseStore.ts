import { create } from 'zustand'

/** Formulário da anamnese de Puericultura. Fica na store (não em useState) só pra sobreviver
 *  a trocar de aba dentro da consulta (Anamnese / Vacinas / Referência). Sem `persist` de
 *  propósito: é a criança na cadeira agora, não deve sobreviver a um F5 com outra. */
interface AnamneseState {
  valores: Record<string, string>
  setValor: (id: string, v: string) => void
  marcos: Set<string>
  alternarMarco: (chave: string) => void
  reflexos: Set<string>
  alternarReflexo: (nome: string) => void
  vacFaltando: Set<string>
  alternarVacina: (nome: string) => void
  exameOff: Set<string>
  alternarExame: (id: string) => void
  orientOff: Set<string>
  alternarOrient: (id: string) => void
  planoExtra: string
  setPlanoExtra: (v: string) => void
  limpar: () => void
}

const alternar = (s: Set<string>, k: string) => {
  const n = new Set(s)
  if (n.has(k)) n.delete(k)
  else n.add(k)
  return n
}

export const useAnamneseStore = create<AnamneseState>((set) => ({
  valores: {},
  setValor: (id, v) => set((s) => ({ valores: { ...s.valores, [id]: v } })),
  marcos: new Set(),
  alternarMarco: (k) => set((s) => ({ marcos: alternar(s.marcos, k) })),
  reflexos: new Set(),
  alternarReflexo: (k) => set((s) => ({ reflexos: alternar(s.reflexos, k) })),
  vacFaltando: new Set(),
  alternarVacina: (k) => set((s) => ({ vacFaltando: alternar(s.vacFaltando, k) })),
  exameOff: new Set(),
  alternarExame: (k) => set((s) => ({ exameOff: alternar(s.exameOff, k) })),
  orientOff: new Set(),
  alternarOrient: (k) => set((s) => ({ orientOff: alternar(s.orientOff, k) })),
  planoExtra: '',
  setPlanoExtra: (planoExtra) => set({ planoExtra }),
  limpar: () =>
    set({ valores: {}, marcos: new Set(), reflexos: new Set(), vacFaltando: new Set(), exameOff: new Set(), orientOff: new Set(), planoExtra: '' }),
}))
