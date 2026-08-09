import { useEffect, useState } from 'react'
import { Trash2, Pencil } from 'lucide-react'
import type { Medicamento, Apresentacao, ModoTratamento, TratamentoItem } from '../types'
import { gerarTextoReceita, gerarTextoPadrao, estaUsandoCustom } from '../../core/receita'
import { formatarApresentacao } from '../../core/apresentacao'
import { MedicamentoPicker } from './MedicamentoPicker'
import { TextField, TextAreaField, SelectField } from './Field'

function resolveNome(item: Pick<TratamentoItem, 'medicamento_id' | 'nome_livre'>, medicamentos: Medicamento[]): string {
  if (item.medicamento_id) {
    return medicamentos.find((m) => m.id === item.medicamento_id)?.nome ?? ''
  }
  return item.nome_livre ?? ''
}

function saoIguais(a: TratamentoItem, b: TratamentoItem): boolean {
  return (
    a.medicamento_id === b.medicamento_id &&
    a.nome_livre === b.nome_livre &&
    a.apresentacao_id === b.apresentacao_id &&
    a.quantidade === b.quantidade &&
    a.dose === b.dose &&
    a.via === b.via &&
    a.posologia === b.posologia &&
    a.duracao === b.duracao &&
    a.condicao === b.condicao &&
    a.diluicao === b.diluicao &&
    a.receita_custom === b.receita_custom &&
    a.observacoes === b.observacoes
  )
}

