import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X, FolderHeart, Pill } from 'lucide-react'
import { useConsultaStore } from './store'
import { useSyncStore } from '../core/sync'
import type { Patologia, Medicamento } from '../admin/types'

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export function BuscaGlobal() {
  const [aberta, setAberta] = useState(false)
  const [termo, setTermo] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const patologias = useSyncStore((s) => s.patologias)
  const medicamentos = useSyncStore((s) => s.medicamentos)
  const tratamentos = useSyncStore((s) => s.tratamentos)
  const itens = useSyncStore((s) => s.itens)
  const irPara = useConsultaStore((s) => s.irPara)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setAberta(true)
      } else if (e.key === 'Escape') {
        setAberta(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (aberta) {
      setTermo('')
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [aberta])

  const resultadosPatologias = useMemo<Patologia[]>(() => {
    const t = normalizar(termo.trim())
    if (!t) return []
    return patologias
      .filter((p) => normalizar(p.nome).includes(t) || normalizar(p.sinonimos ?? '').includes(t))
      .slice(0, 8)
  }, [patologias, termo])

  const resultadosMedicamentos = useMemo<Medicamento[]>(() => {
    const t = normalizar(termo.trim())
    if (!t) return []
    return medicamentos
      .filter((m) => normalizar(m.nome).includes(t) || normalizar(m.nome_comercial ?? '').includes(t))
      .slice(0, 8)
  }, [medicamentos, termo])

  function irParaPatologia(p: Patologia) {
    irPara(p.area_id, p.id)
    setAberta(false)
  }

  function irParaMedicamento(m: Medicamento) {
    // Um medicamento pode aparecer em vários tratamentos — pula pro primeiro uso encontrado.
    const item = itens.find((i) => i.medicamento_id === m.id)
    if (!item) return
    const tratamento = tratamentos.find((t) => t.id === item.tratamento_id)
    if (!tratamento) return
    const patologia = patologias.find((p) => p.id === tratamento.patologia_id)
    if (!patologia) return
    irParaPatologia(patologia)
  }

  const semResultados =
    termo.trim().length > 0 && resultadosPatologias.length === 0 && resultadosMedicamentos.length === 0

  return (
    <>
      <button
        onClick={() => setAberta(true)}
        className="flex items-center gap-2 bg-surface border border-border rounded-[var(--radius-pill,999px)] px-4 py-2.5 text-sm text-text-dim hover:text-text hover:border-text-dim transition-colors w-full flex-1"
      >
        <Search className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left truncate">Buscar patologia ou medicamento…</span>
        <kbd className="hidden lg:inline text-[10px] border border-border rounded px-1.5 py-0.5 text-text-dim shrink-0">
          Ctrl K
        </kbd>
      </button>

      {aberta && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[10vh]"
          onClick={() => setAberta(false)}
        >
          <div
            className="w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <Search className="w-4 h-4 text-text-dim shrink-0" />
              <input
                ref={inputRef}
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                placeholder="Ex: cistite, nitrofurantoína…"
                className="flex-1 bg-transparent outline-none text-sm text-text placeholder:text-text-dim"
              />
              <button onClick={() => setAberta(false)} className="text-text-dim hover:text-text transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto py-2">
              {termo.trim() === '' && (
                <p className="text-sm text-text-dim px-4 py-6 text-center">
                  Digite para buscar por patologia, sinônimo ou medicamento.
                </p>
              )}

              {semResultados && (
                <p className="text-sm text-text-dim px-4 py-6 text-center">Nenhum resultado encontrado.</p>
              )}

              {resultadosPatologias.length > 0 && (
                <div className="mb-2">
                  <p className="text-[11px] font-semibold text-text-dim uppercase tracking-wide px-4 py-1.5">
                    Patologias
                  </p>
                  {resultadosPatologias.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => irParaPatologia(p)}
                      className="w-full flex items-center gap-2.5 text-left px-4 py-2 hover:bg-surface-2 transition-colors"
                    >
                      <FolderHeart className="w-4 h-4 text-text-dim shrink-0" />
                      <span className="min-w-0">
                        <span className="block text-sm text-text">{p.nome}</span>
                        {p.sinonimos && (
                          <span className="block text-xs text-text-dim truncate">{p.sinonimos}</span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {resultadosMedicamentos.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-text-dim uppercase tracking-wide px-4 py-1.5">
                    Medicamentos
                  </p>
                  {resultadosMedicamentos.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => irParaMedicamento(m)}
                      className="w-full flex items-center gap-2.5 text-left px-4 py-2 hover:bg-surface-2 transition-colors"
                    >
                      <Pill className="w-4 h-4 text-text-dim shrink-0" />
                      <span className="min-w-0">
                        <span className="block text-sm text-text">{m.nome}</span>
                        {m.nome_comercial && (
                          <span className="block text-xs text-text-dim truncate">{m.nome_comercial}</span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
