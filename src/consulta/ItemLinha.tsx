import type { Medicamento, Apresentacao, TratamentoItem, ModoTratamento } from '../admin/types'
import { textoReceitaDoItem, estaUsandoCustom } from '../core/receita'
import { formatarApresentacao } from '../core/apresentacao'
import { CopyButton } from './components/CopyButton'
import { AlertaGestacao } from './components/AlertaGestacao'
import { AlertTriangle, Clock } from 'lucide-react'

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
  const custom = estaUsandoCustom(item.receita_custom)

  const detalhes: { rotulo: string; valor: string | null }[] = [
    { rotulo: 'Apresentação', valor: apresentacao ? formatarApresentacao(apresentacao) : null },
    { rotulo: 'Quantidade', valor: item.quantidade },
    { rotulo: 'Dose', valor: item.dose },
    { rotulo: 'Via', valor: item.via },
    { rotulo: 'Posologia', valor: item.posologia },
    { rotulo: 'Duração', valor: item.duracao },
  ]
  if ((modoTratamento === 'hospitalar' || modoTratamento === 'ambos') && item.diluicao) {
    detalhes.push({ rotulo: 'Diluição', valor: item.diluicao })
  }
  const detalhesPreenchidos = detalhes.filter((d) => d.valor?.trim())

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
      <AlertaGestacao status={medicamento?.gestacao_status ?? null} obs={medicamento?.gestacao_obs ?? null} />

      {/* Receita montada — o que vai ser colado na prescrição, sempre em destaque. Mono:
          lê como um rótulo de bula, não como prosa qualquer. */}
      <div className="rounded-md bg-bg border border-border px-3 py-2.5">
        {custom && (
          <span className="block text-[11px] font-medium text-warn mb-1">Texto customizado</span>
        )}
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

      {detalhesPreenchidos.length > 0 && (
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
          {detalhesPreenchidos.map((d) => (
            <div key={d.rotulo}>
              <dt className="text-[11px] text-text-dim uppercase tracking-wide">{d.rotulo}</dt>
              <dd className="tabular text-sm text-text">{d.valor}</dd>
            </div>
          ))}
        </dl>
      )}

      {item.observacoes && (
        <p className="text-sm text-text-dim leading-relaxed">{item.observacoes}</p>
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
