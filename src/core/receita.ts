// Geração do texto de receita a partir dos campos estruturados do item de tratamento.
// A receita nunca é digitada solta — é sempre derivada de medicamento + dose + via + posologia + duração,
// pra nunca desatualizar quando a dose muda (o problema que a planilha antiga tinha).

export interface DadosItemReceita {
  nomeMedicamento: string | null | undefined // resolvido: nome do cadastro OU nome_livre
  dose: string | null | undefined
  via: string | null | undefined
  posologia: string | null | undefined
  duracao: string | null | undefined
  receitaCustom: string | null | undefined
}

/** Monta o texto padrão: "Nitrofurantoína 100 mg VO 6/6h por 5 dias" */
export function gerarTextoPadrao(dados: DadosItemReceita): string {
  const partes: string[] = []
  if (dados.nomeMedicamento?.trim()) partes.push(dados.nomeMedicamento.trim())
  if (dados.dose?.trim()) partes.push(dados.dose.trim())
  if (dados.via?.trim()) partes.push(dados.via.trim())
  if (dados.posologia?.trim()) partes.push(dados.posologia.trim())
  if (dados.duracao?.trim()) partes.push(`por ${dados.duracao.trim()}`)
  return partes.join(' ')
}

/** Texto final: usa receita_custom quando preenchido, senão o texto derivado dos campos. */
export function gerarTextoReceita(dados: DadosItemReceita): string {
  const custom = dados.receitaCustom?.trim()
  if (custom) return custom
  return gerarTextoPadrao(dados)
}

export function estaUsandoCustom(receitaCustom: string | null | undefined): boolean {
  return !!receitaCustom?.trim()
}

/** Campos crus de um tratamento_itens — usado pela tela de consulta para não duplicar
 *  a lógica de "resolver nome (cadastro ou livre) + gerar texto" em cada lugar que exibe um item. */
export interface ItemReceitaBruto {
  medicamento_id: number | null
  nome_livre: string | null
  dose: string | null
  via: string | null
  posologia: string | null
  duracao: string | null
  receita_custom: string | null
}

/** Recebe o item cru + o nome do medicamento do cadastro (já resolvido por quem chama,
 *  já que só quem tem acesso à lista de medicamentos sabe fazer esse lookup) e devolve o texto final. */
export function textoReceitaDoItem(
  item: ItemReceitaBruto,
  nomeMedicamentoCadastro: string | null
): string {
  const nomeMedicamento = item.medicamento_id ? nomeMedicamentoCadastro : item.nome_livre
  return gerarTextoReceita({
    nomeMedicamento,
    dose: item.dose,
    via: item.via,
    posologia: item.posologia,
    duracao: item.duracao,
    receitaCustom: item.receita_custom,
  })
}
