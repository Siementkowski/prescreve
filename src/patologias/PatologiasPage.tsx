import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useSyncStore } from '../core/sync'
import { SearchInput } from '../admin/components/SearchInput'
import { IconePorNome } from '../admin/components/IconPicker'
import { CartaoAreaLink } from '../core/components/CartaoAreaLink'
import { HeroPagina } from '../core/components/HeroPagina'
import type { Area, Patologia } from '../admin/types'

const COR_PADRAO = '#1857d1'

/** Patologias — aba do USUÁRIO, só leitura. Dois níveis: grade de áreas (/patologias) e
 *  lista da área escolhida (/patologias?area=ID), de onde se abre a ficha em
 *  /patologias/:id (ver PatologiaDetalhe). Quem cadastra é o editor, em Painel →
 *  Patologias. Usa o mesmo cache offline-first do Consulta/Pediatria (useSyncStore). */
export function PatologiasPage() {
  const carregandoInicial = useSyncStore((s) => s.carregandoInicial)
  const areas = useSyncStore((s) => s.areas)
  const patologias = useSyncStore((s) => s.patologias)
  const [searchParams] = useSearchParams()
  const areaDaUrl = Number(searchParams.get('area')) || null
  const [busca, setBusca] = useState('')

  const areasOrdenadas = useMemo(
    () => [...areas].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [areas]
  )

  const porArea = useMemo(() => {
    const mapa = new Map<number, Patologia[]>()
    for (const p of patologias) mapa.set(p.area_id, [...(mapa.get(p.area_id) ?? []), p])
    for (const lista of mapa.values()) lista.sort((a, b) => a.ordem - b.ordem)
    return mapa
  }, [patologias])

  if (carregandoInicial) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-text-dim">Carregando base…</p>
      </div>
    )
  }

  const area = areaDaUrl ? areas.find((a) => a.id === areaDaUrl) ?? null : null
  if (area) return <ListaDaArea area={area} lista={porArea.get(area.id) ?? []} />

  const t = busca.trim().toLowerCase()
  const resultadoBusca = t
    ? patologias
        .filter((p) => p.nome.toLowerCase().includes(t) || (p.sinonimos ?? '').toLowerCase().includes(t))
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    : null

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 sm:px-9 py-10 flex flex-col gap-8">
        <div className="flex flex-col items-center text-center gap-2">
          <h1 className="font-display text-[36px] font-bold tracking-[-1.2px] text-text">Patologias</h1>
          <p className="text-sm text-text-dim max-w-lg">
            {patologias.length} patologias divididas por área. Escolha uma especialidade — ou busque pelo nome — para ver
            as orientações e os esquemas de tratamento.
          </p>
        </div>

        <div className="w-full max-w-md mx-auto">
          <SearchInput value={busca} onChange={setBusca} placeholder="Buscar patologia ou sinônimo…" />
        </div>

        {resultadoBusca ? (
          resultadoBusca.length === 0 ? (
            <p className="text-sm text-text-dim text-center">Nenhuma patologia encontrada.</p>
          ) : (
            <div className="border border-border bg-surface rounded-[var(--radius-panel,18px)] px-6">
              {resultadoBusca.map((p) => (
                <LinhaPatologia key={p.id} p={p} areaNome={areas.find((a) => a.id === p.area_id)?.nome} />
              ))}
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {areasOrdenadas.map((a) => {
              const cor = a.cor ?? COR_PADRAO
              const total = porArea.get(a.id)?.length ?? 0
              return (
                <CartaoAreaLink
                  key={a.id}
                  to={`/patologias?area=${a.id}`}
                  cor={cor}
                  raio="18px"
                  className="p-5 min-h-[150px] flex flex-col justify-between"
                >
                  <span
                    className="w-11 h-11 rounded-full flex items-center justify-center"
                    style={{ color: cor, backgroundColor: `${cor}1f` }}
                  >
                    <IconePorNome nome={a.icone} className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="font-display text-[19px] font-semibold tracking-[-.5px] text-text leading-tight">
                      {a.nome}
                    </p>
                    <p className="text-xs mt-1 font-medium" style={{ color: cor }}>
                      {total} {total === 1 ? 'patologia' : 'patologias'}
                    </p>
                  </div>
                </CartaoAreaLink>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function ListaDaArea({ area, lista }: { area: Area; lista: Patologia[] }) {
  const [busca, setBusca] = useState('')
  const t = busca.trim().toLowerCase()
  const filtradas = t
    ? lista.filter((p) => p.nome.toLowerCase().includes(t) || (p.sinonimos ?? '').toLowerCase().includes(t))
    : lista

  return (
    <div className="h-full overflow-y-auto">
      <HeroPagina
        migalhas={[
          { label: 'Página inicial', to: '/' },
          { label: 'Patologias', to: '/patologias' },
          { label: area.nome },
        ]}
        titulo={area.nome}
        cor={area.cor ?? COR_PADRAO}
      >
        <p className="inline-flex items-center gap-1.5 text-[13px] text-white/90">
          <IconePorNome nome={area.icone} className="w-3.5 h-3.5" />
          <b>{lista.length}</b> {lista.length === 1 ? 'patologia' : 'patologias'}
        </p>
      </HeroPagina>

      <div className="px-6 sm:px-9 py-8 flex flex-col gap-4 max-w-5xl">
        <div className="max-w-md">
          <SearchInput value={busca} onChange={setBusca} placeholder={`Buscar em ${area.nome}…`} />
        </div>
        {filtradas.length === 0 ? (
          <p className="text-sm text-text-dim">Nenhuma patologia nesta área.</p>
        ) : (
          <div className="border border-border bg-surface rounded-[var(--radius-panel,18px)] px-6">
            {filtradas.map((p) => (
              <LinhaPatologia key={p.id} p={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function LinhaPatologia({ p, areaNome }: { p: Patologia; areaNome?: string }) {
  return (
    <Link to={`/patologias/${p.id}`} className="group flex items-center gap-3 py-4 border-b border-border last:border-b-0">
      <ChevronRight className="w-4 h-4 text-text-dim shrink-0 transition-transform group-hover:translate-x-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-text truncate group-hover:text-accent transition-colors">
          {p.nome}
        </p>
        {(p.sinonimos || areaNome) && (
          <p className="text-xs text-text-dim truncate mt-0.5">{p.sinonimos || areaNome}</p>
        )}
      </div>
      {areaNome && p.sinonimos && (
        <span className="hidden md:inline text-xs font-semibold text-text-dim shrink-0">{areaNome}</span>
      )}
    </Link>
  )
}
