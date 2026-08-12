import { useEffect, useMemo, useRef, useState } from 'react'
import { FileText, Maximize2, Minimize2 } from 'lucide-react'
import { useSyncStore } from '../core/sync'
import { HtmlSandbox } from '../core/components/HtmlSandbox'

/** Geradores de anamnese — HTML+JS colado no admin, cacheado offline junto do resto da
 *  base (core/sync) e executado sempre isolado (HtmlSandbox). Nunca lista inativo. */
export function AnamnesePage() {
  const geradoresTodos = useSyncStore((s) => s.geradores)
  const carregandoInicial = useSyncStore((s) => s.carregandoInicial)
  const [selecionadoId, setSelecionadoId] = useState<number | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [emTelaCheia, setEmTelaCheia] = useState(false)

  const geradores = useMemo(
    () => geradoresTodos.filter((g) => g.ativo).sort((a, b) => a.ordem - b.ordem),
    [geradoresTodos]
  )

  const selecionado = geradores.find((g) => g.id === selecionadoId) ?? geradores[0] ?? null

  // Esc já sai do fullscreen sozinho (comportamento nativo do navegador) — só precisamos
  // escutar a mudança pra saber que estado o ícone do botão deve mostrar.
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

      {/* Só este contêiner rola (quando o postMessage de altura faz o gerador crescer além
          da viewport) — por padrão, sem medição, o gerador preenche exatamente o espaço
          disponível e quem rola é o próprio iframe por dentro. Nunca os dois ao mesmo tempo. */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {selecionado && (
          <>
            {selecionado.descricao && <p className="text-sm text-text-dim shrink-0">{selecionado.descricao}</p>}
            <div
              // Sem overflow-hidden aqui de propósito: um overflow-hidden clicaria o iframe
              // no tamanho do flex-basis em vez de deixar o wrapper crescer com ele — é
              // assim que a página passa a rolar quando o postMessage reporta uma altura
              // maior que a viewport. O arredondamento visual já vem do próprio iframe
              // (rounded-lg no HtmlSandbox), não precisa duplicar aqui.
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
    </div>
  )
}
