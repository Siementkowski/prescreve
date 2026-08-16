import { useMemo, useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import type { Medicamento } from '../types'

export function MedicamentoPicker({
  medicamentos,
  valorId,
  onSelecionar,
  onAbrirCadastro,
}: {
  medicamentos: Medicamento[]
  valorId: number | null
  onSelecionar: (id: number) => void
  /** Busca não achou nada → oferece abrir o modal de cadastro (Fase 4) ali mesmo, sem
   *  trocar de tela e sem perder o rascunho do esquema. Só abre o modal — quem cria de
   *  fato é o modal em si (precisa de forma+concentração, não só o nome). */
  onAbrirCadastro?: (nomeSugestao: string) => void
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

  function abrirCadastro() {
    if (!onAbrirCadastro) return
    onAbrirCadastro(filtro.trim())
    setAberto(false)
    setFiltro('')
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
              <p className="text-xs text-text-dim px-3 py-2.5">Nenhum medicamento encontrado no catálogo.</p>
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

          {/* Sempre visível, não só quando a busca não acha nada — não devia exigir limpar
              a busca primeiro pra achar essa opção. */}
          {onAbrirCadastro && (
            <button
              type="button"
              onClick={abrirCadastro}
              className="w-full flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 px-3 py-2 border-t border-border transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {filtro.trim() ? `Cadastrar "${filtro.trim()}" como novo medicamento` : 'Cadastrar novo medicamento'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
