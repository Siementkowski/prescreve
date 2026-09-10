import { useEffect, useRef, useState } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'
import type { Fluxograma } from '../admin/types'
import { HtmlSandbox } from '../core/components/HtmlSandbox'

/** Abas + sandbox + tela cheia — mesmo padrão de visualização já usado nos Geradores de
 *  anamnese (AnamnesePage.tsx), generalizado aqui pra aceitar qualquer lista de
 *  Fluxograma[] via prop. Reaproveitado tanto em /fluxogramas quanto nas condutas
 *  pediátricas (Pediatria → Condutas), que só passam a lista já filtrada por categoria. */
export function FluxogramaViewer({ fluxogramas }: { fluxogramas: Fluxograma[] }) {
  const [selecionadoId, setSelecionadoId] = useState<number | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [emTelaCheia, setEmTelaCheia] = useState(false)

  const selecionado = fluxogramas.find((f) => f.id === selecionadoId) ?? fluxogramas[0] ?? null

  useEffect(() => {
    function aoMudarFullscreen() {
      setEmTelaCheia(document.fullscreenElement === wrapperRef.current)
    }
    document.addEventListener('fullscreenchange', aoMudarFullscreen)
    return () => document.removeEventListener('fullscreenchange', aoMudarFullscreen)
  }, [])

  function alternarTelaCheia() {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      wrapperRef.current?.requestFullscreen()
    }
  }

  if (fluxogramas.length === 0) {
    return <p className="text-sm text-text-dim px-1">Nenhum fluxograma nessa categoria ainda.</p>
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-3">
      {fluxogramas.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
          {fluxogramas.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelecionadoId(f.id)}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap ${
                selecionado?.id === f.id
                  ? 'bg-accent-dim border-accent text-accent'
                  : 'bg-surface border-border text-text-dim hover:text-text hover:border-text-dim'
              }`}
            >
              {f.titulo}
            </button>
          ))}
        </div>
      )}

      {selecionado && (
        <>
          {selecionado.descricao && <p className="text-sm text-text-dim shrink-0">{selecionado.descricao}</p>}
          <div
            ref={wrapperRef}
            className={`relative flex-1 min-h-0 rounded-xl border border-border ${
              emTelaCheia ? 'bg-white p-0' : 'bg-white'
            }`}
          >
            <button
              type="button"
              onClick={alternarTelaCheia}
              title={emTelaCheia ? 'Sair da tela cheia (Esc)' : 'Tela cheia'}
              className="absolute top-2 right-2 z-10 flex items-center justify-center w-8 h-8 rounded-lg bg-surface/90 border border-border text-text-dim hover:text-text hover:bg-surface transition-colors backdrop-blur-sm"
            >
              {emTelaCheia ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <HtmlSandbox html={selecionado.html} className="h-full" />
          </div>
        </>
      )}
    </div>
  )
}
