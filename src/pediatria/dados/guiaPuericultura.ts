// Guia de consulta de Puericultura, por faixa etária — mesma ideia do Guia de Consulta do
// módulo Gestantes, mas a régua aqui é a idade da criança em vez da semana gestacional.
// Conteúdo curado (não filtrado programaticamente) a partir do que já existe em
// dados/calendarioVacinal.ts, dados/marcosDesenvolvimento.ts e dados/examesPorIdade.ts —
// resumo do que é relevante NESSA consulta específica; o "ver completo" de cada bloco leva
// pra tela cheia com todos os detalhes, doses e observações.
//
// Alimentação/introdução alimentar e tempo de tela são conteúdo NOVO, rascunho inicial
// baseado em Guia Alimentar para Crianças Brasileiras Menores de 2 Anos (Ministério da
// Saúde) e recomendações da SBP sobre tempo de tela — revisar antes de usar em produção.

export type FaixaId = '7d' | '1m' | '2m' | '4m' | '6m' | '9m' | '12m' | '18m' | '24m' | 'acima2a'

export interface FaixaPuericultura {
  id: FaixaId
  titulo: string
  resumo: string
  /** Idade de referência em meses — usada só pra chamar as funções de suplementação
   *  (calcularFerro/calcularVitaminaD), que já existem e são puras. */
  idadeReferenciaMeses: number
  queixas: string[]
  vacinas: string[]
  marcos: string[]
  exames: string[]
  /** Vazio = alimentação complementar ainda não se aplica nessa fase. */
  alimentacao: string[]
  /** Só preenchido quando `alimentacao` está vazio — explica por que ainda não é a hora. */
  alimentacaoAviso?: string
  aleitamento: string
  tela: string
  seguranca: string[]
}

