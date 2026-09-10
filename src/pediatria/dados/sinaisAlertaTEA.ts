// Sinais de alerta de TEA (transtorno do espectro autista) por faixa etária — checklist
// de triagem clínica, NÃO um instrumento formal validado (M-CHAT ficou de fora de
// propósito: é um instrumento protegido, com pontuação e texto oficial que precisam ser
// reproduzidos fielmente, não parafraseados — decisão de escopo, ver conversa).
// Fonte: https://sanarmed.com/sinais-de-alerta-para-tea-o-que-observar-em-cada-faixa-etaria/
// ⚠️ Presença de um sinal não é diagnóstico — é gatilho pra avaliação mais aprofundada
// (idealmente com instrumento validado e especialista). Variação entre crianças é normal.

export interface FaixaSinaisAlerta {
  idadeMesesInicio: number
  idadeMesesFim: number
  rotulo: string
  sinais: string[]
}

export const SINAIS_ALERTA_TEA: FaixaSinaisAlerta[] = [
  {
    idadeMesesInicio: 0,
    idadeMesesFim: 6,
    rotulo: 'Nascimento aos 6 meses',
    sinais: [
      'Interesse limitado por rostos e vozes',
      'Sorriso social raro ou inconsistente',
      'Contato visual breve ou difícil de manter',
      'Pouca reciprocidade durante vocalizações',
      'Reações incomuns a sons, toque, movimento ou luz',
    ],
  },
  {
    idadeMesesInicio: 6,
    idadeMesesFim: 12,
    rotulo: '6 aos 12 meses',
    sinais: [
      'Resposta infrequente ao nome',
      'Baixo interesse em brincadeiras sociais',
      'Balbucio limitado ou não direcionado',
      'Ausência de gestos (braços estendidos, acenar)',
      'Dificuldade pra acompanhar o olhar ou o gesto de apontar',
      'Maior interesse por partes de objetos do que por interação',
    ],
  },
  {
    idadeMesesInicio: 12,
    idadeMesesFim: 18,
    rotulo: '12 aos 18 meses',
    sinais: [
      'Ausência de apontar pra mostrar algo interessante',
      'Pouco uso de gestos comunicativos',
      'Alternância de olhar limitada entre objeto e adulto',
      'Resposta limitada ao nome',
      'Imitação social reduzida',
      'Brincadeira funcional limitada',
    ],
  },
  {
    idadeMesesInicio: 18,
    idadeMesesFim: 24,
    rotulo: '18 aos 24 meses',
    sinais: [
      'Poucas palavras espontâneas',
      'Ausência de combinações de duas palavras aos 24 meses',
      'Pouca compreensão de comandos simples',
      'Fixação por rodas, letras, números, luzes ou movimentos',
      'Resistência intensa a mudanças pequenas',
      'Possível perda de linguagem ou habilidades sociais já adquiridas',
    ],
  },
  {
    idadeMesesInicio: 24,
    idadeMesesFim: 36,
    rotulo: '2 aos 3 anos',
    sinais: [
      'Linguagem pouco usada pra conversar',
      'Fala repetitiva, roteirizada ou centrada em frases decoradas',
      'Pouca curiosidade sobre outras pessoas',
      'Brincadeiras repetitivas (alinhar, girar objetos)',
      'Sofrimento intenso com mudanças de rotina',
    ],
  },
  {
    idadeMesesInicio: 36,
    idadeMesesFim: 60,
    rotulo: '4 aos 5 anos',
    sinais: [
      'Dificuldade em brincadeiras coletivas',
      'Controle rígido do enredo da brincadeira',
      'Interpretação literal de falas',
      'Conversa unilateral ou centrada em temas específicos',
      'Pouca compreensão das emoções, intenções ou perspectivas dos outros',
    ],
  },
]
