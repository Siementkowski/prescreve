import { AlertTriangle, ExternalLink } from 'lucide-react'
import type { Tratamento, TratamentoItem, Medicamento, Apresentacao } from '../admin/types'
import { LABEL_LINHA } from '../admin/types'
import { itensDoTratamento, medicamentoPorId, apresentacaoPorId, tratamentoTemContraindicadoGestacao } from './filtros'
import { textoReceitaDoItem } from '../core/receita'
import { precisaRevisar, ehUrl } from '../core/revisao'
import { useConfiguracoesStore } from '../core/configuracoes'
import { ItemLinha } from './ItemLinha'
import { CopyButton } from './components/CopyButton'
import { SeloRevisao } from './components/SeloRevisao'

const CHIP_LINHA: Record<Tratamento['linha'], string> = {
  '1a_linha': 'text-ok border-ok/40 bg-ok/10',
  alternativa: 'text-accent border-accent/40 bg-accent/10',
  opcao: 'text-warn border-warn/40 bg-warn/10',
  off_label: 'text-danger border-danger/40 bg-danger/10',
}

export function TratamentoCard({
  tratamento,
  itens,
  medicamentos,
  apresentacoes,
  gestante,
}: {
  tratamento: Tratamento
  itens: TratamentoItem[]
  medicamentos: Medicamento[]
  apresentacoes: Apresentacao[]
  gestante: boolean
}) {
  const mesesAteRevisar = useConfiguracoesStore((s) => s.mesesAteRevisar)
  const itensDoCard = itensDoTratamento(itens, tratamento.id)
  const temContraindicado = tratamentoTemContraindicadoGestacao(tratamento.id, itens, medicamentos)
  const esmaecido = gestante && temContraindicado
  const revisar = precisaRevisar(
    { precisaRevisao: tratamento.precisa_revisao, revisadoEm: tratamento.revisado_em },
    mesesAteRevisar
  )

  // Linha em branco entre itens — cada um já vem em duas linhas (medicamento + como
  // tomar), sem o espaçamento eles colariam um no outro e ficaria ilegível no combo.
  const textoCombo = itensDoCard
    .map((item) =>
      textoReceitaDoItem(
        item,
        medicamentoPorId(medicamentos, item.medicamento_id)?.nome ?? null,
        apresentacaoPorId(apresentacoes, item.apresentacao_id)
      )
    )
    .join('\n\n')

  return (
    <div
      className={`border rounded-xl p-4 flex flex-col gap-3 transition-opacity ${
        esmaecido ? 'border-danger/50 bg-surface opacity-60 hover:opacity-100' : 'border-border bg-surface'
      }`}
    >
      {esmaecido && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-danger -mb-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          Contém medicamento contraindicado na gestação
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${CHIP_LINHA[tratamento.linha]}`}>
            {LABEL_LINHA[tratamento.linha]}
          </span>
          {tratamento.titulo && <h3 className="font-display text-base font-semibold text-text">{tratamento.titulo}</h3>}
          {revisar && <SeloRevisao revisadoEm={tratamento.revisado_em} />}
        </div>
        {itensDoCard.length > 1 && (
          <CopyButton texto={textoCombo} label="Copiar tudo" variant="solid" />
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        {itensDoCard.map((item) => (
          <ItemLinha
            key={item.id}
            item={item}
            medicamento={medicamentoPorId(medicamentos, item.medicamento_id)}
            apresentacao={apresentacaoPorId(apresentacoes, item.apresentacao_id)}
            modoTratamento={tratamento.modo}
            semMoldura={itensDoCard.length === 1}
          />
        ))}
      </div>

      {(tratamento.referencia || tratamento.revisado_em) && (
        <p className="text-[11px] text-text-dim flex items-center gap-1 flex-wrap">
          {tratamento.referencia &&
            (ehUrl(tratamento.referencia) ? (
              <a
                href={tratamento.referencia}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline flex items-center gap-0.5"
              >
                Referência <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span>{tratamento.referencia}</span>
            ))}
          {tratamento.referencia && tratamento.revisado_em && <span>·</span>}
          {tratamento.revisado_em && <span>revisado em {tratamento.revisado_em}</span>}
        </p>
      )}
    </div>
  )
}
