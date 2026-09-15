// Suplementação de rotina no pré-natal — Ácido Fólico, Ferro, Cálcio, AAS e Vitaminas
// B12/D, conteúdo fornecido pelo usuário (Ministério da Saúde / Febrasgo).

export type StatusSuplementoGestante = 'aguardar' | 'iniciar' | 'concluido' | 'nao_aplicavel'

export interface ContextoSuplementacaoGestante {
  semanasIG: number | null
  /** Antecedente pessoal/familiar de defeito do tubo neural, epilepsia, uso de
   *  anticonvulsivantes, diabetes, obesidade, polimorfismos genéticos, doença
   *  inflamatória intestinal ou cirurgia bariátrica — eleva a dose de ácido fólico de
   *  400 mcg/dia pra 4-5 mg/dia. */
  riscoFolatoAlto: boolean
  /** Anemia confirmada (Hb < 11) — eleva a dose de ferro elementar. */
  anemiaConfirmada: boolean
  /** HAS crônica, DM, gestação múltipla, história de pré-eclâmpsia, entre outras — indica AAS. */
  riscoPreEclampsia: boolean
  /** Dieta vegana estrita ou hipovitaminose já identificada — indica B12/D. */
  dietaRestritivaOuHipovitaminose: boolean
}

export interface RecomendacaoSuplementoGestante {
  nome: string
  status: StatusSuplementoGestante
  rotuloStatus: string
  dose: string
  janela: string
  indicacao: string
  observacao?: string
}

export function calcularAcidoFolico(ctx: ContextoSuplementacaoGestante): RecomendacaoSuplementoGestante {
  const { semanasIG, riscoFolatoAlto } = ctx
  const dose = riscoFolatoAlto ? '4 a 5 mg/dia' : '400 mcg/dia'
  const indicacao =
    'Todas as gestantes (profilaxia universal, evita defeitos de fechamento do tubo neural) — 4 a 5 mg/dia em: antecedente pessoal/familiar de defeito do tubo neural, uso de anticonvulsivantes, diabetes, obesidade, polimorfismos genéticos, doença inflamatória intestinal ou cirurgia bariátrica'
  const janela = 'Mínimo 30 dias antes da concepção até o final do 1º trimestre'

  if (semanasIG == null) {
    return { nome: 'Ácido Fólico', status: 'iniciar', rotuloStatus: 'Rotina', dose, janela, indicacao }
  }
  if (semanasIG <= 13) {
    return { nome: 'Ácido Fólico', status: 'iniciar', rotuloStatus: 'Em uso', dose, janela, indicacao }
  }
  return {
    nome: 'Ácido Fólico',
    status: 'concluido',
    rotuloStatus: 'Janela encerrada',
    dose: '—',
    janela: 'A janela de suplementação (até o final do 1º trimestre) já passou.',
    indicacao,
  }
}

export function calcularFerro(ctx: ContextoSuplementacaoGestante): RecomendacaoSuplementoGestante {
  const { semanasIG, anemiaConfirmada } = ctx
  const dose = anemiaConfirmada
    ? '120–240 mg/dia de ferro elementar (anemia confirmada, Hb < 11)'
    : '40 mg de ferro elementar/dia (~200 mg de sulfato ferroso)'
  const indicacao = 'Todas as gestantes, a partir da confirmação da gravidez'
  const janela = 'Após confirmação da gravidez até o final da gestação'

  if (semanasIG == null) {
    return { nome: 'Ferro (Sulfato Ferroso)', status: 'aguardar', rotuloStatus: 'Aguardar', dose, janela, indicacao }
  }
  return {
    nome: 'Ferro (Sulfato Ferroso)',
    status: 'iniciar',
    rotuloStatus: 'Em uso',
    dose,
    janela,
    indicacao,
    observacao: 'Tomar antes das refeições para melhor absorção.',
  }
}

export function calcularCalcio(ctx: ContextoSuplementacaoGestante): RecomendacaoSuplementoGestante {
  const { semanasIG } = ctx
  const dose = '1 g/dia de Carbonato de Cálcio'
  const indicacao = 'Todas as gestantes (Ministério da Saúde)'
  const observacao = 'Não ingerir junto com o ferro — respeitar intervalo de 2 horas entre eles.'

  if (semanasIG == null || semanasIG < 12) {
    return { nome: 'Cálcio (Carbonato de Cálcio)', status: 'aguardar', rotuloStatus: 'Aguardar', dose, janela: 'A partir da 12ª semana de gestação até o parto', indicacao, observacao }
  }
  return { nome: 'Cálcio (Carbonato de Cálcio)', status: 'iniciar', rotuloStatus: 'Em uso', dose, janela: 'Até o parto', indicacao, observacao }
}

export function calcularAAS(ctx: ContextoSuplementacaoGestante): RecomendacaoSuplementoGestante {
  const { semanasIG, riscoPreEclampsia } = ctx
  const indicacao = 'Gestantes com alto risco para pré-eclâmpsia: HAS crônica, DM, gestação múltipla, história de pré-eclâmpsia, entre outras'

  if (!riscoPreEclampsia) {
    return {
      nome: 'AAS (Ácido Acetilsalicílico)',
      status: 'nao_aplicavel',
      rotuloStatus: 'Não indicado',
      dose: '100 mg/dia, se indicado',
      janela: 'Início entre 12 e 16 semanas, suspender aos 36 semanas',
      indicacao,
      observacao: 'Só indicado em gestantes de alto risco para pré-eclâmpsia — marque o fator de risco acima se for o caso.',
    }
  }
  if (semanasIG == null || semanasIG < 12) {
    return {
      nome: 'AAS (Ácido Acetilsalicílico)',
      status: 'aguardar',
      rotuloStatus: 'Aguardar',
      dose: '100 mg/dia',
      janela: 'Início entre 12 e 16 semanas',
      indicacao,
    }
  }
  if (semanasIG < 36) {
    return {
      nome: 'AAS (Ácido Acetilsalicílico)',
      status: 'iniciar',
      rotuloStatus: semanasIG <= 16 ? 'Janela ideal de início' : 'Em uso',
      dose: '100 mg/dia',
      janela: 'Manter até 36 semanas',
      indicacao,
      observacao: 'Reduz o risco de pré-eclâmpsia precoce e de restrição de crescimento fetal (RCF).',
    }
  }
  return {
    nome: 'AAS (Ácido Acetilsalicílico)',
    status: 'concluido',
    rotuloStatus: 'Suspender',
    dose: '—',
    janela: 'Suspender aos 36 semanas — se ainda em uso, suspender agora.',
    indicacao,
  }
}

export function calcularB12D(ctx: ContextoSuplementacaoGestante): RecomendacaoSuplementoGestante {
  const { dietaRestritivaOuHipovitaminose } = ctx
  const indicacao = 'Gestantes veganas ou com hipovitaminoses identificadas'

  if (!dietaRestritivaOuHipovitaminose) {
    return {
      nome: 'Vitaminas B12 e D',
      status: 'nao_aplicavel',
      rotuloStatus: 'Não indicado',
      dose: 'Conforme orientação nutricional individual',
      janela: 'Durante toda a gestação, se indicado',
      indicacao,
      observacao: 'Marque o fator de risco acima (dieta vegana estrita ou hipovitaminose) se for o caso.',
    }
  }
  return {
    nome: 'Vitaminas B12 e D',
    status: 'iniciar',
    rotuloStatus: 'Em uso',
    dose: 'Conforme orientação nutricional individual',
    janela: 'Durante toda a gestação',
    indicacao,
    observacao: 'Objetivo: prevenir deficiências associadas a dietas restritivas.',
  }
}
