// Marcos da linha do tempo de IG — lista de dados, não hardcoded no componente visual
// (LinhaDoTempoIG.tsx só itera essa lista), pra dar pra adicionar/editar/remover marco sem
// mexer no componente.

export type CategoriaMarco = 'exames' | 'vacinas' | 'suplementos'

export const LABEL_CATEGORIA_MARCO: Record<CategoriaMarco, string> = {
  exames: 'Exames',
  vacinas: 'Vacinações',
  suplementos: 'Suplementações/Profilaxia',
}

/** Cor por categoria — tokens do tema editorial (var(--tint-*), já globais no app via
 *  .tema-editorial em App.tsx), mesmo par usado nas badges/tags do resto do Painel. */
export const CORES_CATEGORIA_MARCO: Record<CategoriaMarco, { cor: string; suave: string }> = {
  exames: { cor: 'var(--tint-blue-fg)', suave: 'var(--tint-blue-bg)' },
  vacinas: { cor: 'var(--tint-green-fg)', suave: 'var(--tint-green-bg)' },
  suplementos: { cor: 'var(--tint-purple-fg)', suave: 'var(--tint-purple-bg)' },
}

export interface MarcoIG {
  chave: string
  titulo: string
  categoria: CategoriaMarco
  semanaInicio: number
  // null = marco pontual (uma semana só). `textoAberto` distingue "exatamente nessa
  // semana" (ex: Imunoglobulina anti-D, 28s) de "a partir dessa semana, sem fim" (ex:
  // dTpa, VSR) — muda só o texto do rótulo, não a posição.
  semanaFim: number | null
  textoAberto?: boolean
  /** Corpo do card exibido no hover — 1 frase de contexto clínico, sem repetir o título. */
  descricao: string
}

export const MARCOS_IG: MarcoIG[] = [
  {
    chave: 'exames_1t',
    titulo: 'Exames laboratoriais — 1º trimestre',
    categoria: 'exames',
    semanaInicio: 0,
    semanaFim: 12,
    descricao:
      'Hemograma, tipagem + Rh + Coombs indireto, glicemia de jejum, sífilis, HIV, toxoplasmose, HBsAg, Anti-HCV, EAS, urocultura, TSH, eletroforese de hemoglobina, HTLV e USG 1º tri.',
  },
  {
    chave: 'acido_folico',
    titulo: 'Ácido fólico',
    categoria: 'suplementos',
    semanaInicio: 0,
    semanaFim: 12,
    descricao: 'Prevenção de defeitos do tubo neural — 400 mcg/dia (4 a 5 mg/dia em alto risco). Idealmente desde o período pré-concepcional.',
  },
  {
    chave: 'aas',
    titulo: 'AAS — profilaxia pré-eclâmpsia',
    categoria: 'suplementos',
    semanaInicio: 12,
    semanaFim: 16,
    descricao: '100 mg/dia em gestantes de alto risco para pré-eclâmpsia (HAS crônica, DM, gestação múltipla, história de PE) — manter até 36 semanas.',
  },
  {
    chave: 'usg_morfologico_2t',
    titulo: 'USG morfológico 2º tri',
    categoria: 'exames',
    semanaInicio: 20,
    semanaFim: 24,
    descricao: 'Avaliação completa da anatomia fetal, medida do colo uterino e da placenta.',
  },
  {
    chave: 'dtpa',
    titulo: 'dTpa',
    categoria: 'vacinas',
    semanaInicio: 20,
    semanaFim: null,
    textoAberto: true,
    descricao: 'Uma dose a partir de 20 semanas — esquema completo (dT + dTpa) depende do histórico vacinal.',
  },
  {
    chave: 'totg',
    titulo: 'TOTG 75g',
    categoria: 'exames',
    semanaInicio: 24,
    semanaFim: 28,
    descricao: 'Teste oral de tolerância à glicose — padrão-ouro para DMG, só se a glicemia de jejum do 1º tri foi normal (< 92 mg/dL).',
  },
  {
    chave: 'coombs_indireto',
    titulo: 'Coombs indireto mensal (se Rh−)',
    categoria: 'exames',
    semanaInicio: 28,
    semanaFim: null,
    descricao: 'Repetir mensalmente em gestantes Rh negativo com risco de aloimunização.',
  },
  {
    chave: 'anti_d',
    titulo: 'Imunoglobulina anti-D (se Rh−)',
    categoria: 'suplementos',
    semanaInicio: 28,
    semanaFim: null,
    descricao: 'Gestantes Rh negativo não sensibilizadas, com parceiro Rh positivo ou desconhecido.',
  },
  {
    chave: 'vsr',
    titulo: 'VSR',
    categoria: 'vacinas',
    semanaInicio: 28,
    semanaFim: null,
    textoAberto: true,
    descricao: 'Uma dose a partir de 28 semanas, pelo menos 14 dias antes do parto — repetir em cada gestação.',
  },
  {
    chave: 'egb',
    titulo: 'EGB (swab anal/vaginal)',
    categoria: 'exames',
    semanaInicio: 35,
    semanaFim: 37,
    descricao: 'Rastreamento universal — positivo indica profilaxia intraparto com penicilina G ou ampicilina.',
  },
]

export const SEMANA_MAX_LINHA_DO_TEMPO = 42

export function rotuloSemanasMarco(m: MarcoIG): string {
  if (m.semanaFim == null) return m.textoAberto ? `a partir de ${m.semanaInicio}s` : `${m.semanaInicio}s`
  return `${m.semanaInicio}–${m.semanaFim}s`
}

/** "Fim efetivo" pra cálculo de status/posição — marco pontual dura 0 semanas (fim =
 *  início), marco "em aberto" preenche até o fim da linha do tempo. */
export function semanaFimEfetiva(m: MarcoIG): number {
  if (m.semanaFim != null) return m.semanaFim
  return m.textoAberto ? SEMANA_MAX_LINHA_DO_TEMPO : m.semanaInicio
}

export type StatusMarco = 'passado' | 'atual' | 'futuro'

export function statusDoMarco(m: MarcoIG, igSemanas: number): { rotulo: string; status: StatusMarco } {
  const fim = semanaFimEfetiva(m)
  if (igSemanas > fim) return { rotulo: 'Período encerrado', status: 'passado' }
  if (igSemanas >= m.semanaInicio) return { rotulo: 'Período atual', status: 'atual' }
  const faltam = Math.ceil(m.semanaInicio - igSemanas)
  return { rotulo: faltam <= 1 ? 'Em 1 semana' : `Em ${faltam} semanas`, status: 'futuro' }
}
