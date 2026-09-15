import { useMemo } from 'react'
import { create } from 'zustand'
import { calcularIGPorDUM, calcularIGPorUSG, type IdadeGestacional } from './idade'

export type AbaGestantes = 'guia_consulta' | 'pre_natal' | 'suplementacao' | 'vacinacao' | 'intercorrencias'
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

/** yyyy-mm-dd (de <input type="date">) → Date local — exportada pra quem precisa da data
 *  "crua" além da IG já calculada (ex: montar a DPP, ou citar a data no texto final). */
export function dataDeInputISO(iso: string): Date {
  const [ano, mes, dia] = iso.split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}

export interface ContextoIG {
  metodo: MetodoIG
  dum: string
  dataExameUSG: string
  igUsgSemanas: string
  igUsgDias: string
}

/** IG atual a partir dos campos preenchidos — null se não tem dado suficiente ainda.
 *  Função pura (não é selector de Zustand): sempre monte o contexto com useGestantesStore
 *  selecionando cada campo primitivo, e passe pra cá dentro de um useMemo — selecionar a
 *  store com uma função que devolve objeto novo a cada leitura (como essa fazia antes)
 *  gera um novo objeto a cada render e entra em loop infinito com useSyncExternalStore. */
export function calcularIGDoContexto(ctx: ContextoIG): IdadeGestacional | null {
  if (ctx.metodo === 'dum') {
    if (!ctx.dum) return null
    return calcularIGPorDUM(dataDeInputISO(ctx.dum))
  }
  if (!ctx.dataExameUSG || ctx.igUsgSemanas === '') return null
  return calcularIGPorUSG(dataDeInputISO(ctx.dataExameUSG), {
    semanas: Number(ctx.igUsgSemanas) || 0,
    dias: Number(ctx.igUsgDias) || 0,
  })
}

/** IG atual, direto — cobre o caso comum (Suplementação/Vacinação só precisam do
 *  resultado, não dos campos crus). Quem também precisa dos campos individuais (Pré-natal
 *  pro formulário, Guia de Consulta pro cabeçalho da anamnese) continua selecionando cada
 *  um à parte e pode usar `calcularIGDoContexto` diretamente. */
export function useIGAtual(): IdadeGestacional | null {
  const metodo = useGestantesStore((s) => s.metodo)
  const dum = useGestantesStore((s) => s.dum)
  const dataExameUSG = useGestantesStore((s) => s.dataExameUSG)
  const igUsgSemanas = useGestantesStore((s) => s.igUsgSemanas)
  const igUsgDias = useGestantesStore((s) => s.igUsgDias)
  return useMemo(
    () => calcularIGDoContexto({ metodo, dum, dataExameUSG, igUsgSemanas, igUsgDias }),
    [metodo, dum, dataExameUSG, igUsgSemanas, igUsgDias]
  )
}
