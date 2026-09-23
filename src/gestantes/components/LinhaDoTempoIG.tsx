import { useState } from 'react'
import { MARCOS_IG, SEMANA_MAX_LINHA_DO_TEMPO, rotuloSemanasMarco } from '../dados/marcosIG'

function pct(semanas: number): number {
  return Math.min(100, Math.max(0, (semanas / SEMANA_MAX_LINHA_DO_TEMPO) * 100))
}

/** Linha do tempo visual de IG (0–42 semanas) — trilho branco, indicador da IG atual
 *  branco e cintilante (se diferencia do trilho por brilho, não por cor), marcos como
 *  marcações discretas em preto, sem texto visível por padrão. Passar o mouse na linha
 *  acende o trilho; passar exatamente sobre um marco revela um card com o nome e a janela
 *  de semanas, acima da linha. Só itera `MARCOS_IG` (dados/marcosIG.ts): adicionar/editar
 *  um marco é mexer só nos dados, nunca neste componente. */
export function LinhaDoTempoIG({ semanaAtual }: { semanaAtual: number | null }) {
  const [hoverLinha, setHoverLinha] = useState(false)
  const [marcoAtivo, setMarcoAtivo] = useState<string | null>(null)

  return (
    <div className="bg-surface border border-border rounded-[var(--radius-card,14px)] p-3.5 flex flex-col gap-5 flex-1 min-w-0">
      <h2 className="font-display text-[13px] font-semibold">Linha do tempo — 0 a 42 semanas</h2>

      <div className="relative pt-8 pb-1">
        {/* ---- indicador da IG atual — branco, cintilante ---- */}
        {semanaAtual != null && (
          <div
            className="absolute top-2 flex flex-col items-center -translate-x-1/2 pointer-events-none z-10"
            style={{ left: `${pct(semanaAtual)}%` }}
          >
            <span className="text-[10px] font-bold text-text whitespace-nowrap mb-1.5">{semanaAtual}s</span>
            <span className="relative flex items-center justify-center w-3.5 h-3.5">
              <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-60" />
              <span className="relative w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_3px_rgba(255,255,255,0.95)] ring-1 ring-black/15" />
            </span>
          </div>
        )}

        {/* ---- trilho ---- */}
        <div
          onMouseEnter={() => setHoverLinha(true)}
          onMouseLeave={() => {
            setHoverLinha(false)
            setMarcoAtivo(null)
          }}
          className={`relative h-3 bg-white rounded-full border transition-shadow duration-200 ${
            hoverLinha
              ? 'border-white shadow-[0_0_16px_3px_rgba(255,255,255,0.85)]'
              : 'border-[var(--color-border-strong)]'
          }`}
        >
          {/* ---- marcos — discretos, em preto ---- */}
          {MARCOS_IG.map((m) => {
            const inicio = pct(m.semanaInicio)
            const fim = m.semanaFim != null ? pct(m.semanaFim) : inicio
            const ehFaixa = fim > inicio
            const centro = (inicio + fim) / 2
            const ativo = marcoAtivo === m.chave

            return (
              <div key={m.chave}>
                {ehFaixa ? (
                  <div
                    onMouseEnter={() => setMarcoAtivo(m.chave)}
                    onMouseLeave={() => setMarcoAtivo(null)}
                    className={`absolute inset-y-0.5 rounded-full bg-black cursor-default transition-opacity ${
                      ativo ? 'opacity-70' : 'opacity-30'
                    }`}
                    style={{ left: `${inicio}%`, width: `${Math.max(fim - inicio, 1)}%` }}
                  />
                ) : (
                  <div
                    onMouseEnter={() => setMarcoAtivo(m.chave)}
                    onMouseLeave={() => setMarcoAtivo(null)}
                    className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black cursor-default transition-all ${
                      ativo ? 'w-3 h-3 opacity-90' : 'w-1.5 h-1.5 opacity-40'
                    }`}
                    style={{ left: `${inicio}%` }}
                  />
                )}

                {ativo && (
                  <div
                    className="absolute bottom-[calc(100%+10px)] -translate-x-1/2 bg-text text-bg text-xs rounded-[var(--radius-item,11px)] px-3 py-2 whitespace-nowrap shadow-lg z-20 pointer-events-none"
                    style={{ left: `${centro}%` }}
                  >
                    <span className="font-semibold">{m.titulo}</span>
                    <span className="opacity-75"> — {rotuloSemanasMarco(m)}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ---- réguas 0/10/20/30/40 ---- */}
        <div className="relative h-3 mt-1.5">
          {[0, 10, 20, 30, 40].map((s) => (
            <span
              key={s}
              className="absolute text-[9px] text-text-dim -translate-x-1/2"
              style={{ left: `${pct(s)}%` }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
