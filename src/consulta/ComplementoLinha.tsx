import { AlertTriangle, Square, SquareCheck } from 'lucide-react'
import type { Tratamento, TratamentoItem, Medicamento, Apresentacao } from '../admin/types'
import { itensDoTratamento, medicamentoPorId, apresentacaoPorId, tratamentoTemContraindicadoGestacao } from './filtros'
import { textoReceitaDoItem } from '../core/receita'

/** Linha compacta de um complemento — checkbox, nome com concentração e a posologia
 *  resumida em mono, uma linha só (sem campos detalhados nem alerta expandido). Usa o
 *  mesmo texto de receita gerado pra tudo mais no app, só splitado nas duas linhas que
 *  `textoReceitaDoItem` já produz — nenhuma formatação nova. */
export function ComplementoLinha({
  tratamento,
  itens,
  medicamentos,
  apresentacoes,
  gestante,
  selecionado,
  onToggle,
}: {
  tratamento: Tratamento
  itens: TratamentoItem[]
  medicamentos: Medicamento[]
  apresentacoes: Apresentacao[]
  gestante: boolean
  selecionado: boolean
  onToggle: () => void
}) {
  const item = itensDoTratamento(itens, tratamento.id)[0]
  if (!item) return null

  const medicamento = medicamentoPorId(medicamentos, item.medicamento_id)
  const apresentacao = apresentacaoPorId(apresentacoes, item.apresentacao_id)
  const texto = textoReceitaDoItem(item, medicamento?.nome ?? null, apresentacao)
  const [linha1, linha2] = texto.split('\n')

  const temContraindicado = tratamentoTemContraindicadoGestacao(tratamento.id, itens, medicamentos)
  const esmaecido = gestante && temContraindicado

  const Icone = selecionado ? SquareCheck : Square

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-opacity ${
        esmaecido ? 'opacity-60 hover:opacity-100' : ''
      }`}
    >
      <Icone className={`w-4 h-4 shrink-0 ${selecionado ? 'text-accent' : 'text-text-faint'}`} />
      {esmaecido && <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-danger" />}
      <span className={`text-sm truncate ${esmaecido ? 'text-danger' : 'text-text'}`}>{linha1 || '—'}</span>
      {linha2 && <span className="tabular text-xs text-text-dim font-mono truncate ml-auto shrink-0">{linha2}</span>}
    </button>
  )
}
