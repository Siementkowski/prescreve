import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { tratamentosApi, tratamentoItensApi } from '../api'
import type {
  Tratamento,
  TratamentoItem,
  Medicamento,
  Apresentacao,
  ModoTratamento,
  Linha,
  PapelTratamento,
} from '../types'
import { LABEL_MODO_TRATAMENTO, LABEL_LINHA } from '../types'
import { SortableList } from './SortableList'
import { TratamentoItemRow } from './TratamentoItemRow'
import type { NovaApresentacaoDados } from './ApresentacaoPicker'
import { TextField, TextAreaField, SelectField, CheckboxField } from './Field'
import { ItemLinha } from '../../consulta/ItemLinha'

function itemVazio(idTemp: number): TratamentoItem {
  return {
    id: idTemp,
    tratamento_id: 0, // placeholder — o real só existe depois de salvar o esquema
    medicamento_id: null,
    nome_livre: '',
    apresentacao_id: null,
    apresentacao_livre: '',
    quantidade: '',
    dose: '',
    via: '',
    posologia: '',
    duracao: '',
    condicao: '',
    diluicao: '',
    receita_custom: '',
    observacoes: '',
    ordem: 0,
  }
}

interface Cabecalho {
  modo: ModoTratamento
  linha: Linha
  titulo: string
  observacoes: string
  revisado_em: string | null
  precisa_revisao: boolean
  classe: string
}

function cabecalhoDe(t: Tratamento | null): Cabecalho {
  return {
    modo: t?.modo ?? 'ambulatorial',
    linha: t?.linha ?? '1a_linha',
    titulo: t?.titulo ?? '',
    observacoes: t?.observacoes ?? '',
    revisado_em: t?.revisado_em ?? null,
    precisa_revisao: t?.precisa_revisao ?? false,
    classe: t?.classe ?? '',
  }
}

/** Editor de esquema unificado — cabeçalho e itens numa tela só, um "Salvar esquema" que
 *  persiste tudo de uma vez (nada é escrito no banco enquanto a pessoa monta o rascunho).
 *  `tratamentos`/`tratamento_itens` continuam separados no banco — a unificação é só na
 *  experiência de edição. Usado tanto por Prescrições (papel='principal', com patologia e
 *  linha) quanto por Complementos (papel='complemento', com classe, sem patologia fixa).
 *
 *  Monte com `key={tratamento?.id ?? 'novo'}` no componente pai — o remount ao trocar de
 *  seleção é o que dá o reset de rascunho limpo, sem sincronizar estado via useEffect. */
