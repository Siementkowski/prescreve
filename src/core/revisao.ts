// Regra de "precisa revisão" — pura, sem UI. Um tratamento precisa de revisão quando:
// (a) foi marcado manualmente (precisa_revisao = true), ou
// (b) nunca foi revisado, ou
// (c) a última revisão passou do prazo configurado (default 12 meses).

export interface DadosRevisao {
  precisaRevisao: boolean
  revisadoEm: string | null // date (YYYY-MM-DD)
}

export const MESES_PADRAO_ATE_REVISAR = 12

export function precisaRevisar(
  dados: DadosRevisao,
  mesesLimite: number = MESES_PADRAO_ATE_REVISAR,
  agora: Date = new Date()
): boolean {
  if (dados.precisaRevisao) return true
  if (!dados.revisadoEm) return true

  const revisado = new Date(dados.revisadoEm)
  const limite = new Date(revisado)
  limite.setMonth(limite.getMonth() + mesesLimite)

  return agora >= limite
}

/** "nunca revisado", "há 3 meses", "há 1 ano e 2 meses" — pra mostrar no selo e no painel. */
export function tempoDesdeRevisao(revisadoEm: string | null, agora: Date = new Date()): string {
  if (!revisadoEm) return 'nunca revisado'

  const revisado = new Date(revisadoEm)
  let meses = (agora.getFullYear() - revisado.getFullYear()) * 12 + (agora.getMonth() - revisado.getMonth())
  if (agora.getDate() < revisado.getDate()) meses -= 1
  if (meses < 1) return 'há menos de 1 mês'
  if (meses < 12) return `há ${meses} ${meses === 1 ? 'mês' : 'meses'}`

  const anos = Math.floor(meses / 12)
  const mesesRestantes = meses % 12
  if (mesesRestantes === 0) return `há ${anos} ${anos === 1 ? 'ano' : 'anos'}`
  return `há ${anos} ${anos === 1 ? 'ano' : 'anos'} e ${mesesRestantes} ${mesesRestantes === 1 ? 'mês' : 'meses'}`
}

export function ehUrl(texto: string): boolean {
  try {
    const u = new URL(texto.trim())
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}
