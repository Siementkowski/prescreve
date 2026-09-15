import { create } from 'zustand'

export type StatusSorologia = 'desconhecido' | 'imune' | 'suscetivel'
export type MetodoBCF = 'nao_informado' | 'sonar_doppler' | 'pinard'
export type MovimentacaoFetal = 'nao_avaliado' | 'presente' | 'reduzida' | 'ausente'

/** Estado do formulário do Guia de Consulta — separado da store de Gestantes (que só
 *  guarda a IG, compartilhada por todas as sub-abas) porque esse aqui é bem maior e é
 *  específico dessa tela. Vive na store (não em useState) só pra sobreviver a trocar de
 *  sub-aba (Pré-natal/Suplementação/...) sem perder o que já foi preenchido — o
 *  componente do Guia desmonta a cada troca de aba, useState local se perderia. Segue a
 *  mesma regra das outras stores do módulo: sem `persist`, é a paciente na cadeira agora,
 *  não deve sobreviver a um F5 amanhã com outra. */
interface GuiaConsultaState {
  primeiraConsulta: boolean | null
  setPrimeiraConsulta: (v: boolean | null) => void

  // ---- cabeçalho / antecedentes ----
  // DUM que entra no cabeçalho da anamnese — campo livre, preenchido por quem está
  // digitando (não é calculado a partir da IG: o método de cálculo em Pré-natal pode ser
  // por USG/IG prévia sem que a DUM relatada pela paciente seja conhecida ou coincida).
  dumAnamnese: string
  setDumAnamnese: (v: string) => void
  g: string
  setG: (v: string) => void
  p: string
  setP: (v: string) => void
  c: string
  setC: (v: string) => void
  a: string
  setA: (v: string) => void
  historiaObstetrica: string
  setHistoriaObstetrica: (v: string) => void
  tipoSanguineo: string
  setTipoSanguineo: (v: string) => void
  comorbidades: string
  setComorbidades: (v: string) => void
  medsSelecionados: Set<string>
  setMedsSelecionados: (v: Set<string>) => void
  outrosMedicamentos: string
  setOutrosMedicamentos: (v: string) => void
  alergias: string
  setAlergias: (v: string) => void
  negaVicios: boolean
  setNegaVicios: (v: boolean) => void
  viciosDetalhe: string
  setViciosDetalhe: (v: string) => void
  toxoplasmose: StatusSorologia
  setToxoplasmose: (v: StatusSorologia) => void
  atividadeLaboral: string
  setAtividadeLaboral: (v: string) => void

  // ---- subjetivo ----
  acompanhada: boolean
  setAcompanhada: (v: boolean) => void
  acompanhantePor: string
  setAcompanhantePor: (v: string) => void
  encaminhadaPor: string
  setEncaminhadaPor: (v: string) => void
  jaRealizouExames: boolean
  setJaRealizouExames: (v: boolean) => void
  queixas: Record<string, boolean>
  setQueixas: (v: Record<string, boolean>) => void
  queixasDetalhe: string
  setQueixasDetalhe: (v: string) => void
  vacinasTomadas: Set<string>
  setVacinasTomadas: (v: Set<string>) => void

  // ---- objetivo / exame físico ----
  peso: string
  setPeso: (v: string) => void
  estatura: string
  setEstatura: (v: string) => void
  abdomeGravidico: boolean
  setAbdomeGravidico: (v: boolean) => void
  au: string
  setAu: (v: string) => void
  bcfBpm: string
  setBcfBpm: (v: string) => void
  bcfMetodo: MetodoBCF
  setBcfMetodo: (v: MetodoBCF) => void
  bcfAusente: boolean
  setBcfAusente: (v: boolean) => void
  movimentacaoFetal: MovimentacaoFetal
  setMovimentacaoFetal: (v: MovimentacaoFetal) => void
  achados: Set<string>
  setAchados: (v: Set<string>) => void

