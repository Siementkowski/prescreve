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
