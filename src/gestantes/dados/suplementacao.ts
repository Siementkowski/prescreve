// Suplementação de rotina no pré-natal — Ácido Fólico, Ferro, Cálcio, AAS, Vitaminas B12/D
// e Iodo, conteúdo fornecido pelo usuário (Ministério da Saúde / Febrasgo).

export type StatusSuplementoGestante = 'aguardar' | 'iniciar' | 'concluido' | 'nao_aplicavel'

export interface ContextoSuplementacaoGestante {
  semanasIG: number | null
  /** Antecedente de filho com defeito de tubo neural, obesidade, uso de
   *  anticonvulsivantes, má absorção/doença celíaca, diabetes insulinodependente,
   *  alcoolismo, cirurgia bariátrica ou medicamentos que interferem no metabolismo do
   *  folato — eleva a dose de ácido fólico de 400 mcg/dia pra 4-5 mg/dia. */
  riscoFolatoAlto: boolean
  /** Anemia confirmada (Hb < 11) — eleva a dose de ferro elementar. */
  anemiaConfirmada: boolean
  /** HAS crônica, DM, gestação múltipla, história de pré-eclâmpsia, entre outras — indica AAS. */
  riscoPreEclampsia: boolean
  /** Dieta vegana estrita ou hipovitaminose já identificada — indica B12/D. */
  dietaRestritivaOuHipovitaminose: boolean
  /** Baixa ingesta de laticínios — indica suplementação de cálcio (600 mg/dia), sobretudo
   *  quando associada a risco de pré-eclâmpsia. */
  baixaIngestaLaticinios: boolean
  /** Deficiência de vitamina D comprovada por exame — só se suplementa nesse caso, não há
   *  esquema universal. */
  deficienciaVitaminaD: boolean
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
    'Todas as gestantes (profilaxia universal, evita defeitos de fechamento do tubo neural) — 4 a 5 mg/dia em: antecedente de filho com defeito de tubo neural, obesidade, uso de anticonvulsivantes, má absorção/doença celíaca, diabetes insulinodependente, alcoolismo, cirurgia bariátrica ou medicamentos que interferem no metabolismo do folato'
  const janela = '1 mês antes da concepção até a 12ª semana de gestação'

  if (semanasIG == null) {
    return { nome: 'Ácido Fólico', status: 'iniciar', rotuloStatus: 'Rotina', dose, janela, indicacao }
  }
  if (semanasIG <= 12) {
    return { nome: 'Ácido Fólico', status: 'iniciar', rotuloStatus: 'Em uso', dose, janela, indicacao }
  }
  return {
    nome: 'Ácido Fólico',
    status: 'concluido',
    rotuloStatus: 'Janela encerrada',
    dose: '—',
    janela: 'A janela de suplementação (até a 12ª semana) já passou.',
    indicacao,
  }
}

export function calcularFerro(ctx: ContextoSuplementacaoGestante): RecomendacaoSuplementoGestante {
  const { semanasIG, anemiaConfirmada } = ctx
  const dose = anemiaConfirmada
    ? '120–240 mg/dia de ferro elementar (anemia confirmada, Hb < 11)'
    : '40 mg de ferro elementar/dia (~200 mg de sulfato ferroso)'
  const indicacao = 'Todas as gestantes, a partir de 20 semanas'
  const janela = 'A partir de 20 semanas até 3 meses pós-parto'

  if (semanasIG == null) {
    return { nome: 'Ferro (Sulfato Ferroso)', status: 'aguardar', rotuloStatus: 'Aguardar', dose, janela, indicacao }
  }
  if (semanasIG < 20) {
    return {
      nome: 'Ferro (Sulfato Ferroso)',
      status: 'aguardar',
      rotuloStatus: 'Aguardar',
      dose,
      janela,
      indicacao,
      observacao: 'Janela começa em 20 semanas.',
    }
  }
  return {
    nome: 'Ferro (Sulfato Ferroso)',
    status: 'iniciar',
    rotuloStatus: 'Em uso',
    dose,
    janela,
    indicacao,
    observacao: 'Tomar antes das refeições para melhor absorção. Manter até 3 meses pós-parto.',
  }
}

export function calcularCalcio(ctx: ContextoSuplementacaoGestante): RecomendacaoSuplementoGestante {
  const { baixaIngestaLaticinios, riscoPreEclampsia } = ctx
  const dose = '600 mg/dia'
  const indicacao = 'Baixa ingesta de laticínios — sobretudo relevante se associada a risco de pré-eclâmpsia'
  const observacao = 'Não ingerir junto com o ferro — respeitar intervalo de 2 horas entre eles.'

  if (!baixaIngestaLaticinios) {
    return {
      nome: 'Cálcio',
      status: 'nao_aplicavel',
      rotuloStatus: 'Não indicado',
      dose,
      janela: 'Durante a gestação, se indicado',
      indicacao,
      observacao: 'Marque "baixa ingesta de laticínios" acima se for o caso.',
    }
  }
  return {
    nome: 'Cálcio',
    status: 'iniciar',
    rotuloStatus: 'Em uso',
    dose,
    janela: 'Durante a gestação',
    indicacao,
    observacao: riscoPreEclampsia ? `${observacao} Também contribui pra redução do risco de pré-eclâmpsia.` : observacao,
  }
}

