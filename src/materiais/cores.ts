// Paleta fixa do kit (tokens crus de painel-editorial.css) — mesma cor sempre que a mesma
// posição alfabética se repete, sem precisar guardar cor por categoria no banco. Ciclo de 5:
// a 6ª categoria repete a cor da 1ª, mas na prática a lista de categorias tende a ser curta.
const PALETA = ['var(--blue)', 'var(--mint)', 'var(--orange)', 'var(--red)', 'var(--yellow)']

/** Cor determinística pra categoria, pela posição dela na lista ordenada alfabeticamente
 *  de todas as categorias em uso — mesma entrada, mesma cor, sem depender de cadastro. */
export function corDaCategoria(categoria: string, todasCategorias: string[]): string {
  const ordenadas = [...new Set(todasCategorias)].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  const idx = ordenadas.indexOf(categoria)
  return PALETA[idx < 0 ? 0 : idx % PALETA.length]
}
