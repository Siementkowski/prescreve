/** Idade em meses completos a partir da data de nascimento (string yyyy-mm-dd, de um
 *  <input type="date">) até hoje. Pura, sem UI — usada tanto no Calendário vacinal quanto
 *  nos Marcos do desenvolvimento. */
export function idadeEmMeses(dataNascimentoISO: string): number {
  const nascimento = new Date(dataNascimentoISO + 'T00:00:00')
  const hoje = new Date()
  let meses = (hoje.getFullYear() - nascimento.getFullYear()) * 12 + (hoje.getMonth() - nascimento.getMonth())
  if (hoje.getDate() < nascimento.getDate()) meses -= 1
  return Math.max(0, meses)
}

/** Formata idade em meses como texto legível — "3 anos e 2 meses", "8 meses" etc. */
export function formatarIdade(meses: number): string {
  const anos = Math.floor(meses / 12)
  const restoMeses = meses % 12
  if (anos === 0) return `${meses} ${meses === 1 ? 'mês' : 'meses'}`
  const parteAnos = `${anos} ${anos === 1 ? 'ano' : 'anos'}`
  if (restoMeses === 0) return parteAnos
  return `${parteAnos} e ${restoMeses} ${restoMeses === 1 ? 'mês' : 'meses'}`
}
