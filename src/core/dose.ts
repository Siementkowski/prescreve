// Dose derivada de quantidade × concentração da apresentação — pra não depender de alguém
// calcular de cabeça e digitar errado. Só calcula quando a quantidade é um número simples
// (uma faixa como "1 a 2" não tem dose única, então não calcula — quem edita digita à mão
// nesse caso, e isso já conta como override).

import type { DadosApresentacao } from './apresentacao'

export interface DoseCalculada {
  valor: number
  unidade: string
}

function parseQuantidadeSimples(q: string | null | undefined): number | null {
  if (!q?.trim()) return null
  const limpo = q.trim().replace(',', '.')
  if (!/^\d+(\.\d+)?$/.test(limpo)) return null
  const n = Number(limpo)
  return Number.isFinite(n) ? n : null
}

/** null quando falta quantidade (vazia ou faixa) ou a apresentação não tem
 *  concentração+unidade cadastradas — nesses casos não há o que calcular. */
export function calcularDose(
  apresentacao: DadosApresentacao | null | undefined,
  quantidade: string | null | undefined
): DoseCalculada | null {
  const qtd = parseQuantidadeSimples(quantidade)
  if (qtd == null || apresentacao?.concentracao == null || !apresentacao.unidade?.trim()) return null
  return { valor: qtd * apresentacao.concentracao, unidade: apresentacao.unidade.trim() }
}

export function formatarDoseCalculada(d: DoseCalculada): string {
  const valor = Number.isInteger(d.valor) ? String(d.valor) : String(d.valor).replace('.', ',')
  return `${valor} ${d.unidade}`
}