export function EsquemaEditor({
  tratamento,
  papel,
  patologiaId,
  ordemNova,
  medicamentos,
  apresentacoes,
  onSalvo,
  onCriarMedicamento,
  onCriarApresentacao,
  onExcluir,
  extraTopo,
}: {
  tratamento: Tratamento | null
  papel: PapelTratamento
  patologiaId: number | null
  ordemNova: number
  medicamentos: Medicamento[]
  apresentacoes: Apresentacao[]
  onSalvo: (tratamento: Tratamento, itens: TratamentoItem[]) => void
  onCriarMedicamento: (nome: string) => Promise<Medicamento>
  onCriarApresentacao: (medicamentoId: number, dados: NovaApresentacaoDados) => Promise<Apresentacao>
  onExcluir?: () => void
  /** Slot pro que cada tela quer mostrar acima do cabeçalho (ex: "usado em N patologias"
   *  no Complementos) — o editor em si não sabe nada sobre isso. */
  extraTopo?: React.ReactNode
}) {
  const [cabecalho, setCabecalho] = useState<Cabecalho>(cabecalhoDe(tratamento))
  const [itens, setItens] = useState<TratamentoItem[]>([])
  const [carregandoItens, setCarregandoItens] = useState(!!tratamento)
  const [idsRemovidos, setIdsRemovidos] = useState<number[]>([])
  const [proximoIdTemp, setProximoIdTemp] = useState(-1)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // Carrega os itens já existentes uma vez, no mount (o componente é remontado — key —
  // sempre que a seleção muda, então isso não precisa reagir a mudança de prop depois).
  useEffect(() => {
    if (!tratamento) return
    let cancelado = false
    tratamentoItensApi
      .listByTratamento(tratamento.id)
      .then((lista) => !cancelado && setItens(lista))
      .catch((e) => !cancelado && setErro((e as Error).message))
      .finally(() => !cancelado && setCarregandoItens(false))
    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function adicionarItem() {
    setItens((prev) => [...prev, { ...itemVazio(proximoIdTemp), ordem: prev.length }])
    setProximoIdTemp((id) => id - 1)
  }

  function atualizarItem(id: number, patch: Partial<TratamentoItem>) {
    setItens((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }

  function removerItem(id: number) {
    setItens((prev) => prev.filter((i) => i.id !== id))
    if (id > 0) setIdsRemovidos((prev) => [...prev, id])
  }

  async function salvarEsquema() {
    setSalvando(true)
    setErro(null)
    try {
      const payloadCabecalho = {
        patologia_id: papel === 'principal' ? patologiaId : null,
        modo: cabecalho.modo,
        linha: papel === 'principal' ? cabecalho.linha : ('1a_linha' as Linha),
        titulo: cabecalho.titulo,
        observacoes: cabecalho.observacoes,
        referencia: null, // campo removido da UI — não sobrescreve o que já existia no banco
        revisado_em: cabecalho.revisado_em,
        precisa_revisao: cabecalho.precisa_revisao,
        papel,
        classe: papel === 'complemento' ? cabecalho.classe : null,
      }

      let tratamentoSalvo: Tratamento
      if (tratamento) {
        // Não manda `referencia` no update — preserva o que já estava lá, já que o campo
        // saiu da UI mas a coluna continua existindo (não é uma migração de dado, só a tela).
        const { referencia: _semReferencia, ...semReferencia } = payloadCabecalho
        void _semReferencia
        tratamentoSalvo = await tratamentosApi.update(tratamento.id, semReferencia)
      } else {
        tratamentoSalvo = await tratamentosApi.insert({ ...payloadCabecalho, ordem: ordemNova })
      }

      const itensSalvos: TratamentoItem[] = []
      for (const [idx, item] of itens.entries()) {
        const {
          medicamento_id,
          nome_livre,
          apresentacao_id,
          apresentacao_livre,
          quantidade,
          dose,
          via,
          posologia,
          duracao,
          condicao,
          diluicao,
          receita_custom,
          observacoes,
        } = item
        const payloadItem = {
          medicamento_id,
          nome_livre,
          apresentacao_id,
          apresentacao_livre,
          quantidade,
          dose,
          via,
          posologia,
          duracao,
          condicao,
          diluicao,
          receita_custom,
          observacoes,
          ordem: idx,
        }
        if (item.id > 0) {
          itensSalvos.push(await tratamentoItensApi.update(item.id, payloadItem))
        } else {
          itensSalvos.push(await tratamentoItensApi.insert({ ...payloadItem, tratamento_id: tratamentoSalvo.id }))
        }
      }
      for (const id of idsRemovidos) {
        await tratamentoItensApi.remove(id)
      }
      setIdsRemovidos([])
      setItens(itensSalvos)
      onSalvo(tratamentoSalvo, itensSalvos)
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-5">
      {extraTopo}

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {papel === 'complemento' ? (
            <TextField
              label="Classe"
              hint="Ex: Analgésicos/antitérmicos, Antieméticos"
              value={cabecalho.classe}
              onChange={(e) => setCabecalho({ ...cabecalho, classe: e.target.value })}
              placeholder="Analgésicos/antitérmicos"
            />
          ) : (
            <SelectField
              label="Linha"
              value={cabecalho.linha}
              onChange={(e) => setCabecalho({ ...cabecalho, linha: e.target.value as Linha })}
            >
              {Object.entries(LABEL_LINHA).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </SelectField>
          )}
          <SelectField
            label="Modo"
            value={cabecalho.modo}
            onChange={(e) => setCabecalho({ ...cabecalho, modo: e.target.value as ModoTratamento })}
          >
            {Object.entries(LABEL_MODO_TRATAMENTO).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </SelectField>
        </div>

        <TextField
          label="Título (opcional)"
          value={cabecalho.titulo}
          onChange={(e) => setCabecalho({ ...cabecalho, titulo: e.target.value })}
          placeholder="Ex: Esquema padrão"
        />

        <div className="grid grid-cols-2 gap-3 items-end">
          <TextField
            label="Revisado em"
            type="date"
            value={cabecalho.revisado_em ?? ''}
            onChange={(e) => setCabecalho({ ...cabecalho, revisado_em: e.target.value || null })}
          />
          <CheckboxField
            label="Precisa de revisão"
            checked={cabecalho.precisa_revisao}
            onChange={(v) => setCabecalho({ ...cabecalho, precisa_revisao: v })}
          />
        </div>

        <TextAreaField
          label="Observações"
          value={cabecalho.observacoes}
          onChange={(e) => setCabecalho({ ...cabecalho, observacoes: e.target.value })}
          rows={2}
        />
      </div>

      <div className="flex flex-col gap-3 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text">Itens</h3>
          <button
            type="button"
            onClick={adicionarItem}
            className="flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar item
          </button>
        </div>

        {carregandoItens ? (
          <p className="text-sm text-text-dim">Carregando itens…</p>
        ) : itens.length === 0 ? (
          <p className="text-sm text-text-dim">Nenhum item ainda — clique em "Adicionar item".</p>
        ) : (
          <SortableList
            items={itens}
            onReorder={setItens}
            className="flex flex-col gap-3"
            renderItem={(item, arrastando) => (
              <TratamentoItemRow
                item={item}
                medicamentos={medicamentos}
                apresentacoes={apresentacoes}
                modoTratamento={cabecalho.modo}
                arrastando={arrastando}
                onChange={(patch) => atualizarItem(item.id, patch)}
                onExcluir={() => removerItem(item.id)}
                onCriarMedicamento={onCriarMedicamento}
                onCriarApresentacao={onCriarApresentacao}
              />
            )}
          />
        )}
      </div>

      {itens.length > 0 && (
        <div className="flex flex-col gap-3 pt-2 border-t border-border">
          <h3 className="text-sm font-semibold text-text">
            Preview do esquema completo
            <span className="ml-2 text-xs font-normal text-text-dim">— exatamente o que a Consulta mostra e copia</span>
          </h3>
          <div className="flex flex-col gap-2.5">
            {itens.map((item) => (
              <ItemLinha
                key={item.id}
                item={item}
                medicamento={medicamentos.find((m) => m.id === item.medicamento_id) ?? null}
                apresentacao={apresentacoes.find((a) => a.id === item.apresentacao_id) ?? null}
                modoTratamento={cabecalho.modo}
                semMoldura={itens.length === 1}
              />
            ))}
          </div>
        </div>
      )}

      {erro && (
        <p className="text-sm text-danger bg-danger-dim border border-danger/30 rounded-lg px-3 py-2">{erro}</p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        {onExcluir ? (
          <button
            onClick={onExcluir}
            className="flex items-center gap-1.5 text-sm text-danger hover:text-danger/80 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Excluir {papel === 'complemento' ? 'complemento' : 'esquema'}
          </button>
        ) : (
          <span />
        )}
        <button
          onClick={salvarEsquema}
          disabled={salvando}
          className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-accent-text text-sm font-semibold rounded-lg px-4 py-2 transition-colors"
        >
          {salvando ? 'Salvando…' : 'Salvar esquema'}
        </button>
      </div>
    </div>
  )
}
