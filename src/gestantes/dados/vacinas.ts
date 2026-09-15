// Vacinação na gestação — Ministério da Saúde, conteúdo detalhado fornecido pelo usuário.

export interface VacinaIndicada {
  nome: string
  observacao?: string
  esquema?: string[]
}

export const VACINAS_INDICADAS: VacinaIndicada[] = [
  {
    nome: 'Hepatite B',
    observacao: 'Indicada para toda gestante que apresente sorologia negativa para Hepatite B (e que não tenha sido vacinada)',
    esquema: ['1ª dose na primeira consulta', '2ª dose 30 dias após', '3ª dose 6 meses após'],
  },
  {
    nome: 'Influenza (Gripe A / H1N1)',
    observacao: 'Vacinar toda gestante, em qualquer trimestre, durante o período sazonal da doença',
    esquema: ['Dose única'],
  },
  {
    nome: 'COVID-19',
    observacao: 'Gestantes e puérperas são grupos prioritários',
    esquema: ['Duas doses anuais da vacina monovalente XBB, com intervalo de 6 meses entre cada dose'],
  },
  {
    nome: 'Vírus Sincicial Respiratório (VSR)',
    observacao: 'Gestantes a partir de 18 anos de idade — repetir em cada gestação',
    esquema: [
      'Uma dose, intramuscular, a partir de 28 semanas de gestação (licenciada pela ANVISA de 24 a 36 semanas) — pelo menos 14 dias antes do parto',
      'Aplicada a qualquer momento, independente da sazonalidade',
    ],
  },
  {
    nome: 'dTpa (Tétano, Coqueluche e Difteria)',
    observacao: 'Indicada para todas as gestantes — o esquema depende do histórico vacinal (ver tabela abaixo)',
  },
]

export interface LinhaEsquemaTetano {
  historico: string
  conduta: string
}

/** Doses com componente tetânico: DTP, DT ou dT. */
export const ESQUEMA_TETANO: LinhaEsquemaTetano[] = [
  { historico: '3 doses prévias (DT, DT, DT)', conduta: 'dTpa às 20 semanas de gestação' },
  { historico: '2 doses prévias (DT, DT)', conduta: 'dTpa às 20 semanas de gestação' },
  { historico: '1 dose prévia (DT)', conduta: 'DT + dTpa, com intervalo de 30 a 60 dias entre elas' },
  { historico: 'Desconhecido', conduta: 'DT antes de 20 semanas → dTpa com 20 semanas → DT após 60 dias' },
]

/** Vacinas de vírus atenuado ou sem dados suficientes — contraindicadas na gestação. */
export const VACINAS_CONTRAINDICADAS: string[] = ['Sarampo, caxumba e rubéola', 'Varicela-Zóster', 'Dengue']

/** HPV não é vírus atenuado, mas também não é recomendada na gestação — regra própria,
 *  por isso fica separada das contraindicadas de vírus atenuado. */
export const VACINA_HPV_OBSERVACAO =
  'HPV: não recomendada — se o esquema vacinal já tiver sido iniciado, adiar sua continuação para o pós-parto.'

export const NOTA_VACINAS_CONTRAINDICADAS = 'Se tomar as vacinas que não são permitidas, aguardar pelo menos 30 dias para engravidar.'
