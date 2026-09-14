// Suplementação de rotina no pré-natal — Ácido Fólico, Ferro, AAS e Vitaminas B12/D,
// conteúdo fornecido pelo usuário. Cálcio (Carbonato de Cálcio) fica de fora por enquanto
// — usuário sinalizou que a dose de referência pode estar desatualizada, aguardando
// confirmação antes de entrar aqui.

export type StatusSuplementoGestante = 'aguardar' | 'iniciar' | 'concluido' | 'nao_aplicavel'

export interface ContextoSuplementacaoGestante {
  semanasIG: number | null
  /** Epilepsia, obesidade, DM ou uso de anticonvulsivantes — eleva a dose de ácido fólico
   *  de 400 mcg/dia pra 4 mg/dia. */
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
  const dose = riscoFolatoAlto ? '4 mg/dia' : '400 mcg/dia'
  const indicacao = 'Todas as gestantes (profilaxia universal) — 4 mg/dia em epilepsia, obesidade, DM ou uso de anticonvulsivantes'

  if (semanasIG == null) {
    return { nome: 'Ácido Fólico', status: 'iniciar', rotuloStatus: 'Rotina', dose, janela: '2 a 3 meses antes da concepção até 12 semanas de gestação', indicacao }
  }
  if (semanasIG <= 12) {
    return { nome: 'Ácido Fólico', status: 'iniciar', rotuloStatus: 'Em uso', dose, janela: '2 a 3 meses antes da concepção até 12 semanas de gestação', indicacao }
  }
  return {
    nome: 'Ácido Fólico',
    status: 'concluido',
    rotuloStatus: 'Janela encerrada',
    dose: '—',
    janela: 'A janela de suplementação (até 12 semanas) já passou.',
    indicacao,
  }
}

export function calcularFerro(ctx: ContextoSuplementacaoGestante): RecomendacaoSuplementoGestante {
  const { semanasIG, anemiaConfirmada } = ctx
  const indicacao = 'Todas as gestantes, se dieta insuficiente — confirmado por exame ou em profilaxia'

  if (semanasIG == null || semanasIG < 20) {
    return {
      nome: 'Ferro (Sulfato Ferroso)',
      status: 'aguardar',
      rotuloStatus: 'Aguardar',
      dose: anemiaConfirmada ? '120–240 mg/dia de ferro elementar (anemia confirmada, Hb < 11)' : '40 mg de ferro elementar/dia (~200 mg de sulfato ferroso)',
      janela: 'Suplementação profilática universal a partir da 20ª semana (MS / Caderneta da Gestante)',
      indicacao,
    }
  }
  return {
    nome: 'Ferro (Sulfato Ferroso)',
    status: 'iniciar',
    rotuloStatus: 'Em uso',
    dose: anemiaConfirmada ? '120–240 mg/dia de ferro elementar (anemia confirmada, Hb < 11)' : '40 mg de ferro elementar/dia (~200 mg de sulfato ferroso)',
    janela: 'Até o fim da gestação; manter no puerpério se anemia',
    indicacao,
    observacao: 'Tomar antes das refeições para melhor absorção.',
  }
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
