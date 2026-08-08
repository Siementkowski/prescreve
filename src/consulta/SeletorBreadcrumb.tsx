import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useConsultaStore } from './store'
import { useSyncStore } from '../core/sync'
import { areasVisiveis, patologiasVisiveis } from './filtros'
import { IconePorNome } from '../admin/components/IconPicker'
import type { Area, Patologia } from '../admin/types'

/** Dropdown genérico de seleção — usado tanto pra área quanto pra patologia. Fecha ao
 *  clicar fora ou ao escolher um item. */
function useFechaAoClicarFora(aberto: boolean, fechar: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!aberto) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) fechar()
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [aberto, fechar])
  return ref
}

/** Breadcrumb com dois seletores (Área ▸ Patologia) que substitui as antigas colunas
 *  laterais. Mantém a mesma navegação (useConsultaStore), só muda a apresentação. */
export function SeletorBreadcrumb() {
  const modo = useConsultaStore((s) => s.modo)
  const areas = useSyncStore((s) => s.areas)
  const patologias = useSyncStore((s) => s.patologias)
  const tratamentos = useSyncStore((s) => s.tratamentos)
  const areaSelecionadaId = useConsultaStore((s) => s.areaSelecionadaId)
  const patologiaSelecionadaId = useConsultaStore((s) => s.patologiaSelecionadaId)
  const selecionarArea = useConsultaStore((s) => s.selecionarArea)
  const selecionarPatologia = useConsultaStore((s) => s.selecionarPatologia)

  const [areaAberta, setAreaAberta] = useState(false)
  const [patologiaAberta, setPatologiaAberta] = useState(false)

  const areaRef = useFechaAoClicarFora(areaAberta, () => setAreaAberta(false))
  const patologiaRef = useFechaAoClicarFora(patologiaAberta, () => setPatologiaAberta(false))

  const areasOpcoes = useMemo(() => areasVisiveis(areas, modo), [areas, modo])
  const patologiasOpcoes = useMemo(
    () => (areaSelecionadaId != null ? patologiasVisiveis(patologias, areaSelecionadaId, tratamentos, modo) : []),
    [patologias, areaSelecionadaId, tratamentos, modo]
  )

  const area = areas.find((a) => a.id === areaSelecionadaId) ?? null
  const patologia = patologias.find((p) => p.id === patologiaSelecionadaId) ?? null

  function escolherArea(a: Area) {
    selecionarArea(a.id)
    setAreaAberta(false)
    setPatologiaAberta(true)
  }

  function escolherPatologia(p: Patologia) {
    selecionarPatologia(p.id)
    setPatologiaAberta(false)
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Área */}
      <div className="relative" ref={areaRef}>
        <button
          type="button"
          onClick={() => setAreaAberta((v) => !v)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            areaAberta ? 'border-accent bg-accent-dim text-accent' : 'border-border bg-surface text-text hover:border-text-dim'
          }`}
        >
          {area ? (
            <>
              <span
                className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: (area.cor ?? '#2dd4e8') + '22', color: area.cor ?? '#2dd4e8' }}
              >
                <IconePorNome nome={area.icone} className="w-3 h-3" />
              </span>
              {area.nome}
            </>
          ) : (
            <span className="text-text-dim">Selecione a área</span>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-text-dim shrink-0" />
        </button>

        {areaAberta && (
          <div className="absolute z-20 top-full mt-1.5 w-64 max-h-80 overflow-y-auto bg-surface border border-border rounded-xl shadow-lg py-1.5">
            {areasOpcoes.length === 0 ? (
              <p className="text-sm text-text-dim px-3 py-3">Nenhuma área cadastrada para este modo.</p>
            ) : (
              areasOpcoes.map((a) => (
                <button
                  key={a.id}
                  onClick={() => escolherArea(a)}
                  className={`w-full flex items-center gap-2.5 text-left px-3 py-2 transition-colors ${
                    areaSelecionadaId === a.id ? 'bg-accent-dim text-accent' : 'hover:bg-surface-2 text-text'
                  }`}
                >
                  <span
                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: (a.cor ?? '#2dd4e8') + '22', color: a.cor ?? '#2dd4e8' }}
                  >
                    <IconePorNome nome={a.icone} className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-sm font-medium">{a.nome}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <ChevronRight className="w-4 h-4 text-text-faint shrink-0" />

      {/* Patologia */}
      <div className="relative" ref={patologiaRef}>
        <button
          type="button"
          disabled={areaSelecionadaId == null}
          onClick={() => setPatologiaAberta((v) => !v)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            patologiaAberta
              ? 'border-accent bg-accent-dim text-accent'
              : 'border-border bg-surface text-text hover:border-text-dim'
          }`}
        >
          {patologia ? patologia.nome : <span className="text-text-dim">Selecione a patologia</span>}
          <ChevronDown className="w-3.5 h-3.5 text-text-dim shrink-0" />
        </button>

        {patologiaAberta && areaSelecionadaId != null && (
          <div className="absolute z-20 top-full mt-1.5 w-72 max-h-80 overflow-y-auto bg-surface border border-border rounded-xl shadow-lg py-1.5">
            {patologiasOpcoes.length === 0 ? (
              <p className="text-sm text-text-dim px-3 py-3">Nenhuma patologia com prescrição neste modo.</p>
            ) : (
              patologiasOpcoes.map((p) => (
                <button
                  key={p.id}
                  onClick={() => escolherPatologia(p)}
                  className={`w-full text-left px-3 py-2 transition-colors ${
                    patologiaSelecionadaId === p.id ? 'bg-accent-dim text-accent' : 'hover:bg-surface-2 text-text'
                  }`}
                >
                  <span className="block text-sm font-medium">{p.nome}</span>
                  {p.sinonimos && <span className="block text-xs text-text-dim truncate mt-0.5">{p.sinonimos}</span>}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
