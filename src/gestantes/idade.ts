/** Idade gestacional e datas relacionadas — puro, sem UI. Dois métodos de cálculo:
 *
 *  DUM: idade gestacional é simplesmente hoje − DUM, e a DPP é a regra de Naegele
 *  (DUM + 280 dias / 40 semanas) — só depende da própria DUM, nunca muda com o tempo.
 *
 *  USG: o exame já informa a IG naquela data (mais confiável no 1º trimestre que a
 *  memória da DUM) — daí é só somar os dias decorridos entre a data do exame e a data de
 *  referência (hoje) pra projetar a IG atual. A DPP "corrigida" sai da mesma conta: a
 *  data em que a gestação completaria 40 semanas, partindo da IG do USG. */

export interface IdadeGestacional {
  semanas: number
  dias: number // 0-6, resto da semana
}

const DIA_EM_MS = 24 * 60 * 60 * 1000

function diasEntre(inicio: Date, fim: Date): number {
  // Zera hora/minuto/segundo antes de subtrair — evita diferença de 1 dia por causa de
  // fuso/horário quando as datas vêm de <input type="date"> (meia-noite local) misturadas
  // com `new Date()` (hora atual).
  const a = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate())
  const b = new Date(fim.getFullYear(), fim.getMonth(), fim.getDate())
  return Math.round((b.getTime() - a.getTime()) / DIA_EM_MS)
}

function diasParaIG(totalDias: number): IdadeGestacional {
  const dias = Math.max(0, totalDias)
  return { semanas: Math.floor(dias / 7), dias: dias % 7 }
}

/** IG atual a partir da DUM — hoje (ou `dataReferencia`) menos a DUM. */
export function calcularIGPorDUM(dum: Date, dataReferencia: Date = new Date()): IdadeGestacional {
  return diasParaIG(diasEntre(dum, dataReferencia))
}

/** DPP pela regra de Naegele: DUM + 280 dias (40 semanas). */
export function calcularDPP(dum: Date): Date {
  const dpp = new Date(dum.getFullYear(), dum.getMonth(), dum.getDate())
  dpp.setDate(dpp.getDate() + 280)
  return dpp
}

/** IG projetada pra `dataReferencia` a partir do que o USG apontou numa data anterior —
 *  soma os dias corridos entre o exame e hoje à IG que o USG mediu. */
export function calcularIGPorUSG(
  dataExameUSG: Date,
  igNaDataExame: IdadeGestacional,
  dataReferencia: Date = new Date()
): IdadeGestacional {
  const diasDesdeExame = diasEntre(dataExameUSG, dataReferencia)
  const totalDiasNoExame = igNaDataExame.semanas * 7 + igNaDataExame.dias
  return diasParaIG(totalDiasNoExame + diasDesdeExame)
}

/** DPP "corrigida" pelo USG: a partir da IG apontada no exame, quantos dias faltam pra
 *  completar 40 semanas (280 dias) — contados da data do próprio exame, não de hoje. */
export function dppCorrigidaPorUSG(dataExameUSG: Date, igNaDataExame: IdadeGestacional): Date {
  const totalDiasNoExame = igNaDataExame.semanas * 7 + igNaDataExame.dias
  const diasRestantes = 280 - totalDiasNoExame
  const dpp = new Date(dataExameUSG.getFullYear(), dataExameUSG.getMonth(), dataExameUSG.getDate())
  dpp.setDate(dpp.getDate() + diasRestantes)
  return dpp
}

/** Trimestre a partir das semanas completas — 1º até 13s6d, 2º de 14s a 27s6d, 3º daí em
 *  diante. Usa só `semanas` (o resto em dias nunca muda o trimestre). */
export function trimestreDaIG(semanas: number): 1 | 2 | 3 {
  if (semanas < 14) return 1
  if (semanas < 28) return 2
  return 3
}

/** Formata como "31s 3d" — mesmo padrão compacto usado no resto do app pra idade. */
export function formatarIG(ig: IdadeGestacional): string {
  return `${ig.semanas}s ${ig.dias}d`
}

/** Formata data como dd/mm/aaaa — sem depender de Intl/locale, mesmo padrão simples do
 *  resto do projeto. */
export function formatarData(data: Date): string {
  const dd = String(data.getDate()).padStart(2, '0')
  const mm = String(data.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${data.getFullYear()}`
}

// ---- Testes de sanidade manuais (mesmo espírito informal do idade.ts da Pediatria) ----
// DUM há exatamente 40 semanas (280 dias) → IG 40s0d e DPP = hoje.
// const hoje = new Date()
// const dum40s = new Date(hoje); dum40s.setDate(dum40s.getDate() - 280)
// console.assert(formatarIG(calcularIGPorDUM(dum40s, hoje)) === '40s 0d', 'IG 40s0d')
// console.assert(diasEntre(calcularDPP(dum40s), hoje) === 0, 'DPP = hoje')
// Trimestre: 27s6d → 2º, 28s0d → 3º.
// console.assert(trimestreDaIG(27) === 2, '27s ainda é 2º trimestre')
// console.assert(trimestreDaIG(28) === 3, '28s já é 3º trimestre')