export function TratamentoItemRow({
  item,
  medicamentos,
  apresentacoes,
  modoTratamento,
  arrastando,
  onSalvar,
  onExcluir,
  onCriarMedicamento,
}: {
  item: TratamentoItem
  medicamentos: Medicamento[]
  apresentacoes: Apresentacao[]
  modoTratamento: ModoTratamento
  arrastando: boolean
  onSalvar: (id: number, dados: Partial<TratamentoItem>) => Promise<void>
  onExcluir: (id: number) => void
  onCriarMedicamento?: (nome: string) => Promise<Medicamento>
}) {
  const [local, setLocal] = useState<TratamentoItem>(item)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [usaCadastro, setUsaCadastro] = useState(!!item.medicamento_id)

  useEffect(() => {
    setLocal(item)
    setUsaCadastro(!!item.medicamento_id)
  }, [item])

  const dirty = !saoIguais(local, item)
  const nomeResolvido = resolveNome(local, medicamentos)
  const apresentacoesDoMedicamento = apresentacoes.filter((a) => a.medicamento_id === local.medicamento_id)
  const apresentacaoSelecionada = apresentacoesDoMedicamento.find((a) => a.id === local.apresentacao_id) ?? null

  const dadosReceita = {
    nomeMedicamento: nomeResolvido,
    apresentacao: apresentacaoSelecionada,
    quantidade: local.quantidade,
    dose: local.dose,
    via: local.via,
    posologia: local.posologia,
    duracao: local.duracao,
    condicao: local.condicao,
  }
  const textoPadrao = gerarTextoPadrao({ ...dadosReceita, receitaCustom: null })
  const textoFinal = gerarTextoReceita({ ...dadosReceita, receitaCustom: local.receita_custom })
  const usandoCustom = estaUsandoCustom(local.receita_custom)

  async function salvar() {
    setSalvando(true)
    setErro(null)
    try {
      // Só os campos editáveis — id/tratamento_id/ordem não fazem parte do payload de update.
      const {
        medicamento_id,
        nome_livre,
        apresentacao_id,
        quantidade,
        dose,
        via,
        posologia,
        duracao,
        condicao,
        diluicao,
        receita_custom,
        observacoes,
      } = local
      await onSalvar(item.id, {
        medicamento_id,
        nome_livre,
        apresentacao_id,
        quantidade,
        dose,
        via,
        posologia,
        duracao,
        condicao,
        diluicao,
        receita_custom,
        observacoes,
      })
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setSalvando(false)
    }
  }

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
            onClick={() => {
              setUsaCadastro(true)
              setLocal({ ...local, nome_livre: null })
            }}
            className={`px-2 py-1 transition-colors ${usaCadastro ? 'bg-accent text-accent-text' : 'text-text-dim hover:text-text'}`}
          >
            Cadastro
          </button>
          <button
            type="button"
            onClick={() => {
              setUsaCadastro(false)
              setLocal({ ...local, medicamento_id: null })
            }}
            className={`px-2 py-1 transition-colors ${!usaCadastro ? 'bg-accent text-accent-text' : 'text-text-dim hover:text-text'}`}
          >
            Nome livre
          </button>
        </div>

        <div className="flex-1">
          {usaCadastro ? (
            <MedicamentoPicker
              medicamentos={medicamentos}
              valorId={local.medicamento_id}
              onSelecionar={(id) => setLocal({ ...local, medicamento_id: id, apresentacao_id: null })}
              onCriar={onCriarMedicamento}
            />
          ) : (
            <input
              value={local.nome_livre ?? ''}
              onChange={(e) => setLocal({ ...local, nome_livre: e.target.value })}
              placeholder='Ex: "SF 0,9%"'
              className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm text-text outline-none focus:border-accent transition-colors"
            />
          )}
        </div>

        <button
          type="button"
          onClick={() => onExcluir(item.id)}
          className="shrink-0 text-text-dim hover:text-danger transition-colors p-1.5"
          title="Remover item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Apresentação do catálogo — carrega as apresentações do medicamento escolhido;
          quantidade é texto porque aceita faixa ("1 a 2"). */}
      {usaCadastro && local.medicamento_id && (
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <SelectField
            label="Apresentação"
            value={local.apresentacao_id ?? ''}
            onChange={(e) =>
              setLocal({ ...local, apresentacao_id: e.target.value ? Number(e.target.value) : null })
            }
          >
            <option value="">
              {apresentacoesDoMedicamento.length === 0 ? 'Nenhuma cadastrada — use "Dose" abaixo' : '— nenhuma —'}
            </option>
            {apresentacoesDoMedicamento.map((a) => (
              <option key={a.id} value={a.id}>
                {formatarApresentacao(a)}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Quantidade"
            hint="Aceita faixa"
            value={local.quantidade ?? ''}
            onChange={(e) => setLocal({ ...local, quantidade: e.target.value })}
            placeholder="1 a 2"
            className="w-28"
            disabled={!local.apresentacao_id}
          />
        </div>
      )}

      <div className={`grid gap-3 ${modoTratamento !== 'ambulatorial' ? 'grid-cols-5' : 'grid-cols-4'}`}>
        <TextField
          label="Dose"
          value={local.dose ?? ''}
          onChange={(e) => setLocal({ ...local, dose: e.target.value })}
          placeholder="100 mg"
        />
        <TextField
          label="Via"
          value={local.via ?? ''}
          onChange={(e) => setLocal({ ...local, via: e.target.value })}
          placeholder="VO"
        />
        <TextField
          label="Posologia"
          value={local.posologia ?? ''}
          onChange={(e) => setLocal({ ...local, posologia: e.target.value })}
          placeholder="6/6h"
        />
        <TextField
          label="Duração"
          value={local.duracao ?? ''}
          onChange={(e) => setLocal({ ...local, duracao: e.target.value })}
          placeholder="5 dias"
        />
        {modoTratamento !== 'ambulatorial' && (
          <TextField
            label="Diluição"
            value={local.diluicao ?? ''}
            onChange={(e) => setLocal({ ...local, diluicao: e.target.value })}
            placeholder="SF 100ml"
          />
        )}
      </div>

      <TextField
        label="Condição (SOS)"
        hint='Só pra quando não há duração fixa — "se dor ou febre", "se náusea". Deixe em branco pra uso contínuo.'
        value={local.condicao ?? ''}
        onChange={(e) => setLocal({ ...local, condicao: e.target.value })}
        placeholder="se dor ou febre"
      />

      <TextAreaField
        label="Observações do item"
        value={local.observacoes ?? ''}
        onChange={(e) => setLocal({ ...local, observacoes: e.target.value })}
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
        <p className={`text-sm ${usandoCustom ? 'text-warn' : 'text-text'}`}>
          {textoFinal || <span className="text-text-dim">Preencha os campos para gerar o texto…</span>}
        </p>
        {usandoCustom && textoPadrao && (
          <p className="text-xs text-text-dim line-through decoration-text-dim/60">{textoPadrao}</p>
        )}
      </div>

      <TextAreaField
        label="Receita customizada (opcional)"
        hint="Preencha só quando o texto automático não servir — ele passa a ser ignorado."
        value={local.receita_custom ?? ''}
        onChange={(e) => setLocal({ ...local, receita_custom: e.target.value })}
        rows={2}
      />

      {erro && <p className="text-xs text-danger">{erro}</p>}

      {dirty && (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setLocal(item)}
            className="text-xs text-text-dim hover:text-text transition-colors px-2 py-1"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={salvar}
            disabled={salvando}
            className="text-xs bg-accent hover:bg-accent/90 disabled:opacity-50 text-accent-text rounded-lg px-3 py-1.5 transition-colors"
          >
            {salvando ? 'Salvando…' : 'Salvar item'}
          </button>
        </div>
      )}
    </div>
  )
}
