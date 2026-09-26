// Marcos da linha do tempo de IG — lista de dados, não hardcoded no componente visual
// (LinhaDoTempoIG.tsx só itera essa lista), pra dar pra adicionar/editar/remover marco sem
// mexer no componente. Conteúdo FINAL e definitivo fornecido pelo usuário (2026-09-26).

export type CategoriaMarco = 'exames' | 'usg' | 'vacinas' | 'suplementos'

export const LABEL_CATEGORIA_MARCO: Record<CategoriaMarco, string> = {
  exames: 'Exames',
  usg: 'USG',
  vacinas: 'Vacinações',
  suplementos: 'Suplementações/Profilaxia',
}

/** Cor por categoria — tokens do tema editorial (var(--tint-*), já globais no app via
 *  .tema-editorial em App.tsx), mesmo par usado nas badges/tags do resto do Painel. */
export const CORES_CATEGORIA_MARCO: Record<CategoriaMarco, { cor: string; suave: string }> = {
  exames: { cor: 'var(--tint-blue-fg)', suave: 'var(--tint-blue-bg)' },
  usg: { cor: 'var(--tint-orange-fg)', suave: 'var(--tint-orange-bg)' },
  vacinas: { cor: 'var(--tint-green-fg)', suave: 'var(--tint-green-bg)' },
  suplementos: { cor: 'var(--tint-purple-fg)', suave: 'var(--tint-purple-bg)' },
}

export interface MarcoIG {
  chave: string
  titulo: string
  categoria: CategoriaMarco
  semanaInicio: number
  // null = marco pontual (uma semana só). `textoAberto` distingue "exatamente nessa
  // semana" de "a partir dessa semana, sem fim" (ex: dTpa, Sulfato ferroso) — muda só o
  // texto do rótulo, não a posição.
  semanaFim: number | null
  textoAberto?: boolean
  // Sem janela fixa (ex: 3º USG, Hepatite B, Vitamina D — dependem de indicação clínica,
  // não de semana) — não entra na régua posicionado, vira um chip à parte, sem semana.
  semFaixaFixa?: boolean
  // Vale a qualquer momento da gestação (ex: Influenza, COVID-19) — cobre a régua inteira
  // em vez de ficar preso a uma semana de início.
  sempreDisponivel?: boolean
  /** Corpo do card exibido no hover — 1 frase de contexto clínico, sem repetir o título. */
  descricao: string
}

