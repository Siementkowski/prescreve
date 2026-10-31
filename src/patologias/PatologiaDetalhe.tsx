import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ClipboardList, StickyNote } from 'lucide-react'
import { useSyncStore } from '../core/sync'
import { HeroPagina } from '../core/components/HeroPagina'
import { TratamentoCard } from '../consulta/TratamentoCard'
import { CopyButton } from '../consulta/components/CopyButton'
import { principaisVisiveis } from '../consulta/filtros'
import type { ModoTratamento } from '../admin/types'

/** Ficha da patologia — só leitura. Cabeçalho azul com o modo (ambulatorial/hospitalar,
 *  que aqui é só filtro de leitura, não uma escolha que vira receita); à esquerda os
 *  esquemas publicados, à direita as orientações e observações. */
export function PatologiaDetalhe() {
  const { id } = useParams()
  const carregandoInicial = useSyncStore((s) => s.carregandoInicial)
  const areas = useSyncStore((s) => s.areas)
  const patologias = useSyncStore((s) => s.patologias)
  const tratamentos = useSyncStore((s) => s.tratamentos)
  const itens = useSyncStore((s) => s.itens)
  const medicamentos = useSyncStore((s) => s.medicamentos)
  const apresentacoes = useSyncStore((s) => s.apresentacoes)
  const [modo, setModo] = useState<ModoTratamento>('ambulatorial')

  const patologia = patologias.find((p) => p.id === Number(id)) ?? null
  const area = patologia ? areas.find((a) => a.id === patologia.area_id) ?? null : null

  const esquemas = useMemo(() => {
    if (!patologia) return []
    return principaisVisiveis(tratamentos, patologia.id, modo).sort((a, b) => a.ordem - b.ordem)
  }, [tratamentos, patologia, modo])

  if (carregandoInicial) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-text-dim">Carregando base…</p>
      </div>
    )
  }

  if (!patologia) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-text-dim">Patologia não encontrada.</p>
        <Link to="/patologias" className="text-sm font-medium text-accent hover:underline">
          Voltar para Patologias
        </Link>
      </div>
    )
  }

  const temLateral = !!(patologia.orientacoes || patologia.observacoes)

  return (
    <div className="h-full overflow-y-auto">
      <HeroPagina
        migalhas={[
          { label: 'Página inicial', to: '/' },
          { label: 'Patologias', to: '/patologias' },
          ...(area ? [{ label: area.nome, to: `/patologias?area=${area.id}` }] : []),
          { label: patologia.nome },
        ]}
        titulo={patologia.nome}
        subtitulo={patologia.sinonimos ? `Também conhecida como: ${patologia.sinonimos}` : null}
      >
        <ModoSwitch value={modo} onChange={setModo} />
      </HeroPagina>

      <div
        className={`px-6 sm:px-9 py-8 grid grid-cols-1 gap-6 items-start ${
          temLateral ? 'lg:grid-cols-[minmax(0,1fr)_360px]' : ''
        }`}
      >
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-[22px] font-semibold tracking-[-.6px] text-text">Esquemas</h2>
          {esquemas.length === 0 ? (
            <div className="border border-border bg-surface rounded-[var(--radius-panel,18px)] p-6">
              <p className="text-sm text-text-dim text-center py-6">Nenhum esquema publicado pra esse modo ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {esquemas.map((t) => (
                <TratamentoCard
                  key={t.id}
                  tratamento={t}
                  itens={itens}
                  medicamentos={medicamentos}
                  apresentacoes={apresentacoes}
                  gestante={false}
                />
              ))}
            </div>
          )}
        </section>

        {temLateral && (
          <aside className="border border-border bg-surface rounded-[var(--radius-panel,18px)] overflow-hidden">
            {patologia.orientacoes && (
              <div className="px-6 py-6">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h2 className="flex items-center gap-2 font-display text-[19px] font-semibold tracking-[-.5px] text-text">
                    <ClipboardList className="w-4.5 h-4.5 text-accent" />
                    Orientações
                  </h2>
                  <CopyButton texto={patologia.orientacoes} label="Copiar" />
                </div>
                <p className="text-[13px] text-text-dim leading-relaxed whitespace-pre-wrap">
                  {patologia.orientacoes}
                </p>
              </div>
            )}
            {patologia.observacoes && (
              <div className={`px-6 py-6 ${patologia.orientacoes ? 'border-t border-border' : ''}`}>
                <h2 className="flex items-center gap-2 font-display text-[19px] font-semibold tracking-[-.5px] text-text mb-2">
                  <StickyNote className="w-4.5 h-4.5 text-warn" />
                  Observações
                </h2>
                <p className="text-[13px] text-text-dim leading-relaxed whitespace-pre-wrap">
                  {patologia.observacoes}
                </p>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  )
}

/** Alternância ambulatorial/hospitalar — pill sobre o azul do hero (ativo em superfície
 *  clara). Local à tela: não mexe no store da Consulta de propósito. */
function ModoSwitch({ value, onChange }: { value: ModoTratamento; onChange: (m: ModoTratamento) => void }) {
  const opcoes: { valor: ModoTratamento; label: string }[] = [
    { valor: 'ambulatorial', label: 'Ambulatorial' },
    { valor: 'hospitalar', label: 'Hospitalar' },
  ]
  return (
    <div className="inline-flex items-center gap-0.5 bg-white/15 rounded-[var(--radius-control,12px)] p-1 self-start">
      {opcoes.map((o) => (
        <button
          key={o.valor}
          type="button"
          onClick={() => onChange(o.valor)}
          className={`text-xs font-bold rounded-[var(--radius-input,9px)] px-3.5 py-1.5 transition-colors ${
            value === o.valor ? 'bg-surface text-text' : 'text-white/85 hover:text-white'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
