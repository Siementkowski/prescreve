// Tipos espelhando o schema do Supabase (fase P1).

export type ModoArea = 'ambulatorial' | 'hospitalar' | 'ambos'
export type ModoTratamento = 'ambulatorial' | 'hospitalar' | 'ambos'
export type Linha = '1a_linha' | 'alternativa' | 'opcao' | 'off_label'
export type StatusRisco = 'seguro' | 'cautela' | 'contraindicado' | 'sem_dados'
export type PapelTratamento = 'principal' | 'complemento'

export interface Area {
  id: number
  nome: string
  modo: ModoArea
  icone: string | null
  cor: string | null
  ordem: number
}
export type AreaInput = Omit<Area, 'id'>

export interface Patologia {
  id: number
  area_id: number
  nome: string
  sinonimos: string | null
  orientacoes: string | null
  observacoes: string | null
  ordem: number
}
export type PatologiaInput = Omit<Patologia, 'id'>

export interface Medicamento {
  id: number
  nome: string
  nome_comercial: string | null
  apresentacoes: string | null
  gestacao_status: StatusRisco | null
  gestacao_obs: string | null
  lactacao_status: StatusRisco | null
  contraindicacoes: string | null
  ped_mg_kg_dia: number | null
  ped_dose_max_dia: number | null
  ped_concentracao: number | null
  ped_volume_ref: number | null
  ped_obs: string | null
}
export type MedicamentoInput = Omit<Medicamento, 'id'>

export interface Apresentacao {
  id: number
  medicamento_id: number
  forma: string
  concentracao: number | null
  unidade: string | null
  por_volume: number | null
  por_volume_unidade: string | null
  descricao: string | null
  ordem: number
}
export type ApresentacaoInput = Omit<Apresentacao, 'id'>

export interface Tratamento {
  id: number
  // Null só pra complemento — ele não pertence a uma patologia fixa, vive na biblioteca e
  // se liga a várias via patologia_complementos.
  patologia_id: number | null
  modo: ModoTratamento
  linha: Linha
  titulo: string | null
  observacoes: string | null
  referencia: string | null
  revisado_em: string | null
  precisa_revisao: boolean
  ordem: number
  // 'principal' = a conduta que resolve (escolha única na consulta). 'complemento' =
  // suporte sintomático opcional, reutilizável entre patologias (escolha múltipla).
  papel: PapelTratamento
  // Só complemento usa — agrupamento visual no seletor (Analgésicos, Antieméticos...).
  // Nunca é a unidade de vínculo: quem se liga à patologia é o complemento em si.
  classe: string | null
}
export type TratamentoInput = Omit<Tratamento, 'id'>

/** Vínculo entre uma patologia e um complemento da biblioteca — N:N, com ordem própria
 *  por patologia (a mesma dipirona pode estar em 1º lugar numa patologia e em 3º noutra). */
export interface PatologiaComplemento {
  patologia_id: number
  tratamento_id: number
  ordem: number
}

export interface TratamentoItem {
  id: number
  tratamento_id: number
  medicamento_id: number | null
  nome_livre: string | null
  apresentacao_id: number | null
  quantidade: string | null
  dose: string | null
  via: string | null
  posologia: string | null
  duracao: string | null
  condicao: string | null
  diluicao: string | null
  receita_custom: string | null
  observacoes: string | null
  ordem: number
}
export type TratamentoItemInput = Omit<TratamentoItem, 'id'>

export const LABEL_MODO_AREA: Record<ModoArea, string> = {
  ambulatorial: 'Ambulatorial',
  hospitalar: 'Hospitalar',
  ambos: 'Ambos',
}

export const LABEL_MODO_TRATAMENTO: Record<ModoTratamento, string> = {
  ambulatorial: 'Ambulatorial',
  hospitalar: 'Hospitalar',
  ambos: 'Ambos',
}

export const LABEL_LINHA: Record<Linha, string> = {
  '1a_linha': '1ª linha',
  alternativa: 'Alternativa',
  opcao: 'Opção',
  off_label: 'Off label',
}

export const LABEL_PAPEL: Record<PapelTratamento, string> = {
  principal: 'Principal',
  complemento: 'Complemento',
}

export const LABEL_STATUS_RISCO: Record<StatusRisco, string> = {
  seguro: 'Seguro',
  cautela: 'Cautela',
  contraindicado: 'Contraindicado',
  sem_dados: 'Sem dados',
}
