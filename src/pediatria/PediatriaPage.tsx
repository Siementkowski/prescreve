import { useMemo } from 'react'
import { Baby } from 'lucide-react'
import { useSyncStore } from '../core/sync'
import { usePediatriaStore } from './store'
import { CalculadoraMedicamento } from './CalculadoraMedicamento'
import { SearchInput } from '../admin/components/SearchInput'

export function PediatriaPage() {
  // A base (a mesma do módulo de consulta, cacheada offline) vem do core/sync — já chega
  // carregada aqui, tenha você entrado pela Consulta ou direto pela Pediatria.
  const medicamentos = useSyncStore((s) => s.medicamentos)
  const carregandoInicial = useSyncStore((s) => s.carregandoInicial)

  const pesoKg = usePediatriaStore((s) => s.pesoKg)
  const setPesoKg = usePediatriaStore((s) => s.setPesoKg)
  const busca = usePediatriaStore((s) => s.busca)
  const setBusca = usePediatriaStore((s) => s.setBusca)

  const comDadosPediatricos = useMemo(
    () => medicamentos.filter((m) => m.ped_mg_kg_dia != null && m.ped_mg_kg_dia > 0),
    [medicamentos]
  )

  const filtrados = useMemo(() => {
    const t = busca.trim().toLowerCase()
    if (!t) return comDadosPediatricos
    return comDadosPediatricos.filter(
      (m) => m.nome.toLowerCase().includes(t) || (m.nome_comercial ?? '').toLowerCase().includes(t)
    )
  }, [comDadosPediatricos, busca])

  if (carregandoInicial) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-text-dim">Carregando base…</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0 flex-wrap">
        <div className="flex items-center gap-2">
          <Baby className="w-4 h-4 text-text-dim shrink-0" />
          <label className="text-sm text-text-dim shrink-0">Peso</label>
          <div className="relative">
            <input
              type="number"
              min={0}
              step="0.1"
              value={pesoKg ?? ''}
              onChange={(e) => setPesoKg(e.target.value === '' ? null : Number(e.target.value))}
              placeholder="0,0"
              className="w-24 bg-surface-2 border border-border rounded-md pl-3 pr-8 py-1.5 text-sm text-text outline-none focus:border-accent"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-text-dim pointer-events-none">
              kg
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-48 max-w-xs">
          <SearchInput value={busca} onChange={setBusca} placeholder="Buscar medicamento…" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!pesoKg || pesoKg <= 0 ? (
          <p className="text-sm text-text-dim px-1 py-4">Informe o peso da criança para calcular as doses.</p>
        ) : comDadosPediatricos.length === 0 ? (
          <p className="text-sm text-text-dim px-1 py-4">
            Nenhum medicamento com dados pediátricos cadastrados ainda.
          </p>
        ) : filtrados.length === 0 ? (
          <p className="text-sm text-text-dim px-1 py-4">Nenhum medicamento encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtrados.map((m) => (
              <CalculadoraMedicamento key={m.id} medicamento={m} pesoKg={pesoKg} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
