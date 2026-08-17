// Descritor declarativo das formas farmacêuticas — espelha o enum `forma_farmaceutica`
// do banco (migrations normaliza_forma_apresentacoes / converte_coluna_forma_para_enum /
// adiciona_campos_por_forma_apresentacoes). Centralizado aqui de propósito: um único lugar
// pra rótulo, agrupamento, campos exigidos e unidade de administração de cada forma — o
// formulário de apresentação (ApresentacaoRow/ApresentacaoPicker) renderiza e valida a
// partir disto, sem condicional por forma escrita à mão. Adicionar uma forma nova (com
// campos já suportados) é só uma entrada nova aqui.
//
// 'frasco' foi mantido por decisão explícita (Soro Fisiológico 0,9% é ambíguo — pode ser
// solução, suspensão ou pó pra reconstituição — e não foi reclassificado). Não é oferecido
// como opção pra apresentações novas (`selecionavel: false`) — existe só pra não quebrar o
// único registro legado que já usa esse valor.

export type FormaFarmaceutica =
  | 'comprimido'
  | 'capsula'
  | 'gotas'
  | 'solucao'
  | 'suspensao'
  | 'ampola'
  | 'sache'
  | 'pomada'
  | 'jato'
  | 'frasco'

export type GrupoForma = 'solidos' | 'liquidos' | 'parenterais' | 'outros'

/** Chaves de campo — cada uma corresponde a 1 (ou 2, quando o campo tem unidade própria)
 *  colunas em `apresentacoes` e a um widget fixo em CAMPO_META, nunca a lógica específica
 *  de uma forma. */
export type CampoForma =
  | 'concentracao' // concentracao + unidade
  | 'por_volume' // por_volume + por_volume_unidade
  | 'gotas_por_ml'
  | 'volume_ampola'
  | 'concentracao_percentual'
  | 'peso_tubo'

export interface FormaConfig {
  rotulo: string
  grupo: GrupoForma
  campos: CampoForma[]
  unidadeAdministracao: string
  /** false só em 'frasco' — não aparece nos toggles de seleção pra apresentação nova,
   *  mas continua com formulário e rótulo funcionando pro registro legado que já usa. */
  selecionavel?: boolean
}

export const FORMAS_CONFIG: Record<FormaFarmaceutica, FormaConfig> = {
  comprimido: {
    rotulo: 'Comprimido',
    grupo: 'solidos',
    campos: ['concentracao'],
    unidadeAdministracao: 'comprimidos',
  },
  capsula: {
    rotulo: 'Cápsula',
    grupo: 'solidos',
    campos: ['concentracao'],
    unidadeAdministracao: 'cápsulas',
  },
  gotas: {
    rotulo: 'Gotas',
    grupo: 'liquidos',
    campos: ['concentracao', 'por_volume', 'gotas_por_ml'],
    unidadeAdministracao: 'gotas ou mL',
  },
  solucao: {
    rotulo: 'Solução',
    grupo: 'liquidos',
    campos: ['concentracao', 'por_volume'],
    unidadeAdministracao: 'mL',
  },
  suspensao: {
    rotulo: 'Suspensão',
    grupo: 'liquidos',
    campos: ['concentracao', 'por_volume'],
    unidadeAdministracao: 'mL',
  },
  ampola: {
    rotulo: 'Ampola',
    grupo: 'parenterais',
    campos: ['concentracao', 'por_volume', 'volume_ampola'],
    unidadeAdministracao: 'mL ou ampolas',
  },
  sache: {
    rotulo: 'Sachê',
    grupo: 'solidos',
    campos: ['concentracao'],
    unidadeAdministracao: 'envelopes',
  },
  pomada: {
    rotulo: 'Pomada',
    grupo: 'outros',
    campos: ['concentracao_percentual', 'peso_tubo'],
    unidadeAdministracao: 'aplicações',
  },
  jato: {
    // Valor no banco é 'jato' (não 'spray') de propósito — pluraliza certo sozinho na
    // receita ("2 jatos"), termo que já é o usado na prática (salbutamol, ipratrópio).
    rotulo: 'Spray/jato',
    grupo: 'outros',
    campos: ['concentracao'],
    unidadeAdministracao: 'jatos',
  },
  frasco: {
    rotulo: 'Frasco',
    grupo: 'outros',
    campos: ['concentracao', 'por_volume'],
    unidadeAdministracao: 'mL',
    selecionavel: false,
  },
}

export const LABEL_GRUPO_FORMA: Record<GrupoForma, string> = {
  solidos: 'Sólidos',
  liquidos: 'Líquidos',
  parenterais: 'Parenterais',
  outros: 'Outros',
}

const ORDEM_GRUPOS: GrupoForma[] = ['solidos', 'liquidos', 'parenterais', 'outros']

/** Formas agrupadas na ordem fixa dos toggles (Sólidos · Líquidos · Parenterais · Outros),
 *  já filtrando as não selecionáveis — é o que o toggle de forma itera, sem saber nada de
 *  forma nenhuma em particular. */
