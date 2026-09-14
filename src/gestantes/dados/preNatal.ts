// Exames e condutas de rotina do pré-natal, por trimestre — protocolo Ministério da
// Saúde (Caderneta da Gestante / Atenção ao pré-natal de baixo risco) + Febrasgo (Manual
// de Assistência Pré-natal), conteúdo revisado e detalhado pelo usuário. Cronograma de
// baixo risco — gestação de alto risco tem rotina própria, mais frequente, fora do
// escopo desta lista.

/** Fatores que merecem atenção em toda consulta, independente da semana — não são exame
 *  nem conduta pontual, é uma checagem contínua. */
export const AVALIAR_SEMPRE: string[] = [
  'Dentição (risco para trabalho de parto prematuro) — dente séptico',
  'Idade materna < 15 ou > 35 anos',
  'Ocupação com possível exposição química',
]

export interface FaixaPeriodicidade {
  semanaInicio: number
  semanaFim: number | null // null = "em diante"
  intervalo: string
}

export const PERIODICIDADE_CONSULTAS: FaixaPeriodicidade[] = [
  { semanaInicio: 0, semanaFim: 28, intervalo: 'Mensal' },
  { semanaInicio: 28, semanaFim: 36, intervalo: 'Quinzenal' },
  { semanaInicio: 36, semanaFim: null, intervalo: 'Semanal' },
]

/** Intervalo de consulta recomendado pra uma semana de IG — null se fora da faixa coberta. */
export function periodicidadeParaSemana(semanas: number): string | null {
  const faixa = PERIODICIDADE_CONSULTAS.find(
    (f) => semanas >= f.semanaInicio && (f.semanaFim == null || semanas < f.semanaFim)
  )
  return faixa?.intervalo ?? null
}

/** As 4 perguntas que não podem faltar em nenhuma consulta de pré-natal — fixas,
 *  independentes de trimestre ou exame. */
export const PERGUNTAS_ESSENCIAIS: { titulo: string; descricao: string }[] = [
  { titulo: 'Sangramento', descricao: 'Investigação de qualquer ocorrência, frequência e intensidade do sangramento.' },
  { titulo: 'Perda de líquido', descricao: 'Avaliação para determinar se há ruptura prematura das membranas.' },
  { titulo: 'Dor ou contrações', descricao: 'Frequência e intensidade das contrações ou qualquer tipo de dor abdominal.' },
  { titulo: 'Movimentação fetal', descricao: 'Checagem da atividade fetal, importante indicador da saúde do bebê.' },
]

/** Nota curta associada a um exame — ex: limiar diagnóstico. `alerta` destaca visualmente
 *  (mesmo tratamento das condutas com `alerta`). */
export interface NotaExame {
  texto: string
  alerta?: boolean
}

/** Sub-item de indicação mais estruturado que uma nota simples — usado no EGB, que tem 4
 *  critérios nomeados, alguns "indicação absoluta". */
export interface SubitemExame {
  titulo: string
  descricao: string
  absoluta?: boolean
}

export interface ExamePreNatal {
  nome: string
  periodicidade: string
  notas?: NotaExame[]
  subitens?: SubitemExame[]
}

export interface CondutaPreNatal {
  texto: string
  alerta?: boolean
}

export interface BlocoTrimestre {
  trimestre: 1 | 2 | 3
  semanaInicio: number
  semanaFim: number | null
  exames: ExamePreNatal[]
  condutas: CondutaPreNatal[]
}

