// Exames de rastreamento/rotina em pediatria, por idade — compilado de fontes com
// protocolo etário claro. Fontes:
// - Triagens neonatais: consenso nacional (SUS/Ministério da Saúde), teste do pezinho/
//   orelhinha/olhinho/coraçãozinho/linguinha — obrigatórios, bem padronizados no Brasil.
// - Anemia/ferro: atualização SBP 2026 (unificada com Ministério da Saúde) — ver
//   https://med.estrategia.com/portal/noticias/sbp-atualiza-recomendacoes-sobre-anemia-ferropriva-em-lactentes-e-unifica-conduta-com-o-ministerio-da-saude/
// - Perfil lipídico: MSD Manuals (Manuais MSD, edição profissional) —
//   https://www.msdmanuals.com/pt/profissional/pediatria/acompanhamento-do-crescimento-e-desenvolvimento-da-crian%C3%A7a-saud%C3%A1vel/testes-de-rastreamento-para-lactentes-crian%C3%A7as-e-adolescentes
// ⚠️ EAS e Parasitológico de fezes NÃO têm cronograma etário nacional único — aparecem
// aqui porque são comumente pedidos em check-up, mas o campo `restricao` deixa claro que
// não é rastreio universal obrigatório, ao contrário dos demais itens.

export interface ExameRecomendado {
  nome: string
  categoria: string
  idadeMeses: number // idade a partir da qual entra na lista (0 = ao nascer)
  periodicidade: string
  justificativa: string
  restricao?: string
}

export const EXAMES_POR_IDADE: ExameRecomendado[] = [
  {
    nome: 'Teste do pezinho',
    categoria: 'Triagem neonatal',
    idadeMeses: 0,
    periodicidade: 'Dose única, entre o 3º e o 5º dia de vida',
    justificativa:
      'Rastreia doenças metabólicas, genéticas e infecciosas graves (hipotireoidismo congênito, fenilcetonúria, fibrose cística, hemoglobinopatias, hiperplasia adrenal congênita, entre outras).',
  },
  {
    nome: 'Teste da orelhinha (triagem auditiva neonatal)',
    categoria: 'Triagem neonatal',
    idadeMeses: 0,
    periodicidade: 'Dose única, antes da alta ou até 1 mês de vida',
    justificativa: 'Rastreia perda auditiva congênita.',
  },
  {
    nome: 'Teste do olhinho (reflexo do olho vermelho)',
    categoria: 'Triagem neonatal',
    idadeMeses: 0,
    periodicidade: 'Dose única, ainda na maternidade',
    justificativa: 'Rastreia catarata congênita, glaucoma, retinoblastoma e outras opacidades.',
  },
  {
    nome: 'Teste do coraçãozinho (oximetria de pulso)',
    categoria: 'Triagem neonatal',
    idadeMeses: 0,
    periodicidade: 'Dose única, entre 24 e 48h de vida',
    justificativa: 'Rastreia cardiopatias congênitas críticas.',
  },
  {
    nome: 'Teste da linguinha',
    categoria: 'Triagem neonatal',
    idadeMeses: 0,
    periodicidade: 'Dose única, ainda na maternidade',
    justificativa: 'Rastreia anquiloglossia (língua presa), que pode prejudicar a amamentação.',
  },
  {
    nome: 'Hemograma + ferritina (± PCR)',
    categoria: 'Anemia / ferro',
    idadeMeses: 9,
    periodicidade: 'Entre 9 e 12 meses, se indicado',
    justificativa: 'Investigação de deficiência de ferro/anemia ferropriva.',
    restricao:
      'SBP 2026: reservado a grupo de risco (prematuro, baixo peso ao nascer, falha da profilaxia com ferro, alimentação ou crescimento inadequados) — lactente saudável de risco habitual não precisa de rastreio laboratorial de rotina. AAP/OMS recomendam rastreio universal aos 12 meses — critério pode variar por serviço.',
  },
  {
    nome: 'Perfil lipídico (colesterol total e frações)',
    categoria: 'Cardiovascular',
    idadeMeses: 108, // 9 anos
    periodicidade: 'Entre 9 e 11 anos, repetir entre 17 e 21 anos',
    justificativa: 'Rastreio de dislipidemia e risco cardiovascular.',
  },
  {
    nome: 'EAS (urina tipo 1)',
    categoria: 'Rotina / check-up',
    idadeMeses: 12,
    periodicidade: 'Conforme rotina do serviço',
    justificativa: 'Triagem geral de alterações urinárias.',
    restricao: 'Sem cronograma etário nacional padronizado — não é rastreio universal obrigatório, avaliar por serviço/queixa.',
  },
  {
    nome: 'Parasitológico de fezes',
    categoria: 'Rotina / check-up',
    idadeMeses: 24,
    periodicidade: 'Conforme rotina do serviço ou sintomas',
    justificativa: 'Investigação de parasitoses intestinais.',
    restricao: 'Sem cronograma etário nacional padronizado — não é rastreio universal obrigatório, avaliar por serviço/queixa/endemicidade local.',
  },
]
