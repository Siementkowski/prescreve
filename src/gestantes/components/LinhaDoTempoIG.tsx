import { useEffect, useMemo, useRef, useState } from 'react'
import {
  MARCOS_IG,
  SEMANA_MAX_LINHA_DO_TEMPO,
  rotuloSemanasMarco,
  semanaFimEfetiva,
  statusDoMarco,
  LABEL_CATEGORIA_MARCO,
  CORES_CATEGORIA_MARCO,
  type CategoriaMarco,
  type MarcoIG,
} from '../dados/marcosIG'

const MAX = SEMANA_MAX_LINHA_DO_TEMPO
const CATEGORIAS = Object.keys(LABEL_CATEGORIA_MARCO) as CategoriaMarco[]
const TRIMESTRES = [
  { rotulo: '1º trimestre', de: 0, ate: 13 },
  { rotulo: '2º trimestre', de: 14, ate: 27 },
  { rotulo: '3º trimestre', de: 28, ate: MAX },
]
const TRACK_Y = 66
const DOT = 10
const GAP = 13
const EASE = 'cubic-bezier(.2,.7,.2,1)'

function pctNum(semanas: number): number {
  return (Math.max(0, Math.min(MAX, semanas)) / MAX) * 100
}
function pct(semanas: number): string {
  return `${pctNum(semanas)}%`
}

/** Linha do tempo visual de IG (0–42 semanas) — porta o componente `GestationTimeline` do
 *  design system (mockup entregue pelo usuário) pro app real, usando os dados já
 *  existentes em dados/marcosIG.ts em vez dos marcos de exemplo do mockup. Zonas de
 *  trimestre, pino "hoje" animado, trilho com trecho percorrido, marcos coloridos por
 *  categoria (empilham quando caem na mesma semana), toggle de categoria com contagem, e
 *  card de detalhe no hover com status (Período encerrado/atual/Em X semanas). Só itera
 *  `MARCOS_IG`: adicionar/editar um marco é mexer nos dados, nunca aqui. */
