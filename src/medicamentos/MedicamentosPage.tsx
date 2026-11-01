import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Baby, ChevronRight, Pill } from 'lucide-react'
import { useSyncStore } from '../core/sync'
import { FORMAS_CONFIG, type FormaFarmaceutica } from '../core/formas'
import { SearchInput } from '../admin/components/SearchInput'
import type { Medicamento } from '../admin/types'
import { HeroPagina } from '../core/components/HeroPagina'
import { CLASSE_SEM_CATEGORIA, temDosePorPeso, visualCategoria } from './categorias'

const porNome = (a: Medicamento, b: Medicamento) => a.nome.localeCompare(b.nome, 'pt-BR')

/** Medicamentos — aba do USUÁRIO, só leitura. Dois níveis: grade de classes
 *  (/medicamentos) e lista da classe escolhida (/medicamentos?classe=…), de onde se abre a
 *  ficha em /medicamentos/:id. Usa a mesma base cacheada offline que Consulta/Pediatria.
 *  A classe é cadastrada pelo editor em Painel → Medicamentos. */
export function MedicamentosPage() {
  const carregandoInicial = useSyncStore((s) => s.carregandoInicial)
  const medicamentos = useSyncStore((s) => s.medicamentos)
  const apresentacoes = useSyncStore((s) => s.apresentacoes)
  const [searchParams] = useSearchParams()
  const classeAberta = searchParams.get('classe')
  // ?dose=1 (vem da calculadora de Pediatria) mostra só quem tem dose por peso cadastrada.
  const apenasDose = searchParams.get('dose') === '1'
  const [busca, setBusca] = useState('')

  const classes = useMemo(() => {
    const mapa = new Map<string, Medicamento[]>()
    for (const m of medicamentos) {
      const c = m.classe?.trim() || CLASSE_SEM_CATEGORIA
      mapa.set(c, [...(mapa.get(c) ?? []), m])
    }
    // "Outros" sempre por último, o resto em ordem alfabética.
    return [...mapa.entries()]
      .map(([nome, lista]) => ({ nome, lista: lista.sort(porNome) }))
      .sort((a, b) =>
        a.nome === CLASSE_SEM_CATEGORIA ? 1 : b.nome === CLASSE_SEM_CATEGORIA ? -1 : a.nome.localeCompare(b.nome, 'pt-BR')
      )
  }, [medicamentos])

  const formasPorMed = useMemo(() => {
    const mapa = new Map<number, string[]>()
    for (const a of apresentacoes) {
      const rotulo = FORMAS_CONFIG[a.forma as FormaFarmaceutica]?.rotulo ?? a.forma
      const atual = mapa.get(a.medicamento_id) ?? []
      if (rotulo && !atual.includes(rotulo)) mapa.set(a.medicamento_id, [...atual, rotulo])
    }
    return mapa
  }, [apresentacoes])

  if (carregandoInicial) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-text-dim">Carregando base…</p>
      </div>
    )
  }

  const classe = classeAberta ? classes.find((c) => c.nome === classeAberta) ?? null : null

  if (classe) {
    const lista = apenasDose ? classe.lista.filter(temDosePorPeso) : classe.lista
    return <ListaDaClasse nome={classe.nome} lista={lista} formasPorMed={formasPorMed} apenasDose={apenasDose} />
  }

  const t = busca.trim().toLowerCase()
  const resultadoBusca = t
    ? medicamentos
        .filter((m) => m.nome.toLowerCase().includes(t) || (m.nome_comercial ?? '').toLowerCase().includes(t))
        .sort(porNome)
    : null

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 sm:px-9 py-10 flex flex-col gap-8">
        <div className="flex flex-col items-center text-center gap-2">
          <h1 className="font-display text-[36px] font-bold tracking-[-1.2px] text-text">Medicamentos</h1>
          <p className="text-sm text-text-dim max-w-lg">
            {medicamentos.length} medicamentos divididos por classe. Escolha uma categoria — ou busque pelo nome — para
            calcular a dose pelo peso e ver as advertências.
          </p>
        </div>

        <div className="w-full max-w-md mx-auto">
          <SearchInput value={busca} onChange={setBusca} placeholder="Buscar por nome ou nome comercial…" />
        </div>

        {resultadoBusca ? (
          resultadoBusca.length === 0 ? (
            <p className="text-sm text-text-dim text-center">Nenhum medicamento encontrado.</p>
          ) : (
            <div className="border border-border bg-surface rounded-[var(--radius-panel,18px)] px-6">
              {resultadoBusca.map((m) => (
                <LinhaMedicamento key={m.id} m={m} formas={formasPorMed.get(m.id)} mostrarClasse />
              ))}
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {classes.map(({ nome, lista }) => {
              const { icone: Icone, bg, fg } = visualCategoria(nome)
              return (
                <Link
                  key={nome}
                  to={`/medicamentos?classe=${encodeURIComponent(nome)}`}
                  className="ed-hover-lift border border-border rounded-[var(--radius-panel,18px)] p-5 min-h-[150px] flex flex-col justify-between"
                  style={{ background: `linear-gradient(135deg, ${bg}, var(--surface) 85%)` }}
                >
                  <span
                    className="w-11 h-11 rounded-full bg-surface flex items-center justify-center shadow-[var(--shadow-float)]"
                    style={{ color: fg }}
                  >
                    <Icone className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="font-display text-[19px] font-semibold tracking-[-.5px] text-text leading-tight">
                      {nome}
                    </p>
                    <p className="text-xs mt-1 font-medium" style={{ color: fg }}>
                      {lista.length} {lista.length === 1 ? 'medicamento' : 'medicamentos'}
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

function ListaDaClasse({
  nome,
  lista,
  formasPorMed,
  apenasDose,
}: {
  nome: string
  lista: Medicamento[]
  formasPorMed: Map<number, string[]>
  apenasDose: boolean
}) {
  const [busca, setBusca] = useState('')
  const { icone: Icone, fg } = visualCategoria(nome)
  const t = busca.trim().toLowerCase()
  const filtrados = t
    ? lista.filter((m) => m.nome.toLowerCase().includes(t) || (m.nome_comercial ?? '').toLowerCase().includes(t))
    : lista

  return (
    <div className="h-full overflow-y-auto">
      <HeroPagina
        migalhas={[
          { label: 'Página inicial', to: '/' },
          { label: 'Medicamentos', to: '/medicamentos' },
          { label: nome },
        ]}
        titulo={nome}
        cor={fg}
      >
        <p className="inline-flex items-center gap-1.5 text-[13px] text-white/90">
          <Icone className="w-3.5 h-3.5" />
          <b>{lista.length}</b> {lista.length === 1 ? 'medicamento' : 'medicamentos'}
          {apenasDose && ' com dose por peso'}
        </p>
      </HeroPagina>

      <div className="px-6 sm:px-9 py-8 flex flex-col gap-4 max-w-5xl">
        <div className="max-w-md">
          <SearchInput value={busca} onChange={setBusca} placeholder={`Buscar em ${nome}…`} />
        </div>
        {filtrados.length === 0 ? (
          <p className="text-sm text-text-dim">Nenhum medicamento encontrado.</p>
        ) : (
          <div className="border border-border bg-surface rounded-[var(--radius-panel,18px)] px-6">
            {filtrados.map((m) => (
              <LinhaMedicamento key={m.id} m={m} formas={formasPorMed.get(m.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function LinhaMedicamento({
  m,
  formas,
  mostrarClasse,
}: {
  m: Medicamento
  formas?: string[]
  mostrarClasse?: boolean
}) {
  const temDosePediatrica = temDosePorPeso(m)
  return (
    <Link
      to={`/medicamentos/${m.id}`}
      className="group flex items-center gap-3 py-4 border-b border-border last:border-b-0"
    >
      <ChevronRight className="w-4 h-4 text-text-dim shrink-0 transition-transform group-hover:translate-x-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-text truncate group-hover:text-accent transition-colors">
          {m.nome}
        </p>
        <p className="text-xs text-text-dim truncate mt-0.5">
          {m.nome_comercial || (mostrarClasse ? m.classe : null) || 'Somente genérico'}
        </p>
      </div>
      {temDosePediatrica && (
        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium rounded-full bg-accent-dim text-accent px-2.5 py-0.5 shrink-0">
          <Baby className="w-3 h-3" />
          Dose por peso
        </span>
      )}
      {formas && formas.length > 0 && (
        <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-text-dim shrink-0 max-w-[220px] truncate">
          <Pill className="w-3.5 h-3.5" />
          {formas.join(' / ')}
        </span>
      )}
    </Link>
  )
}
