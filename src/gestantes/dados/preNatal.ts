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

/** Sub-item de indicação mais estruturado que uma nota simples — usado no EGB e no
 *  Ecocardiograma fetal, que têm critérios nomeados, alguns "indicação absoluta". */
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

export const PRE_NATAL: BlocoTrimestre[] = [
  {
    trimestre: 1,
    semanaInicio: 0,
    semanaFim: 13,
    exames: [
      { nome: 'Hemograma completo', periodicidade: '1ª consulta' },
      { nome: 'Tipagem sanguínea + Fator Rh + Coombs indireto', periodicidade: '1ª consulta (Coombs se Rh negativo)' },
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
          { texto: 'Suscetível (IgG−/IgM−): repetir no máximo a cada 2 meses' },
          { texto: 'Infecção aguda: encaminhar para pré-natal de alto risco', alerta: true },
        ],
      },
      {
        nome: 'HTLV',
        periodicidade: '1ª consulta — triagem sorológica (ELISA/CLIA/ECLIA)',
        subitens: [
          { titulo: 'Não reagente', descricao: 'Encerra investigação — sem HTLV.' },
          { titulo: 'Reagente ou indeterminado', descricao: 'Segue para teste confirmatório sorológico (Western Blot/LIA).' },
          { titulo: 'Confirmatório reagente', descricao: 'HTLV confirmado.' },
          { titulo: 'Confirmatório indeterminado', descricao: 'Segue para teste molecular (carga proviral) — define detectado ou não detectado.' },
        ],
      },
      { nome: 'Ferritina', periodicidade: '1ª consulta (Febrasgo)' },
      { nome: 'TSH', periodicidade: '1ª consulta (Febrasgo)' },
      { nome: 'Colpocitologia oncótica (Papanicolau)', periodicidade: 'Se não realizada nos últimos 3 anos' },
      { nome: 'Exame de secreção vaginal', periodicidade: 'Se houver indicação clínica' },
      { nome: 'Protoparasitológico de fezes', periodicidade: 'Se houver indicação clínica' },
      { nome: 'Swab clamídia e gonococo', periodicidade: 'Quando necessário (Febrasgo)' },
      { nome: 'Eletroforese de hemoglobina', periodicidade: '1ª consulta — rastreamento de doença falciforme' },
      {
        nome: 'USG obstétrica inicial',
        periodicidade: '6 a 9 semanas',
        notas: [{ texto: 'Diagnóstico/evolutiva, datação, tópica x ectópica, única x múltipla, corionicidade' }],
      },
      {
        nome: 'USG morfológica de 1º trimestre',
        periodicidade: '11 a 14 semanas',
        notas: [
          { texto: 'Rastreio (risco) de cromossomopatias' },
          { texto: 'Medida de translucência nucal' },
          { texto: 'Fluxo no ducto venoso' },
          { texto: 'Identificação do ossículo nasal' },
          { texto: 'Lei 14.598/2023: garante pelo menos 2 USG transvaginais no 1º quadrimestre de gestação, pelo SUS.' },
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
      { nome: 'Coombs indireto', periodicidade: 'Mensal, se Rh negativo' },
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
      { nome: 'Toxoplasmose IgG/IgM', periodicidade: 'Se suscetível — no máximo a cada 2 meses' },
      { nome: 'HIV', periodicidade: 'Repetir no 2º ou 3º trimestre, conforme protocolo local' },
      { nome: 'USG morfológica de 2º trimestre', periodicidade: '18 a 24 semanas', notas: [{ texto: 'Toda a morfologia do feto, medida do comprimento do colo uterino (normal ≥ 2,5cm), avaliação da placenta' }] },
      {
        nome: 'Ecocardiograma fetal',
        periodicidade: '22 a 28 semanas — Lei 14.598/2023 inclui na rotina do pré-natal',
        subitens: [
          { titulo: 'Idade materna avançada' },
          { titulo: 'Diabetes mellitus pré-gestacional' },
          { titulo: 'Antecedente de outro filho com cardiopatia congênita' },
          { titulo: 'Cardiopatia congênita materna' },
          { titulo: 'Doenças reumatológicas com anti-Ro/anti-La positivos' },
          { titulo: 'Ultrassom morfológico alterado' },
          { titulo: 'Cariótipo alterado' },
          { titulo: 'Gestação de FIV' },
          { titulo: 'Uso de medicações: carbamazepina, lítio, iECA, varfarina' },
        ],
      },
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
      { nome: 'Coombs indireto', periodicidade: 'Mensal, se Rh negativo' },
      { nome: 'Glicemia de jejum', periodicidade: 'Se TOTG não realizado' },
      { nome: 'Toxoplasmose IgG/IgM', periodicidade: 'Se suscetível — no máximo a cada 2 meses' },
      { nome: 'HIV', periodicidade: 'Repetir — obrigatório no 3º trimestre e na internação para o parto', notas: [{ texto: 'Obrigatório mesmo se já negativo antes', alerta: true }] },
      { nome: 'Anti-HCV (Hepatite C)', periodicidade: 'Solicitar no 1º e no 3º trimestres' },
      { nome: 'Bacterioscopia de secreção vaginal', periodicidade: 'A partir de 37 semanas de gestação' },
      {
        nome: 'Streptococcus agalactiae (Estreptococo B)',
        periodicidade: 'Swab vaginal/retal entre 35–37 semanas — rastreamento universal',
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
      {
        nome: 'USG obstétrica de 3º trimestre',
        periodicidade: '34 a 36 semanas',
        notas: [{ texto: 'Apresentação fetal, avaliação de vitalidade fetal (Dopplervelocimetria e ILA), peso fetal estimado' }],
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

/** Agenda dos exames de imagem — mesmos nomes usados em PRE_NATAL, mas com faixa de
 *  semana numérica (lá é texto livre) pra dar pra calcular "qual é o próximo exame de
 *  imagem dela" no Guia de Consulta. */
export interface JanelaImagem {
  nome: string
  semanaInicio: number
  semanaFim: number
}

export const AGENDA_IMAGEM: JanelaImagem[] = [
  { nome: 'USG obstétrica inicial', semanaInicio: 6, semanaFim: 9 },
  { nome: 'USG morfológica de 1º trimestre', semanaInicio: 11, semanaFim: 14 },
  { nome: 'USG morfológica de 2º trimestre', semanaInicio: 18, semanaFim: 24 },
  { nome: 'Ecocardiograma fetal', semanaInicio: 22, semanaFim: 28 },
  { nome: 'USG obstétrica de 3º trimestre', semanaInicio: 34, semanaFim: 36 },
]

/** Próximo exame de imagem ainda não vencido pra semana atual — se já passou de todos,
 *  devolve o último (obstétrica de 3º trimestre), que é o que ainda cabe pedir de novo
 *  perto do parto. */
export function proximoExameImagem(semanas: number): JanelaImagem {
  return AGENDA_IMAGEM.find((j) => semanas < j.semanaFim) ?? AGENDA_IMAGEM[AGENDA_IMAGEM.length - 1]
}
