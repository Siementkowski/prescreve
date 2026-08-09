// Formatação de apresentações estruturadas (forma + concentração ± volume) — usado tanto
// no rótulo exibido no cadastro do medicamento quanto no segmento de receita gerado.

export interface DadosApresentacao {
  forma: string | null | undefined
  concentracao: number | null | undefined
  unidade: string | null | undefined
  por_volume: number | null | undefined
  por_volume_unidade: string | null | undefined
  descricao?: string | null | undefined
}

function formatarNumero(n: number): string {
  // Evita ".0" sobrando (500 em vez de 500.0), mas preserva casas decimais reais (0.5).
  return Number.isInteger(n) ? String(n) : String(n).replace('.', ',')
}

/** "500 mg", "250 mg/5 ml", "500 mg/ml" (por_volume = 1 some da exibição). */
export function formatarConcentracao(a: DadosApresentacao): string | null {
  if (a.concentracao == null || !a.unidade?.trim()) return null
  let texto = `${formatarNumero(a.concentracao)} ${a.unidade.trim()}`
  if (a.por_volume != null && a.por_volume_unidade?.trim()) {
    const denominador =
      a.por_volume === 1 ? a.por_volume_unidade.trim() : `${formatarNumero(a.por_volume)} ${a.por_volume_unidade.trim()}`
    texto += `/${denominador}`
  }
  return texto
}

/** Rótulo completo pra listas/seletores: "comprimido 500 mg". Usa a descrição manual
 *  quando cadastrada (cobre apresentações que não cabem no padrão forma+concentração). */
export function formatarApresentacao(a: DadosApresentacao): string {
  if (a.descricao?.trim()) return a.descricao.trim()
  const partes: string[] = []
  if (a.forma?.trim()) partes.push(a.forma.trim())
  const concentracao = formatarConcentracao(a)
  if (concentracao) partes.push(concentracao)
  return partes.join(' ')
}

/** Pluraliza a forma farmacêutica (comprimido → comprimidos). Regras simples de PT-BR,
 *  suficientes pro vocabulário do domínio (comprimido, cápsula, ampola, gota, sachê...). */
export function pluralizarForma(forma: string): string {
  const f = forma.trim()
  if (!f) return f
  if (/s$/i.test(f)) return f // já parece plural/invariável (ex: "gotas")
  if (/m$/i.test(f)) return f.slice(0, -1) + 'ns'
  if (/[rz]$/i.test(f)) return f + 'es'
  return f + 's'
}

/** "1 comprimido" fica singular (mantém a forma exatamente como cadastrada). Qualquer
 *  outra quantidade — "2", "1 a 2", texto livre — pluraliza: é o caso inequívoco mais
 *  comum, e evita o risco maior (deixar plural óbvio no singular). */
export function formaComQuantidade(forma: string, quantidade: string): string {
  const q = quantidade.trim()
  const ehUmSingular = q === '1' || q === '1,0' || q === '1.0'
  return ehUmSingular ? forma.trim() : pluralizarForma(forma)
}
