import { Trash2, Pencil, Calculator } from 'lucide-react'
import type { Medicamento, Apresentacao, ModoTratamento, TratamentoItem } from '../types'
import { gerarTextoReceita, gerarTextoPadrao, estaUsandoCustom } from '../../core/receita'
import { calcularDose, formatarDoseCalculada } from '../../core/dose'
import { MedicamentoPicker } from './MedicamentoPicker'
import { ApresentacaoPicker, type NovaApresentacaoDados } from './ApresentacaoPicker'
import { TextField, TextAreaField } from './Field'

function resolveNome(item: Pick<TratamentoItem, 'medicamento_id' | 'nome_livre'>, medicamentos: Medicamento[]): string {
  if (item.medicamento_id) {
    return medicamentos.find((m) => m.id === item.medicamento_id)?.nome ?? ''
  }
  return item.nome_livre ?? ''
}

/** Um item dentro do rascunho do esquema — totalmente controlado (sem buffer local, sem
 *  Salvar/Cancelar próprio): cada mudança já entra no rascunho do EsquemaEditor, e só vira
 *  escrita no banco quando o esquema inteiro é salvo. */
export function TratamentoItemRow({
  item,
  medicamentos,
  apresentacoes,
  modoTratamento,
  arrastando,
  onChange,
  onExcluir,
  onCriarMedicamento,
  onCriarApresentacao,
}: {
  item: TratamentoItem
  medicamentos: Medicamento[]
  apresentacoes: Apresentacao[]
  modoTratamento: ModoTratamento
  arrastando: boolean
  onChange: (patch: Partial<TratamentoItem>) => void
  onExcluir: () => void
  onCriarMedicamento?: (nome: string) => Promise<Medicamento>
  onCriarApresentacao?: (medicamentoId: number, dados: NovaApresentacaoDados) => Promise<Apresentacao>
}) {
  // Item recém-criado (os dois nulos) cai em "Cadastro" por padrão; assim que um dos dois
  // modos é usado (medicamento_id ou nome_livre preenchidos), o estado real decide sozinho.
  const modoAtual: 'cadastro' | 'livre' = item.medicamento_id ? 'cadastro' : item.nome_livre ? 'livre' : 'cadastro'

  const nomeResolvido = resolveNome(item, medicamentos)
  const apresentacoesDoMedicamento = apresentacoes.filter((a) => a.medicamento_id === item.medicamento_id)
  const apresentacaoSelecionada = apresentacoesDoMedicamento.find((a) => a.id === item.apresentacao_id) ?? null

  const dadosReceita = {
    nomeMedicamento: nomeResolvido,
    apresentacao: apresentacaoSelecionada,
    apresentacaoLivre: item.apresentacao_livre,
    quantidade: item.quantidade,
    dose: item.dose,
    via: item.via,
    posologia: item.posologia,
    duracao: item.duracao,
    condicao: item.condicao,
  }
  const textoPadrao = gerarTextoPadrao({ ...dadosReceita, receitaCustom: null })
  const textoFinal = gerarTextoReceita({ ...dadosReceita, receitaCustom: item.receita_custom })
  const usandoCustom = estaUsandoCustom(item.receita_custom)

  // Dose derivada de quantidade × concentração — não digitada. Se o valor guardado em
  // `dose` bate com o calculado, é automático; se diverge (a pessoa digitou algo diferente
  // por cima), fica marcado como override, sem esconder o que foi calculado.
  const doseCalculada = apresentacaoSelecionada ? calcularDose(apresentacaoSelecionada, item.quantidade) : null
  const doseCalculadaTexto = doseCalculada ? formatarDoseCalculada(doseCalculada) : null
  // Só conta como "override" quando existe um valor calculado sendo sobrescrito — dose
  // digitada sem nenhum cálculo possível (sem concentração cadastrada, por ex.) é apenas
  // texto manual, não uma divergência de nada.
  const doseEhOverride = !!doseCalculadaTexto && !!item.dose?.trim() && item.dose.trim() !== doseCalculadaTexto

  return (
    <div
      className={`bg-surface border rounded-md p-3 flex flex-col gap-3 ${
        arrastando ? 'border-accent' : 'border-border'
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="flex rounded-md overflow-hidden border border-border text-xs shrink-0">
          <button
            type="button"
            onClick={() => onChange({ nome_livre: null, apresentacao_livre: null })}
            className={`px-2 py-1 transition-colors ${modoAtual === 'cadastro' ? 'bg-accent text-accent-text' : 'text-text-dim hover:text-text'}`}
          >
            Cadastro
          </button>
          <button
            type="button"
            onClick={() => onChange({ medicamento_id: null, apresentacao_id: null, nome_livre: item.nome_livre ?? '' })}
            className={`px-2 py-1 transition-colors ${modoAtual === 'livre' ? 'bg-accent text-accent-text' : 'text-text-dim hover:text-text'}`}
          >
            Nome livre
          </button>
        </div>

        <div className="flex-1">
          {modoAtual === 'cadastro' ? (
            <MedicamentoPicker
              medicamentos={medicamentos}
              valorId={item.medicamento_id}
              onSelecionar={(id) => onChange({ medicamento_id: id, apresentacao_id: null })}
              onCriar={onCriarMedicamento}
            />
          ) : (
            <input
              value={item.nome_livre ?? ''}
              onChange={(e) => onChange({ nome_livre: e.target.value })}
              placeholder='Ex: "SF 0,9%"'
              className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm text-text outline-none focus:border-accent transition-colors"
            />
          )}
        </div>

        <button
          type="button"
          onClick={onExcluir}
          className="shrink-0 text-text-dim hover:text-danger transition-colors p-1.5"
          title="Remover item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {modoAtual === 'cadastro' && item.medicamento_id && (
        <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-text-dim uppercase tracking-wide">Apresentação</span>
            <ApresentacaoPicker
              apresentacoes={apresentacoesDoMedicamento}
              valorId={item.apresentacao_id}
              onSelecionar={(id) => onChange({ apresentacao_id: id })}
              onCriar={
                onCriarApresentacao && item.medicamento_id
                  ? (dados) => onCriarApresentacao(item.medicamento_id!, dados)
                  : undefined
              }
            />
          </label>
          <TextField
            label="Quantidade"
            hint="Aceita faixa"
            value={item.quantidade ?? ''}
            onChange={(e) => onChange({ quantidade: e.target.value })}
            placeholder="1 a 2"
            className="w-28"
            disabled={!item.apresentacao_id}
          />
        </div>
      )}

      {modoAtual === 'livre' && (
        <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
          <TextField
            label="Apresentação"
            hint="Texto livre — sem medicamento cadastrado não há apresentações pra escolher"
            value={item.apresentacao_livre ?? ''}
            onChange={(e) => onChange({ apresentacao_livre: e.target.value })}
            placeholder='Ex: "bolsa 500ml"'
          />
          <TextField
            label="Quantidade"
            hint="Aceita faixa"
            value={item.quantidade ?? ''}
            onChange={(e) => onChange({ quantidade: e.target.value })}
            placeholder="1 a 2"
            className="w-28"
            disabled={!item.apresentacao_livre?.trim()}
          />
        </div>
      )}

      <div className={`grid gap-3 ${modoTratamento !== 'ambulatorial' ? 'grid-cols-5' : 'grid-cols-4'}`}>
        <label className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1 text-[11px] font-medium text-text-dim uppercase tracking-wide">
            Dose
            {doseEhOverride ? (
              <Pencil className="w-3 h-3 text-warn" />
            ) : doseCalculada ? (
              <Calculator className="w-3 h-3 text-text-faint" />
            ) : null}
          </span>
          <input
            value={item.dose ?? ''}
            onChange={(e) => onChange({ dose: e.target.value })}
            placeholder={doseCalculadaTexto ?? '100 mg'}
            className={`bg-surface-2 border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors w-full ${
              doseEhOverride ? 'border-warn/60 text-warn' : 'border-border text-text'
            }`}
          />
          {doseCalculada && !item.dose?.trim() && (
            <span className="text-xs text-text-dim/80">Calculado: {doseCalculadaTexto} — digite pra sobrescrever</span>
          )}
          {doseEhOverride && doseCalculadaTexto && (
            <span className="text-xs text-warn/80">Digitado — o cálculo daria {doseCalculadaTexto}</span>
          )}
        </label>
        <TextField
          label="Via"
          value={item.via ?? ''}
          onChange={(e) => onChange({ via: e.target.value })}
          placeholder="VO"
        />
        <TextField
          label="Posologia"
          value={item.posologia ?? ''}
          onChange={(e) => onChange({ posologia: e.target.value })}
          placeholder="6/6h"
        />
        <TextField
          label="Duração"
          value={item.duracao ?? ''}
          onChange={(e) => onChange({ duracao: e.target.value })}
          placeholder="5 dias"
        />
        {modoTratamento !== 'ambulatorial' && (
          <TextField
            label="Diluição"
            value={item.diluicao ?? ''}
            onChange={(e) => onChange({ diluicao: e.target.value })}
            placeholder="SF 100ml"
          />
        )}
      </div>

      <TextField
        label="Condição (SOS)"
        hint='Só pra quando não há duração fixa — "se dor ou febre", "se náusea". Deixe em branco pra uso contínuo.'
        value={item.condicao ?? ''}
        onChange={(e) => onChange({ condicao: e.target.value })}
        placeholder="se dor ou febre"
      />

      <TextAreaField
        label="Observações do item"
        value={item.observacoes ?? ''}
        onChange={(e) => onChange({ observacoes: e.target.value })}
        rows={2}
      />

      {/* Preview da receita — derivada, não digitada */}
      <div className="rounded-md border border-border bg-surface-2 p-3 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-dim">Preview da receita</span>
          {usandoCustom && (
            <span className="flex items-center gap-1 text-xs text-warn">
              <Pencil className="w-3 h-3" />
              Texto customizado — ignorando o automático
            </span>
          )}
        </div>
        <p className={`text-sm whitespace-pre-line ${usandoCustom ? 'text-warn' : 'text-text'}`}>
          {textoFinal || <span className="text-text-dim">Preencha os campos para gerar o texto…</span>}
        </p>
        {usandoCustom && textoPadrao && (
          <p className="text-xs text-text-dim whitespace-pre-line line-through decoration-text-dim/60">{textoPadrao}</p>
        )}
      </div>

      <TextAreaField
        label="Receita customizada (opcional)"
        hint="Preencha só quando o texto automático não servir — ele passa a ser ignorado."
        value={item.receita_custom ?? ''}
        onChange={(e) => onChange({ receita_custom: e.target.value })}
        rows={2}
      />
    </div>
  )
}