export const MARCOS_IG: MarcoIG[] = [
  // ---- Exames ----
  {
    chave: 'exames_1t',
    titulo: 'Exames laboratoriais — 1º trimestre',
    categoria: 'exames',
    semanaInicio: 0,
    semanaFim: 12,
    descricao:
      'Hemograma, TS+Rh, Coombs indireto (se Rh−), eletroforese de hemoglobina, glicemia de jejum, EAS, urocultura com TSA, toxoplasmose, HIV, sífilis, hepatite B e C, HTLV 1 e 2, TSH, preventivo, vitamina D e clamídia/gonococo (conforme critérios).',
  },
  {
    chave: 'exames_2t',
    titulo: 'Exames laboratoriais — 2º trimestre',
    categoria: 'exames',
    semanaInicio: 24,
    semanaFim: 28,
    descricao: 'Hemograma, TOTG, Coombs indireto (se Rh−), toxoplasmose (se suscetível), EAS, urocultura, HIV e sífilis.',
  },
  {
    chave: 'exames_3t',
    titulo: 'Exames laboratoriais — 3º trimestre',
    categoria: 'exames',
    semanaInicio: 28,
    semanaFim: 36,
    descricao: 'Hemograma, glicemia de jejum, Coombs indireto (se Rh−), EAS, urocultura, sífilis, HIV, hepatite B e toxoplasmose (se suscetível).',
  },
  {
    chave: 'egb',
    titulo: 'Pesquisa de estreptococo (EGB)',
    categoria: 'exames',
    semanaInicio: 35,
    semanaFim: 37,
    descricao: 'Rastreamento universal — positivo indica profilaxia intraparto com penicilina G ou ampicilina.',
  },

  // ---- USG ----
  {
    chave: 'usg_1t',
    titulo: '1º USG (translucência nucal)',
    categoria: 'usg',
    semanaInicio: 11,
    semanaFim: 14,
    descricao: 'Datação da gestação e rastreio de cromossomopatias pela translucência nucal.',
  },
  {
    chave: 'usg_2t_obstetrico',
    titulo: '2º USG obstétrico',
    categoria: 'usg',
    semanaInicio: 20,
    semanaFim: 26,
    descricao: 'Avaliação obstétrica de rotina do 2º trimestre.',
  },
  {
    chave: 'usg_morfologico',
    titulo: 'USG morfológico',
    categoria: 'usg',
    semanaInicio: 20,
    semanaFim: 24,
    descricao: 'Avaliação completa da anatomia fetal — indicado conforme critérios.',
  },
  {
    chave: 'usg_3t',
    titulo: '3º USG',
    categoria: 'usg',
    semanaInicio: 36,
    semanaFim: null,
    semFaixaFixa: true,
    descricao: 'Sem janela fixa — solicitar apenas quando houver indicação clínica.',
  },

  // ---- Vacinações ----
  {
    chave: 'dtpa',
    titulo: 'dTpa',
    categoria: 'vacinas',
    semanaInicio: 20,
    semanaFim: null,
    textoAberto: true,
    descricao: 'A partir de 20 semanas, em cada gravidez — esquema completo (dT + dTpa) depende do histórico vacinal.',
  },
  {
    chave: 'vsr',
    titulo: 'VSR',
    categoria: 'vacinas',
    semanaInicio: 28,
    semanaFim: null,
    textoAberto: true,
    descricao: 'A partir de 28 semanas, pelo menos 14 dias antes do parto — repetir em cada gestação.',
  },
  {
    chave: 'influenza',
    titulo: 'Influenza',
    categoria: 'vacinas',
    semanaInicio: 0,
    semanaFim: 42,
    sempreDisponivel: true,
    descricao: 'Dose única, em qualquer momento da gestação, durante o período de campanha.',
  },
  {
    chave: 'covid',
    titulo: 'COVID-19',
    categoria: 'vacinas',
    semanaInicio: 0,
    semanaFim: 42,
    sempreDisponivel: true,
    descricao: 'Gestantes são grupo prioritário — em qualquer momento da gestação, conforme protocolo vigente.',
  },
  {
    chave: 'hepatite_b_vacina',
    titulo: 'Hepatite B (vacina)',
    categoria: 'vacinas',
    semanaInicio: 0,
    semanaFim: null,
    semFaixaFixa: true,
    descricao: '3 doses se não vacinada ou sem comprovação de imunidade; revacinação (1 dose) se Anti-HBs negativo.',
  },

  // ---- Suplementações / Profilaxia ----
  {
    chave: 'acido_folico',
    titulo: 'Ácido fólico',
    categoria: 'suplementos',
    semanaInicio: 0,
    semanaFim: 12,
    descricao: 'Prevenção de defeitos do tubo neural — 400 mcg/dia (4 a 5 mg/dia em alto risco). Desde o início até 12 semanas.',
  },
  {
    chave: 'aas',
    titulo: 'AAS 100mg — profilaxia pré-eclâmpsia',
    categoria: 'suplementos',
    semanaInicio: 12,
    semanaFim: 20,
    descricao: 'Alto risco para pré-eclâmpsia — janela ótima 12–16 semanas, limite até 20 semanas pra iniciar, interromper com 36 semanas.',
  },
  {
    chave: 'sulfato_ferroso',
    titulo: 'Sulfato ferroso',
    categoria: 'suplementos',
    semanaInicio: 20,
    semanaFim: null,
    textoAberto: true,
    descricao: 'A partir de 20 semanas — manter até 3 meses pós-parto (além do fim desta régua, que vai só até 42 semanas).',
  },
  {
    chave: 'vitamina_d_suplemento',
    titulo: 'Vitamina D',
    categoria: 'suplementos',
    semanaInicio: 0,
    semanaFim: null,
    semFaixaFixa: true,
    descricao: 'Suplementar apenas com deficiência comprovada por exame — sem esquema universal.',
  },
]

export const SEMANA_MAX_LINHA_DO_TEMPO = 42

export function rotuloSemanasMarco(m: MarcoIG): string {
  if (m.semFaixaFixa) return 'sob indicação clínica'
  if (m.sempreDisponivel) return 'qualquer momento da gestação'
  if (m.semanaFim == null) return m.textoAberto ? `a partir de ${m.semanaInicio}s` : `${m.semanaInicio}s`
  return `${m.semanaInicio}–${m.semanaFim}s`
}

/** "Fim efetivo" pra cálculo de status/posição — marco pontual dura 0 semanas (fim =
 *  início), marco "em aberto" preenche até o fim da linha do tempo. */
export function semanaFimEfetiva(m: MarcoIG): number {
  if (m.semanaFim != null) return m.semanaFim
  return m.textoAberto || m.sempreDisponivel ? SEMANA_MAX_LINHA_DO_TEMPO : m.semanaInicio
}

export type StatusMarco = 'passado' | 'atual' | 'futuro'

export function statusDoMarco(m: MarcoIG, igSemanas: number): { rotulo: string; status: StatusMarco } {
  if (m.semFaixaFixa) return { rotulo: 'Sob indicação clínica', status: 'atual' }
  if (m.sempreDisponivel) return { rotulo: 'Disponível agora', status: 'atual' }
  const fim = semanaFimEfetiva(m)
  if (igSemanas > fim) return { rotulo: 'Período encerrado', status: 'passado' }
  if (igSemanas >= m.semanaInicio) return { rotulo: 'Período atual', status: 'atual' }
  const faltam = Math.ceil(m.semanaInicio - igSemanas)
  return { rotulo: faltam <= 1 ? 'Em 1 semana' : `Em ${faltam} semanas`, status: 'futuro' }
}
