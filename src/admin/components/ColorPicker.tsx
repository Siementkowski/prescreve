export const CORES_PALETA = [
  '#3ba7ff', // accent
  '#4caf7d', // ok
  '#e0a63a', // warn
  '#ef5350', // danger
  '#a78bfa', // roxo
  '#f472b6', // rosa
  '#22d3ee', // ciano
  '#fb923c', // laranja
  '#84cc16', // verde-lima
  '#94a3b8', // cinza
  '#6366f1', // índigo
  '#8b5cf6', // violeta
  '#d946ef', // magenta
  '#ec4899', // pink
  '#f43f5e', // rosé
  '#dc2626', // vermelho escuro
  '#c2410c', // terracota
  '#d97706', // âmbar
  '#ca8a04', // dourado
  '#65a30d', // verde-oliva
  '#16a34a', // verde
  '#059669', // esmeralda
  '#0d9488', // teal
  '#0891b2', // azul-petróleo
  '#0284c7', // azul
  '#2563eb', // azul-royal
  '#4f46e5', // azul-índigo
  '#7c3aed', // roxo-escuro
  '#334155', // ardósia
  '#57534e', // marrom-acinzentado
]

export function ColorPicker({
  valor,
  onChange,
}: {
  valor: string | null
  onChange: (cor: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CORES_PALETA.map((cor) => (
        <button
          key={cor}
          type="button"
          title={cor}
          onClick={() => onChange(cor)}
          style={{ backgroundColor: cor }}
          className={`w-6 h-6 rounded-full border-2 transition-transform ${
            valor === cor ? 'border-text scale-110' : 'border-transparent hover:scale-105'
          }`}
        />
      ))}
    </div>
  )
}
