import { create } from 'zustand'
import { calcularIGPorDUM, calcularIGPorUSG, type IdadeGestacional } from './idade'

export type AbaGestantes = 'pre_natal' | 'suplementacao' | 'vacinacao'
export type MetodoIG = 'dum' | 'usg'

// Estado da calculadora de idade gestacional — compartilhado entre as sub-abas do módulo
// (mesmo raciocínio do dataNascimento em pediatria/store.ts): calcula uma vez em
// Pré-natal, e Suplementação/Vacinação já sabem em que semana a gestante está, sem pedir
// a DUM de novo. Não usa `persist` de propósito — é a gestante que está na consulta
// agora, não deve sobreviver a um F5 amanhã com outra paciente.
interface GestantesState {
  abaAberta: AbaGestantes
  setAbaAberta: (v: AbaGestantes) => void

  metodo: MetodoIG
  setMetodo: (v: MetodoIG) => void

  dum: string // yyyy-mm-dd, de <input type="date">
  setDum: (v: string) => void

  dataExameUSG: string
  setDataExameUSG: (v: string) => void
  igUsgSemanas: string
  setIgUsgSemanas: (v: string) => void
  igUsgDias: string
  setIgUsgDias: (v: string) => void
}

export const useGestantesStore = create<GestantesState>((set) => ({
  abaAberta: 'pre_natal',
  setAbaAberta: (abaAberta) => set({ abaAberta }),

  metodo: 'dum',
  setMetodo: (metodo) => set({ metodo }),

  dum: '',
  setDum: (dum) => set({ dum }),

  dataExameUSG: '',
  setDataExameUSG: (dataExameUSG) => set({ dataExameUSG }),
  igUsgSemanas: '',
  setIgUsgSemanas: (igUsgSemanas) => set({ igUsgSemanas }),
  igUsgDias: '',
  setIgUsgDias: (igUsgDias) => set({ igUsgDias }),
}))

function dataDeInput(iso: string): Date {
  const [ano, mes, dia] = iso.split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}

/** IG atual calculada a partir do que estiver preenchido na store — null se não tem dado
 *  suficiente ainda. Usada por Suplementação/Vacinação pra saber "em que semana ela tá"
 *  sem duplicar o formulário de cálculo, que mora só em Pré-natal. */
export function igAtualDaStore(s: GestantesState): IdadeGestacional | null {
  if (s.metodo === 'dum') {
    if (!s.dum) return null
    return calcularIGPorDUM(dataDeInput(s.dum))
  }
  if (!s.dataExameUSG || s.igUsgSemanas === '') return null
  return calcularIGPorUSG(dataDeInput(s.dataExameUSG), {
    semanas: Number(s.igUsgSemanas) || 0,
    dias: Number(s.igUsgDias) || 0,
  })
}
