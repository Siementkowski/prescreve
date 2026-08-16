// Mapa via → verbo da receita ("VO" → "Tomar"). Centralizado aqui de propósito — é o
// único lugar que precisa mudar se um verbo estiver errado ou faltar uma via nova.
// Chaves normalizadas (maiúsculas, sem acento) pra aceitar "EV"/"IV"/"endovenosa" etc
// sem precisar de uma entrada por variação de grafia.
export const VERBO_POR_VIA: Record<string, string> = {
  VO: 'Tomar',
  ORAL: 'Tomar',
  SL: 'Dissolver sob a língua',
  SUBLINGUAL: 'Dissolver sob a língua',
  IM: 'Aplicar',
  INTRAMUSCULAR: 'Aplicar',
  EV: 'Infundir',
  IV: 'Infundir',
  ENDOVENOSA: 'Infundir',
  INTRAVENOSA: 'Infundir',
  SC: 'Aplicar',
  SUBCUTANEA: 'Aplicar',
  TOPICA: 'Aplicar',
  CUTANEA: 'Aplicar',
  RETAL: 'Introduzir',
  SUPOSITORIO: 'Introduzir',
  VAGINAL: 'Introduzir',
  INALATORIA: 'Inalar',
  NASAL: 'Aplicar',
  OCULAR: 'Instilar',
  OTOLOGICA: 'Instilar',
}

// Pra via parenteral (EV/IM), o verbo sozinho ("Infundir 1 ampola agora") não deixa claro
// COMO foi aplicado — a sigla precisa aparecer no corpo do texto também ("Infundir 1
// ampola EV agora"). VO e as outras vias não repetem (o verbo já basta).
const SIGLA_A_REPETIR: Record<string, string> = {
  EV: 'EV',
  IV: 'EV',
  ENDOVENOSA: 'EV',
  INTRAVENOSA: 'EV',
  IM: 'IM',
  INTRAMUSCULAR: 'IM',
}

function normalizar(s: string): string {
  return s
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

/** Verbo correspondente à via ("VO" → "Tomar"). Via não mapeada devolve null — quem
 *  chama decide o fallback (manter a sigla como está, sem verbo). */
export function verboDaVia(via: string | null | undefined): string | null {
  if (!via?.trim()) return null
  return VERBO_POR_VIA[normalizar(via)] ?? null
}

/** Texto pronto pra entrar na receita: verbo quando a via está mapeada, senão a sigla
 *  exatamente como foi cadastrada. */
export function textoDaVia(via: string | null | undefined): string | null {
  if (!via?.trim()) return null
  return verboDaVia(via) ?? via.trim()
}

/** "EV" ou "IM" (forma curta canônica) quando a via é parenteral e precisa repetir a sigla
 *  no corpo da receita — null pras demais vias (VO etc. já ficam claras só com o verbo). */
export function siglaParaRepetir(via: string | null | undefined): string | null {
  if (!via?.trim()) return null
  return SIGLA_A_REPETIR[normalizar(via)] ?? null
}