export const PRE_NATAL: BlocoTrimestre[] = [
  {
    trimestre: 1,
    semanaInicio: 0,
    semanaFim: 13,
    exames: [
      { nome: 'Hemograma completo', periodicidade: '1ª consulta' },
      { nome: 'Tipagem sanguínea + Fator Rh + Coombs indireto', periodicidade: '1ª consulta' },
      {
        nome: 'Glicemia de jejum',
        periodicidade: '1ª consulta',
        notas: [
          { texto: 'GJ < 92 mg/dL → normal; repetir com TOTG entre 24–28 semanas' },
          { texto: 'GJ 92–125 mg/dL → DMG confirmado (mesmo sem TOTG)' },
          { texto: 'GJ ≥ 126 mg/dL → DM diagnosticado na gestação (DM prévio)', alerta: true },
        ],
      },
      { nome: 'EAS + Urocultura', periodicidade: '1ª consulta' },
      { nome: 'HIV (teste rápido ou sorologia)', periodicidade: '1ª consulta' },
      { nome: 'VDRL (sífilis)', periodicidade: '1ª consulta' },
      { nome: 'HBsAg + Anti-HBs (Hepatite B)', periodicidade: '1ª consulta' },
      { nome: 'Anti-HCV (Hepatite C)', periodicidade: 'Solicitar no 1º e no 3º trimestres' },
      {
        nome: 'Toxoplasmose IgG/IgM',
        periodicidade: '1ª consulta',
        notas: [
          { texto: 'Suscetível (IgG−/IgM−): repetir trimestralmente' },
          { texto: 'Infecção aguda: encaminhar para pré-natal de alto risco', alerta: true },
        ],
      },
      { nome: 'Colpocitologia oncótica', periodicidade: 'Se não realizada nos últimos 3 anos' },
      { nome: 'Eletroforese de hemoglobina', periodicidade: '1ª consulta — rastreamento de doença falciforme' },
      {
        nome: 'USG 1º trimestre',
        periodicidade: '11 semanas a 13 semanas e 6 dias',
        notas: [
          { texto: 'Datar a gestação com maior precisão' },
          { texto: 'Avaliar translucência nucal (rastreamento de aneuploidias)' },
        ],
      },
    ],
    condutas: [],
  },
  {
    trimestre: 2,
    semanaInicio: 14,
    semanaFim: 27,
    exames: [
      { nome: 'Hemograma', periodicidade: '24–28 semanas' },
      { nome: 'VDRL', periodicidade: '24–28 semanas' },
      { nome: 'EAS + Urocultura', periodicidade: '24–28 semanas' },
      {
        nome: 'TOTG 75g',
        periodicidade: '24–28 semanas — padrão-ouro para DMG',
        notas: [
          { texto: 'Indicado para todas as gestantes com GJ < 92 mg/dL no 1º trimestre' },
          { texto: 'Critérios IADPSG / SBD / Ministério da Saúde' },
          { texto: 'Diagnóstico de DMG: ≥ 1 valor alterado — jejum ≥ 92, 1h ≥ 180, 2h ≥ 153 mg/dL' },
          { texto: '2h ≥ 200 mg/dL = DM diagnosticado na gestação (não DMG)', alerta: true },
          { texto: 'Pós-bariátrica: não realizar TOTG — risco de hipoglicemia; usar glicemia de jejum seriada', alerta: true },
        ],
      },
      { nome: 'Toxoplasmose IgG/IgM', periodicidade: 'Se suscetível no 1º trimestre' },
      { nome: 'HIV', periodicidade: 'Repetir no 2º ou 3º trimestre, conforme protocolo local' },
      { nome: 'USG morfológico fetal', periodicidade: '20–24 semanas — avaliação completa da anatomia fetal' },
    ],
    condutas: [],
  },
  {
    trimestre: 3,
    semanaInicio: 28,
    semanaFim: null,
    exames: [
      { nome: 'Hemograma', periodicidade: '28–36 semanas' },
      { nome: 'VDRL', periodicidade: '28–36 semanas' },
      { nome: 'EAS + Urocultura', periodicidade: '28–36 semanas' },
      { nome: 'Glicemia de jejum', periodicidade: 'Se TOTG não realizado' },
      { nome: 'Toxoplasmose IgG/IgM', periodicidade: 'Se suscetível' },
      { nome: 'HIV', periodicidade: 'Repetir — obrigatório no 3º trimestre e na internação para o parto', notas: [{ texto: 'Obrigatório mesmo se já negativo antes', alerta: true }] },
      { nome: 'Anti-HCV (Hepatite C)', periodicidade: 'Solicitar no 1º e no 3º trimestres' },
      {
        nome: 'Streptococcus agalactiae (Estreptococo B)',
        periodicidade: 'Swab vaginal/retal entre 35–37 semanas',
        notas: [{ texto: 'Positivo: profilaxia intraparto com penicilina G ou ampicilina', alerta: true }],
        subitens: [
          {
            titulo: 'Cultura materna positiva para EGB',
            descricao: 'Swab vaginal/retal positivo entre 35–37 semanas, independente de outros fatores de risco.',
            absoluta: true,
          },
          {
            titulo: 'Bacteriúria por EGB em qualquer momento da gestação',
            descricao: 'Sintomática ou assintomática, mesmo que tratada adequadamente — indica alta colonização materna.',
            absoluta: true,
          },
          {
            titulo: 'Filho prévio com infecção neonatal por EGB',
            descricao: 'Sepse, pneumonia ou meningite por EGB em gestação anterior.',
            absoluta: true,
          },
          {
            titulo: 'Status de EGB desconhecido + fator de risco intraparto',
            descricao:
              'Profilaxia indicada se EGB desconhecido E pelo menos um dos critérios: febre intraparto ≥ 38ºC, ruptura de membranas ≥ 18h, ou trabalho de parto prematuro (< 37 semanas).',
          },
        ],
      },
      { nome: 'USG 3º trimestre', periodicidade: '32–34 semanas — crescimento fetal, volume de líquido amniótico, localização placentária' },
    ],
    condutas: [
      {
        texto: 'Orientar sinais de trabalho de parto (contrações regulares, perda de líquido/tampão) e redução da movimentação fetal — procurar atendimento imediato',
        alerta: true,
      },
      { texto: 'Discutir plano de parto e via de parto a partir de 36 semanas' },
    ],
  },
]
