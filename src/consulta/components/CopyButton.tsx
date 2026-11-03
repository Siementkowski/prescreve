import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopyButton({
  texto,
  label = 'Copiar',
  variant = 'ghost',
  className,
}: {
  texto: string
  label?: string
  variant?: 'ghost' | 'solid' | 'primario'
  className?: string
}) {
  const [copiado, setCopiado] = useState(false)

  async function copiar(e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1600)
    } catch {
      // Sem permissão de clipboard — silenciosamente ignora, botão não muda de estado.
    }
  }

  const base = 'inline-flex items-center gap-1.5 text-xs font-medium rounded-md px-2.5 py-1.5 transition-colors shrink-0'
  const raio = variant === 'primario' ? 'rounded-[var(--radius-input,9px)] font-semibold' : ''
  const estilos =
    variant === 'primario'
      ? copiado
        ? 'bg-ok text-white'
        : 'bg-text hover:opacity-90 text-bg'
      : variant === 'solid'
      ? copiado
        ? 'bg-ok text-white'
        : 'bg-accent hover:bg-accent/90 text-accent-text'
      : copiado
        ? 'bg-ok/15 text-ok border border-ok/40'
        : 'bg-surface-2 hover:bg-border text-text-dim hover:text-text border border-border'

  return (
    <button type="button" onClick={copiar} disabled={!texto} className={`${base} ${raio} ${estilos} ${className ?? ''}`}>
      {copiado ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Copiado!
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          {label}
        </>
      )}
    </button>
  )
}
