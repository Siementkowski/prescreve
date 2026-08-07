// Calculadora de dose pediátrica — pura, sem UI. Erro de dose em pediatria é o mais perigoso
// do app, então nada aqui esconde a conta: toda função devolve os números intermediários,
// não só o resultado final, pra tela poder mostrar a fórmula.

export interface ParametrosCalculoPediatrico {
  pesoKg: number
  mgPorKgDia: number
  doseMaxDiariaMg: number | null
  tomadasPorDia: number
  concentracaoMgPorMl: number | null
}

export interface CalculoPediatrico {
  pesoKg: number
  mgPorKgDia: number
  doseDiariaCalculadaMg: number // peso × mg/kg/dia, sem teto aplicado
  doseMaximaDiariaMg: number | null
  atingiuTeto: boolean
  doseDiariaEfetivaMg: number // já com o teto aplicado, se necessário
  tomadasPorDia: number
  dosePorTomadaMg: number
  concentracaoMgPorMl: number | null
  volumePorTomadaMlBruto: number | null // antes de arredondar
  volumePorTomadaMl: number | null // arredondado para 0,1 ml
}

export function calcularDosePediatrica(p: ParametrosCalculoPediatrico): CalculoPediatrico {
  const doseDiariaCalculadaMg = p.pesoKg * p.mgPorKgDia
  const atingiuTeto = p.doseMaxDiariaMg != null && doseDiariaCalculadaMg > p.doseMaxDiariaMg
  const doseDiariaEfetivaMg = atingiuTeto ? (p.doseMaxDiariaMg as number) : doseDiariaCalculadaMg
  const tomadasPorDia = p.tomadasPorDia > 0 ? p.tomadasPorDia : 1
  const dosePorTomadaMg = doseDiariaEfetivaMg / tomadasPorDia

  const volumePorTomadaMlBruto =
    p.concentracaoMgPorMl && p.concentracaoMgPorMl > 0 ? dosePorTomadaMg / p.concentracaoMgPorMl : null
  const volumePorTomadaMl =
    volumePorTomadaMlBruto != null ? Math.round(volumePorTomadaMlBruto * 10) / 10 : null

  return {
    pesoKg: p.pesoKg,
    mgPorKgDia: p.mgPorKgDia,
    doseDiariaCalculadaMg,
    doseMaximaDiariaMg: p.doseMaxDiariaMg,
    atingiuTeto,
    doseDiariaEfetivaMg,
    tomadasPorDia,
    dosePorTomadaMg,
    concentracaoMgPorMl: p.concentracaoMgPorMl,
    volumePorTomadaMlBruto,
    volumePorTomadaMl,
  }
}

export function formatarNumero(n: number, casas = 1): string {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: casas })
}

/** Descreve a conta passo a passo, pra nunca esconder de onde o número saiu. */
export function textoFormula(calc: CalculoPediatrico): string {
  const linhas: string[] = []
  linhas.push(
    `${formatarNumero(calc.pesoKg)} kg × ${formatarNumero(calc.mgPorKgDia, 2)} mg/kg/dia = ${formatarNumero(calc.doseDiariaCalculadaMg)} mg/dia`
  )
  if (calc.atingiuTeto) {
    linhas.push(
      `Ultrapassa o teto de ${formatarNumero(calc.doseMaximaDiariaMg as number)} mg/dia — usando ${formatarNumero(calc.doseDiariaEfetivaMg)} mg/dia`
    )
  }
  linhas.push(
    `${formatarNumero(calc.doseDiariaEfetivaMg)} mg/dia ÷ ${calc.tomadasPorDia}x/dia = ${formatarNumero(calc.dosePorTomadaMg)} mg/tomada`
  )
  if (calc.concentracaoMgPorMl && calc.volumePorTomadaMl != null) {
    linhas.push(
      `${formatarNumero(calc.dosePorTomadaMg)} mg ÷ ${formatarNumero(calc.concentracaoMgPorMl, 2)} mg/ml = ${formatarNumero(calc.volumePorTomadaMlBruto as number, 3)} ml → arredondado para ${formatarNumero(calc.volumePorTomadaMl)} ml`
    )
  }
  return linhas.join('\n')
}

/** Texto pronto pra copiar — prescrição pediátrica com a dose já calculada. */
export function textoPrescricaoPediatrica(calc: CalculoPediatrico, nomeMedicamento: string): string {
  const partes = [nomeMedicamento, `— peso ${formatarNumero(calc.pesoKg)} kg`]
  if (calc.volumePorTomadaMl != null) {
    partes.push(`— ${formatarNumero(calc.volumePorTomadaMl)} ml VO`)
  } else {
    partes.push(`— ${formatarNumero(calc.dosePorTomadaMg)} mg`)
  }
  partes.push(`de ${calc.tomadasPorDia}x/dia`)
  if (calc.volumePorTomadaMl != null) {
    partes.push(`(${formatarNumero(calc.dosePorTomadaMg)} mg/tomada)`)
  }
  if (calc.atingiuTeto) {
    partes.push(`[dose ajustada ao teto de ${formatarNumero(calc.doseMaximaDiariaMg as number)} mg/dia]`)
  }
  return partes.join(' ')
}
