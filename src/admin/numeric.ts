/** Converte texto de input numérico (aceita vírgula decimal) pra number|null — vazio ou
 *  inválido vira null, nunca NaN. Compartilhado por todo formulário que edita apresentação. */
export function numOuNull(v: string): number | null {
  if (v.trim() === '') return null
  const n = Number(v.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}
