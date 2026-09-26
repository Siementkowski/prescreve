// Conteúdo fixo do roteiro de anamnese do Guia de Consulta — perguntas de rotina (S), só
// o que já foi marcado muda o texto final. Os LABS por trimestre continuam em
// dados/preNatal.ts (PRE_NATAL/examesDaConsulta).

/** Perguntas fixas de toda consulta de pré-natal, sempre no modelo nega/refere — sem
 *  marcar nada, o texto final assume "nega" pra todas. `textoRefere` é a frase usada
 *  quando a queixa é marcada (refere). */
export interface QueixaRotina {
  chave: string
  titulo: string
  textoRefere: string
}

export const QUEIXAS_ROTINA: QueixaRotina[] = [
  { chave: 'mov_fetal', titulo: 'Movimentação fetal diminuída', textoRefere: 'diminuição da movimentação fetal' },
  { chave: 'contracoes', titulo: 'Contrações uterinas', textoRefere: 'contrações uterinas' },
  { chave: 'perdas_vaginais', titulo: 'Perdas vaginais (líquido ou sangue)', textoRefere: 'perdas vaginais (líquido ou sangue)' },
  { chave: 'sintomas_urinarios', titulo: 'Sintomas urinários (disúria, polaciúria)', textoRefere: 'sintomas urinários (disúria, polaciúria)' },
  { chave: 'edema', titulo: 'Edema', textoRefere: 'edema' },
  { chave: 'cefaleia', titulo: 'Cefaleia', textoRefere: 'cefaleia' },
  { chave: 'alteracoes_visuais', titulo: 'Alterações visuais / escotomas', textoRefere: 'alterações visuais/escotomas' },
  { chave: 'dor_epigastrica', titulo: 'Dor epigástrica', textoRefere: 'dor epigástrica' },
]

export const TEXTO_SINAIS_ALERTA =
  'Oriento sinais de alerta para pré-eclâmpsia (cefaleia intensa, alterações visuais/escotomas, dor epigástrica, edema súbito de mãos/rosto) e para parto prematuro (contrações regulares, perda de líquido ou sangramento vaginal) — procurar atendimento imediato se presentes.'
