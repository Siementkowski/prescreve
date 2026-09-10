// Marcos do desenvolvimento infantil por faixa etária — compilado de referências
// pediátricas padrão (marcos amplamente usados em triagem, alinhados ao tipo de
// avaliação feita na Caderneta de Saúde da Criança do Ministério da Saúde):
// https://med.estrategia.com/portal/conteudos-gratis/resumo-de-marcos-do-desenvolvimento-infantil-diagnostico-tratamento-e-mais/
// https://www.msdmanuals.com/pt/profissional/pediatria/crescimento-e-desenvolvimento/desenvolvimento-infantil
// ⚠️ Referência, não diagnóstico: cada criança tem seu próprio ritmo — pequenas variações
// dentro da faixa são normais. Ausência de um marco é gatilho pra avaliação clínica, não
// conclusão automática de atraso. Idade aqui é "a partir de quando o marco costuma
// aparecer", não um prazo fixo.

export interface Marco {
  dominio: 'motor' | 'linguagem' | 'social'
  descricao: string
}

export interface FaixaEtariaDesenvolvimento {
  idadeMeses: number
  rotulo: string
  marcos: Marco[]
}

export const MARCOS_DESENVOLVIMENTO: FaixaEtariaDesenvolvimento[] = [
  {
    idadeMeses: 2,
    rotulo: '2 meses',
    marcos: [
      { dominio: 'motor', descricao: 'Levanta a cabeça e empurra o corpo com os braços quando de bruços' },
      { dominio: 'motor', descricao: 'Acompanha objetos com o olhar' },
      { dominio: 'linguagem', descricao: 'Emite alguns sons' },
      { dominio: 'social', descricao: 'Reflexos primitivos presentes (Moro, sucção, preensão)' },
    ],
  },
  {
    idadeMeses: 4,
    rotulo: '4 meses',
    marcos: [
      { dominio: 'motor', descricao: 'Sustenta a cabeça firme quando de bruços' },
      { dominio: 'motor', descricao: 'Leva as mãos à linha média e objetos à boca' },
      { dominio: 'social', descricao: 'Sorri espontaneamente (sorriso social)' },
    ],
  },
  {
    idadeMeses: 6,
    rotulo: '6 meses',
    marcos: [
      { dominio: 'motor', descricao: 'Senta sem apoio; rola de bruços para as costas' },
      { dominio: 'motor', descricao: 'Transfere objetos de uma mão para outra' },
      { dominio: 'linguagem', descricao: "Balbucia sílabas repetidas ('bababá', 'lalalá')" },
      { dominio: 'social', descricao: 'Estranha pessoas desconhecidas; entende permanência do objeto' },
    ],
  },
  {
    idadeMeses: 9,
    rotulo: '9 meses',
    marcos: [
      { dominio: 'motor', descricao: 'Engatinha ou anda com apoio' },
      { dominio: 'motor', descricao: 'Faz pinça com os dedos pra pegar objetos pequenos' },
      { dominio: 'linguagem', descricao: "Fala sílabas com intenção ('papa', 'mama')" },
      { dominio: 'social', descricao: 'Reage à ausência dos pais ou à presença de estranhos' },
    ],
  },
  {
    idadeMeses: 12,
    rotulo: '12 meses (1 ano)',
    marcos: [
      { dominio: 'motor', descricao: 'Dá alguns passos sozinha ou com apoio' },
      { dominio: 'motor', descricao: 'Entrega objetos a outras pessoas' },
      { dominio: 'linguagem', descricao: 'Fala as primeiras palavras com significado' },
      { dominio: 'social', descricao: 'Chora quando os pais saem; ri de brincadeiras' },
    ],
  },
  {
    idadeMeses: 18,
    rotulo: '18 meses (1 ano e 6 meses)',
    marcos: [
      { dominio: 'motor', descricao: 'Anda bem sozinha; sobe escada com apoio' },
      { dominio: 'motor', descricao: 'Come sozinha com colher; tira o próprio calçado' },
      { dominio: 'linguagem', descricao: 'Fala cerca de 10 palavras; aponta partes do corpo' },
      { dominio: 'social', descricao: 'Começa a brincar de forma mais interativa' },
    ],
  },
  {
    idadeMeses: 24,
    rotulo: '24 meses (2 anos)',
    marcos: [
      { dominio: 'motor', descricao: 'Corre com coordenação; sobe e desce escada sem ajuda' },
      { dominio: 'linguagem', descricao: 'Forma frases de 2 a 3 palavras; responde ao próprio nome' },
      { dominio: 'social', descricao: 'Reconhece-se no espelho; começa o faz de conta; compartilha e se reveza' },
    ],
  },
  {
    idadeMeses: 36,
    rotulo: '36 meses (3 anos)',
    marcos: [
      { dominio: 'motor', descricao: 'Marcha madura; anda de triciclo' },
      { dominio: 'linguagem', descricao: 'Conta até 10; usa plurais' },
      { dominio: 'social', descricao: 'Crescente interesse em brincadeiras de fantasia' },
    ],
  },
  {
    idadeMeses: 48,
    rotulo: '48 meses (4 anos)',
    marcos: [
      { dominio: 'motor', descricao: 'Arremessa bola por cima do ombro; pula em um pé só' },
      { dominio: 'linguagem', descricao: 'Conta histórias simples' },
      { dominio: 'social', descricao: 'Conversa com adultos e outras crianças' },
    ],
  },
  {
    idadeMeses: 60,
    rotulo: '60 meses (5 anos)',
    marcos: [
      { dominio: 'motor', descricao: 'Salta; escreve o próprio nome' },
      { dominio: 'linguagem', descricao: 'Vocabulário amplo; reconhece palavras escritas simples' },
      { dominio: 'social', descricao: 'Relacionamentos com colegas mais desenvolvidos; segue regras de jogos' },
    ],
  },
]
