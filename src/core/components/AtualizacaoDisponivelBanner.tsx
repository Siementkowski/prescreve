import { DatabaseZap, X } from 'lucide-react'
import { useState } from 'react'
import { useSyncStore } from '../sync'

/** Não intrusivo de propósito: uma faixa fina, sem bloquear nada, sem recarregar sozinho.
 *  A base mudou no servidor enquanto o app estava aberto — quem decide atualizar é você. */
export function AtualizacaoDisponivelBanner() {
  const atualizacaoDisponivel = useSyncStore((s) => s.atualizacaoDisponivel)
  const sincronizando = useSyncStore((s) => s.sincronizando)
  const sincronizar = useSyncStore((s) => s.sincronizar)
  const [dispensado, setDispensado] = useState(false)

  if (!atualizacaoDisponivel || dispensado) return null

  return (
    <div className="flex items-center justify-between gap-3 bg-accent/10 border-b border-accent/30 px-4 py-2 text-sm shrink-0">
      <span className="flex items-center gap-2 text-text">
        <DatabaseZap className="w-4 h-4 text-accent shrink-0" />
        A base foi atualizada. Os dados na tela podem estar desatualizados.
      </span>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => sincronizar({ forcar: true })}
          disabled={sincronizando}
          className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-accent-text text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors"
        >
          {sincronizando ? 'Atualizando…' : 'Atualizar'}
        </button>
        <button
          onClick={() => setDispensado(true)}
          className="text-text-dim hover:text-text transition-colors p-1"
          aria-label="Dispensar aviso"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
