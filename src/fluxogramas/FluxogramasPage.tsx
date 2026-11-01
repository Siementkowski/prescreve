import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ChevronRight, Workflow } from 'lucide-react'
import { useSyncStore } from '../core/sync'
import { SearchInput } from '../admin/components/SearchInput'
import { HeroPagina } from '../core/components/HeroPagina'
import type { Fluxograma } from '../admin/types'
import { corDaCategoria } from '../materiais/cores'
import { FluxogramaViewer } from './FluxogramaViewer'

const porTitulo = (a: Fluxograma, b: Fluxograma) => a.titulo.localeCompare(b.titulo, 'pt-BR')

/** Fluxogramas — aba do USUÁRIO, só leitura, no mesmo desenho de Medicamentos: grade de áreas
 *  (/fluxogramas), lista da área escolhida (/fluxogramas?categoria=…) e o fluxograma aberto
 *  em /fluxogramas/:id. Usa o cache offline-first (useSyncStore). Quem cadastra é o editor
 *  (Painel → Fluxogramas). */
export function FluxogramasPage() {
  const carregandoInicial = useSyncStore((s) => s.carregandoInicial)
  const fluxogramas = useSyncStore((s) => s.fluxogramas)
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const categoriaAberta = searchParams.get('categoria')
  const [busca, setBusca] = useState('')

  const todasCategorias = useMemo(() => fluxogramas.map((f) => f.categoria), [fluxogramas])

  const areas = useMemo(() => {
    const mapa = new Map<string, Fluxograma[]>()
    for (const f of fluxogramas) mapa.set(f.categoria, [...(mapa.get(f.categoria) ?? []), f])
    return [...mapa.entries()]
      .map(([nome, lista]) => ({ nome, lista: lista.sort(porTitulo) }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  }, [fluxogramas])

  if (carregandoInicial) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-text-dim">Carregando base…</p>
      </div>
    )
  }

  // Fluxograma aberto
  if (id) {
    const f = fluxogramas.find((x) => String(x.id) === id)
    if (!f) {
      return (
        <div className="h-full flex flex-col items-center justify-center gap-2">
          <p className="text-sm text-text-dim">Fluxograma não encontrado.</p>
          <Link to="/fluxogramas" className="text-sm font-medium text-accent">
            Voltar aos fluxogramas
          </Link>
        </div>
      )
    }
    return (
      <div className="h-full overflow-y-auto pb-10">
        <HeroPagina
          migalhas={[
            { label: 'Página inicial', to: '/' },
            { label: 'Fluxogramas', to: '/fluxogramas' },
            { label: f.categoria, to: `/fluxogramas?categoria=${encodeURIComponent(f.categoria)}` },
            { label: f.titulo },
          ]}
          titulo={f.titulo}
        />
        <div className="px-6 sm:px-9 pt-6">
          <FluxogramaViewer fluxogramas={[f]} />
        </div>
      </div>
    )
  }

  // Lista da área escolhida
  const area = categoriaAberta ? areas.find((a) => a.nome === categoriaAberta) ?? null : null
  if (area) {
    return <ListaDaArea nome={area.nome} lista={area.lista} />
  }

  // Grade de áreas (ou resultado de busca por título)
  const t = busca.trim().toLowerCase()
  const resultadoBusca = t
    ? fluxogramas.filter((f) => f.titulo.toLowerCase().includes(t) || f.categoria.toLowerCase().includes(t)).sort(porTitulo)
    : null

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 sm:px-9 py-10 flex flex-col gap-8">
        <div className="flex flex-col items-center text-center gap-2">
          <h1 className="font-display text-[36px] font-bold tracking-[-1.2px] text-text">Fluxogramas</h1>
          <p className="text-sm text-text-dim max-w-lg">
            {fluxogramas.length} {fluxogramas.length === 1 ? 'fluxograma' : 'fluxogramas'} divididos por área. Escolha
            uma área — ou busque pelo nome — para abrir a conduta.
          </p>
        </div>

        <div className="w-full max-w-md mx-auto">
          <SearchInput value={busca} onChange={setBusca} placeholder="Buscar fluxograma ou área…" />
        </div>

        {resultadoBusca ? (
          resultadoBusca.length === 0 ? (
            <p className="text-sm text-text-dim text-center">Nenhum fluxograma encontrado.</p>
          ) : (
            <div className="border border-border bg-surface rounded-[var(--radius-panel,18px)] px-6">
              {resultadoBusca.map((f) => (
                <LinhaFluxograma key={f.id} f={f} mostrarArea />
              ))}
            </div>
          )
        ) : areas.length === 0 ? (
          <p className="text-sm text-text-dim text-center">
            Nenhum fluxograma cadastrado ainda — quem cadastra é o editor, em Painel → Fluxogramas.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {areas.map(({ nome, lista }) => {
              const cor = corDaCategoria(nome, todasCategorias)
              return (
                <Link
                  key={nome}
                  to={`/fluxogramas?categoria=${encodeURIComponent(nome)}`}
                  className="ed-hover-lift border border-border rounded-[var(--radius-panel,18px)] p-5 min-h-[150px] flex flex-col justify-between"
                  style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${cor} 18%, var(--surface)), var(--surface) 85%)` }}
                >
                  <span
                    className="w-11 h-11 rounded-full bg-surface flex items-center justify-center shadow-[var(--shadow-float)]"
                    style={{ color: cor }}
                  >
                    <Workflow className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="font-display text-[19px] font-semibold tracking-[-.5px] text-text leading-tight">{nome}</p>
                    <p className="text-xs mt-1 font-medium" style={{ color: cor }}>
                      {lista.length} {lista.length === 1 ? 'fluxograma' : 'fluxogramas'}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function ListaDaArea({ nome, lista }: { nome: string; lista: Fluxograma[] }) {
  const [busca, setBusca] = useState('')
  const t = busca.trim().toLowerCase()
  const filtrados = t ? lista.filter((f) => f.titulo.toLowerCase().includes(t)) : lista

  return (
    <div className="h-full overflow-y-auto">
      <HeroPagina
        migalhas={[
          { label: 'Página inicial', to: '/' },
          { label: 'Fluxogramas', to: '/fluxogramas' },
          { label: nome },
        ]}
        titulo={nome}
      >
        <p className="inline-flex items-center gap-1.5 text-[13px] text-white/90">
          <Workflow className="w-3.5 h-3.5" />
          <b>{lista.length}</b> {lista.length === 1 ? 'fluxograma' : 'fluxogramas'}
        </p>
      </HeroPagina>

      <div className="px-6 sm:px-9 py-8 flex flex-col gap-4 max-w-5xl">
        <div className="max-w-md">
          <SearchInput value={busca} onChange={setBusca} placeholder={`Buscar em ${nome}…`} />
        </div>
        {filtrados.length === 0 ? (
          <p className="text-sm text-text-dim">Nenhum fluxograma encontrado.</p>
        ) : (
          <div className="border border-border bg-surface rounded-[var(--radius-panel,18px)] px-6">
            {filtrados.map((f) => (
              <LinhaFluxograma key={f.id} f={f} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function LinhaFluxograma({ f, mostrarArea }: { f: Fluxograma; mostrarArea?: boolean }) {
  return (
    <Link to={`/fluxogramas/${f.id}`} className="group flex items-center gap-3 py-4 border-b border-border last:border-b-0">
      <ChevronRight className="w-4 h-4 text-text-dim shrink-0 transition-transform group-hover:translate-x-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-text truncate group-hover:text-accent transition-colors">{f.titulo}</p>
        {(mostrarArea || f.descricao) && (
          <p className="text-xs text-text-dim truncate mt-0.5">{mostrarArea ? f.categoria : f.descricao}</p>
        )}
      </div>
    </Link>
  )
}
