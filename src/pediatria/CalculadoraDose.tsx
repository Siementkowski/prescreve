import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Calculator } from 'lucide-react'
import { useSyncStore } from '../core/sync'
import { usePediatriaStore } from './store'
import { SearchInput } from '../admin/components/SearchInput'
import { CLASSE_SEM_CATEGORIA, visualCategoria } from '../medicamentos/categorias'
import { LinhaMedicamento } from '../medicamentos/MedicamentosPage'
import { FORMAS_CONFIG, type FormaFarmaceutica } from '../core/formas'
import type { Medicamento } from '../admin/types'

/** Calculadora de dose por peso — porta de entrada para as fichas de Medicamentos: o peso
 *  digitado aqui já chega preenchido na ficha (mesmo usePediatriaStore), onde a conta é
 *  feita e mostrada passo a passo (core/pediatria.ts). Só entram medicamentos com dado
 *  pediátrico cadastrado (ped_mg_kg_dia); se a lista vier vazia, o problema quase sempre é
 *  cadastro faltando em Painel → Medicamentos, não a conta. */
export function CalculadoraDose() {
  const medicamentos = useSyncStore((s) => s.medicamentos)
  const apresentacoes = useSyncStore((s) => s.apresentacoes)
  const carregandoInicial = useSyncStore((s) => s.carregandoInicial)

  const pesoKg = usePediatriaStore((s) => s.pesoKg)
  const setPesoKg = usePediatriaStore((s) => s.setPesoKg)
  const busca = usePediatriaStore((s) => s.busca)
  const setBusca = usePediatriaStore((s) => s.setBusca)

  const comDose = useMemo(
    () => medicamentos.filter((m) => m.ped_mg_kg_dia != null && m.ped_mg_kg_dia > 0),
    [medicamentos]
  )

  const classes = useMemo(() => {
    const mapa = new Map<string, Medicamento[]>()
    for (const m of comDose) {
      const c = m.classe?.trim() || CLASSE_SEM_CATEGORIA
      mapa.set(c, [...(mapa.get(c) ?? []), m])
    }
    return [...mapa.entries()]
      .map(([nome, lista]) => ({ nome, total: lista.length }))
      .sort((a, b) =>
        a.nome === CLASSE_SEM_CATEGORIA ? 1 : b.nome === CLASSE_SEM_CATEGORIA ? -1 : a.nome.localeCompare(b.nome, 'pt-BR')
      )
  }, [comDose])

  const formasPorMed = useMemo(() => {
    const mapa = new Map<number, string[]>()
    for (const a of apresentacoes) {
      const rotulo = FORMAS_CONFIG[a.forma as FormaFarmaceutica]?.rotulo ?? a.forma
      const atual = mapa.get(a.medicamento_id) ?? []
      if (rotulo && !atual.includes(rotulo)) mapa.set(a.medicamento_id, [...atual, rotulo])
    }
    return mapa
  }, [apresentacoes])

  const resultadoBusca = useMemo(() => {
    const t = busca.trim().toLowerCase()
    if (!t) return null
    return comDose
      .filter((m) => m.nome.toLowerCase().includes(t) || (m.nome_comercial ?? '').toLowerCase().includes(t))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  }, [comDose, busca])

  if (carregandoInicial) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-text-dim">Carregando base…</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 sm:px-9 py-10 flex flex-col gap-8">
        <div className="flex flex-col items-center text-center gap-2">
          <h1 className="font-display text-[36px] font-bold tracking-[-1.2px] text-text">Cálculo de doses pediátricas</h1>
          <p className="text-sm text-text-dim max-w-lg">
            Digite o peso, escolha a classe e abra o medicamento — a dose, o volume e a fórmula já saem calculados.
          </p>
        </div>

        <div className="w-full max-w-lg mx-auto flex flex-col gap-3">
          <label className="flex items-center bg-surface border border-border focus-within:border-text rounded-[var(--radius-control,12px)] p-1.5 shadow-[var(--shadow-float)] transition-colors">
            <input
              type="number"
              min={0}
              step="0.1"
              value={pesoKg ?? ''}
              onChange={(e) => setPesoKg(e.target.value === '' ? null : Number(e.target.value))}
              placeholder="Digite o peso do paciente (em kg)"
              className="tabular flex-1 min-w-0 bg-transparent outline-none px-3 py-2 text-sm text-text placeholder:text-text-dim"
            />
            <span className="w-10 h-10 rounded-[var(--radius-input,9px)] bg-accent text-accent-text flex items-center justify-center shrink-0">
              <Calculator className="w-4 h-4" />
            </span>
          </label>
          <SearchInput value={busca} onChange={setBusca} placeholder="Buscar medicamento…" />
        </div>

        {comDose.length === 0 ? (
          <p className="text-sm text-text-dim text-center max-w-md mx-auto">
            Nenhum medicamento com dados pediátricos cadastrados ainda — quem preenche é o editor, em Painel →
            Medicamentos → seção Pediatria (mg/kg/dia, dose máxima, concentração).
          </p>
        ) : resultadoBusca ? (
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
            {classes.map(({ nome, total }) => {
              const { icone: Icone, bg, fg } = visualCategoria(nome)
              return (
                <Link
                  key={nome}
                  to={`/medicamentos?classe=${encodeURIComponent(nome)}&dose=1`}
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
                      {total} {total === 1 ? 'medicamento' : 'medicamentos'} com dose por peso
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
