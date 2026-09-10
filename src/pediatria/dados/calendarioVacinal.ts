// Calendário Nacional de Vacinação 2026 — Vacinas da Criança (0 a 9 anos, 11 meses e 29
// dias), transcrito do PDF oficial do Ministério da Saúde/SUS:
// https://www.gov.br/saude/pt-br/vacinacao/arquivos/calendario-nacional-de-vacinacao-crianca
// ⚠️ Referência pública, não paciente: isso é o calendário PADRÃO nacional, não substitui
// avaliação individual (atraso vacinal, imunocomprometidos, área de risco de febre
// amarela etc. têm regras próprias, ver `observacao` em cada dose). Conferir contra o
// calendário vigente do Ministério da Saúde periodicamente — datas de vacinação mudam.

export interface DoseVacina {
  idadeMeses: number
  rotulo: string
  observacao?: string
}

export interface Vacina {
  nome: string
  doencasEvitadas: string
  doses: DoseVacina[]
}

export const CALENDARIO_VACINAL: Vacina[] = [
  {
    nome: 'Hepatite B',
    doencasEvitadas: 'Hepatite B e hepatite D',
    doses: [{ idadeMeses: 0, rotulo: 'Dose única (ao nascer)' }],
  },
  {
    nome: 'BCG',
    doencasEvitadas: 'Formas graves de tuberculose; efeito protetor contra hanseníase',
    doses: [{ idadeMeses: 0, rotulo: 'Dose única (ao nascer)' }],
  },
  {
    nome: 'Penta (DTP + Hib + HB)',
    doencasEvitadas: 'Difteria, tétano, coqueluche, H. influenzae b e hepatite B',
    doses: [
      { idadeMeses: 2, rotulo: '1ª dose' },
      { idadeMeses: 4, rotulo: '2ª dose' },
      { idadeMeses: 6, rotulo: '3ª dose' },
    ],
  },
  {
    nome: 'Poliomielite inativada (VIP)',
    doencasEvitadas: 'Poliomielite (paralisia infantil)',
    doses: [
      { idadeMeses: 2, rotulo: '1ª dose' },
      { idadeMeses: 4, rotulo: '2ª dose' },
      { idadeMeses: 6, rotulo: '3ª dose' },
      { idadeMeses: 15, rotulo: '1º reforço' },
      { idadeMeses: 48, rotulo: '2º reforço' },
    ],
  },
  {
    nome: 'Rotavírus humano',
    doencasEvitadas: 'Doenças diarreicas agudas por rotavírus',
    doses: [
      {
        idadeMeses: 2,
        rotulo: '1ª dose',
        observacao: 'Janela: entre 1m15d e 11m29d — perde a oportunidade se passar do prazo.',
      },
      {
        idadeMeses: 4,
        rotulo: '2ª dose',
        observacao: 'Janela: entre 3m15d e 23m29d, com pelo menos 60 dias da 1ª dose.',
      },
    ],
  },
  {
    nome: 'Pneumocócica',
    doencasEvitadas: 'Doenças pneumocócicas invasivas',
    doses: [
      { idadeMeses: 2, rotulo: '1ª dose' },
      { idadeMeses: 4, rotulo: '2ª dose' },
      { idadeMeses: 12, rotulo: 'Reforço' },
      { idadeMeses: 60, rotulo: 'Dose extra', observacao: 'Só povos indígenas, sem histórico vacinal prévio.' },
    ],
  },
  {
    nome: 'Meningocócica C',
    doencasEvitadas: 'Doença meningocócica causada pelo sorogrupo C',
    doses: [
      { idadeMeses: 3, rotulo: '1ª dose' },
      { idadeMeses: 5, rotulo: '2ª dose' },
    ],
  },
  {
    nome: 'Meningocócica ACWY',
    doencasEvitadas: 'Doença meningocócica causada pelos sorogrupos A, C, W-135 e Y',
    doses: [{ idadeMeses: 12, rotulo: 'Dose única' }],
  },
  {
    nome: 'Influenza (gripe)',
    doencasEvitadas: 'Influenza (gripe)',
    doses: [
      {
        idadeMeses: 6,
        rotulo: '1ª dose',
        observacao: 'Anual até os 5 anos 11 meses — primeira vez: 2 doses com 30 dias de intervalo; depois, 1 dose/ano.',
      },
    ],
  },
  {
    nome: 'Covid-19',
    doencasEvitadas: 'Formas graves de covid-19 (SARS-CoV-2)',
    doses: [
      { idadeMeses: 6, rotulo: '1ª dose' },
      { idadeMeses: 7, rotulo: '2ª dose' },
      { idadeMeses: 9, rotulo: '3ª dose' },
    ],
  },
  {
    nome: 'Febre amarela',
    doencasEvitadas: 'Febre amarela',
    doses: [
      { idadeMeses: 9, rotulo: 'Dose única' },
      { idadeMeses: 48, rotulo: 'Reforço' },
    ],
  },
  {
    nome: 'Tríplice viral (SCR)',
    doencasEvitadas: 'Sarampo, caxumba, rubéola e síndrome da rubéola congênita',
    doses: [
      { idadeMeses: 12, rotulo: '1ª dose' },
      { idadeMeses: 15, rotulo: '2ª dose' },
    ],
  },
  {
    nome: 'DTP',
    doencasEvitadas: 'Difteria, tétano e coqueluche',
    doses: [
      { idadeMeses: 15, rotulo: '1º reforço' },
      { idadeMeses: 48, rotulo: '2º reforço' },
    ],
  },
  {
    nome: 'Varicela',
    doencasEvitadas: 'Varicela (catapora)',
    doses: [
      { idadeMeses: 15, rotulo: '1ª dose' },
      { idadeMeses: 48, rotulo: '2ª dose' },
    ],
  },
  {
    nome: 'Hepatite A',
    doencasEvitadas: 'Hepatite A',
    doses: [{ idadeMeses: 15, rotulo: 'Dose única' }],
  },
  {
    nome: 'HPV4',
    doencasEvitadas: 'Infecções pelo papilomavírus humano (HPV)',
    doses: [
      {
        idadeMeses: 108,
        rotulo: 'Dose única',
        observacao: 'Em caso de atraso, vacinar o quanto antes até 14 anos 11 meses.',
      },
    ],
  },
]
