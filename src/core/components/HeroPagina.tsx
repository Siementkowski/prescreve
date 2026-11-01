import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export interface MigalhaHero {
  label: string
  to?: string
}

/** Faixa azul de topo das telas de detalhe (ficha de medicamento, lista de classe, área e
 *  ficha de patologia): breadcrumb, título grande, subtítulo opcional e um slot pra o que
 *  cada tela precisa embaixo (campo de peso, chips, seletor de modo). Painel com sombra
 *  dura e círculos decorativos — o mesmo vocabulário do Painel Editorial. */
export function HeroPagina({
  migalhas,
  titulo,
  subtitulo,
  cor,
  children,
}: {
  migalhas: MigalhaHero[]
  titulo: string
  subtitulo?: string | null
  /** Cor do painel (ex.: a cor da classe do medicamento). Sem ela, usa o azul padrão. */
  cor?: string
  children?: ReactNode
}) {
  return (
    <div className="px-6 sm:px-9 pt-6">
      <div
        className="relative overflow-hidden ed-panel bg-accent text-white px-7 sm:px-10 py-8 shadow-[var(--shadow-area)]"
        style={cor ? { background: `color-mix(in srgb, ${cor} 85%, #000)` } : undefined}
      >
        <span className="pointer-events-none absolute -right-16 -bottom-24 w-72 h-72 rounded-full bg-white/10" />
        <span className="pointer-events-none absolute right-40 -top-20 w-44 h-44 rounded-full bg-white/5" />

        <div className="relative flex flex-col gap-4">
          <nav className="flex items-center gap-2 text-xs text-white/80 flex-wrap">
            {migalhas.map((m, i) => (
              <span key={`${m.label}-${i}`} className="flex items-center gap-2">
                {i > 0 && <span>/</span>}
                {m.to ? (
                  <Link to={m.to} className="hover:text-white">
                    {m.label}
                  </Link>
                ) : (
                  <span className="text-white">{m.label}</span>
                )}
              </span>
            ))}
          </nav>

          <div>
            <h1 className="font-display text-[40px] font-bold tracking-[-1.4px] leading-none">{titulo}</h1>
            {subtitulo && <p className="text-sm text-white/80 mt-2">{subtitulo}</p>}
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
