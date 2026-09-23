// Marcos da linha do tempo de IG — lista de dados, não hardcoded no componente visual
// (LinhaDoTempoIG.tsx só itera essa lista), pra dar pra adicionar/editar/remover marco sem
// mexer no componente.

export interface MarcoIG {
  chave: string
  titulo: string
  semanaInicio: number
  // null = marco pontual (uma semana só). `textoAberto` distingue "exatamente nessa
  // semana" (ex: Imunoglobulina anti-D, 28s) de "a partir dessa semana, sem fim" (ex:
  // dTpa, VSR) — muda só o texto do rótulo, não a posição.
  semanaFim: number | null
  textoAberto?: boolean
}

export const MARCOS_IG: MarcoIG[] = [
  { chave: 'aas', titulo: 'AAS — profilaxia pré-eclâmpsia', semanaInicio: 12, semanaFim: 16 },
  { chave: 'usg_morfologico_2t', titulo: 'USG morfológico 2º tri', semanaInicio: 20, semanaFim: 24 },
  { chave: 'dtpa', titulo: 'dTpa', semanaInicio: 20, semanaFim: null, textoAberto: true },
  { chave: 'totg', titulo: 'TOTG', semanaInicio: 24, semanaFim: 28 },
  { chave: 'anti_d', titulo: 'Imunoglobulina anti-D (se Rh−)', semanaInicio: 28, semanaFim: null },
  { chave: 'vsr', titulo: 'VSR', semanaInicio: 28, semanaFim: null, textoAberto: true },
  { chave: 'egb', titulo: 'EGB (swab vaginal/retal)', semanaInicio: 35, semanaFim: 37 },
]

export const SEMANA_MAX_LINHA_DO_TEMPO = 42

export function rotuloSemanasMarco(m: MarcoIG): string {
  if (m.semanaFim == null) return m.textoAberto ? `a partir de ${m.semanaInicio}s` : `${m.semanaInicio}s`
  return `${m.semanaInicio}–${m.semanaFim}s`
}
