import type { Medicamento, Apresentacao, TratamentoItem, ModoTratamento } from '../admin/types'
import { textoReceitaDoItem } from '../core/receita'
import { CopyButton } from './components/CopyButton'
import { AlertaGestacao } from './components/AlertaGestacao'
import { AlertTriangle, Clock, Info } from 'lucide-react'

export function ItemLinha({
  item,
  medicamento,
  apresentacao,
  modoTratamento,
  semMoldura = false,
}: {
  item: TratamentoItem
  medicamento: Medicamento | null
  apresentacao: Apresentacao | null
  modoTratamento: ModoTratamento
  /** Quando o tratamento tem um único item, o card externo (TratamentoCard) já dá a
   *  moldura — renderiza só o conteúdo, sem duplicar borda/fundo. */
  semMoldura?: boolean
}) {
  const nomeExibido = medicamento?.nome ?? item.nome_livre ?? '—'
  const texto = textoReceitaDoItem(item, medicamento?.nome ?? null, apresentacao)

  return (
    <div className={semMoldura ? 'flex flex-col gap-3' : 'border border-border rounded-lg p-4 bg-surface-2 flex flex-col gap-3'}>
      {/* Nome já aparece no cabeçalho do card quando é item único (semMoldura) — não repete
          aqui, só o botão de copiar individual continua sempre presente. */}
      <div className={`flex items-start gap-3 ${semMoldura ? 'justify-end' : 'justify-between'}`}>
        {!semMoldura && (
          <div className="min-w-0">
            <p className="font-display text-base font-semibold text-text">{nomeExibido}</p>
            {medicamento?.apresentacoes && (
              <p className="text-xs text-text-dim mt-0.5">{medicamento.apresentacoes}</p>
            )}
          </div>
        )}
        <CopyButton texto={texto} label="Copiar" />
      </div>

      {/* Alerta de gestação — automático, sempre visível, independente de qualquer toggle */}
      <AlertaGestacao
        status={medicamento?.gestacao_status ?? null}
        obs={medicamento?.gestacao_obs ?? null}
        incompleto={medicamento?.incompleto ?? false}
      />

      {/* Receita montada — o que vai ser colado na prescrição, sempre em destaque. Mono:
          lê como um rótulo de bula, não como prosa qualquer. */}
      <div className="rounded-md bg-bg border border-border px-3 py-2.5">
        <p className="tabular text-sm text-text font-medium leading-relaxed whitespace-pre-line">{texto || '—'}</p>
      </div>

      {/* Condição (SOS) — muda QUANDO tomar, não é só mais um detalhe: destaque próprio,
          separado da grade de dose/via/posologia. */}
      {item.condicao?.trim() && (
        <div className="flex items-center gap-2 text-sm font-medium text-accent bg-accent-dim border border-accent/30 rounded-md px-3 py-2">
          <Clock className="w-4 h-4 shrink-0" />
          <span>{item.condicao}</span>
        </div>
      )}

      {/* Diluição — só hospitalar/ambos, e só ela ficou de fora da receita (as outras —
          apresentação, quantidade, dose, via, posologia, duração — já estão no texto
          acima, mostrar de novo embaixo era duplicar informação). */}
      {(modoTratamento === 'hospitalar' || modoTratamento === 'ambos') && item.diluicao?.trim() && (
        <div>
          <dt className="text-[11px] text-text-dim uppercase tracking-wide">Diluição</dt>
          <dd className="tabular text-sm text-text">{item.diluicao}</dd>
        </div>
      )}

      {/* Observação do item — destaque próprio em amarelo, não some no meio dos detalhes
          neutros (é aviso de quem prescreve pra quem lê, não só mais um dado). */}
      {item.observacoes && (
        <div className="flex items-start gap-2 text-sm font-medium text-warn bg-warn/10 border border-warn/30 rounded-md px-3 py-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{item.observacoes}</span>
        </div>
      )}

      {medicamento?.contraindicacoes && (
        <div className="flex items-start gap-2 text-sm text-danger bg-danger/10 border border-danger/30 rounded-md px-3 py-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{medicamento.contraindicacoes}</span>
        </div>
      )}
    </div>
  )
}
