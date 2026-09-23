// Conteúdo fixo do roteiro de anamnese do Guia de Consulta — perguntas de rotina (S) e
// itens de orientação (P) que não mudam com a IG, só o que já foi marcado muda o texto
// final. Os LABS por trimestre continuam em dados/preNatal.ts (PRE_NATAL/examesDaConsulta).

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

/** Itens de orientação de rotina do plano — marcados conforme o que foi de fato orientado
 *  nessa consulta (nem toda orientação cabe em toda IG, ex: cuidados com RN faz mais
 *  sentido perto do termo — por isso é checklist, não texto fixo). */
export interface OrientacaoPlano {
  chave: string
  titulo: string
}

export const ORIENTACOES_PLANO: OrientacaoPlano[] = [
  { chave: 'plano_parto', titulo: 'Plano de parto' },
  { chave: 'reconhecimento_tp', titulo: 'Reconhecimento do trabalho de parto' },
  { chave: 'sinais_alerta', titulo: 'Sinais de alerta (pré-eclâmpsia e parto prematuro)' },
  { chave: 'aleitamento', titulo: 'Aleitamento materno' },
  { chave: 'cuidados_rn', titulo: 'Cuidados com o recém-nascido' },
  { chave: 'revisao_vacinas', titulo: 'Revisão do calendário vacinal' },
]

export const TEXTO_SINAIS_ALERTA =
  'Oriento sinais de alerta para pré-eclâmpsia (cefaleia intensa, alterações visuais/escotomas, dor epigástrica, edema súbito de mãos/rosto) e para parto prematuro (contrações regulares, perda de líquido ou sangramento vaginal) — procurar atendimento imediato se presentes.'
