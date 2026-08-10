import { useEffect, useMemo, useState } from 'react'
import { Lock, Plus, Trash2, Users } from 'lucide-react'
import { tratamentosApi, tratamentoItensApi, medicamentosApi, apresentacoesApi, patologiaComplementosApi } from './api'
import type { Tratamento, TratamentoInput, TratamentoItem, Medicamento, MedicamentoInput, Apresentacao, ModoTratamento } from './types'
import { LABEL_MODO_TRATAMENTO } from './types'
import { SearchInput } from './components/SearchInput'
import { ConfirmDialog } from './components/ConfirmDialog'
import { SortableList } from './components/SortableList'
import { TratamentoItemRow } from './components/TratamentoItemRow'
import { TextField, SelectField, CheckboxField } from './components/Field'

function vazio(ordem: number): TratamentoInput {
  return {
    patologia_id: null,
    modo: 'ambulatorial',
    linha: '1a_linha', // sem efeito pra complemento — não agrupa por linha em lugar nenhum
    titulo: '',
    observacoes: '',
    referencia: '',
    revisado_em: null,
    precisa_revisao: false,
    ordem,
    papel: 'complemento',
    classe: '',
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

/** Biblioteca de complementos — suporte sintomático (dipirona, escopolamina...) cadastrado
 *  uma vez e vinculado a várias patologias (em Patologias, seção "Complementos vinculados").
 *  Mesmo editor de item que Prescrições, sem patologia/linha e com classe pra agrupar no
 *  seletor. Corrigir a dose aqui propaga pra todo lugar que usa esse complemento — por
 *  isso mostra em quantas patologias ele está antes de editar ou excluir. */
export function ComplementosPage() {
  const [complementos, setComplementos] = useState<Tratamento[]>([])
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])
  const [apresentacoes, setApresentacoes] = useState<Apresentacao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [busca, setBusca] = useState('')

  const [selecionadoId, setSelecionadoId] = useState<number | null>(null)
  const [form, setForm] = useState<TratamentoInput | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [usoAtual, setUsoAtual] = useState<{ patologia_id: number; nome: string }[]>([])
  const [carregandoUso, setCarregandoUso] = useState(false)
  const [paraExcluir, setParaExcluir] = useState<Tratamento | null>(null)
  const [usoParaExcluir, setUsoParaExcluir] = useState<{ patologia_id: number; nome: string }[]>([])

  const [itens, setItens] = useState<TratamentoItem[]>([])
  const [carregandoItens, setCarregandoItens] = useState(false)
  const [resumoItens, setResumoItens] = useState<Record<number, TratamentoItem[]>>({})

  async function recarregar() {
    setCarregando(true)
    try {
      const lista = await tratamentosApi.listComplementos()
      setComplementos(lista)
      const todosItens = await tratamentoItensApi.listByTratamentos(lista.map((t) => t.id))
      const agrupados: Record<number, TratamentoItem[]> = {}
      for (const item of todosItens) {
        ;(agrupados[item.tratamento_id] ??= []).push(item)
      }
      setResumoItens(agrupados)
      setErro(null)
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    recarregar()
    medicamentosApi.list().then(setMedicamentos)
    apresentacoesApi.list().then(setApresentacoes)
  }, [])

  /** "Dipirona" (1 item) ou "Dipirona +2" (combo raro, mas o campo aceita). */
  function resumoComplemento(t: Tratamento): string {
    const itensDoComplemento = (resumoItens[t.id] ?? []).slice().sort((a, b) => a.ordem - b.ordem)
    if (itensDoComplemento.length === 0) return ''
    const nomes = itensDoComplemento.map((i) =>
      i.medicamento_id ? medicamentos.find((m) => m.id === i.medicamento_id)?.nome ?? '—' : i.nome_livre || '—'
    )
    return nomes.length === 1 ? nomes[0] : `${nomes[0]} +${nomes.length - 1}`
  }

  function tituloExibido(t: Tratamento): string {
    return t.titulo || resumoComplemento(t) || 'Complemento sem medicamento ainda'
  }

  const classesExistentes = useMemo(
    () => Array.from(new Set(complementos.map((c) => c.classe?.trim()).filter((c): c is string => !!c))).sort(),
    [complementos]
  )

  const filtrados = useMemo(
    () =>
      complementos
        .filter((t) =>
          `${t.titulo ?? ''} ${resumoComplemento(t)} ${t.classe ?? ''}`.toLowerCase().includes(busca.toLowerCase())
        )
        .sort((a, b) => tituloExibido(a).localeCompare(tituloExibido(b), 'pt-BR')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [complementos, busca, resumoItens, medicamentos]
  )

  function novo() {
    setSelecionadoId(null)
    setForm(vazio(complementos.length))
    setItens([])
    setUsoAtual([])
    setErro(null)
  }

  async function selecionar(t: Tratamento) {
    setSelecionadoId(t.id)
    setForm(t)
    setErro(null)
    setCarregandoItens(true)
    setCarregandoUso(true)
    try {
      setItens(await tratamentoItensApi.listByTratamento(t.id))
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setCarregandoItens(false)
    }
    try {
      setUsoAtual(await patologiaComplementosApi.listPatologiasUsando(t.id))
    } finally {
      setCarregandoUso(false)
    }
  }

  async function salvarCabecalho() {
    if (!form) return
    setSalvando(true)
    setErro(null)
    try {
      if (selecionadoId) {
        const { modo, titulo, observacoes, referencia, revisado_em, precisa_revisao, ordem, classe } = form
        const atualizado = await tratamentosApi.update(selecionadoId, {
          patologia_id: null,
          modo,
          linha: '1a_linha',
          titulo,
          observacoes,
          referencia,
          revisado_em,
          precisa_revisao,
          ordem,
          papel: 'complemento',
          classe,
        })
        setComplementos((prev) => prev.map((t) => (t.id === selecionadoId ? atualizado : t)))
        setForm(atualizado)
      } else {
        const criado = await tratamentosApi.insert(form)
        setComplementos((prev) => [...prev, criado])
        setSelecionadoId(criado.id)
        setForm(criado)
        setItens([])
        setUsoAtual([])
      }
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setSalvando(false)
    }
  }

  async function pedirExclusao(t: Tratamento) {
    setParaExcluir(t)
    setUsoParaExcluir(await patologiaComplementosApi.listPatologiasUsando(t.id))
  }

  async function excluirComplemento(t: Tratamento) {
    try {
      await tratamentosApi.remove(t.id)
      setComplementos((prev) => prev.filter((x) => x.id !== t.id))
      if (selecionadoId === t.id) novo()
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setParaExcluir(null)
      setUsoParaExcluir([])
    }
  }

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

  async function criarMedicamentoRapido(nome: string): Promise<Medicamento> {
    const criado = await medicamentosApi.insert(medicamentoVazio(nome))
    setMedicamentos((prev) => [...prev, criado].sort((a, b) => a.nome.localeCompare(b.nome)))
    return criado
  }

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

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 h-full min-h-0">
        <div className="flex flex-col gap-3 min-h-0">
          <p className="text-xs text-text-dim leading-relaxed -mt-1">
            Suporte sintomático (dipirona, escopolamina...) cadastrado uma vez e vinculado a várias
            patologias em <span className="text-text-dim/90">Patologias → Complementos vinculados</span>.
          </p>
          <div className="flex gap-2">
            <div className="flex-1">
              <SearchInput value={busca} onChange={setBusca} placeholder="Buscar complemento…" />
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
              <p className="text-sm text-text-dim px-1">Nenhum complemento cadastrado.</p>
            ) : (
              filtrados.map((t) => (
                <div key={t.id} className="w-full flex items-center gap-1.5">
                  <button
                    onClick={() => selecionar(t)}
                    className={`flex-1 min-w-0 text-left px-3 py-2 rounded-lg border transition-colors ${
                      selecionadoId === t.id
                        ? 'bg-accent-dim border-accent'
                        : 'bg-surface border-border hover:border-text-faint'
                    }`}
                  >
                    <span className="block text-sm text-text font-medium truncate">
                      {t.titulo || resumoComplemento(t) || 'Complemento sem medicamento ainda'}
                    </span>
                    <span className="block text-xs text-text-dim truncate">
                      {t.classe || 'Sem classe'}
                      {t.titulo && resumoComplemento(t) && ` · ${resumoComplemento(t)}`}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => pedirExclusao(t)}
                    className="shrink-0 text-danger hover:text-danger/80 transition-colors p-2"
                    title="Excluir complemento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="min-h-0 overflow-y-auto flex flex-col gap-5 pb-6">
          <div className="flex items-center gap-1.5 text-xs text-text-dim">
            <span className="text-text font-medium">
              {(() => {
                const atual = selecionadoId ? complementos.find((c) => c.id === selecionadoId) : null
                return atual ? tituloExibido(atual) : 'Novo complemento'
              })()}
            </span>
          </div>

          {selecionadoId && (
            <div className="flex items-center gap-2 text-xs rounded-lg border border-border bg-surface-2 px-3 py-2 text-text-dim">
              <Users className="w-3.5 h-3.5 shrink-0" />
              {carregandoUso ? (
                'Verificando em quantas patologias está vinculado…'
              ) : usoAtual.length === 0 ? (
                'Ainda não vinculado a nenhuma patologia.'
              ) : (
                <span>
                  Usado em <strong className="text-text">{usoAtual.length}</strong> patologia
                  {usoAtual.length > 1 ? 's' : ''}: {usoAtual.map((u) => u.nome).join(', ')} — editar aqui
                  propaga pra todas.
                </span>
              )}
            </div>
          )}

          {form && (
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-2.5 mb-1">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent-dim text-accent text-[11px] font-bold shrink-0">
                  1
                </span>
                <h2 className="text-sm font-semibold text-text">Cabeçalho do complemento</h2>
              </div>
              <p className="text-xs text-text-dim mb-4 ml-7.5">
                Sem patologia fixa — a classe é só pra agrupar visualmente no seletor da patologia.
                O medicamento com dose e posologia entra na seção 2, depois de salvar aqui.
              </p>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <TextField
                    label="Classe"
                    hint="Ex: Analgésicos/antitérmicos, Antieméticos"
                    list="classes-complemento"
                    value={form.classe ?? ''}
                    onChange={(e) => setForm({ ...form, classe: e.target.value })}
                    placeholder="Analgésicos/antitérmicos"
                  />
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
                </div>
                <datalist id="classes-complemento">
                  {classesExistentes.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>

                <TextField
                  label="Título (opcional)"
                  hint="Só se o nome do medicamento não bastar pra identificar"
                  value={form.titulo ?? ''}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ex: Dipirona gotas"
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
                      onClick={() => pedirExclusao(complementos.find((t) => t.id === selecionadoId)!)}
                      className="flex items-center gap-1.5 text-sm text-danger hover:text-danger/80 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir complemento
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    onClick={salvarCabecalho}
                    disabled={salvando}
                    className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-accent-text text-sm font-semibold rounded-lg px-4 py-2 transition-colors"
                  >
                    {salvando ? 'Salvando…' : selecionadoId ? 'Salvar cabeçalho' : 'Criar complemento e liberar item →'}
                  </button>
                </div>
              </div>
            </div>
          )}

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
                  Item — medicamento, dose, via, posologia
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
                Salve o cabeçalho na seção 1 pra liberar a adição do item aqui.
              </p>
            ) : (
              <>
                <p className="text-xs text-text-dim mb-4 ml-7.5">
                  Quase sempre 1 item só (o próprio complemento) — mas aceita mais de um se for um
                  combo sintomático fixo.
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
        titulo="Excluir complemento"
        mensagem={
          usoParaExcluir.length === 0
            ? `Excluir "${paraExcluir ? tituloExibido(paraExcluir) : 'este complemento'}"? Isso apaga também o(s) item(ns) dele.`
            : `"${paraExcluir ? tituloExibido(paraExcluir) : ''}" está vinculado a ${usoParaExcluir.length} patologia${usoParaExcluir.length > 1 ? 's' : ''}: ${usoParaExcluir.map((u) => u.nome).join(', ')}. Excluir remove de todas elas também. Confirma?`
        }
        onConfirmar={() => paraExcluir && excluirComplemento(paraExcluir)}
        onCancelar={() => {
          setParaExcluir(null)
          setUsoParaExcluir([])
        }}
      />
    </>
  )
}