export function LinhaDoTempoIG({ semanas, dias = 0 }: { semanas: number | null; dias?: number }) {
  const [categoriasAtivas, setCategoriasAtivas] = useState<Set<CategoriaMarco>>(new Set(CATEGORIAS))
  const [hover, setHover] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [largura, setLargura] = useState(900)
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 30)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!stageRef.current) return
    const ro = new ResizeObserver(([e]) => setLargura(e.contentRect.width))
    ro.observe(stageRef.current)
    return () => ro.disconnect()
  }, [])

  const ga = semanas != null ? semanas + dias / 7 : null

  function alternarCategoria(cat: CategoriaMarco) {
    setCategoriasAtivas((atuais) => {
      const novo = new Set(atuais)
      if (novo.has(cat)) novo.delete(cat)
      else novo.add(cat)
      return novo
    })
  }

  const contagens = useMemo(
    () => Object.fromEntries(CATEGORIAS.map((c) => [c, MARCOS_IG.filter((m) => m.categoria === c).length])) as Record<CategoriaMarco, number>,
    []
  )

  const visiveis = useMemo(
    () => MARCOS_IG.filter((m) => categoriasAtivas.has(m.categoria)).sort((a, b) => a.semanaInicio - b.semanaInicio),
    [categoriasAtivas]
  )

  const placed = useMemo(() => {
    const stackIdx: Record<number, number> = {}
    return visiveis.map((m) => {
      const key = Math.round(m.semanaInicio)
      const i = (stackIdx[key] = (stackIdx[key] ?? -1) + 1)
      return { m, i }
    })
  }, [visiveis])

  const passo = largura < 520 ? 6 : largura < 820 ? 4 : 2
  const rotulos = useMemo(() => {
    const l: number[] = []
    for (let w = 0; w <= MAX; w += passo) l.push(w)
    if (passo === 2 && l[l.length - 1] !== MAX) l.push(MAX)
    return l
  }, [passo])

  const hoveredItem = hover ? placed.find((p) => p.m.chave === hover) : undefined
  const hoveredMarco = hoveredItem?.m

  return (
    <div
      className="bg-surface border border-border rounded-[var(--radius-panel,18px)] flex-1 min-w-0"
      style={{ padding: '20px 24px 18px', fontFamily: 'var(--font-body)' }}
    >
      <header className="flex items-center justify-between flex-wrap gap-x-5 gap-y-3 mb-3.5">
        <div className="flex items-center flex-wrap gap-x-4 gap-y-2.5">
          <h2 className="font-display text-[21px] font-semibold tracking-[-.7px] shrink-0 whitespace-nowrap m-0">
            Linha do tempo
          </h2>
          <div role="group" aria-label="Filtrar marcos por categoria" className="flex flex-wrap gap-1.5">
            {CATEGORIAS.map((cat) => {
              const ativo = categoriasAtivas.has(cat)
              const cor = CORES_CATEGORIA_MARCO[cat].cor
              return (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => alternarCategoria(cat)}
                  className={`flex items-center gap-[7px] whitespace-nowrap rounded-[var(--radius-pill,999px)] border text-xs transition-colors ${
                    ativo ? 'bg-text border-text text-bg' : 'border-border text-text-dim hover:text-text'
                  }`}
                  style={{ padding: '6px 11px 6px 9px' }}
                >
                  <span
                    className="w-[7px] h-[7px] rounded-full shrink-0"
                    style={{ background: ativo ? cor : 'transparent', boxShadow: `inset 0 0 0 1.5px ${cor}` }}
                  />
                  {LABEL_CATEGORIA_MARCO[cat]}
                  <span className={ativo ? 'opacity-60' : 'opacity-80'} style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {contagens[cat]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex gap-3.5 text-[11px] text-text-dim whitespace-nowrap">
          <span className="flex items-center gap-1.5">
            <span className="w-[7px] h-[7px] rounded-full bg-text-dim" />
            Período encerrado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-[7px] h-[7px] rounded-full" style={{ boxShadow: 'inset 0 0 0 1.5px var(--color-text-dim)' }} />
            Previsto
          </span>
        </div>
      </header>

      <div ref={stageRef} className="relative mx-1.5" style={{ height: 128 }} onMouseLeave={() => setHover(null)}>
        {/* ---- zonas de trimestre ---- */}
        {TRIMESTRES.map((t, i) => (
          <div
            key={t.rotulo}
            className="absolute"
            style={{
              top: 32,
              height: TRACK_Y - 32 + 4,
              left: pct(t.de),
              width: `calc(${pct(t.ate - t.de + (i < 2 ? 1 : 0))})`,
              borderLeft: i ? '1px dashed var(--color-border)' : 'none',
            }}
          />
        ))}

        {/* ---- pino "hoje" ---- */}
        {ga != null && (
          <div
            className="absolute z-[3] pointer-events-none"
            style={{ left: loaded ? pct(ga) : '0%', top: 0, bottom: 42, transition: `left 1.1s ${EASE}` }}
          >
            <div
              className="absolute top-0 left-0 -translate-x-1/2 flex items-baseline gap-[5px] whitespace-nowrap bg-text text-bg rounded-[var(--radius-pill,999px)] text-[11px] leading-none"
              style={{ padding: '4px 10px 5px' }}
            >
              <span className="font-display font-semibold text-[13px] tracking-[-.3px]">
                {semanas}s {dias}d
              </span>
              <span className="opacity-65">hoje</span>
            </div>
            <div className="absolute bg-text" style={{ top: 20, bottom: 0, left: -0.75, width: 1.5 }} />
          </div>
        )}

        {/* ---- trilho ---- */}
        <div
          className="absolute left-0 right-0 rounded-[var(--radius-pill,999px)] overflow-hidden"
          style={{ top: TRACK_Y - 4, height: 8, background: 'var(--color-surface-3)' }}
        >
          {ga != null && (
            <div
              className="absolute inset-0"
              style={{
                width: loaded ? pct(ga) : '0%',
                background: 'color-mix(in oklab, var(--color-text) 26%, var(--color-surface-3))',
                transition: `width 1.1s ${EASE}`,
              }}
            />
          )}
          {hoveredMarco && (
            <div
              className="absolute top-0 bottom-0 rounded-[var(--radius-pill,999px)]"
              style={{
                left: pct(hoveredMarco.semanaInicio),
                width: `max(6px, ${pct(semanaFimEfetiva(hoveredMarco) - hoveredMarco.semanaInicio)})`,
                background: CORES_CATEGORIA_MARCO[hoveredMarco.categoria].cor,
                opacity: 0.45,
              }}
            />
          )}
        </div>

        {/* ---- marcos ---- */}
        {placed.map(({ m, i }) => {
          const c = CORES_CATEGORIA_MARCO[m.categoria]
          const fim = semanaFimEfetiva(m)
          const passado = ga != null && ga > fim
          const atual = ga != null && ga >= m.semanaInicio && ga <= fim
          const isHover = hover === m.chave
          const tamanho = isHover ? DOT + 4 : DOT
          return (
            <button
              key={m.chave}
              type="button"
              aria-label={`${m.titulo}, ${rotuloSemanasMarco(m)}`}
              onMouseEnter={() => setHover(m.chave)}
              onFocus={() => setHover(m.chave)}
              onBlur={() => setHover(null)}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-[22px] h-[22px] p-0 border-0 bg-transparent grid place-items-center outline-none"
              style={{ left: pct(m.semanaInicio), top: TRACK_Y - i * GAP, zIndex: isHover ? 5 : 2 }}
            >
              <span
                className="rounded-full transition-all"
                style={{
                  width: tamanho,
                  height: tamanho,
                  background: passado ? c.cor : 'var(--color-surface)',
                  boxShadow: `0 0 0 2px var(--color-surface), inset 0 0 0 2px ${c.cor}${atual ? `, 0 0 0 5px ${c.suave}` : ''}`,
                  opacity: passado && !isHover ? 0.55 : 1,
                }}
              />
            </button>
          )
        })}

        {/* ---- marcações de semana ---- */}
        {Array.from({ length: MAX + 1 }, (_, w) => (
          <div
            key={w}
            className="absolute"
            style={{
              left: pct(w),
              top: TRACK_Y + 8,
              width: 1,
              height: w % 2 ? 3 : 5,
              background: ga != null && w <= ga ? 'var(--color-border-strong)' : 'var(--color-border)',
            }}
          />
        ))}

        {/* ---- rótulos de semana ---- */}
        {rotulos.map((w) => {
          const perto = ga != null && Math.abs(w - ga) < 0.6
          return (
            <div
              key={w}
              className="absolute -translate-x-1/2"
              style={{
                left: pct(w),
                top: TRACK_Y + 16,
                fontSize: 11,
                fontVariantNumeric: 'tabular-nums',
                color: perto ? 'var(--color-text)' : 'var(--color-text-dim)',
                fontWeight: perto ? 600 : 400,
              }}
            >
              {w}
            </div>
          )
        })}

        {/* ---- rótulos de trimestre ---- */}
        {TRIMESTRES.map((t) => {
          const atual = ga != null && ga >= t.de && ga < t.ate + 1
          return (
            <div
              key={t.rotulo}
              className="absolute whitespace-nowrap uppercase"
              style={{
                left: pct(t.de),
                top: TRACK_Y + 40,
                paddingLeft: t.de ? 6 : 0,
                fontSize: 10,
                letterSpacing: '1.2px',
                color: atual ? 'var(--color-text)' : 'var(--color-text-dim)',
                fontWeight: atual ? 600 : 400,
              }}
            >
              {t.rotulo}
            </div>
          )
        })}

        {/* ---- card de detalhe (hover) ---- */}
        {hoveredMarco && hoveredItem && ga != null && (
          <CardMarco marco={hoveredMarco} indiceEmpilhado={hoveredItem.i} ga={ga} />
        )}
      </div>
    </div>
  )
}

function CardMarco({ marco, indiceEmpilhado, ga }: { marco: MarcoIG; indiceEmpilhado: number; ga: number }) {
  const c = CORES_CATEGORIA_MARCO[marco.categoria]
  const { rotulo, status } = statusDoMarco(marco, ga)
  const x = marco.semanaInicio / MAX
  const alinhamento = x < 0.18 ? '0%' : x > 0.82 ? '-100%' : '-50%'
  const deslocamento = x < 0.18 ? -14 : x > 0.82 ? 14 : 0

  return (
    <div
      role="tooltip"
      className="absolute bg-surface border border-border rounded-[var(--radius-card,14px)] shadow-[var(--shadow-popover,0_14px_32px_rgba(0,0,0,.2))] pointer-events-none z-10"
      style={{
        left: `calc(${pct(marco.semanaInicio)} + ${deslocamento}px)`,
        top: TRACK_Y - indiceEmpilhado * GAP - 16,
        transform: `translate(${alinhamento}, -100%)`,
        width: 256,
        padding: '13px 15px 14px',
      }}
    >
      <div className="flex items-center justify-between gap-2.5 mb-2">
        <span
          className="flex items-center gap-1.5 uppercase font-semibold"
          style={{ fontSize: 10, letterSpacing: '1.2px', color: c.cor }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.cor }} />
          {LABEL_CATEGORIA_MARCO[marco.categoria]}
        </span>
        <span
          className="text-[11px] rounded-[var(--radius-pill,999px)] px-2 py-0.5 whitespace-nowrap"
          style={{
            background: status === 'atual' ? 'var(--color-text)' : 'var(--color-surface-2)',
            color: status === 'atual' ? 'var(--color-bg)' : 'var(--color-text-dim)',
          }}
        >
          {rotulo}
        </span>
      </div>
      <div className="font-display text-base font-semibold tracking-[-.4px] leading-tight">{marco.titulo}</div>
      <div className="text-xs text-text-dim mt-0.5" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {rotuloSemanasMarco(marco)}
      </div>
      <p className="text-[13px] leading-relaxed text-text-dim mt-2 mb-0">{marco.descricao}</p>
    </div>
  )
}
