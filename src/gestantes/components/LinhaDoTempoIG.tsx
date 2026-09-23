import { MARCOS_IG, SEMANA_MAX_LINHA_DO_TEMPO, rotuloSemanasMarco } from '../dados/marcosIG'

const CORES = [
  'var(--color-cat-patologias)',
  'var(--color-cat-areas)',
  'var(--color-warn)',
  'var(--color-cat-medicamentos)',
  'var(--color-danger)',
  'var(--color-accent)',
  'var(--color-cat-tratamentos)',
]

function pct(semanas: number): number {
  return Math.min(100, Math.max(0, (semanas / SEMANA_MAX_LINHA_DO_TEMPO) * 100))
}

/** Linha do tempo visual de IG (0–42 semanas) — marcador da posição atual + marcos ao
 *  longo da linha (AAS, TOTG, USG morfológico, EGB, anti-D, dTpa, VSR...). Só itera
 *  `MARCOS_IG` (dados/marcosIG.ts): adicionar/editar um marco é mexer só nos dados, nunca
 *  neste componente. Versão inicial simples — ajustar visual depois de simular no app. */
export function LinhaDoTempoIG({ semanaAtual }: { semanaAtual: number | null }) {
  return (
    <div className="bg-surface border border-border rounded-[var(--radius-card,14px)] p-3.5 flex flex-col gap-4 flex-1 min-w-0">
      <h2 className="font-display text-[13px] font-semibold">Linha do tempo — 0 a 42 semanas</h2>

      <div className="relative pt-5 pb-1">
        {/* ---- pino da IG atual ---- */}
        {semanaAtual != null && (
          <div
            className="absolute -top-0.5 flex flex-col items-center -translate-x-1/2"
            style={{ left: `${pct(semanaAtual)}%` }}
          >
            <span className="text-[10px] font-bold text-accent whitespace-nowrap">{semanaAtual}s</span>
            <span className="w-0.5 h-3 bg-accent rounded-full mt-0.5" />
          </div>
        )}

        {/* ---- barra ---- */}
        <div className="relative h-1.5 bg-surface-2 rounded-full border border-border">
          {semanaAtual != null && (
            <div
              className="absolute inset-y-0 left-0 bg-accent/30 rounded-full"
              style={{ width: `${pct(semanaAtual)}%` }}
            />
          )}

          {/* ---- marcos ---- */}
          {MARCOS_IG.map((m, i) => {
            const cor = CORES[i % CORES.length]
            const inicio = pct(m.semanaInicio)
            const fim = m.semanaFim != null ? pct(m.semanaFim) : inicio
            const ehFaixa = fim > inicio
            return ehFaixa ? (
              <div
                key={m.chave}
                className="absolute inset-y-0 rounded-full"
                style={{ left: `${inicio}%`, width: `${fim - inicio}%`, backgroundColor: cor, opacity: 0.55 }}
                title={`${m.titulo} — ${rotuloSemanasMarco(m)}`}
              />
            ) : (
              <div
                key={m.chave}
                className="absolute top-1/2 w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 border border-surface"
                style={{ left: `${inicio}%`, backgroundColor: cor }}
                title={`${m.titulo} — ${rotuloSemanasMarco(m)}`}
              />
            )
          })}
        </div>

        {/* ---- réguas 0/10/20/30/40 ---- */}
        <div className="relative h-3 mt-1">
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

      {/* ---- legenda ---- */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {MARCOS_IG.map((m, i) => (
          <div key={m.chave} className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CORES[i % CORES.length] }} />
            <span className="text-[11px] text-text-dim truncate">
              <span className="text-text font-medium">{m.titulo}</span> — {rotuloSemanasMarco(m)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
