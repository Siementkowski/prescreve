import { useMemo } from 'react'
import { ArrowLeft, EyeOff } from 'lucide-react'
import { useConsultaStore } from './store'
import { useSyncStore } from '../core/sync'
import { agruparPorLinha, tratamentosVisiveis, tratamentoTemContraindicadoGestacao } from './filtros'
import { LABEL_LINHA } from '../admin/types'
import { TratamentoCard } from './TratamentoCard'
import { CopyButton } from './components/CopyButton'

export function PainelTratamentos({ visivelMobile }: { visivelMobile: boolean }) {
  const modo = useConsultaStore((s) => s.modo)
  const gestante = useConsultaStore((s) => s.gestante)
  const ocultarContraindicados = useConsultaStore((s) => s.ocultarContraindicados)
  const patologias = useSyncStore((s) => s.patologias)
  const tratamentos = useSyncStore((s) => s.tratamentos)
  const itens = useSyncStore((s) => s.itens)
  const medicamentos = useSyncStore((s) => s.medicamentos)
  const patologiaSelecionadaId = useConsultaStore((s) => s.patologiaSelecionadaId)
  const voltar = useConsultaStore((s) => s.voltar)

  const patologia = patologias.find((p) => p.id === patologiaSelecionadaId) ?? null

  const { grupos, ocultosCount } = useMemo(() => {
    if (patologiaSelecionadaId == null) return { grupos: [], ocultosCount: 0 }
    const todos = tratamentosVisiveis(tratamentos, patologiaSelecionadaId, modo)

    if (!gestante || !ocultarContraindicados) {
      return { grupos: agruparPorLinha(todos), ocultosCount: 0 }
    }

    const visiveis = todos.filter((t) => !tratamentoTemContraindicadoGestacao(t.id, itens, medicamentos))
    return { grupos: agruparPorLinha(visiveis), ocultosCount: todos.length - visiveis.length }
  }, [tratamentos, patologiaSelecionadaId, modo, gestante, ocultarContraindicados, itens, medicamentos])

  return (
    <div className={`${visivelMobile ? 'flex' : 'hidden'} lg:flex flex-col min-h-0`}>
      <div className="px-4 py-3 border-b border-border shrink-0 flex items-center gap-2">
        <button
          onClick={voltar}
          className="lg:hidden text-text-dim hover:text-text transition-colors -ml-1 p-1"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-xs font-semibold text-text-dim uppercase tracking-wide">
          Prescrições{patologia ? ` — ${patologia.nome}` : ''}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        {!patologia ? (
          <p className="text-sm text-text-dim px-1 py-4">Selecione uma patologia.</p>
        ) : (
          <>
            {patologia.orientacoes && (
              <div className="border border-border rounded-xl bg-surface p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-text">Orientações não medicamentosas</h3>
                  <CopyButton texto={patologia.orientacoes} label="Copiar" />
                </div>
                <p className="text-sm text-text-dim whitespace-pre-wrap leading-relaxed">
                  {patologia.orientacoes}
                </p>
              </div>
            )}

            {patologia.observacoes && (
              <p className="text-sm text-text-dim -mt-2">{patologia.observacoes}</p>
            )}

            {ocultosCount > 0 && (
              <div className="flex items-center gap-2 text-xs text-text-dim bg-surface-2 border border-border rounded-md px-3 py-2">
                <EyeOff className="w-3.5 h-3.5 shrink-0" />
                {ocultosCount} prescriç{ocultosCount > 1 ? 'ões' : 'ão'} oculta{ocultosCount > 1 ? 's' : ''} por
                contraindicação na gestação
              </div>
            )}

            {grupos.length === 0 ? (
              <p className="text-sm text-text-dim px-1">Nenhuma prescrição cadastrada neste modo.</p>
            ) : (
              grupos.map((grupo) => (
                <div key={grupo.linha} className="flex flex-col gap-2.5">
                  <h4 className="text-xs font-semibold text-text-dim uppercase tracking-wide">
                    {LABEL_LINHA[grupo.linha]}
                  </h4>
                  <div className="flex flex-col gap-3">
                    {grupo.tratamentos.map((t) => (
                      <TratamentoCard
                        key={t.id}
                        tratamento={t}
                        itens={itens}
                        medicamentos={medicamentos}
                        gestante={gestante}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}
