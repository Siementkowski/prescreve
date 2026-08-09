// Geração do texto de receita a partir dos campos estruturados do item de tratamento.
// A receita nunca é digitada solta — é sempre derivada de medicamento + apresentação +
// dose + via + posologia + duração + condição, pra nunca desatualizar quando algo muda
// (o problema que a planilha antiga tinha).
//
// Montagem por segmentos: cada pedaço da frase só entra na lista se tiver conteúdo, e o
// texto final é a junção dos segmentos presentes — nunca uma concatenação de strings com
// conectores fixos. É assim que um campo ausente nunca deixa preposição ou vírgula solta,
// e um campo novo (o próximo que alguém adicionar) não corre o risco de reintroduzir esse
// bug: ele também só aparece quando tem conteúdo.

import { formatarConcentracao, formaComQuantidade, type DadosApresentacao } from './apresentacao'

export interface DadosItemReceita {
  nomeMedicamento: string | null | undefined // resolvido: nome do cadastro OU nome_livre
  apresentacao: DadosApresentacao | null | undefined // resolvida a partir de apresentacao_id
  quantidade: string | null | undefined
  dose: string | null | undefined
  via: string | null | undefined
  posologia: string | null | undefined
  duracao: string | null | undefined
  condicao: string | null | undefined
  receitaCustom: string | null | undefined
}

interface Segmento {
  texto: string
  /** true = este segmento é introduzido por ", " em vez de espaço — usado pra separar a
   *  identificação do medicamento (nome + concentração) de como tomar, e pra sempre
   *  destacar a condição no fim. */
  virgulaAntes: boolean
}

function montarSegmentos(dados: DadosItemReceita): Segmento[] {
  const segmentos: Segmento[] = []

  const nome = dados.nomeMedicamento?.trim()
  if (nome) segmentos.push({ texto: nome, virgulaAntes: false })

  const concentracao = dados.apresentacao ? formatarConcentracao(dados.apresentacao) : null
  if (concentracao) segmentos.push({ texto: concentracao, virgulaAntes: false })

  const quantidade = dados.quantidade?.trim()
  const forma = dados.apresentacao?.forma?.trim()
  if (quantidade && forma) {
    segmentos.push({ texto: `${quantidade} ${formaComQuantidade(forma, quantidade)}`, virgulaAntes: true })
  }

  // Dose "solta" (sem apresentação estruturada) continua funcionando como antes — entra
  // junto do bloco de como tomar, sem vírgula, pra não duplicar a lógica da apresentação.
  const dose = dados.dose?.trim()
  if (dose) segmentos.push({ texto: dose, virgulaAntes: false })

  const via = dados.via?.trim()
  if (via) segmentos.push({ texto: via, virgulaAntes: false })

  const posologia = dados.posologia?.trim()
  if (posologia) segmentos.push({ texto: posologia, virgulaAntes: false })

  const duracao = dados.duracao?.trim()
  if (duracao) segmentos.push({ texto: `por ${duracao}`, virgulaAntes: false })

  const condicao = dados.condicao?.trim()
  if (condicao) segmentos.push({ texto: condicao, virgulaAntes: true })

  return segmentos
}

/** Junta os segmentos presentes — nunca produz espaço duplo, vírgula dupla ou pontuação
 *  solta no início/fim, porque só entra na lista quem já tem conteúdo. */
function juntarSegmentos(segmentos: Segmento[]): string {
  return segmentos.reduce((acc, seg, i) => {
    if (i === 0) return seg.texto
    return acc + (seg.virgulaAntes ? ', ' : ' ') + seg.texto
  }, '')
}

/** Monta o texto padrão: "Amoxicilina 500 mg, 1 comprimido VO 8/8h por 10 dias" */
export function gerarTextoPadrao(dados: DadosItemReceita): string {
  return juntarSegmentos(montarSegmentos(dados))
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
  apresentacao_id: number | null
  quantidade: string | null
  dose: string | null
  via: string | null
  posologia: string | null
  duracao: string | null
  condicao: string | null
  receita_custom: string | null
}

/** Recebe o item cru + o nome do medicamento e a apresentação já resolvidos por quem chama
 *  (só quem tem acesso às listas de medicamentos/apresentações sabe fazer esse lookup) e
 *  devolve o texto final. */
export function textoReceitaDoItem(
  item: ItemReceitaBruto,
  nomeMedicamentoCadastro: string | null,
  apresentacao: DadosApresentacao | null = null
): string {
  const nomeMedicamento = item.medicamento_id ? nomeMedicamentoCadastro : item.nome_livre
  return gerarTextoReceita({
    nomeMedicamento,
    apresentacao: item.apresentacao_id ? apresentacao : null,
    quantidade: item.quantidade,
    dose: item.dose,
    via: item.via,
    posologia: item.posologia,
    duracao: item.duracao,
    condicao: item.condicao,
    receitaCustom: item.receita_custom,
  })
}