export function formasAgrupadas(): { grupo: GrupoForma; label: string; formas: FormaFarmaceutica[] }[] {
  return ORDEM_GRUPOS.map((grupo) => ({
    grupo,
    label: LABEL_GRUPO_FORMA[grupo],
    formas: (Object.keys(FORMAS_CONFIG) as FormaFarmaceutica[]).filter(
      (f) => FORMAS_CONFIG[f].grupo === grupo && FORMAS_CONFIG[f].selecionavel !== false
    ),
  })).filter((g) => g.formas.length > 0)
}

/** Dados numéricos/texto que os campos de uma apresentação podem preencher — só os que
 *  fazem sentido pro formulário dinâmico (não inclui id/medicamento_id/ordem/forma). */
export interface DadosCamposForma {
  concentracao: number | null
  unidade: string | null
  por_volume: number | null
  por_volume_unidade: string | null
  gotas_por_ml: number | null
  volume_ampola: number | null
  concentracao_percentual: number | null
  peso_tubo: number | null
}

interface CampoMeta {
  /** Rótulo mostrado acima do(s) input(s) desse campo. */
  label: string
  hint?: string
  placeholder: string
  /** Segunda coluna (unidade), quando o campo tem uma — null pra campo de valor único. */
  unidade: { label: string; placeholder: string } | null
  /** Testa se o campo está preenchido o bastante pra validar (usado tanto pro widget
   *  quanto pra validação de salvar). */
  preenchido: (d: DadosCamposForma) => boolean
}

/** Um widget fixo por chave de campo — a única "regra por tipo" que existe no sistema.
 *  Formas não entram aqui: quem decide quais campos aparecem é `FORMAS_CONFIG[forma].campos`. */
export const CAMPO_META: Record<CampoForma, CampoMeta> = {
  concentracao: {
    label: 'Concentração',
    placeholder: '500',
    unidade: { label: 'Unidade', placeholder: 'mg' },
    preenchido: (d) => d.concentracao != null && !!d.unidade?.trim(),
  },
  por_volume: {
    label: 'Por volume',
    hint: 'Base da concentração — ex: 5 = "/5 mL"',
    placeholder: '5',
    unidade: { label: 'Unidade do volume', placeholder: 'mL' },
    preenchido: (d) => d.por_volume != null && !!d.por_volume_unidade?.trim(),
  },
  gotas_por_ml: {
    label: 'Gotas por mL',
    hint: 'Varia por produto — não estime, confira na bula.',
    placeholder: '20',
    unidade: null,
    preenchido: (d) => d.gotas_por_ml != null,
  },
  volume_ampola: {
    label: 'Volume da ampola (mL)',
    placeholder: '10',
    unidade: null,
    preenchido: (d) => d.volume_ampola != null,
  },
  concentracao_percentual: {
    label: 'Concentração (%)',
    placeholder: '1',
    unidade: null,
    preenchido: (d) => d.concentracao_percentual != null,
  },
  peso_tubo: {
    label: 'Peso do tubo (g)',
    placeholder: '30',
    unidade: null,
    preenchido: (d) => d.peso_tubo != null,
  },
}

/** Campos ainda não preenchidos, na ordem do descritor — vazio = formulário válido pra
 *  salvar. Guiado inteiramente por `FORMAS_CONFIG[forma].campos`, nunca por um switch. */
export function camposFaltando(forma: FormaFarmaceutica | string, dados: DadosCamposForma): CampoMeta[] {
  const config = FORMAS_CONFIG[forma as FormaFarmaceutica]
  if (!config) return []
  return config.campos.filter((c) => !CAMPO_META[c].preenchido(dados)).map((c) => CAMPO_META[c])
}

function formatarNumero(n: number): string {
  return Number.isInteger(n) ? String(n) : String(n).replace('.', ',')
}

/** Rótulo legível gerado a partir dos campos preenchidos — "Comprimido 500 mg",
 *  "Ampola 500 mg/mL, 10 mL". Nada digitado à parte; `descricao` continua disponível como
 *  sobrescrita manual pra casos fora do padrão (ver formatarApresentacao). */
export function gerarRotuloApresentacao(forma: FormaFarmaceutica | string, dados: DadosCamposForma): string {
  const config = FORMAS_CONFIG[forma as FormaFarmaceutica]
  const rotuloForma = config?.rotulo ?? (forma ? forma.charAt(0).toUpperCase() + forma.slice(1) : '')

  const partes: string[] = []
  if (rotuloForma) partes.push(rotuloForma)

  if (dados.concentracao != null && dados.unidade?.trim()) {
    let texto = `${formatarNumero(dados.concentracao)} ${dados.unidade.trim()}`
    if (dados.por_volume != null && dados.por_volume_unidade?.trim()) {
      const denominador =
        dados.por_volume === 1
          ? dados.por_volume_unidade.trim()
          : `${formatarNumero(dados.por_volume)} ${dados.por_volume_unidade.trim()}`
      texto += `/${denominador}`
    }
    partes.push(texto)
  }
  if (dados.concentracao_percentual != null) {
    partes.push(`${formatarNumero(dados.concentracao_percentual)}%`)
  }

  const extras: string[] = []
  if (dados.volume_ampola != null) extras.push(`${formatarNumero(dados.volume_ampola)} mL`)
  if (dados.peso_tubo != null) extras.push(`bisnaga de ${formatarNumero(dados.peso_tubo)} g`)

  let rotulo = partes.join(' ')
  if (extras.length) rotulo += (rotulo ? ', ' : '') + extras.join(', ')
  return rotulo
}
