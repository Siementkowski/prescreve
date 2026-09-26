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

/** Orientação de atividade física de rotina — não é exame nem conduta pontual, mesmo
 *  espírito de AVALIAR_SEMPRE/PERGUNTAS_ESSENCIAIS: informação de fundo, sempre válida. */
export const ATIVIDADE_FISICA: string[] = [
  'Intensidade moderada por 30 minutos, ou mais, diariamente.',
  'Evitar exercícios de risco para queda e acidentes no abdome.',
  'Não é o momento de iniciar novos exercícios aeróbios ou intensificar o treinamento.',
]

/** Nota curta associada a um exame — ex: limiar diagnóstico. `alerta` destaca visualmente
 *  (mesmo tratamento das condutas com `alerta`). */
export interface NotaExame {
  texto: string
  alerta?: boolean
}

/** Sub-item de indicação mais estruturado que uma nota simples — usado no EGB, que tem
 *  critérios nomeados, alguns "indicação absoluta". */
export interface SubitemExame {
  titulo: string
  descricao?: string
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

// LABS por trimestre — versão FINAL e definitiva fornecida pelo usuário (2026-09-26),
// substitui qualquer conteúdo anterior sobre exames laboratoriais de rotina do pré-natal.
// USG deixou de entrar aqui — agora é categoria própria só na linha do tempo de IG
// (dados/marcosIG.ts), não faz mais parte deste checklist de labs.
export const PRE_NATAL: BlocoTrimestre[] = [
  {
    trimestre: 1,
    semanaInicio: 0,
    semanaFim: 13,
    exames: [
      { nome: 'Hemograma', periodicidade: '1ª consulta' },
      { nome: 'Tipagem sanguínea + Fator Rh', periodicidade: '1ª consulta' },
      { nome: 'Coombs indireto', periodicidade: '1ª consulta — se Rh negativo' },
      { nome: 'Eletroforese de hemoglobina', periodicidade: '1ª consulta — rastreamento de doença falciforme' },
      {
        nome: 'Glicemia de jejum',
        periodicidade: '1ª consulta',
        notas: [
          { texto: 'GJ < 92 mg/dL → normal; repetir com TOTG entre 24–28 semanas' },
          { texto: 'GJ 92–125 mg/dL → DMG confirmado (mesmo sem TOTG)' },
          { texto: 'GJ ≥ 126 mg/dL → DM diagnosticado na gestação (DM prévio)', alerta: true },
        ],
      },
      { nome: 'EAS', periodicidade: '1ª consulta' },
      { nome: 'Urocultura com TSA (antibiograma)', periodicidade: '1ª consulta' },
      {
        nome: 'Toxoplasmose IgG/IgM',
        periodicidade: '1ª consulta',
        notas: [
          { texto: 'Suscetível (IgM−/IgG−): repetir durante toda a gestação (1º, 2º e 3º trimestres)' },
          { texto: 'Alta prevalência local: a cada 2 meses — protocolo HC-FMUSP: mensal' },
          { texto: 'Infecção aguda: encaminhar para pré-natal de alto risco', alerta: true },
        ],
      },
      { nome: 'HIV', periodicidade: '1ª consulta' },
      { nome: 'Sífilis', periodicidade: '1ª consulta' },
      { nome: 'Hepatite B e C (HBsAg + Anti-HCV)', periodicidade: '1ª consulta' },
      {
        nome: 'HTLV 1 e 2',
        periodicidade: '1ª consulta — triagem sorológica (ELISA/CLIA/ECLIA)',
        subitens: [
          { titulo: 'Não reagente', descricao: 'Encerra investigação — sem HTLV.' },
          { titulo: 'Reagente ou indeterminado', descricao: 'Segue para teste confirmatório sorológico (Western Blot/LIA).' },
          { titulo: 'Confirmatório reagente', descricao: 'HTLV confirmado.' },
          { titulo: 'Confirmatório indeterminado', descricao: 'Segue para teste molecular (carga proviral) — define detectado ou não detectado.' },
        ],
      },
      { nome: 'TSH', periodicidade: '1ª consulta' },
      { nome: 'Preventivo (citopatológico de colo uterino)', periodicidade: 'Se atrasado' },
      { nome: 'Vitamina D', periodicidade: '1ª consulta' },
      { nome: 'Clamídia / Gonococo', periodicidade: 'Conforme critérios clínicos' },
    ],
    condutas: [],
  },
  {
    trimestre: 2,
    semanaInicio: 14,
    semanaFim: 27,
    exames: [
      { nome: 'Hemograma', periodicidade: '24–28 semanas' },
      {
        nome: 'TOTG 75g',
        periodicidade: '24–28 semanas — padrão-ouro para DMG, só se a GJ do 1º tri foi normal (< 92 mg/dL)',
        notas: [
          { texto: 'Diagnóstico de DMG: 1 único valor alterado — jejum ≥ 92, 1h ≥ 180, 2h ≥ 153 mg/dL' },
          { texto: '2h ≥ 200 mg/dL = DM diagnosticado na gestação (não DMG)', alerta: true },
          { texto: 'Gestante bariátrica: não realizar TOTG (risco de hipoglicemia) — usar glicemia de jejum seriada', alerta: true },
        ],
      },
      { nome: 'Coombs indireto', periodicidade: 'Se Rh negativo' },
      {
        nome: 'Toxoplasmose IgG/IgM',
        periodicidade: 'Se suscetível',
        notas: [{ texto: 'Repetir durante toda a gestação — a cada 2 meses (alta prevalência local) ou mensal (protocolo HC-FMUSP)' }],
      },
      { nome: 'EAS', periodicidade: '24–28 semanas' },
      { nome: 'Urocultura', periodicidade: '24–28 semanas' },
      { nome: 'HIV', periodicidade: '24–28 semanas' },
      { nome: 'Sífilis', periodicidade: '24–28 semanas' },
    ],
    condutas: [],
  },
  {
    trimestre: 3,
    semanaInicio: 28,
    semanaFim: null,
    exames: [
      { nome: 'Hemograma', periodicidade: '28–36 semanas' },
      { nome: 'Glicemia de jejum', periodicidade: 'Se TOTG não foi realizado' },
      { nome: 'Coombs indireto', periodicidade: 'Se Rh negativo' },
      { nome: 'EAS', periodicidade: 'Após 28 semanas' },
      { nome: 'Urocultura', periodicidade: 'Após 28 semanas' },
      { nome: 'Sífilis', periodicidade: 'Após 28 semanas' },
      {
        nome: 'HIV',
        periodicidade: 'Obrigatório no 3º trimestre e na internação para o parto',
        notas: [{ texto: 'Obrigatório mesmo se já negativo antes', alerta: true }],
      },
      { nome: 'Hepatite B', periodicidade: 'Após 28 semanas' },
      {
        nome: 'Toxoplasmose IgG/IgM',
        periodicidade: 'Se suscetível',
        notas: [{ texto: 'Repetir durante toda a gestação — a cada 2 meses (alta prevalência local) ou mensal (protocolo HC-FMUSP)' }],
      },
      {
        nome: 'Pesquisa de estreptococo (EGB) — Streptococcus agalactiae',
        periodicidade: 'Swab vaginal/retal entre 35–37 semanas — rastreamento universal',
        notas: [{ texto: 'Positivo: profilaxia intraparto com penicilina G ou ampicilina', alerta: true }],
        subitens: [
          {
            titulo: 'Bacteriúria por EGB em qualquer momento da gestação',
            descricao: 'Sintomática ou assintomática, mesmo que tratada adequadamente — indicação absoluta de profilaxia, mesmo sem cultura 35–37s positiva.',
            absoluta: true,
          },
          {
            titulo: 'Filho prévio com infecção neonatal por EGB',
            descricao: 'Sepse, pneumonia ou meningite por EGB em gestação anterior — indicação absoluta de profilaxia, mesmo sem cultura 35–37s positiva.',
            absoluta: true,
          },
          {
            titulo: 'Status de EGB desconhecido + fator de risco intraparto',
            descricao:
              'Profilaxia indicada se EGB desconhecido E pelo menos um dos critérios: febre intraparto ≥ 38ºC, ruptura de membranas ≥ 18h, ou trabalho de parto prematuro (< 37 semanas).',
          },
        ],
      },
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

/** Painel de exames pra uma consulta — usado no Guia de Consulta (checklist "o que fazer
 *  nessa consulta"). Consulta de retorno: só os exames do trimestre atual, de rotina.
 *  Primeira consulta: sempre inclui o painel inicial completo (bloco do 1º trimestre,
 *  onde vive a bateria "1ª consulta" — antenatal, sorologias etc.), mesmo se a gestante
 *  já estiver num trimestre mais avançado (início tardio de pré-natal); some ao painel os
 *  exames do trimestre atual que ainda não apareceram, sem duplicar por nome. */
export function examesDaConsulta(trimestreAtual: BlocoTrimestre['trimestre'], primeiraConsulta: boolean): ExamePreNatal[] {
  const blocoAtual = PRE_NATAL.find((b) => b.trimestre === trimestreAtual) ?? PRE_NATAL[0]
  if (!primeiraConsulta) return blocoAtual.exames

  const blocoInicial = PRE_NATAL[0]
  if (trimestreAtual === 1) return blocoInicial.exames

  const jaIncluidos = new Set(blocoInicial.exames.map((e) => e.nome))
  const extras = blocoAtual.exames.filter((e) => !jaIncluidos.has(e.nome))
  return [...blocoInicial.exames, ...extras]
}

/** Agenda dos USG — categoria própria, fora do checklist de labs (PRE_NATAL) — com faixa
 *  de semana numérica pra dar pra calcular "qual é o próximo USG dela" no Guia de
 *  Consulta. O 3º USG não entra aqui: não tem janela fixa (só sob indicação clínica). */
export interface JanelaImagem {
  nome: string
  semanaInicio: number
  semanaFim: number
}

export const AGENDA_IMAGEM: JanelaImagem[] = [
  { nome: '1º USG (translucência nucal)', semanaInicio: 11, semanaFim: 14 },
  { nome: '2º USG obstétrico', semanaInicio: 20, semanaFim: 26 },
  { nome: 'USG morfológico', semanaInicio: 20, semanaFim: 24 },
]

/** Próximo exame de imagem ainda não vencido pra semana atual — se já passou de todos,
 *  devolve o último (obstétrica de 3º trimestre), que é o que ainda cabe pedir de novo
 *  perto do parto. */
export function proximoExameImagem(semanas: number): JanelaImagem {
  return AGENDA_IMAGEM.find((j) => semanas < j.semanaFim) ?? AGENDA_IMAGEM[AGENDA_IMAGEM.length - 1]
}
