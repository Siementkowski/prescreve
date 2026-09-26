import { create } from 'zustand'

export type StatusSorologia = 'desconhecido' | 'imune' | 'suscetivel'
export type StatusLabs = 'nao_avaliado' | 'normais' | 'alterados'

/** Estado do formulário do Guia de Consulta — separado da store de Gestantes (que só
 *  guarda a IG, compartilhada por todas as sub-abas) porque esse aqui é bem maior e é
 *  específico dessa tela. Vive na store (não em useState) só pra sobreviver a trocar de
 *  sub-aba (Pré-natal/Suplementação/...) sem perder o que já foi preenchido — o
 *  componente do Guia desmonta a cada troca de aba, useState local se perderia. Segue a
 *  mesma regra das outras stores do módulo: sem `persist`, é a paciente na cadeira agora,
 *  não deve sobreviver a um F5 amanhã com outra.
 *
 *  Estrutura segue o modelo SOAP fornecido: cabeçalho (antecedentes + status de labs),
 *  S (queixas fixas de rotina, nega/refere), O (exame físico objetivo), P (vacinas,
 *  orientações e resultados de exames revisados). LABS no cabeçalho é só um marcador
 *  rápido (avaliado/normal/alterado) — o que de fato entra em "Resultados revisados" no
 *  Plano vem dos campos de resultado por exame do trimestre (`resultadosExame`, campos
 *  definidos em `CAMPOS_RESULTADO_EXAME` de dados/preNatal.ts). */
interface GuiaConsultaState {
  // ---- cabeçalho / antecedentes ----
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
  vacinasTomadas: Set<string>
  setVacinasTomadas: (v: Set<string>) => void
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

  // Marcador rápido de LABS pro cabeçalho — não são os resultados detalhados por exame, é
  // "os resultados que ela já trouxe estão normais ou alterados". Ver `resultadosExame`
  // pros valores efetivos por exame do trimestre.
  labsStatus: StatusLabs
  setLabsStatus: (v: StatusLabs) => void
  labsAlteradosDetalhe: string
  setLabsAlteradosDetalhe: (v: string) => void

  // ---- subjetivo (S) — perguntas fixas de rotina, nega/refere ----
  queixasRotina: Set<string>
  setQueixasRotina: (v: Set<string>) => void
  queixasDetalhe: string
  setQueixasDetalhe: (v: string) => void

  // ---- objetivo (O) ----
  peso: string
  setPeso: (v: string) => void
  estatura: string
  setEstatura: (v: string) => void
  pas: string
  setPas: (v: string) => void
  pad: string
  setPad: (v: string) => void
  fc: string
  setFc: (v: string) => void
  au: string
  setAu: (v: string) => void
  bcfBpm: string
  setBcfBpm: (v: string) => void
  bcfAusente: boolean
  setBcfAusente: (v: boolean) => void

  // ---- avaliação / plano (P) ----
  riscoAlto: boolean
  setRiscoAlto: (v: boolean) => void
  planoExtra: string
  setPlanoExtra: (v: string) => void

  // ---- exames — resultados de laboratório (por trimestre escolhido manualmente) ----
  trimestreExames: 1 | 2 | 3 | null
  setTrimestreExames: (v: 1 | 2 | 3 | null) => void
  dataExames: string
  setDataExames: (v: string) => void
  // chave = `${exame.nome}::${campo.label}` (ver CAMPOS_RESULTADO_EXAME em dados/preNatal.ts)
  resultadosExame: Record<string, string>
  setResultadosExame: (v: Record<string, string>) => void
}

export const useGuiaConsultaStore = create<GuiaConsultaState>((set) => ({
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
  vacinasTomadas: new Set(),
  setVacinasTomadas: (vacinasTomadas) => set({ vacinasTomadas }),
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

  labsStatus: 'nao_avaliado',
  setLabsStatus: (labsStatus) => set({ labsStatus }),
  labsAlteradosDetalhe: '',
  setLabsAlteradosDetalhe: (labsAlteradosDetalhe) => set({ labsAlteradosDetalhe }),

  queixasRotina: new Set(),
  setQueixasRotina: (queixasRotina) => set({ queixasRotina }),
  queixasDetalhe: '',
  setQueixasDetalhe: (queixasDetalhe) => set({ queixasDetalhe }),

  peso: '',
  setPeso: (peso) => set({ peso }),
  estatura: '',
  setEstatura: (estatura) => set({ estatura }),
  pas: '',
  setPas: (pas) => set({ pas }),
  pad: '',
  setPad: (pad) => set({ pad }),
  fc: '',
  setFc: (fc) => set({ fc }),
  au: '',
  setAu: (au) => set({ au }),
  bcfBpm: '',
  setBcfBpm: (bcfBpm) => set({ bcfBpm }),
  bcfAusente: false,
  setBcfAusente: (bcfAusente) => set({ bcfAusente }),

  riscoAlto: false,
  setRiscoAlto: (riscoAlto) => set({ riscoAlto }),
  planoExtra: '',
  setPlanoExtra: (planoExtra) => set({ planoExtra }),

  trimestreExames: null,
  setTrimestreExames: (trimestreExames) => set({ trimestreExames }),
  dataExames: '',
  setDataExames: (dataExames) => set({ dataExames }),
  resultadosExame: {},
  setResultadosExame: (resultadosExame) => set({ resultadosExame }),
}))
