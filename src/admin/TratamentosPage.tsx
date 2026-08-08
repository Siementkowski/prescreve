import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, Lock, Plus, Trash2 } from 'lucide-react'
import { areasApi, patologiasApi, tratamentosApi, tratamentoItensApi, medicamentosApi } from './api'
import type {
  Area,
  Patologia,
  Tratamento,
  TratamentoInput,
  TratamentoItem,
  Medicamento,
  MedicamentoInput,
  ModoTratamento,
  Linha,
} from './types'
import { LABEL_MODO_TRATAMENTO, LABEL_LINHA } from './types'
import { SearchInput } from './components/SearchInput'
import { ConfirmDialog } from './components/ConfirmDialog'
import { SortableList } from './components/SortableList'
import { TratamentoItemRow } from './components/TratamentoItemRow'
import { TextField, SelectField, CheckboxField } from './components/Field'

function vazio(patologiaId: number, ordem: number): TratamentoInput {
  return {
    patologia_id: patologiaId,
    modo: 'ambulatorial',
    linha: '1a_linha',
    titulo: '',
    observacoes: '',
    referencia: '',
    revisado_em: null,
    precisa_revisao: false,
    ordem,
  }
}

function medicamentoVazio(nome: string): MedicamentoInput {
  return {
    nome,
    nome_comercial: null,
    apresentacoes: null,
    gestacao_status: null,
    gestacao_obs: null,
    lactacao_status: null,
    contraindicacoes: null,
    ped_mg_kg_dia: null,
    ped_dose_max_dia: null,
    ped_concentracao: null,
    ped_volume_ref: null,
    ped_obs: null,
  }
}