export const FAIXAS_PUERICULTURA: FaixaPuericultura[] = [
  {
    id: '7d',
    titulo: 'Consulta de 7 dias',
    resumo: 'Adaptação neonatal · Aleitamento · Triagens',
    idadeReferenciaMeses: 0,
    queixas: [
      'Perda/recuperação do peso de nascimento',
      'Icterícia',
      'Coto umbilical (sinais de infecção)',
      'Padrão de sono',
      'Eliminações (urina e fezes)',
      'Dificuldades na amamentação',
    ],
    vacinas: ['Confirmar Hepatite B e BCG aplicadas na maternidade (dose única, ao nascer)'],
    marcos: ['Reflexos primitivos presentes (Moro, sucção, preensão) — checklist formal de marcos começa aos 2 meses'],
    exames: ['Confirmar triagens neonatais: teste do pezinho, orelhinha, olhinho, coraçãozinho e linguinha, se ainda não realizadas'],
    alimentacao: [],
    alimentacaoAviso: 'Alimentação complementar só a partir dos 6 meses completos — aleitamento exclusivo até lá.',
    aleitamento: 'Livre demanda; avaliar pega e transferência de leite; identificar sinais de fome precoce (não esperar o choro).',
    tela: 'Nenhuma exposição a telas — nem para acalmar o bebê.',
    seguranca: [
      'Dormir de barriga pra cima, no berço, sem objetos soltos (travesseiro, protetor, brinquedos)',
      'Não fumar perto do bebê',
      'Assento de carro obrigatório e adequado ao peso',
    ],
  },
  {
    id: '1m',
    titulo: 'Consulta de 1 mês',
    resumo: 'Ganho de peso · Aleitamento · Sono',
    idadeReferenciaMeses: 1,
    queixas: [
      'Ganho de peso',
      'Cólicas, refluxo ou constipação',
      'Padrão de sono',
      'Dificuldades na amamentação',
      'Icterícia persistente',
    ],
    vacinas: ['Nenhuma dose prevista no calendário nacional para 1 mês — próximas doses aos 2 meses'],
    marcos: [],
    exames: ['Sem exame de rotina previsto especificamente para 1 mês'],
    alimentacao: [],
    alimentacaoAviso: 'Alimentação complementar só a partir dos 6 meses completos — aleitamento exclusivo até lá.',
    aleitamento: 'Reforçar exclusividade do aleitamento materno até os 6 meses — sem água, chás ou outros leites.',
    tela: 'Nenhuma exposição a telas.',
    seguranca: [
      'Reforçar segurança do sono',
      'Vacinação em dia da família e cuidadores (dTpa, influenza) protege indiretamente o bebê',
    ],
  },
  {
    id: '2m',
    titulo: 'Consulta de 2 meses',
    resumo: 'Vacinas · Marcos iniciais · Aleitamento',
    idadeReferenciaMeses: 2,
    queixas: ['Ganho de peso', 'Cólicas', 'Padrão de sono', 'Choro excessivo'],
    vacinas: ['Penta (1ª dose)', 'VIP (1ª dose)', 'Rotavírus (1ª dose — janela até 3m15d)', 'Pneumocócica (1ª dose)'],
    marcos: [
      'Levanta a cabeça e empurra o corpo com os braços quando de bruços',
      'Acompanha objetos com o olhar',
      'Emite alguns sons',
    ],
    exames: [],
    alimentacao: [],
    alimentacaoAviso: 'Alimentação complementar só a partir dos 6 meses completos — aleitamento exclusivo até lá.',
    aleitamento: 'Aleitamento exclusivo — sem necessidade de água/chás mesmo em dias quentes.',
    tela: 'Nenhuma exposição a telas.',
    seguranca: ['Atenção a quedas — o bebê já se movimenta mais no colo/trocador'],
  },
  {
    id: '4m',
    titulo: 'Consulta de 4 meses',
    resumo: 'Vacinas · Desenvolvimento motor · Preparo pra IA',
    idadeReferenciaMeses: 4,
    queixas: ['Ganho de peso', 'Padrão de sono', 'Refluxo'],
    vacinas: ['Penta (2ª dose)', 'VIP (2ª dose)', 'Rotavírus (2ª dose)', 'Pneumocócica (2ª dose)'],
    marcos: [
      'Sustenta a cabeça firme quando de bruços',
      'Leva as mãos à linha média e objetos à boca',
      'Sorri espontaneamente (sorriso social)',
    ],
    exames: [],
    alimentacao: [],
    alimentacaoAviso: 'Ainda não é hora — não antecipar a introdução alimentar. Alimentação complementar só a partir dos 6 meses completos.',
    aleitamento: 'Manter aleitamento exclusivo até os 6 meses.',
    tela: 'Nenhuma exposição a telas.',
    seguranca: ['Início da mobilidade (rolar) — nunca deixar sozinho em superfícies altas (trocador, cama, sofá)'],
  },
  {
    id: '6m',
    titulo: 'Consulta de 6 meses',
    resumo: 'Introdução alimentar · Vacinas · Desenvolvimento',
    idadeReferenciaMeses: 6,
    queixas: [
      'Aceitação alimentar (se já iniciou)',
      'Padrão de sono',
      'Ganho de peso e estatura',
      'Engasgos',
    ],
    vacinas: ['Penta (3ª dose)', 'VIP (3ª dose)', 'Influenza (1ª dose — anual até 5a11m)', 'Covid-19 (1ª dose)'],
    marcos: [
      'Senta sem apoio; rola de bruços para as costas',
      'Transfere objetos de uma mão para outra',
      "Balbucia sílabas repetidas ('bababá', 'lalalá')",
      'Estranha pessoas desconhecidas; entende permanência do objeto',
    ],
    exames: ['Sem exame de rotina específico aos 6 meses — hemograma entra na consulta de 9 meses se houver fator de risco'],
    alimentacao: [
      'Início da alimentação complementar: 2-3 refeições/dia além do leite',
      'Oferecer em consistência amassada/pedaços pequenos, conforme a habilidade da criança — não precisa ser só líquido',
      'Alimentos in natura, sem sal ou açúcar adicionado',
      'Introduzir alimentos potencialmente alergênicos (ovo, leite de vaca, amendoim, peixe) de forma gradual, sem atraso proposital',
      'Água oferecida em pequenas quantidades junto às refeições',
      'Evitar mel (risco de botulismo), açúcar e ultraprocessados',
      'Atenção a risco de engasgo — evitar alimentos inteiros e duros (uva inteira, amendoim inteiro)',
    ],
    aleitamento: 'Manter o aleitamento materno como complemento à alimentação — não substitui, complementa.',
    tela: 'Ainda zero — evitar telas mesmo durante as refeições.',
    seguranca: [
      'Cadeira de alimentação com cinto de segurança',
      'Objetos pequenos fora de alcance (risco de engasgo)',
      'Nunca deixar sozinho na banheira',
    ],
  },
  {
    id: '9m',
    titulo: 'Consulta de 9 meses',
    resumo: 'Evolução alimentar · Vacinas · Autonomia',
    idadeReferenciaMeses: 9,
    queixas: ['Aceitação e evolução da alimentação complementar', 'Padrão de sono', 'Ansiedade de separação'],
    vacinas: ['Covid-19 (3ª dose)', 'Febre amarela (dose única)'],
    marcos: [
      'Engatinha ou anda com apoio',
      'Faz pinça com os dedos pra pegar objetos pequenos',
      "Fala sílabas com intenção ('papa', 'mama')",
      'Reage à ausência dos pais ou à presença de estranhos',
    ],
    exames: ['Hemograma + ferritina (± PCR) — se grupo de risco pra deficiência de ferro'],
    alimentacao: [
      'Evoluir para alimentos amassados/picados em pedaços maiores',
      '3 refeições principais + lanches',
      'Estimular autonomia — deixar a criança pegar a comida com as mãos',
      'Oferecer variedade de texturas e sabores',
    ],
    aleitamento: 'Continua como complemento importante, sem horário fixo obrigatório.',
    tela: 'Ainda recomendado zero — se exposto, tempo mínimo e nunca sozinho.',
    seguranca: [
      'Engatinhando/ficando em pé — reforçar proteção de escadas, tomadas e quinas',
      'Ansiedade de separação é esperada nessa fase',
    ],
  },
  {
    id: '12m',
    titulo: 'Consulta de 12 meses',
    resumo: 'Transição alimentar · Vacinas · Primeiras palavras',
    idadeReferenciaMeses: 12,
    queixas: ['Alimentação (transição pra comida da família)', 'Marcha e linguagem', 'Padrão de sono'],
    vacinas: ['Pneumocócica (reforço)', 'Meningocócica ACWY (dose única)', 'Tríplice viral — SCR (1ª dose)'],
    marcos: [
      'Dá alguns passos sozinha ou com apoio',
      'Entrega objetos a outras pessoas',
      'Fala as primeiras palavras com significado',
      'Chora quando os pais saem; ri de brincadeiras',
    ],
    exames: ['EAS (urina tipo 1) — conforme rotina do serviço'],
    alimentacao: [
      'Transição pra comida da família (mesma consistência, com menos sal e tempero)',
      'Leite materno pode continuar até os 2 anos ou mais, se desejado',
      'Se não amamentado, avaliar necessidade de fórmula infantil de transição',
    ],
    aleitamento: 'Sem necessidade de suspender — segue por livre demanda enquanto mãe e criança quiserem.',
    tela: 'Recomendação segue sendo evitar — benefício não comprovado antes dos 2 anos.',
    seguranca: [
      'Primeiros passos — atenção a quedas e acesso a escadas/piscinas',
      'Saúde bucal: iniciar higiene oral com os primeiros dentes',
    ],
  },
  {
    id: '18m',
    titulo: 'Consulta de 18 meses',
    resumo: 'Linguagem · Comportamento · Vacinas',
    idadeReferenciaMeses: 18,
    queixas: ['Linguagem', 'Seletividade alimentar', 'Comportamento', 'Sono'],
    vacinas: ['VIP (1º reforço)', 'DTP (1º reforço)', 'Tríplice viral (2ª dose)', 'Varicela (1ª dose)', 'Hepatite A (dose única)'],
    marcos: [
      'Anda bem sozinha; sobe escada com apoio',
      'Come sozinha com colher; tira o próprio calçado',
      'Fala cerca de 10 palavras; aponta partes do corpo',
      'Começa a brincar de forma mais interativa',
    ],
    exames: [],
    alimentacao: [
      'Neofobia alimentar (recusa de alimentos novos) é esperada — oferecer repetidamente sem forçar',
      'Refeições em família, sem telas',
      'Evitar ultraprocessados e excesso de açúcar',
    ],
    aleitamento: 'Se ainda em curso, pode continuar; não é mais a base da alimentação.',
    tela: 'Ainda recomendado evitar — se expor, sempre com supervisão, conteúdo apropriado e tempo mínimo.',
    seguranca: [
      'Autonomia aumenta o risco de acidentes domésticos — revisar acesso a produtos de limpeza e medicamentos',
      'Saúde bucal — escovação 2x/dia com supervisão',
    ],
  },
  {
    id: '24m',
    titulo: 'Consulta de 24 meses',
    resumo: 'Desenvolvimento/linguagem · Comportamento · Vacinas',
    idadeReferenciaMeses: 24,
    queixas: ['Linguagem e comportamento', 'Seletividade alimentar', 'Desfralde'],
    vacinas: ['Nenhuma dose prevista exatamente aos 24 meses — próximos reforços aos 4 anos'],
    marcos: [
      'Corre com coordenação; sobe e desce escada sem ajuda',
      'Forma frases de 2 a 3 palavras; responde ao próprio nome',
      'Reconhece-se no espelho; começa o faz de conta; compartilha e se reveza',
    ],
    exames: ['Parasitológico de fezes — conforme rotina do serviço ou sintomas'],
    alimentacao: [
      'Alimentação já deve espelhar a da família, com porções adequadas à idade',
      'Rotina de horários de refeição ajuda na autorregulação',
      'Observar sinais de seletividade alimentar excessiva',
    ],
    aleitamento: 'Não é mais esperado como rotina, mas não há necessidade de desmame forçado se ainda ocorrer.',
    tela: 'A partir daqui (referência SBP): até 1h/dia de tela recreativa, sempre com supervisão de um adulto e conteúdo de qualidade.',
    seguranca: ['Início do desfralde — respeitar o tempo da criança', 'Reforçar segurança em ambientes externos (rua, playground)'],
  },
  {
    id: 'acima2a',
    titulo: 'Puericultura acima de 2 anos',
    resumo: 'Acompanhamento longitudinal · Escola · Hábitos',
    idadeReferenciaMeses: 60,
    queixas: ['Linguagem e comportamento', 'Adaptação escolar/creche', 'Alimentação e hábitos', 'Sono'],
    vacinas: [
      'VIP (2º reforço) e DTP (2º reforço) — 4 anos',
      'Varicela (2ª dose) e Febre amarela (reforço) — 4 anos',
      'Pneumocócica (dose extra) — só povos indígenas, sem histórico vacinal prévio',
      'HPV4 (dose única) — a partir dos 9 anos',
    ],
    marcos: [
      '3 anos: marcha madura, anda de triciclo, conta até 10, usa plurais',
      '4 anos: arremessa bola por cima do ombro, pula em um pé só, conta histórias simples',
      '5 anos: salta, escreve o próprio nome, vocabulário amplo, segue regras de jogos',
    ],
    exames: ['Perfil lipídico — entre 9 e 11 anos, repetir entre 17 e 21 anos'],
    alimentacao: [
      'Consolidar hábitos alimentares saudáveis em família',
      'Envolver a criança no preparo das refeições, quando possível',
      'Atenção ao consumo de ultraprocessados e bebidas açucaradas',
    ],
    aleitamento: '',
    tela: '2-5 anos: até 1h/dia. 6-10 anos: 1-2h/dia com regras de horário. 11+ anos: 2-3h/dia com combinados familiares e atenção a sinais de uso problemático (referência SBP).',
    seguranca: ['Adaptação escolar/creche', 'Atividade física regular', 'Prevenção de acidentes conforme a fase (trânsito, bicicleta, água)'],
  },
]
