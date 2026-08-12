// Geração do texto de receita a partir dos campos estruturados do item de tratamento.
// A receita nunca é digitada solta — é sempre derivada de medicamento + apresentação +
// dose + via + posologia + duração + condição, pra nunca desatualizar quando algo muda
// (o problema que a planilha antiga tinha).
//
// Formato de duas linhas, como uma receita de verdade:
//   Nitrofurantoína 100 mg
//   Tomar 1 comprimido de 6/6h, por 5 dias
//
// Montagem por segmentos: cada pedaço da frase só entra na lista se tiver conteúdo, e o
// texto final é a junção dos segmentos presentes — nunca uma concatenação de strings com
// conectores fixos. É assim que um campo ausente nunca deixa preposição ou vírgula solta,
// e um campo novo (o próximo que alguém adicionar) não corre o risco de reintroduzir esse
// bug: ele também só aparece quando tem conteúdo.

import { formatarConcentracao, formaComQuantidade, type DadosApresentacao } from './apresentacao'
import { textoDaVia } from './via'

export interface DadosItemReceita {
  nomeMedicamento: string | null | undefined // resolvido: nome do cadastro OU nome_livre
  apresentacao: DadosApresentacao | null | undefined // resolvida a partir de apresentacao_id
  // Texto livre de apresentação — só quando o item não tem medicamento cadastrado (não há
  // apresentações pra escolher). Entra na mesma posição que `apresentacao` entraria.
  apresentacaoLivre: string | null | undefined
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
  /** true = este segmento é introduzido por ", " em vez de espaço — hoje só a condição
   *  usa isso, pra sempre se destacar no fim da linha. */
  virgulaAntes: boolean
}

/** Junta os segmentos presentes — nunca produz espaço duplo, vírgula dupla ou pontuação
 *  solta no início/fim, porque só entra na lista quem já tem conteúdo. */
function juntarSegmentos(segmentos: Segmento[]): string {
  return segmentos.reduce((acc, seg, i) => {
    if (i === 0) return seg.texto
    return acc + (seg.virgulaAntes ? ', ' : ' ') + seg.texto
  }, '')
}

/** Linha 1 — identificação: "Dipirona 500 mg". A concentração vem da apresentação
 *  escolhida; sem cadastro, a apresentação em texto livre faz esse papel; sem nenhuma das
 *  duas, a dose livre (campo legado) é o último fallback. */
function montarLinha1(dados: DadosItemReceita): string {
  const segmentos: Segmento[] = []

  const nome = dados.nomeMedicamento?.trim()
  if (nome) segmentos.push({ texto: nome, virgulaAntes: false })

  const concentracao = dados.apresentacao ? formatarConcentracao(dados.apresentacao) : null
  const forca = concentracao ?? dados.apresentacaoLivre?.trim() ?? dados.dose?.trim() ?? null
  if (forca) segmentos.push({ texto: forca, virgulaAntes: false })

  return juntarSegmentos(segmentos)
}

/** Linha 2 — como tomar: "Tomar 1 comprimido de 6/6h, por 5 dias". A sigla da via vira o
 *  verbo correspondente (verboDaVia/textoDaVia, em core/via.ts); via não mapeada mantém a
 *  sigla como está. "de" antes da posologia e vírgula antes de "por duração" são fixos —
 *  só entram quando o campo correspondente tem conteúdo, como todo o resto aqui. */
function montarLinha2(dados: DadosItemReceita): string {
  const segmentos: Segmento[] = []

  const via = textoDaVia(dados.via)
  if (via) segmentos.push({ texto: via, virgulaAntes: false })

  const quantidade = dados.quantidade?.trim()
  const forma = dados.apresentacao?.forma?.trim() ?? dados.apresentacaoLivre?.trim()
  if (quantidade && forma) {
    segmentos.push({ texto: `${quantidade} ${formaComQuantidade(forma, quantidade)}`, virgulaAntes: false })
  }

  const posologia = dados.posologia?.trim()
  if (posologia) segmentos.push({ texto: `de ${posologia}`, virgulaAntes: false })

  const duracao = dados.duracao?.trim()
  if (duracao) segmentos.push({ texto: `por ${duracao}`, virgulaAntes: true })

  const condicao = dados.condicao?.trim()
  if (condicao) segmentos.push({ texto: condicao, virgulaAntes: true })

  return juntarSegmentos(segmentos)
}

/** Monta o texto padrão em duas linhas — só entra a quebra se as duas linhas tiverem
 *  conteúdo, senão sobra uma linha vazia à toa. */
export function gerarTextoPadrao(dados: DadosItemReceita): string {
  const linha1 = montarLinha1(dados)
  const linha2 = montarLinha2(dados)
  if (linha1 && linha2) return `${linha1}\n${linha2}`
  return linha1 || linha2
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
  apresentacao_livre: string | null
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
 *  devolve o texto final (duas linhas, com \n de verdade). */
export function textoReceitaDoItem(
  item: ItemReceitaBruto,
  nomeMedicamentoCadastro: string | null,
  apresentacao: DadosApresentacao | null = null
): string {
  const nomeMedicamento = item.medicamento_id ? nomeMedicamentoCadastro : item.nome_livre
  return gerarTextoReceita({
    nomeMedicamento,
    apresentacao: item.apresentacao_id ? apresentacao : null,
    apresentacaoLivre: item.apresentacao_id ? null : item.apresentacao_livre,
    quantidade: item.quantidade,
    dose: item.dose,
    via: item.via,
    posologia: item.posologia,
    duracao: item.duracao,
    condicao: item.condicao,
    receitaCustom: item.receita_custom,
  })
}
