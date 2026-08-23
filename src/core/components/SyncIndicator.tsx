import { useEffect, useState } from 'react'
import { RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { useSyncStore } from '../sync'
import { tempoRelativo } from './tempoRelativo'

/** Indicador discreto e permanente — mora no header, visível em qualquer tela do app.
 *  Mostra online/offline, quando foi a última sincronização, e deixa forçar uma nova. */
export function SyncIndicator() {
  const online = useSyncStore((s) => s.online)
  const sincronizando = useSyncStore((s) => s.sincronizando)
  const ultimaSincronizacao = useSyncStore((s) => s.ultimaSincronizacao)
  const sincronizar = useSyncStore((s) => s.sincronizar)

  // Re-renderiza a cada 30s só pra "há 2 min" virar "há 3 min" sem precisar de interação.
  const [, forcarRender] = useState(0)
  useEffect(() => {
    const id = setInterval(() => forcarRender((n) => n + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="flex items-center gap-1.5 text-[11px] text-text-dim rounded-[var(--radius-nav,10px)] px-2.5 py-2 border border-border bg-surface"
      title={online ? 'Online' : 'Offline'}
    >
      {online ? <Wifi className="w-3.5 h-3.5 text-ok shrink-0" /> : <WifiOff className="w-3.5 h-3.5 text-danger shrink-0" />}
      <span className="min-w-0 leading-tight">
        {online ? 'Online' : 'Offline'}
        {ultimaSincronizacao && ` · sincronizado ${tempoRelativo(ultimaSincronizacao)}`}
        {!ultimaSincronizacao && ' · nunca sincronizado'}
      </span>
      <button
        onClick={() => sincronizar({ forcar: true })}
        disabled={!online || sincronizando}
        title="Forçar sincronização"
        className="ml-auto shrink-0 text-text-dim hover:text-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${sincronizando ? 'animate-spin' : ''}`} />
      </button>
    </div>
  )
}
