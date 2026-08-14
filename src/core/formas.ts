// Descritor declarativo das formas farmacêuticas — espelha o enum `forma_farmaceutica`
// do banco (migrations normaliza_forma_apresentacoes / converte_coluna_forma_para_enum).
// Centralizado aqui de propósito, mesmo padrão de core/via.ts: um único lugar pra rótulo,
// agrupamento, campos exigidos e unidade de administração de cada forma, em vez de
// espalhar isso pelas telas.
//
// 'frasco' foi mantido por decisão explícita (Soro Fisiológico 0,9% é ambíguo — pode ser
// solução, suspensão ou pó pra reconstituição — e não foi reclassificado). Config abaixo
// pra ele é uma estimativa razoável (líquido, mL), não uma definição fechada.

export type FormaFarmaceutica =
  | 'comprimido'
  | 'capsula'
  | 'gotas'
  | 'solucao'
  | 'suspensao'
  | 'ampola'
  | 'sache'
  | 'pomada'
  | 'frasco'

export type GrupoForma = 'solidos' | 'liquidos' | 'parenterais' | 'outros'

/** Chaves de campo que uma forma pode exigir. Nem todas têm coluna própria ainda em
 *  `apresentacoes` — `volume_ampola`, `peso_tubo` e `concentracao_percentual` são
 *  conceituais por enquanto (fase futura adiciona a coluna quando a UI passar a usá-las). */
export type CampoForma =
  | 'concentracao'
  | 'unidade'
  | 'por_volume'
  | 'gotas_por_ml'
  | 'volume_ampola'
  | 'concentracao_percentual'
  | 'peso_tubo'

export interface FormaConfig {
  rotulo: string
  grupo: GrupoForma
  campos: CampoForma[]
  unidadeAdministracao: string
}

export const FORMAS_CONFIG: Record<FormaFarmaceutica, FormaConfig> = {
  comprimido: {
    rotulo: 'Comprimido',
    grupo: 'solidos',
    campos: ['concentracao', 'unidade'],
    unidadeAdministracao: 'comprimidos',
  },
  capsula: {
    rotulo: 'Cápsula',
    grupo: 'solidos',
    campos: ['concentracao', 'unidade'],
    unidadeAdministracao: 'cápsulas',
  },
  gotas: {
    rotulo: 'Gotas',
    grupo: 'liquidos',
    campos: ['concentracao', 'unidade', 'por_volume', 'gotas_por_ml'],
    unidadeAdministracao: 'gotas ou mL',
  },
  solucao: {
    rotulo: 'Solução',
    grupo: 'liquidos',
    campos: ['concentracao', 'unidade', 'por_volume'],
    unidadeAdministracao: 'mL',
  },
  suspensao: {
    rotulo: 'Suspensão',
    grupo: 'liquidos',
    campos: ['concentracao', 'unidade', 'por_volume'],
    unidadeAdministracao: 'mL',
  },
  ampola: {
    rotulo: 'Ampola',
    grupo: 'parenterais',
    campos: ['concentracao', 'unidade', 'por_volume', 'volume_ampola'],
    unidadeAdministracao: 'mL ou ampolas',
  },
  sache: {
    rotulo: 'Sachê',
    grupo: 'solidos',
    campos: ['concentracao', 'unidade'],
    unidadeAdministracao: 'envelopes',
  },
  pomada: {
    rotulo: 'Pomada',
    grupo: 'outros',
    campos: ['concentracao_percentual', 'peso_tubo'],
    unidadeAdministracao: 'aplicações',
  },
  frasco: {
    rotulo: 'Frasco',
    grupo: 'outros',
    campos: ['concentracao', 'unidade', 'por_volume'],
    unidadeAdministracao: 'mL',
  },
}

export const LABEL_GRUPO_FORMA: Record<GrupoForma, string> = {
  solidos: 'Sólidos',
  liquidos: 'Líquidos',
  parenterais: 'Parenterais',
  outros: 'Outros',
}