export function TratamentosPage() {
  const [areas, setAreas] = useState<Area[]>([])
  const [areaSelecionada, setAreaSelecionada] = useState<number | null>(null)
  const [patologias, setPatologias] = useState<Patologia[]>([])
  const [patologiaSelecionada, setPatologiaSelecionada] = useState<number | null>(null)
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])

  const [tratamentos, setTratamentos] = useState<Tratamento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [busca, setBusca] = useState('')

  const [selecionadoId, setSelecionadoId] = useState<number | null>(null)
  const [form, setForm] = useState<TratamentoInput | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [paraExcluir, setParaExcluir] = useState<Tratamento | null>(null)

  const [itens, setItens] = useState<TratamentoItem[]>([])
  const [carregandoItens, setCarregandoItens] = useState(false)

  useEffect(() => {
    areasApi.list().then((lista) => {
      setAreas(lista)
      if (lista.length > 0) setAreaSelecionada(lista[0].id)
    })
    medicamentosApi.list().then(setMedicamentos)
  }, [])

  useEffect(() => {
    if (areaSelecionada == null) return
    patologiasApi.listByArea(areaSelecionada).then((lista) => {
      setPatologias(lista)
      setPatologiaSelecionada(lista.length > 0 ? lista[0].id : null)
    })
  }, [areaSelecionada])

  useEffect(() => {
    if (patologiaSelecionada == null) {
      setTratamentos([])
      return
    }
    setCarregando(true)
    tratamentosApi
      .listByPatologia(patologiaSelecionada)
      .then((lista) => {
        setTratamentos(lista)
        setSelecionadoId(null)
        setForm(vazio(patologiaSelecionada, lista.length))
        setItens([])
        setErro(null)
      })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [patologiaSelecionada])

  const filtrados = useMemo(
    () =>
      tratamentos.filter((t) =>
        `${t.titulo ?? ''} ${LABEL_MODO_TRATAMENTO[t.modo]} ${LABEL_LINHA[t.linha]}`
          .toLowerCase()
          .includes(busca.toLowerCase())
      ),
    [tratamentos, busca]
  )

  const nomeArea = areas.find((a) => a.id === areaSelecionada)?.nome ?? ''
  const nomePatologia = patologias.find((p) => p.id === patologiaSelecionada)?.nome ?? ''
  const tratamentoSelecionado = tratamentos.find((t) => t.id === selecionadoId) ?? null

  function novo() {
    if (patologiaSelecionada == null) return
    setSelecionadoId(null)
    setForm(vazio(patologiaSelecionada, tratamentos.length))
    setItens([])
    setErro(null)
  }

  async function selecionar(t: Tratamento) {
    setSelecionadoId(t.id)
    setForm(t)
    setErro(null)
    setCarregandoItens(true)
    try {
      setItens(await tratamentoItensApi.listByTratamento(t.id))
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setCarregandoItens(false)
    }
  }

  async function salvarCabecalho() {
    if (!form) return
    setSalvando(true)
    setErro(null)
    try {
      if (selecionadoId) {
        const atualizado = await tratamentosApi.update(selecionadoId, form)
        setTratamentos((prev) => prev.map((t) => (t.id === selecionadoId ? atualizado : t)))
        setForm(atualizado)
      } else {
        const criado = await tratamentosApi.insert(form)
        setTratamentos((prev) => [...prev, criado])
        setSelecionadoId(criado.id)
        setForm(criado)
        setItens([])
      }
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setSalvando(false)
    }
  }

  async function excluirTratamento(t: Tratamento) {
    try {
      await tratamentosApi.remove(t.id)
      setTratamentos((prev) => prev.filter((x) => x.id !== t.id))
      if (selecionadoId === t.id) novo()
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setParaExcluir(null)
    }
  }

  async function reordenarTratamentos(novaOrdem: Tratamento[]) {
    setTratamentos(novaOrdem)
    try {
      await tratamentosApi.reorder(novaOrdem.map((t, idx) => ({ id: t.id, ordem: idx })))
    } catch (e) {
      setErro((e as Error).message)
    }
  }

  async function adicionarItem() {
    if (!selecionadoId) return
    try {
      const criado = await tratamentoItensApi.insert({
        tratamento_id: selecionadoId,
        medicamento_id: null,
        nome_livre: '',
        dose: '',
        via: '',
        posologia: '',
        duracao: '',
        diluicao: '',
        receita_custom: '',
        observacoes: '',
        ordem: itens.length,
      })
      setItens((prev) => [...prev, criado])
    } catch (e) {
      setErro((e as Error).message)
    }
  }

  async function salvarItem(id: number, dados: Partial<TratamentoItem>) {
    const atualizado = await tratamentoItensApi.update(id, dados)
    setItens((prev) => prev.map((i) => (i.id === id ? atualizado : i)))
  }

  async function excluirItem(id: number) {
    try {
      await tratamentoItensApi.remove(id)
      setItens((prev) => prev.filter((i) => i.id !== id))
    } catch (e) {
      setErro((e as Error).message)
    }
  }

  async function reordenarItens(novaOrdem: TratamentoItem[]) {
    setItens(novaOrdem)
    try {
      await tratamentoItensApi.reorder(novaOrdem.map((i, idx) => ({ id: i.id, ordem: idx })))
    } catch (e) {
      setErro((e as Error).message)
    }
  }

  /** Cadastro rápido de medicamento direto do item — evita trocar de aba no meio da receita. */
  async function criarMedicamentoRapido(nome: string): Promise<Medicamento> {
    const criado = await medicamentosApi.insert(medicamentoVazio(nome))
    setMedicamentos((prev) => [...prev, criado].sort((a, b) => a.nome.localeCompare(b.nome)))
    return criado
  }

  if (areas.length === 0) {
    return <p className="text-sm text-text-dim">Cadastre uma área e uma patologia primeiro.</p>
  }
  if (patologias.length === 0) {
    return (
      <p className="text-sm text-text-dim">
        Esta área ainda não tem patologias. Cadastre uma na aba "Patologias".
      </p>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 h-full min-h-0">
        <div className="flex flex-col gap-3 min-h-0">
          <div className="grid grid-cols-2 gap-2">
            <SelectField
              label="Área"
              value={areaSelecionada ?? ''}
              onChange={(e) => setAreaSelecionada(Number(e.target.value))}
            >
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Patologia"
              value={patologiaSelecionada ?? ''}
              onChange={(e) => setPatologiaSelecionada(Number(e.target.value))}
            >
              {patologias.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <SearchInput value={busca} onChange={setBusca} placeholder="Buscar prescrição…" />
            </div>
            <button
              onClick={novo}
              className="shrink-0 flex items-center gap-1.5 bg-accent hover:bg-accent/90 text-accent-text text-sm font-semibold rounded-lg px-3 py-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Novo
            </button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
            {carregando ? (
              <p className="text-sm text-text-dim px-1">Carregando…</p>
            ) : filtrados.length === 0 ? (
              <p className="text-sm text-text-dim px-1">Nenhuma prescrição cadastrada.</p>
            ) : (
              <SortableList
                items={filtrados}
                onReorder={reordenarTratamentos}
                renderItem={(t) => (
                  <button
                    onClick={() => selecionar(t)}
                    className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                      selecionadoId === t.id
                        ? 'bg-accent-dim border-accent'
                        : 'bg-surface border-border hover:border-text-faint'
                    }`}
                  >
                    <span className="block text-sm text-text truncate">
                      {t.titulo || `${LABEL_MODO_TRATAMENTO[t.modo]} · ${LABEL_LINHA[t.linha]}`}
                    </span>
                    <span className="block text-xs text-text-dim">
                      {LABEL_MODO_TRATAMENTO[t.modo]} · {LABEL_LINHA[t.linha]}
                    </span>
                  </button>
                )}
              />
            )}
          </div>
        </div>

        <div className="min-h-0 overflow-y-auto flex flex-col gap-5 pb-6">
          {/* Trilha de contexto — nunca perder onde você está na hierarquia */}
          <div className="flex items-center gap-1.5 text-xs text-text-dim">
            <span>{nomeArea}</span>
            <ChevronRight className="w-3 h-3" />
            <span>{nomePatologia}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-text font-medium">
              {tratamentoSelecionado
                ? tratamentoSelecionado.titulo || `${LABEL_MODO_TRATAMENTO[tratamentoSelecionado.modo]} · ${LABEL_LINHA[tratamentoSelecionado.linha]}`
                : 'Nova prescrição'}
            </span>
          </div>

          {form && (
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-2.5 mb-1">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent-dim text-accent text-[11px] font-bold shrink-0">
                  1
                </span>
                <h2 className="text-sm font-semibold text-text">Cabeçalho da prescrição</h2>
              </div>
              <p className="text-xs text-text-dim mb-4 ml-7.5">
                A prescrição é o contêiner — modo, linha e título. Os medicamentos com dose e posologia
                entram na seção 2, depois de salvar aqui.
              </p>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <SelectField
                    label="Modo"
                    value={form.modo}
                    onChange={(e) => setForm({ ...form, modo: e.target.value as ModoTratamento })}
                  >
                    {Object.entries(LABEL_MODO_TRATAMENTO).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </SelectField>
                  <SelectField
                    label="Linha"
                    value={form.linha}
                    onChange={(e) => setForm({ ...form, linha: e.target.value as Linha })}
                  >
                    {Object.entries(LABEL_LINHA).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </SelectField>
                </div>

                <TextField
                  label="Título (opcional)"
                  value={form.titulo ?? ''}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ex: Esquema padrão"
                />

                <div className="grid grid-cols-2 gap-3">
                  <TextField
                    label="Referência (opcional)"
                    value={form.referencia ?? ''}
                    onChange={(e) => setForm({ ...form, referencia: e.target.value })}
                  />
                  <TextField
                    label="Revisado em"
                    type="date"
                    value={form.revisado_em ?? ''}
                    onChange={(e) => setForm({ ...form, revisado_em: e.target.value || null })}
                  />
                </div>

                <CheckboxField
                  label="Precisa de revisão"
                  checked={form.precisa_revisao}
                  onChange={(v) => setForm({ ...form, precisa_revisao: v })}
                />

                {erro && (
                  <p className="text-sm text-danger bg-danger-dim border border-danger/30 rounded-lg px-3 py-2">
                    {erro}
                  </p>
                )}

                <div className="flex items-center justify-between mt-2">
                  {selecionadoId ? (
                    <button
                      onClick={() => setParaExcluir(tratamentos.find((t) => t.id === selecionadoId) ?? null)}
                      className="flex items-center gap-1.5 text-sm text-danger hover:text-danger/80 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir prescrição
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    onClick={salvarCabecalho}
                    disabled={salvando}
                    className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-accent-text text-sm font-semibold rounded-lg px-4 py-2 transition-colors"
                  >
                    {salvando ? 'Salvando…' : selecionadoId ? 'Salvar cabeçalho' : 'Criar prescrição e liberar itens →'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Seção 2 sempre visível — trancada até o cabeçalho existir, em vez de simplesmente
              não aparecer. É essa transição invisível que confundia antes. */}
          <div
            className={`bg-surface border rounded-xl p-6 ${
              selecionadoId ? 'border-border' : 'border-border border-dashed'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold shrink-0 ${
                    selecionadoId ? 'bg-accent-dim text-accent' : 'bg-surface-3 text-text-faint'
                  }`}
                >
                  2
                </span>
                <h2 className={`text-sm font-semibold ${selecionadoId ? 'text-text' : 'text-text-faint'}`}>
                  Itens — medicamento, dose, via, posologia
                </h2>
              </div>
              {selecionadoId && (
                <button
                  onClick={adicionarItem}
                  className="flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar item
                </button>
              )}
            </div>

            {!selecionadoId ? (
              <p className="flex items-center gap-1.5 text-xs text-text-faint mt-3 ml-7.5">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                Salve o cabeçalho na seção 1 pra liberar a adição de itens aqui.
              </p>
            ) : (
              <>
                <p className="text-xs text-text-dim mb-4 ml-7.5">
                  Cada item é um medicamento da receita. Uma prescrição ambulatorial simples tem 1 item; um
                  combo hospitalar costuma ter vários — arraste pra reordenar.
                </p>
                {carregandoItens ? (
                  <p className="text-sm text-text-dim">Carregando itens…</p>
                ) : itens.length === 0 ? (
                  <p className="text-sm text-text-dim">Nenhum item ainda — clique em "Adicionar item".</p>
                ) : (
                  <SortableList
                    items={itens}
                    onReorder={reordenarItens}
                    className="flex flex-col gap-3"
                    renderItem={(item, arrastando) => (
                      <TratamentoItemRow
                        item={item}
                        medicamentos={medicamentos}
                        modoTratamento={form?.modo ?? 'ambulatorial'}
                        arrastando={arrastando}
                        onSalvar={salvarItem}
                        onExcluir={excluirItem}
                        onCriarMedicamento={criarMedicamentoRapido}
                      />
                    )}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        aberto={!!paraExcluir}
        titulo="Excluir prescrição"
        mensagem={`Excluir "${paraExcluir?.titulo || 'esta prescrição'}"? Isso apaga também todos os itens dela.`}
        onConfirmar={() => paraExcluir && excluirTratamento(paraExcluir)}
        onCancelar={() => setParaExcluir(null)}
      />
    </>
  )
}
