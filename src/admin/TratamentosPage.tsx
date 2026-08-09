import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, Lock, Plus, Trash2 } from 'lucide-react'
import { areasApi, patologiasApi, tratamentosApi, tratamentoItensApi, medicamentosApi, apresentacoesApi } from './api'
import type {
  Area,
  Patologia,
  Tratamento,
  TratamentoInput,
  TratamentoItem,
  Medicamento,
  MedicamentoInput,
  Apresentacao,
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
  const [apresentacoes, setApresentacoes] = useState<Apresentacao[]>([])

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
  // Itens de TODOS os tratamentos da patologia atual — só pra montar um resumo (nome do
  // medicamento) na lista da esquerda, que sem isso mostrava "Ambulatorial · 1ª linha"
  // repetido em cada card, sem dar pra distinguir um do outro.
  const [resumoItens, setResumoItens] = useState<Record<number, TratamentoItem[]>>({})

  useEffect(() => {
    areasApi.list().then((lista) => {
      // Ordem alfabética — bem mais fácil de achar a área numa lista grande do que a
      // ordem de arrasto (que é pra outra coisa: a ordem de navegação da Consulta).
      const ordenada = [...lista].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
      setAreas(ordenada)
      if (ordenada.length > 0) setAreaSelecionada(ordenada[0].id)
    })
    medicamentosApi.list().then(setMedicamentos)
    apresentacoesApi.list().then(setApresentacoes)
  }, [])

  useEffect(() => {
    if (areaSelecionada == null) return
    patologiasApi.listByArea(areaSelecionada).then((lista) => {
      const ordenada = [...lista].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
      setPatologias(ordenada)
      setPatologiaSelecionada(ordenada.length > 0 ? ordenada[0].id : null)
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
      .then(async (lista) => {
        setTratamentos(lista)
        setSelecionadoId(null)
        setForm(vazio(patologiaSelecionada, lista.length))
        setItens([])
        setErro(null)

        const todosItens = await tratamentoItensApi.listByTratamentos(lista.map((t) => t.id))
        const agrupados: Record<number, TratamentoItem[]> = {}
        for (const item of todosItens) {
          ;(agrupados[item.tratamento_id] ??= []).push(item)
        }
        setResumoItens(agrupados)
      })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [patologiaSelecionada])

  /** "Amoxicilina" (1 item) ou "Amoxicilina +2" (combo) — o que de fato diferencia um
   *  card do outro na lista, já que vários tratamentos podem ter o mesmo modo e linha. */
  function resumoTratamento(t: Tratamento): string {
    const itensDoTratamento = (resumoItens[t.id] ?? [])
      .slice()
      .sort((a, b) => a.ordem - b.ordem)
    if (itensDoTratamento.length === 0) return ''
    const nomes = itensDoTratamento.map((i) =>
      i.medicamento_id ? medicamentos.find((m) => m.id === i.medicamento_id)?.nome ?? '—' : i.nome_livre || '—'
    )
    return nomes.length === 1 ? nomes[0] : `${nomes[0]} +${nomes.length - 1}`
  }

  function tituloExibido(t: Tratamento): string {
    return t.titulo || resumoTratamento(t) || `${LABEL_MODO_TRATAMENTO[t.modo]} · ${LABEL_LINHA[t.linha]}`
  }

  const filtrados = useMemo(
    () =>
      tratamentos
        .filter((t) =>
          `${t.titulo ?? ''} ${resumoTratamento(t)} ${LABEL_MODO_TRATAMENTO[t.modo]} ${LABEL_LINHA[t.linha]}`
            .toLowerCase()
            .includes(busca.toLowerCase())
        )
        // Ordem alfabética pelo que aparece no card — não pela ordem de arrasto (essa
        // continua existindo e valendo pra Consulta, só não é mais o que rege esta lista).
        .sort((a, b) => tituloExibido(a).localeCompare(tituloExibido(b), 'pt-BR')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tratamentos, busca, resumoItens, medicamentos]
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

  /** Mantém o resumo da lista (nome do medicamento no card) em dia depois de qualquer
   *  alteração nos itens — sem isso o card só atualizava ao trocar de patologia e voltar. */
  function sincronizarResumo(tratamentoId: number, novaLista: TratamentoItem[]) {
    setResumoItens((prev) => ({ ...prev, [tratamentoId]: novaLista }))
  }

  async function adicionarItem() {
    if (!selecionadoId) return
    try {
      const criado = await tratamentoItensApi.insert({
        tratamento_id: selecionadoId,
        medicamento_id: null,
        nome_livre: '',
        apresentacao_id: null,
        quantidade: '',
        dose: '',
        via: '',
        posologia: '',
        duracao: '',
        condicao: '',
        diluicao: '',
        receita_custom: '',
        observacoes: '',
        ordem: itens.length,
      })
      const novaLista = [...itens, criado]
      setItens(novaLista)
      sincronizarResumo(selecionadoId, novaLista)
    } catch (e) {
      setErro((e as Error).message)
    }
  }

  async function salvarItem(id: number, dados: Partial<TratamentoItem>) {
    const atualizado = await tratamentoItensApi.update(id, dados)
    const novaLista = itens.map((i) => (i.id === id ? atualizado : i))
    setItens(novaLista)
    if (selecionadoId) sincronizarResumo(selecionadoId, novaLista)
  }

  async function excluirItem(id: number) {
    try {
      await tratamentoItensApi.remove(id)
      const novaLista = itens.filter((i) => i.id !== id)
      setItens(novaLista)
      if (selecionadoId) sincronizarResumo(selecionadoId, novaLista)
    } catch (e) {
      setErro((e as Error).message)
    }
  }

  async function reordenarItens(novaOrdem: TratamentoItem[]) {
    setItens(novaOrdem)
    if (selecionadoId) sincronizarResumo(selecionadoId, novaOrdem)
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

  /** Cadastro rápido de apresentação direto do item — mesma tabela do cadastro do
   *  medicamento, só um atalho a mais pra não sair do editor da prescrição. */
  async function criarApresentacaoRapida(
    medicamentoId: number,
    dados: { forma: string; concentracao: number | null; unidade: string; por_volume: number | null; por_volume_unidade: string }
  ): Promise<Apresentacao> {
    const ordem = apresentacoes.filter((a) => a.medicamento_id === medicamentoId).length
    const criada = await apresentacoesApi.insert({
      medicamento_id: medicamentoId,
      forma: dados.forma.trim(),
      concentracao: dados.concentracao,
      unidade: dados.unidade.trim() || null,
      por_volume: dados.por_volume,
      por_volume_unidade: dados.por_volume_unidade.trim() || null,
      descricao: null,
      ordem,
    })
    setApresentacoes((prev) => [...prev, criada])
    return criada
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
              // Lista em ordem alfabética — sem arrastar-pra-reordenar aqui (a ordem que
              // rege a Consulta continua existindo, só não é mais o critério desta lista).
              filtrados.map((t) => (
                <div
                  key={t.id}
                  className={`w-full flex items-center gap-1 rounded-lg border transition-colors ${
                    selecionadoId === t.id
                      ? 'bg-accent-dim border-accent'
                      : 'bg-surface border-border hover:border-text-faint'
                  }`}
                >
                  <button onClick={() => selecionar(t)} className="flex-1 min-w-0 text-left px-3 py-2">
                    <span className="block text-sm text-text font-medium truncate">
                      {t.titulo || resumoTratamento(t) || `${LABEL_MODO_TRATAMENTO[t.modo]} · ${LABEL_LINHA[t.linha]}`}
                    </span>
                    <span className="block text-xs text-text-dim truncate">
                      {LABEL_MODO_TRATAMENTO[t.modo]} · {LABEL_LINHA[t.linha]}
                      {t.titulo && resumoTratamento(t) && ` · ${resumoTratamento(t)}`}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setParaExcluir(t)
                    }}
                    className="shrink-0 text-danger hover:text-danger/80 transition-colors p-2 mr-1"
                    title="Excluir prescrição"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
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
                        apresentacoes={apresentacoes}
                        modoTratamento={form?.modo ?? 'ambulatorial'}
                        arrastando={arrastando}
                        onSalvar={salvarItem}
                        onExcluir={excluirItem}
                        onCriarMedicamento={criarMedicamentoRapido}
                        onCriarApresentacao={criarApresentacaoRapida}
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
        mensagem={`Excluir "${paraExcluir ? tituloExibido(paraExcluir) : 'esta prescrição'}"? Isso apaga também todos os itens dela.`}
        onConfirmar={() => paraExcluir && excluirTratamento(paraExcluir)}
        onCancelar={() => setParaExcluir(null)}
      />
    </>
  )
}
