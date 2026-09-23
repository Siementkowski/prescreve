import { useMemo } from 'react'
import { create } from 'zustand'
import { calcularIGPorDUM, calcularIGPorUSG, type IdadeGestacional } from './idade'

export type AbaGestantes = 'guia_consulta' | 'suplementacao' | 'vacinacao' | 'intercorrencias'
export type MetodoIG = 'dum' | 'usg' | 'previa'

// Estado da calculadora de idade gestacional — compartilhado entre as sub-abas do módulo
// (mesmo raciocínio do dataNascimento em pediatria/store.ts): calcula uma vez em
// Pré-natal, e Suplementação/Vacinação já sabem em que semana a gestante está, sem pedir
// a DUM de novo. Não usa `persist` de propósito — é a gestante que está na consulta
// agora, não deve sobreviver a um F5 amanhã com outra paciente.
//
// `usg` e `previa` usam exatamente a mesma conta (uma IG já conhecida numa data, projetada
// pra hoje) — só muda de onde veio esse número (um exame de USG vs. uma IG já registrada
// em consulta/relatório anterior) — por isso dividem os mesmos campos `dataReferencia` /
// `igReferenciaSemanas` / `igReferenciaDias`, só com rótulo diferente na tela.
interface GestantesState {
  abaAberta: AbaGestantes
  setAbaAberta: (v: AbaGestantes) => void

  metodo: MetodoIG
  setMetodo: (v: MetodoIG) => void

  dum: string // yyyy-mm-dd, de <input type="date">
  setDum: (v: string) => void

  dataReferencia: string // yyyy-mm-dd — data do USG, ou data em que a IG prévia foi registrada
  setDataReferencia: (v: string) => void
  igReferenciaSemanas: string
  setIgReferenciaSemanas: (v: string) => void
  igReferenciaDias: string
  setIgReferenciaDias: (v: string) => void
}

export const useGestantesStore = create<GestantesState>((set) => ({
  abaAberta: 'guia_consulta',
  setAbaAberta: (abaAberta) => set({ abaAberta }),

  metodo: 'dum',
  setMetodo: (metodo) => set({ metodo }),

  dum: '',
  setDum: (dum) => set({ dum }),

  dataReferencia: '',
  setDataReferencia: (dataReferencia) => set({ dataReferencia }),
  igReferenciaSemanas: '',
  setIgReferenciaSemanas: (igReferenciaSemanas) => set({ igReferenciaSemanas }),
  igReferenciaDias: '',
  setIgReferenciaDias: (igReferenciaDias) => set({ igReferenciaDias }),
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
  dataReferencia: string
  igReferenciaSemanas: string
  igReferenciaDias: string
}

/** IG atual a partir dos campos preenchidos — null se não tem dado suficiente ainda.
 *  Função pura (não é selector de Zustand): sempre monte o contexto com useGestantesStore
 *  selecionando cada campo primitivo, e passe pra cá dentro de um useMemo — selecionar a
 *  store com uma função que devolve objeto novo a cada leitura (como essa fazia antes)
 *  gera um novo objeto a cada render e entra em loop infinito com useSyncExternalStore.
 *
 *  `usg` e `previa` caem no mesmo ramo de propósito — mesma conta, só muda o rótulo na UI. */
export function calcularIGDoContexto(ctx: ContextoIG): IdadeGestacional | null {
  if (ctx.metodo === 'dum') {
    if (!ctx.dum) return null
    return calcularIGPorDUM(dataDeInputISO(ctx.dum))
  }
  if (!ctx.dataReferencia || ctx.igReferenciaSemanas === '') return null
  return calcularIGPorUSG(dataDeInputISO(ctx.dataReferencia), {
    semanas: Number(ctx.igReferenciaSemanas) || 0,
    dias: Number(ctx.igReferenciaDias) || 0,
  })
}

/** IG atual, direto — cobre o caso comum (Suplementação/Vacinação só precisam do
 *  resultado, não dos campos crus). Quem também precisa dos campos individuais (Pré-natal
 *  pro formulário, Guia de Consulta pro cabeçalho da anamnese) continua selecionando cada
 *  um à parte e pode usar `calcularIGDoContexto` diretamente. */
export function useIGAtual(): IdadeGestacional | null {
  const metodo = useGestantesStore((s) => s.metodo)
  const dum = useGestantesStore((s) => s.dum)
  const dataReferencia = useGestantesStore((s) => s.dataReferencia)
  const igReferenciaSemanas = useGestantesStore((s) => s.igReferenciaSemanas)
  const igReferenciaDias = useGestantesStore((s) => s.igReferenciaDias)
  return useMemo(
    () => calcularIGDoContexto({ metodo, dum, dataReferencia, igReferenciaSemanas, igReferenciaDias }),
    [metodo, dum, dataReferencia, igReferenciaSemanas, igReferenciaDias]
  )
}