export function calcularIodo(): RecomendacaoSuplementoGestante {
  return {
    nome: 'Iodo',
    status: 'iniciar',
    rotuloStatus: 'Rotina',
    dose: '150 a 250 µg/dia',
    janela: 'Durante toda a gestação e a lactação',
    indicacao: 'Todas as gestantes e lactantes',
  }
}

export function calcularAAS(ctx: ContextoSuplementacaoGestante): RecomendacaoSuplementoGestante {
  const { semanasIG, riscoPreEclampsia } = ctx
  const indicacao = 'Gestantes com alto risco para pré-eclâmpsia: HAS crônica, DM, gestação múltipla, história de pré-eclâmpsia, entre outras'
  const janelaPadrao = 'Janela ótima 12–16 semanas, limite até 20 semanas, interromper com 36 semanas'

  if (!riscoPreEclampsia) {
    return {
      nome: 'AAS (Ácido Acetilsalicílico)',
      status: 'nao_aplicavel',
      rotuloStatus: 'Não indicado',
      dose: '100 mg/dia, se indicado',
      janela: janelaPadrao,
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
      janela: janelaPadrao,
      indicacao,
    }
  }
  if (semanasIG <= 20) {
    return {
      nome: 'AAS (Ácido Acetilsalicílico)',
      status: 'iniciar',
      rotuloStatus: semanasIG <= 16 ? 'Janela ideal de início' : 'Ainda no limite (até 20 semanas)',
      dose: '100 mg/dia',
      janela: 'Manter até 36 semanas',
      indicacao,
      observacao: 'Reduz o risco de pré-eclâmpsia precoce e de restrição de crescimento fetal (RCF).',
    }
  }
  if (semanasIG < 36) {
    return {
      nome: 'AAS (Ácido Acetilsalicílico)',
      status: 'iniciar',
      rotuloStatus: 'Em uso',
      dose: '100 mg/dia',
      janela: 'Manter até 36 semanas',
      indicacao,
      observacao: 'Após 20 semanas não se inicia mais AAS — essa recomendação vale só pra quem já está em uso.',
    }
  }
  return {
    nome: 'AAS (Ácido Acetilsalicílico)',
    status: 'concluido',
    rotuloStatus: 'Suspender',
    dose: '—',
    janela: 'Interromper aos 36 semanas — se ainda em uso, suspender agora.',
    indicacao,
  }
}

export function calcularVitaminaD(ctx: ContextoSuplementacaoGestante): RecomendacaoSuplementoGestante {
  const { deficienciaVitaminaD } = ctx
  const indicacao = 'Só suplementar com deficiência comprovada por exame — sem esquema universal'

  if (!deficienciaVitaminaD) {
    return {
      nome: 'Vitamina D',
      status: 'nao_aplicavel',
      rotuloStatus: 'Não indicado',
      dose: 'Conforme resultado do exame',
      janela: 'Durante a gestação, se indicado',
      indicacao,
      observacao: 'Marque "deficiência de vitamina D comprovada" acima se for o caso.',
    }
  }
  return {
    nome: 'Vitamina D',
    status: 'iniciar',
    rotuloStatus: 'Em uso',
    dose: 'Conforme resultado do exame e orientação individual',
    janela: 'Durante a gestação',
    indicacao,
    observacao: 'Dose ajustada ao grau de deficiência encontrado no exame.',
  }
}

export function calcularB12(ctx: ContextoSuplementacaoGestante): RecomendacaoSuplementoGestante {
  const { dietaRestritivaOuHipovitaminose } = ctx
  const indicacao = 'Gestantes veganas ou com hipovitaminoses identificadas'

  if (!dietaRestritivaOuHipovitaminose) {
    return {
      nome: 'Vitamina B12',
      status: 'nao_aplicavel',
      rotuloStatus: 'Não indicado',
      dose: 'Conforme orientação nutricional individual',
      janela: 'Durante toda a gestação, se indicado',
      indicacao,
      observacao: 'Marque o fator de risco acima (dieta vegana estrita ou hipovitaminose) se for o caso.',
    }
  }
  return {
    nome: 'Vitamina B12',
    status: 'iniciar',
    rotuloStatus: 'Em uso',
    dose: 'Conforme orientação nutricional individual',
    janela: 'Durante toda a gestação',
    indicacao,
    observacao: 'Objetivo: prevenir deficiências associadas a dietas restritivas.',
  }
}
