import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { Medicamento } from '../types'

export function MedicamentoPicker({
  medicamentos,
  valorId,
  onSelecionar,
}: {
  medicamentos: Medicamento[]
  valorId: number | null
  onSelecionar: (id: number) => void
}) {
  const [aberto, setAberto] = useState(false)
  const [filtro, setFiltro] = useState('')

  const selecionado = medicamentos.find((m) => m.id === valorId) ?? null

  const filtrados = useMemo(() => {
    if (!filtro.trim()) return medicamentos.slice(0, 30)
    const f = filtro.toLowerCase()
    return medicamentos
      .filter((m) => m.nome.toLowerCase().includes(f) || (m.nome_comercial ?? '').toLowerCase().includes(f))
      .slice(0, 30)
  }, [medicamentos, filtro])

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="w-full flex items-center justify-between bg-surface-2 border border-border rounded-md px-3 py-2 text-sm text-text outline-none focus:border-accent transition-colors"
      >
        <span className={selecionado ? 'text-text' : 'text-text-dim'}>
          {selecionado ? selecionado.nome : 'Selecionar do cadastro…'}
        </span>
        <ChevronDown className="w-4 h-4 text-text-dim shrink-0" />
      </button>

      {aberto && (
        <div className="absolute z-20 mt-1 w-full bg-surface border border-border rounded-md shadow-xl overflow-hidden">
          <input
            autoFocus
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar…"
            className="w-full px-3 py-2 text-sm bg-surface-2 border-b border-border outline-none text-text"
          />
          <div className="max-h-52 overflow-y-auto">
            {filtrados.length === 0 ? (
              <p className="text-xs text-text-dim px-3 py-2">Nenhum medicamento encontrado.</p>
            ) : (
              filtrados.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onSelecionar(m.id)
                    setAberto(false)
                    setFiltro('')
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm text-text hover:bg-surface-2 transition-colors"
                >
                  {m.nome}
                  {m.nome_comercial && <span className="text-text-dim"> · {m.nome_comercial}</span>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
