// Regras de suplementação de Ferro e Vitamina D em pediatria — só esses dois, que têm
// diretriz nacional clara e recente o bastante pra confiar. Vitamina A e Zinco (citados
// como exemplo no pedido original) NÃO entram: são situacionais/regionais (áreas de
// carência endêmica), sem uma dose/janela universal pra transcrever com segurança —
// melhor não fingir precisão que não existe.
//
// Fontes:
// - Ferro: SBP + Ministério da Saúde, atualização unificada 2026 —
//   https://med.estrategia.com/portal/noticias/sbp-atualiza-recomendacoes-sobre-anemia-ferropriva-em-lactentes-e-unifica-conduta-com-o-ministerio-da-saude/
// - Vitamina D: SBP, atualização novembro/2024 —
//   https://www.grupomedcof.com.br/blog/pediatria-atualizacao-de-suplementacao-de-vitamina-d/
// ⚠️ São regras GERAIS (a maioria das crianças) — prematuridade extrema, patologias de
// base e casos individuais sempre podem mudar a conduta; isso não substitui avaliação
// clínica.

export type StatusSuplemento = 'aguardar' | 'iniciar' | 'concluido' | 'nao_aplicavel'

export interface ContextoSuplementacao {
  idadeMeses: number
  prematuroOuBaixoPeso: boolean
  fatorRiscoVitaminaD: boolean
}

export interface RecomendacaoSuplemento {
  nome: string
  status: StatusSuplemento
  rotuloStatus: string
  dose: string
  duracao: string
  observacao?: string
}

export function calcularFerro(ctx: ContextoSuplementacao): RecomendacaoSuplemento {
  const { idadeMeses, prematuroOuBaixoPeso } = ctx

  if (prematuroOuBaixoPeso) {
    if (idadeMeses < 1) {
      return {
        nome: 'Ferro',
        status: 'aguardar',
        rotuloStatus: 'Aguardar',
        dose: '2 a 4 mg/kg/dia (1º ano) — ajustar por idade gestacional e peso ao nascer',
        duracao: 'Início a partir de 30 dias de vida, até 24 meses',
        observacao: 'Prematuro/baixo peso: início mais precoce que o termo — dose e início exatos dependem da idade gestacional, individualizar.',
      }
    }
    if (idadeMeses < 12) {
      return {
        nome: 'Ferro',
        status: 'iniciar',
        rotuloStatus: 'Em uso',
        dose: '2 a 4 mg/kg/dia',
        duracao: 'Até completar 12 meses, depois reduzir a dose (ver 2º ano)',
      }
    }
    if (idadeMeses < 24) {
      return {
        nome: 'Ferro',
        status: 'iniciar',
        rotuloStatus: 'Em uso (2º ano)',
        dose: '1 mg/kg/dia',
        duracao: 'Até completar 24 meses',
      }
    }
    return {
      nome: 'Ferro',
      status: 'concluido',
      rotuloStatus: 'Concluído',
      dose: '—',
      duracao: 'Janela de suplementação de rotina encerrada aos 24 meses.',
    }
  }

  // Termo, peso adequado, sem fator de risco — esquema intermitente SBP/MS 2026.
  if (idadeMeses < 6) {
    return {
      nome: 'Ferro',
      status: 'aguardar',
      rotuloStatus: 'Aguardar',
      dose: '10 a 12,5 mg/dia de ferro elementar (dose fixa)',
      duracao: '1º ciclo começa aos 6 meses',
    }
  }
  if (idadeMeses < 9) {
    return {
      nome: 'Ferro',
      status: 'iniciar',
      rotuloStatus: '1º ciclo em uso',
      dose: '10 a 12,5 mg/dia de ferro elementar',
      duracao: 'Ciclo de 6 a 9 meses',
    }
  }
  if (idadeMeses < 12) {
    return {
      nome: 'Ferro',
      status: 'concluido',
      rotuloStatus: 'Pausa entre ciclos',
      dose: '—',
      duracao: 'Intervalo de 9 a 12 meses (sem suplementação) — 2º ciclo retoma aos 12 meses',
    }
  }
  if (idadeMeses < 15) {
    return {
      nome: 'Ferro',
      status: 'iniciar',
      rotuloStatus: '2º ciclo em uso',
      dose: '10 a 12,5 mg/dia de ferro elementar',
      duracao: 'Ciclo de 12 a 15 meses',
    }
  }
  return {
    nome: 'Ferro',
    status: 'concluido',
    rotuloStatus: 'Concluído',
    dose: '—',
    duracao: 'Os dois ciclos (6-9m e 12-15m) já passaram.',
  }
}

export function calcularVitaminaD(ctx: ContextoSuplementacao): RecomendacaoSuplemento {
  const { idadeMeses, fatorRiscoVitaminaD } = ctx

  if (idadeMeses >= 216) {
    // 18 anos
    return {
      nome: 'Vitamina D',
      status: 'nao_aplicavel',
      rotuloStatus: 'Fora da faixa pediátrica',
      dose: '—',
      duracao: 'Recomendação SBP cobre até 18 anos.',
    }
  }

  const dose = fatorRiscoVitaminaD
    ? '1.200 a 1.800 UI/dia (fator de risco)'
    : idadeMeses < 12
      ? '400 UI/dia'
      : '600 UI/dia'

  return {
    nome: 'Vitamina D',
    status: 'iniciar',
    rotuloStatus: 'Em uso',
    dose,
    duracao: 'Do nascimento até os 18 anos — sem necessidade de dosagem sérica prévia pra iniciar.',
    observacao: fatorRiscoVitaminaD
      ? 'Dose de risco: dieta vegetariana estrita, obesidade, hepatopatia/nefropatia crônica, má absorção intestinal ou uso de medicamentos que afetam o metabolismo da vitamina D.'
      : undefined,
  }
}
