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
  { rotulo: '1º trimestre', de: 0, ate: 14, faixa: '0s-13s6d' },
  { rotulo: '2º trimestre', de: 14, ate: 27, faixa: '14s-26s6d' },
  { rotulo: '3º trimestre', de: 27, ate: MAX, faixa: '27s-41s6d' },
]
const TRACK_Y = 66
const DOT = 10
const ALTURA_LINHA_MARCO = 20
const NUDGE_MARCO_X = 1
const EASE = 'cubic-bezier(.2,.7,.2,1)'

// Em telas com escala fracionária (125%/150% no Windows, comum em notebook), 1px de CSS
// não corresponde a 1 pixel físico — uma linha de 1px cai num sub-pixel do monitor
// diferente dependendo de onde ela está na tela, e cada posição fica com uma nitidez/
// espessura ligeiramente diferente depois do antialiasing. `snapPx` arredonda pro pixel
// físico mais próximo (via devicePixelRatio) antes de voltar pra CSS px, garantindo que a
// linha caia sempre num número inteiro de pixels físicos — mesma espessura em qualquer
// posição da linha do tempo.
const DPR = typeof window !== 'undefined' && window.devicePixelRatio ? window.devicePixelRatio : 1
function snapPx(valorCss: number): number {
  return Math.round(valorCss * DPR) / DPR
}
// Deslocamento pra centralizar um elemento de `larguraCss` sobre o ponto 0 do pai — usar
// isso em vez de `transform: translateX(-50%)` é o que garante que a linha (centralizada
// pela própria largura, já em px físico) e o círculo (centralizado pela largura do botão,
// 22px, que sozinha não cai num múltiplo de pixel físico) acabem exatamente no mesmo
// pixel físico. Com -50% cada um arredondava pro pixel físico mais próximo por conta
// própria — quase sempre o mesmo, mas não sempre, daí a linha parecer "desalinhada" do
// centro do círculo em alguns marcos.
function deslocamentoCentralizado(larguraCss: number): number {
  return -snapPx(larguraCss / 2)
}
const LARGURA_LINHA_MARCO = Math.max(1, Math.round(1 * DPR)) / DPR

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

  // Posição em px físico (não %, nem só px de CSS) pras linhas finas dos marcos — em % +
  // translateX(-50%), cada marco cai num sub-pixel diferente (e isso muda com a largura
  // exata do container, ex: F12 aberto encolhendo a viewport) e o navegador antialiasa
  // cada um de um jeito, fazendo a mesma linha de 1.5px parecer com espessuras diferentes
  // de marco pra marco. `snapPx` trava no pixel físico da tela, sempre.
  function pctPx(semanas: number): number {
    return snapPx((pctNum(semanas) / 100) * largura)
  }

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

      <div ref={stageRef} className="relative mx-1.5" style={{ height: 144 }} onMouseLeave={() => setHover(null)}>
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
              className="absolute left-0 rounded-[var(--radius-pill,999px)]"
              style={{
                top: '50%',
                height: '50%',
                transform: 'translateY(-50%)',
                width: loaded ? pct(ga) : '0%',
                background: '#000',
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

        {/* ---- linhas dos marcos — sempre atrás de TODOS os círculos (2 passadas: linhas
            primeiro, círculos depois), senão a linha mais alta de um marco empilhado
            passa visualmente por cima dos círculos dos marcos abaixo dele na mesma
            semana. Altura de 20px (fixa) + 10px por marco empilhado na mesma semana. ---- */}
        {placed.map(({ m, i }) => {
          const alturaLinha = ALTURA_LINHA_MARCO + i * 10
          const topoLinha = TRACK_Y - 4 - alturaLinha
          const offsetLinha = deslocamentoCentralizado(LARGURA_LINHA_MARCO)
          return (
            <div
              key={m.chave}
              className="absolute pointer-events-none"
              style={{ left: pctPx(m.semanaInicio) + NUDGE_MARCO_X, top: 0, zIndex: 1 }}
            >
              <div
                className="absolute"
                style={{
                  left: offsetLinha,
                  top: topoLinha,
                  height: alturaLinha,
                  width: LARGURA_LINHA_MARCO,
                  background: 'var(--color-border-strong)',
                }}
              />
            </div>
          )
        })}

        {/* ---- círculos dos marcos — sempre preenchidos com a cor da categoria.
            Selecionado (hover): ganha um contorno preto de 1px por fora do halo branco.
            O centro se alinha ao centro REAL da linha (que já é arredondada pro pixel
            físico pra ficar nítida — isso desloca o centro dela em meio pixel, inerente a
            uma linha de largura ímpar nítida — recalcular o centro do zero aqui deixaria
            os dois "certos" isoladamente mas desencontrados um do outro). ---- */}
        {placed.map(({ m, i }) => {
          const c = CORES_CATEGORIA_MARCO[m.categoria]
          const isHover = hover === m.chave
          const tamanho = isHover ? DOT + 4 : DOT
          const alturaLinha = ALTURA_LINHA_MARCO + i * 10
          const topoLinha = TRACK_Y - 4 - alturaLinha
          const offsetLinha = deslocamentoCentralizado(LARGURA_LINHA_MARCO)
          const centroX = offsetLinha + LARGURA_LINHA_MARCO / 2
          return (
            <div
              key={m.chave}
              className="absolute pointer-events-none"
              style={{ left: pctPx(m.semanaInicio) + NUDGE_MARCO_X, top: 0, zIndex: isHover ? 5 : 2 }}
            >
              <button
                type="button"
                aria-label={`${m.titulo}, ${rotuloSemanasMarco(m)}`}
                onMouseEnter={() => setHover(m.chave)}
                onFocus={() => setHover(m.chave)}
                onBlur={() => setHover(null)}
                className="absolute -translate-y-1/2 w-[22px] h-[22px] p-0 border-0 bg-transparent grid place-items-center outline-none pointer-events-auto"
                style={{ left: centroX - 11, top: topoLinha }}
              >
                <span
                  className="rounded-full transition-all"
                  style={{
                    width: tamanho,
                    height: tamanho,
                    background: c.cor,
                    boxShadow: isHover
                      ? '0 0 0 2px var(--color-surface), 0 0 0 3px #000'
                      : '0 0 0 2px var(--color-surface)',
                  }}
                />
              </button>
            </div>
          )
        })}

        {/* ---- marcações de semana ---- */}
        {Array.from({ length: MAX + 1 }, (_, w) => (
          <div
            key={w}
            className="absolute -translate-x-1/2"
            style={{
              left: pctPx(w),
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

        {/* ---- rótulos de trimestre — centralizados na própria faixa, com a janela de
            semanas entre parênteses embaixo ---- */}
        {TRIMESTRES.map((t) => {
          const atual = ga != null && ga >= t.de && ga < t.ate + 1
          return (
            <div
              key={t.rotulo}
              className="absolute -translate-x-1/2 whitespace-nowrap text-center"
              style={{
                left: pct((t.de + t.ate) / 2),
                top: TRACK_Y + 40,
                color: atual ? 'var(--color-text)' : 'var(--color-text-dim)',
              }}
            >
              <div className="uppercase" style={{ fontSize: 10, letterSpacing: '1.2px', fontWeight: atual ? 600 : 400 }}>
                {t.rotulo}
              </div>
              <div style={{ fontSize: 10, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>({t.faixa})</div>
            </div>
          )
        })}

        {/* ---- card de detalhe (hover) ---- */}
        {hoveredMarco && ga != null && <CardMarco marco={hoveredMarco} ga={ga} />}
      </div>
    </div>
  )
}

function CardMarco({ marco, ga }: { marco: MarcoIG; ga: number }) {
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
        // Abre pra baixo do trilho/réguas (não pra cima) — perto do topo da página, um
        // card que sobe pode ficar atrás da topbar fixa do app.
        top: TRACK_Y + 54,
        transform: `translateX(${alinhamento})`,
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
