import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Maximize2, Minimize2 } from 'lucide-react'
import type { Fluxograma } from '../admin/types'
import { HtmlSandbox } from '../core/components/HtmlSandbox'

/** Abas + sandbox + tela cheia — mesmo padrão de visualização já usado nos Geradores de
 *  anamnese (AnamnesePage.tsx), generalizado aqui pra aceitar qualquer lista de
 *  Fluxograma[] via prop. Reaproveitado tanto em /fluxogramas quanto nas condutas
 *  pediátricas (Pediatria → Condutas), que só passam a lista já filtrada por categoria. */
export function FluxogramaViewer({ fluxogramas, titulo }: { fluxogramas: Fluxograma[]; titulo?: string }) {
  const [listaAberta, setListaAberta] = useState(false)
  const seletorRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    if (!listaAberta) return
    function aoClicarFora(e: MouseEvent) {
      if (!seletorRef.current?.contains(e.target as Node)) setListaAberta(false)
    }
    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [listaAberta])

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
      <div className="flex items-center gap-4 shrink-0 flex-wrap">
        {titulo && <h1 className="font-display text-[26px] tracking-[-.8px] text-text">{titulo}</h1>}
        {fluxogramas.length > 1 && (
          <div ref={seletorRef} className="relative">
            <button
              type="button"
              onClick={() => setListaAberta((v) => !v)}
              className="flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-lg border bg-accent-dim border-accent text-accent"
            >
              {selecionado?.titulo}
              <ChevronDown className={`w-4 h-4 transition-transform ${listaAberta ? 'rotate-180' : ''}`} />
            </button>
            {listaAberta && (
              <ul className="absolute left-0 top-full mt-1.5 z-20 min-w-full w-max max-w-[min(90vw,420px)] rounded-xl border border-border bg-surface shadow-[var(--shadow-float,0_4px_14px_rgba(17,17,17,.08))] p-1">
                {fluxogramas.map((f) => (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelecionadoId(f.id)
                        setListaAberta(false)
                      }}
                      className="w-full flex items-center justify-between gap-3 px-3 py-2 text-sm text-left rounded-lg text-text hover:bg-accent-dim"
                    >
                      {f.titulo}
                      {selecionado?.id === f.id && <Check className="w-4 h-4 text-accent shrink-0" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

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
            <HtmlSandbox key={selecionado.id} html={selecionado.html ?? undefined} url={selecionado.url ?? undefined} className="h-full" />
          </div>
        </>
      )}
    </div>
  )
}