  // ---- avaliação / plano ----
  riscoAlto: boolean
  setRiscoAlto: (v: boolean) => void
  planoExtra: string
  setPlanoExtra: (v: string) => void

  // ---- exames a solicitar (checklist) ----
  marcados: Set<string>
  setMarcados: (v: Set<string>) => void
}

export const useGuiaConsultaStore = create<GuiaConsultaState>((set) => ({
  primeiraConsulta: null,
  setPrimeiraConsulta: (primeiraConsulta) => set({ primeiraConsulta }),

  dumAnamnese: '',
  setDumAnamnese: (dumAnamnese) => set({ dumAnamnese }),
  g: '',
  setG: (g) => set({ g }),
  p: '',
  setP: (p) => set({ p }),
  c: '',
  setC: (c) => set({ c }),
  a: '',
  setA: (a) => set({ a }),
  historiaObstetrica: '',
  setHistoriaObstetrica: (historiaObstetrica) => set({ historiaObstetrica }),
  tipoSanguineo: '',
  setTipoSanguineo: (tipoSanguineo) => set({ tipoSanguineo }),
  comorbidades: '',
  setComorbidades: (comorbidades) => set({ comorbidades }),
  medsSelecionados: new Set(),
  setMedsSelecionados: (medsSelecionados) => set({ medsSelecionados }),
  outrosMedicamentos: '',
  setOutrosMedicamentos: (outrosMedicamentos) => set({ outrosMedicamentos }),
  alergias: '',
  setAlergias: (alergias) => set({ alergias }),
  negaVicios: true,
  setNegaVicios: (negaVicios) => set({ negaVicios }),
  viciosDetalhe: '',
  setViciosDetalhe: (viciosDetalhe) => set({ viciosDetalhe }),
  toxoplasmose: 'desconhecido',
  setToxoplasmose: (toxoplasmose) => set({ toxoplasmose }),
  atividadeLaboral: '',
  setAtividadeLaboral: (atividadeLaboral) => set({ atividadeLaboral }),

  acompanhada: false,
  setAcompanhada: (acompanhada) => set({ acompanhada }),
  acompanhantePor: '',
  setAcompanhantePor: (acompanhantePor) => set({ acompanhantePor }),
  encaminhadaPor: '',
  setEncaminhadaPor: (encaminhadaPor) => set({ encaminhadaPor }),
  jaRealizouExames: false,
  setJaRealizouExames: (jaRealizouExames) => set({ jaRealizouExames }),
  queixas: {},
  setQueixas: (queixas) => set({ queixas }),
  queixasDetalhe: '',
  setQueixasDetalhe: (queixasDetalhe) => set({ queixasDetalhe }),
  vacinasTomadas: new Set(),
  setVacinasTomadas: (vacinasTomadas) => set({ vacinasTomadas }),

  peso: '',
  setPeso: (peso) => set({ peso }),
  estatura: '',
  setEstatura: (estatura) => set({ estatura }),
  abdomeGravidico: false,
  setAbdomeGravidico: (abdomeGravidico) => set({ abdomeGravidico }),
  au: '',
  setAu: (au) => set({ au }),
  bcfBpm: '',
  setBcfBpm: (bcfBpm) => set({ bcfBpm }),
  bcfMetodo: 'nao_informado',
  setBcfMetodo: (bcfMetodo) => set({ bcfMetodo }),
  bcfAusente: false,
  setBcfAusente: (bcfAusente) => set({ bcfAusente }),
  movimentacaoFetal: 'nao_avaliado',
  setMovimentacaoFetal: (movimentacaoFetal) => set({ movimentacaoFetal }),
  achados: new Set(),
  setAchados: (achados) => set({ achados }),

  riscoAlto: false,
  setRiscoAlto: (riscoAlto) => set({ riscoAlto }),
  planoExtra: '',
  setPlanoExtra: (planoExtra) => set({ planoExtra }),

  marcados: new Set(),
  setMarcados: (marcados) => set({ marcados }),
}))
