// Fonte única de verdade pra conectividade — módulo simples (sem Zustand, sem dependência
// de outra parte do app) pra evitar import circular entre core/sync.ts (que precisa saber
// se está online) e admin/api.ts (que precisa bloquear escrita sem rede).
type Ouvinte = (online: boolean) => void

let online = typeof navigator !== 'undefined' ? navigator.onLine : true
const ouvintes = new Set<Ouvinte>()

function definir(v: boolean) {
  if (v === online) return
  online = v
  ouvintes.forEach((fn) => fn(online))
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => definir(true))
  window.addEventListener('offline', () => definir(false))
}

export function estaOnline(): boolean {
  return online
}

/** Chame o retorno pra cancelar a assinatura. */
export function assinarConectividade(fn: Ouvinte): () => void {
  ouvintes.add(fn)
  return () => ouvintes.delete(fn)
}

/** Usado quando uma requisição real falha por rede mesmo com navigator.onLine = true
 *  (wi-fi "mentiroso", conectado mas sem internet) — corrige o estado na marra. */
export function forcarOffline(): void {
  definir(false)
}
