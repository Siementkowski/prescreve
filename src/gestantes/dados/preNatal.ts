// Exames e condutas de rotina do pré-natal, por trimestre — compilado de protocolo
// Ministério da Saúde (Caderneta da Gestante / Atenção ao pré-natal de baixo risco) e
// Febrasgo (Manual de Assistência Pré-natal). Cronograma de baixo risco — gestação de
// alto risco tem rotina própria, mais frequente, fora do escopo desta lista.

export interface ExamePreNatal {
  nome: string
  periodicidade: string
}

export interface CondutaPreNatal {
  texto: string
  alerta?: boolean // true = orientação crítica, destacada na tela (ex: sinais de alarme)
}

export interface BlocoTrimestre {
  trimestre: 1 | 2 | 3
  semanaInicio: number
  semanaFim: number | null // null = "em diante", sem teto
  exames: ExamePreNatal[]
  condutas: CondutaPreNatal[]
}

export const PRE_NATAL: BlocoTrimestre[] = [
  {
    trimestre: 1,
    semanaInicio: 0,
    semanaFim: 13,
    exames: [
      { nome: 'Tipagem sanguínea + fator Rh', periodicidade: '1ª consulta' },
      { nome: 'Hemograma completo', periodicidade: '1ª consulta' },
      { nome: 'Glicemia de jejum', periodicidade: '1ª consulta' },
      { nome: 'VDRL (sífilis)', periodicidade: '1ª consulta' },
      { nome: 'Anti-HIV', periodicidade: '1ª consulta' },
      { nome: 'HBsAg (hepatite B)', periodicidade: '1ª consulta' },
      { nome: 'Toxoplasmose IgG/IgM', periodicidade: '1ª consulta' },
      { nome: 'EAS + urocultura', periodicidade: '1ª consulta' },
      { nome: 'USG obstétrico (datação)', periodicidade: 'Idealmente entre 8-13 semanas' },
    ],
    condutas: [
      { texto: 'Iniciar ácido fólico 5mg/dia (idealmente já no período pré-concepcional, mantém até 12 semanas)' },
      { texto: 'Suplementação de ferro — iniciar a partir de 20 semanas se Hb normal, ou já agora se anemia confirmada' },
      { texto: 'Solicitar Coombs indireto se Rh negativo' },
    ],
  },
  {
    trimestre: 2,
    semanaInicio: 14,
    semanaFim: 27,
    exames: [
      { nome: 'USG morfológico do 2º trimestre', periodicidade: 'Entre 20 e 24 semanas' },
      { nome: 'TOTG 75g (curva glicêmica)', periodicidade: 'Entre 24 e 28 semanas' },
      { nome: 'Coombs indireto (repetição, se Rh negativo)', periodicidade: 'Mensal a partir de 24 semanas' },
    ],
    condutas: [
      { texto: 'Consultas mensais até 28 semanas' },
      { texto: 'Vacina dTpa a partir de 20 semanas (reforço a cada gestação)' },
      { texto: 'Orientar sinais de movimentação fetal, a partir de ~18-20 semanas' },
    ],
  },
  {
    trimestre: 3,
    semanaInicio: 28,
    semanaFim: null,
    exames: [
      { nome: 'Hemograma completo (repetição)', periodicidade: '28ª semana' },
      { nome: 'VDRL e anti-HIV (repetição)', periodicidade: '28ª semana' },
      { nome: 'Cultura de estreptococo do grupo B (swab vaginal/retal)', periodicidade: 'Entre 35 e 37 semanas' },
    ],
    condutas: [
      { texto: 'Consultas quinzenais até 36 semanas, depois semanais até o parto' },
      {
        texto: 'Orientar sinais de trabalho de parto (contrações regulares, perda de líquido/tampão) e redução da movimentação fetal — procurar atendimento imediato',
        alerta: true,
      },
      { texto: 'Discutir plano de parto e via de parto a partir de 36 semanas' },
    ],
  },
]
