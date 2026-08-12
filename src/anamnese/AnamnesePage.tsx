import { useMemo, useState } from 'react'
import { FileText } from 'lucide-react'
import { useSyncStore } from '../core/sync'
import { HtmlSandbox } from '../core/components/HtmlSandbox'

/** Geradores de anamnese — HTML+JS colado no admin, cacheado offline junto do resto da
 *  base (core/sync) e executado sempre isolado (HtmlSandbox). Nunca lista inativo. */
export function AnamnesePage() {
  const geradoresTodos = useSyncStore((s) => s.geradores)
  const carregandoInicial = useSyncStore((s) => s.carregandoInicial)
  const [selecionadoId, setSelecionadoId] = useState<number | null>(null)

  const geradores = useMemo(
    () => geradoresTodos.filter((g) => g.ativo).sort((a, b) => a.ordem - b.ordem),
    [geradoresTodos]
  )

  const selecionado = geradores.find((g) => g.id === selecionadoId) ?? geradores[0] ?? null

  if (carregandoInicial) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-text-dim">Carregando base…</p>
      </div>
    )
  }

  if (geradores.length === 0) {
    return (
      <div className="h-full flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <FileText className="w-8 h-8 text-text-faint mx-auto mb-3" />
          <p className="text-sm text-text-dim">
            Nenhum gerador de anamnese ativo ainda. Cadastre um em Painel → Geradores.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      {geradores.length > 1 && (
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border shrink-0 overflow-x-auto">
          {geradores.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelecionadoId(g.id)}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap ${
                selecionado?.id === g.id
                  ? 'bg-accent-dim border-accent text-accent'
                  : 'bg-surface border-border text-text-dim hover:text-text hover:border-text-dim'
              }`}
            >
              {g.nome}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {selecionado && (
          <div className="max-w-3xl mx-auto flex flex-col gap-3">
            {selecionado.descricao && <p className="text-sm text-text-dim">{selecionado.descricao}</p>}
            <div className="border border-border rounded-xl overflow-hidden bg-white">
              <HtmlSandbox html={selecionado.html} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
