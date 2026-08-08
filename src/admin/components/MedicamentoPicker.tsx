import { useMemo, useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import type { Medicamento } from '../types'

export function MedicamentoPicker({
  medicamentos,
  valorId,
  onSelecionar,
  onCriar,
}: {
  medicamentos: Medicamento[]
  valorId: number | null
  onSelecionar: (id: number) => void
  /** Cadastro rápido — quando a busca não acha nada, oferece criar ali mesmo, sem trocar de tela. */
  onCriar?: (nome: string) => Promise<Medicamento>
}) {
  const [aberto, setAberto] = useState(false)
  const [filtro, setFiltro] = useState('')
  const [criando, setCriando] = useState(false)

  const selecionado = medicamentos.find((m) => m.id === valorId) ?? null

  const filtrados = useMemo(() => {
    if (!filtro.trim()) return medicamentos.slice(0, 30)
    const f = filtro.toLowerCase()
    return medicamentos
      .filter((m) => m.nome.toLowerCase().includes(f) || (m.nome_comercial ?? '').toLowerCase().includes(f))
      .slice(0, 30)
  }, [medicamentos, filtro])

  async function criarAgora() {
    if (!onCriar || !filtro.trim()) return
    setCriando(true)
    try {
      const novo = await onCriar(filtro.trim())
      onSelecionar(novo.id)
      setAberto(false)
      setFiltro('')
    } finally {
      setCriando(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="w-full flex items-center justify-between bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-accent transition-colors"
      >
        <span className={selecionado ? 'text-text' : 'text-text-dim'}>
          {selecionado ? selecionado.nome : 'Selecionar do catálogo…'}
        </span>
        <ChevronDown className="w-4 h-4 text-text-dim shrink-0" />
      </button>

      {aberto && (
        <div className="absolute z-20 mt-1 w-full bg-surface border border-border rounded-lg shadow-2xl shadow-black/40 overflow-hidden">
          <input
            autoFocus
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar…"
            className="w-full px-3 py-2 text-sm bg-surface-2 border-b border-border outline-none text-text"
          />
          <div className="max-h-52 overflow-y-auto">
            {filtrados.length === 0 ? (
              <div className="px-3 py-2.5 flex flex-col gap-2">
                <p className="text-xs text-text-dim">Nenhum medicamento encontrado no catálogo.</p>
                {onCriar && filtro.trim() && (
                  <button
                    type="button"
                    onClick={criarAgora}
                    disabled={criando}
                    className="flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 disabled:opacity-50 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {criando ? 'Cadastrando…' : `Cadastrar "${filtro.trim()}" como novo medicamento`}
                  </button>
                )}
              </div>
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
