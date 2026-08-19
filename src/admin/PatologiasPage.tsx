import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronLeft, Plus, Trash2 } from 'lucide-react'
import { areasApi, patologiasApi, tratamentosApi, tratamentoItensApi, medicamentosApi, apresentacoesApi } from './api'
import type { Area, Patologia, PatologiaInput, Medicamento, Apresentacao, Tratamento, MedicamentoInput, TratamentoItem } from './types'
import { LABEL_MODO_TRATAMENTO, LABEL_LINHA } from './types'
import { AdminPageShell } from './components/AdminPageShell'
import { SortableList } from './components/SortableList'
import { ConfirmDialog } from './components/ConfirmDialog'
import { ComplementoSeletor } from './components/ComplementoSeletor'
import { EsquemaEditor } from './components/EsquemaEditor'
import type { NovaApresentacaoDados } from './components/ApresentacaoPicker'
import { TextField, TextAreaField, SelectField } from './components/Field'
import { precisaRevisar, tempoDesdeRevisao } from '../core/revisao'
import { useConfiguracoesStore } from '../core/configuracoes'

function vazio(areaId: number, ordem: number): PatologiaInput {
  return { area_id: areaId, nome: '', sinonimos: '', orientacoes: '', observacoes: '', ordem }
}

/** Patologia como tela de contexto (Fase 5) — tudo que descreve uma patologia numa tela só:
 *  identidade, orientações, os esquemas dela (com editor da Fase 3 embutido), complementos
 *  vinculados e revisão. Nada daqui edita CONTEÚDO de complemento — só vincula/desvincula/
 *  reordena (ComplementoSeletor); editar a posologia de um complemento é sempre em
 *  Painel → Complementos, porque é N:N e mudaria em todas as patologias que o usam. */
export function PatologiasPage() {
  const [areas, setAreas] = useState<Area[]>([])
  const [areaSelecionada, setAreaSelecionada] = useState<number | null>(null)
  const [patologias, setPatologias] = useState<Patologia[]>([])
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])
  const [apresentacoes, setApresentacoes] = useState<Apresentacao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [selecionadaId, setSelecionadaId] = useState<number | null>(null)
  const [form, setForm] = useState<PatologiaInput | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [paraExcluir, setParaExcluir] = useState<Patologia | null>(null)

  // Esquemas da patologia selecionada — lista + qual está aberto no editor (Fase 3).
  const [esquemas, setEsquemas] = useState<Tratamento[]>([])
  const [carregandoEsquemas, setCarregandoEsquemas] = useState(false)
  const [esquemaAbertoId, setEsquemaAbertoId] = useState<number | null | 'novo'>(null)
  const [resumoItens, setResumoItens] = useState<Record<number, TratamentoItem[]>>({})

  const mesesAteRevisar = useConfiguracoesStore((s) => s.mesesAteRevisar)
  const [marcandoRevisao, setMarcandoRevisao] = useState<number | null>(null)

  useEffect(() => {
    areasApi.list().then((lista) => {
      const ordenada = [...lista].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
      setAreas(ordenada)
      if (ordenada.length > 0) setAreaSelecionada(ordenada[0].id)
    })
    medicamentosApi.list().then(setMedicamentos)
    apresentacoesApi.list().then(setApresentacoes)
  }, [])

  useEffect(() => {
    if (areaSelecionada == null) return
    setCarregando(true)
    patologiasApi
      .listByArea(areaSelecionada)
      .then((lista) => {
        setPatologias(lista)
        setSelecionadaId(null)
        setForm(vazio(areaSelecionada, lista.length))
        setErro(null)
      })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [areaSelecionada])

  async function carregarEsquemas(patologiaId: number) {
    setCarregandoEsquemas(true)
    try {
      const lista = await tratamentosApi.listByPatologia(patologiaId)
      setEsquemas(lista)
      const itens = await tratamentoItensApi.listByTratamentos(lista.map((t) => t.id))
      const agrupados: Record<number, TratamentoItem[]> = {}
      for (const item of itens) {
        ;(agrupados[item.tratamento_id] ??= []).push(item)
      }
      setResumoItens(agrupados)
    } finally {
      setCarregandoEsquemas(false)
    }
  }

  const filtradas = useMemo(
    () => patologias.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase())),
    [patologias, busca]
  )

  function novo() {
    if (areaSelecionada == null) return
    setSelecionadaId(null)
    setForm(vazio(areaSelecionada, patologias.length))
    setErro(null)
    setEsquemas([])
    setEsquemaAbertoId(null)
  }

  function selecionar(p: Patologia) {
    setSelecionadaId(p.id)
    setForm(p)
    setErro(null)
    setEsquemaAbertoId(null)
    carregarEsquemas(p.id)
  }

  async function salvar() {
    if (!form) return
    if (!form.nome.trim()) {
      setErro('Nome é obrigatório.')
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      if (selecionadaId) {
        const { area_id, nome, sinonimos, orientacoes, observacoes, ordem } = form
        const atualizada = await patologiasApi.update(selecionadaId, {
          area_id,
          nome,
          sinonimos,
          orientacoes,
          observacoes,
          ordem,
        })
        if (area_id !== areaSelecionada) {
          // Mudou de área — some da lista da área atual (o filtro é por área). Os esquemas
          // vão junto sozinhos, porque eles só apontam pra patologia_id, nunca pra área.
          setPatologias((prev) => prev.filter((p) => p.id !== selecionadaId))
          novo()
        } else {
          setPatologias((prev) => prev.map((p) => (p.id === selecionadaId ? atualizada : p)))
        }
      } else {
        const criada = await patologiasApi.insert(form)
        setPatologias((prev) => [...prev, criada])
        setSelecionadaId(criada.id)
        carregarEsquemas(criada.id)
      }
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(p: Patologia) {
    try {
      await patologiasApi.remove(p.id)
      setPatologias((prev) => prev.filter((x) => x.id !== p.id))
      if (selecionadaId === p.id) novo()
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setParaExcluir(null)
    }
  }

  function tituloEsquema(t: Tratamento): string {
    const itens = (resumoItens[t.id] ?? []).slice().sort((a, b) => a.ordem - b.ordem)
    const nomes = itens.map((i) =>
      i.medicamento_id ? medicamentos.find((m) => m.id === i.medicamento_id)?.nome ?? '—' : i.nome_livre || '—'
    )
    const resumo = nomes.length === 0 ? '' : nomes.length === 1 ? nomes[0] : `${nomes[0]} +${nomes.length - 1}`
    return t.titulo || resumo || `${LABEL_MODO_TRATAMENTO[t.modo]} · ${LABEL_LINHA[t.linha]}`
  }

  async function criarMedicamentoRapido(input: MedicamentoInput): Promise<Medicamento> {
    const criado = await medicamentosApi.insert(input)
    setMedicamentos((prev) => [...prev, criado].sort((a, b) => a.nome.localeCompare(b.nome)))
    return criado
  }

  async function criarApresentacaoRapida(medicamentoId: number, dados: NovaApresentacaoDados): Promise<Apresentacao> {
    const ordem = apresentacoes.filter((a) => a.medicamento_id === medicamentoId).length
    const criada = await apresentacoesApi.insert({ medicamento_id: medicamentoId, ...dados, forma: dados.forma.trim(), descricao: null, ordem })
    setApresentacoes((prev) => [...prev, criada])
    return criada
  }

  async function excluirApresentacao(id: number) {
    await apresentacoesApi.remove(id)
    setApresentacoes((prev) => prev.filter((a) => a.id !== id))
  }

  function aoSalvarEsquema(tratamentoSalvo: Tratamento, itensSalvos: TratamentoItem[]) {
    setEsquemas((prev) => {
      const existe = prev.some((t) => t.id === tratamentoSalvo.id)
      return existe ? prev.map((t) => (t.id === tratamentoSalvo.id ? tratamentoSalvo : t)) : [...prev, tratamentoSalvo]
    })
    setResumoItens((prev) => ({ ...prev, [tratamentoSalvo.id]: itensSalvos }))
    setEsquemaAbertoId(tratamentoSalvo.id)
  }

  async function excluirEsquema(t: Tratamento) {
    try {
      await tratamentosApi.remove(t.id)
      setEsquemas((prev) => prev.filter((x) => x.id !== t.id))
      setEsquemaAbertoId(null)
    } catch (e) {
      setErro((e as Error).message)
    }
  }

  async function marcarEsquemaRevisado(t: Tratamento) {
    setMarcandoRevisao(t.id)
    try {
      const hoje = new Date().toISOString().slice(0, 10)
      const atualizado = await tratamentosApi.update(t.id, { revisado_em: hoje, precisa_revisao: false })
      setEsquemas((prev) => prev.map((x) => (x.id === t.id ? atualizado : x)))
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setMarcandoRevisao(null)
    }
  }

  const esquemasPendentes = esquemas.filter((t) =>
    precisaRevisar({ precisaRevisao: t.precisa_revisao, revisadoEm: t.revisado_em }, mesesAteRevisar)
  )

  const esquemaAberto =
    esquemaAbertoId === 'novo' ? null : esquemaAbertoId != null ? esquemas.find((t) => t.id === esquemaAbertoId) ?? null : null

  return (
    <>
      <AdminPageShell
        busca={busca}
        onBuscaChange={setBusca}
        buscaPlaceholder="Buscar patologia…"
        onNovo={novo}
        labelNovo="Nova patologia"
        extraHeader={
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
        }
        lista={
          carregando ? (
            <p className="text-sm text-text-dim px-1">Carregando…</p>
          ) : filtradas.length === 0 ? (
            <p className="text-sm text-text-dim px-1">Nenhuma patologia nesta área.</p>
          ) : (
            filtradas.map((p) => (
              <button
                key={p.id}
                onClick={() => selecionar(p)}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                  selecionadaId === p.id ? 'bg-accent-dim border-accent' : 'bg-surface border-border hover:border-text-dim'
                }`}
              >
                <span className="block font-display text-[15px] text-text truncate">{p.nome}</span>
                {p.sinonimos && <span className="block text-xs text-text-dim truncate">{p.sinonimos}</span>}
              </button>
            ))
          )
        }
        formulario={
          form && (
            <div className="flex flex-col gap-5 max-w-3xl">
              {/* Identidade e sinônimos */}
              <div className="bg-surface border border-border rounded-lg p-6">
                <h2 className="font-display text-lg font-semibold text-text mb-4">
                  {selecionadaId ? 'Editar patologia' : 'Nova patologia'}
                </h2>
                <div className="flex flex-col gap-4">
                  <TextField
                    label="Nome"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    placeholder="Ex: ITU não complicada"
                  />
                  {selecionadaId && (
                    <SelectField
                      label="Área"
                      hint="Move a patologia (e os esquemas dela junto) pra outra área — ela some da lista da área atual e passa a aparecer na nova."
                      value={form.area_id}
                      onChange={(e) => setForm({ ...form, area_id: Number(e.target.value) })}
                    >
                      {areas.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nome}
                        </option>
                      ))}
                    </SelectField>
                  )}
                  <TextField
                    label="Sinônimos"
                    hint="Separados por vírgula — usados na busca da tela de consulta."
                    value={form.sinonimos ?? ''}
                    onChange={(e) => setForm({ ...form, sinonimos: e.target.value })}
                    placeholder="Ex: infecção urinária, cistite"
                  />

                  {/* Orientações */}
                  <TextAreaField
                    label="Orientações não medicamentosas"
                    hint="Markdown simples — dieta, hábitos, cuidados gerais."
                    value={form.orientacoes ?? ''}
                    onChange={(e) => setForm({ ...form, orientacoes: e.target.value })}
                    rows={5}
                  />
                  <TextAreaField
                    label="Observações"
                    value={form.observacoes ?? ''}
                    onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                    rows={3}
                  />

                  {erro && (
                    <p className="text-sm text-danger bg-danger-dim border border-danger/30 rounded-lg px-3 py-2">{erro}</p>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    {selecionadaId ? (
                      <button
                        onClick={() => setParaExcluir(patologias.find((p) => p.id === selecionadaId) ?? null)}
                        className="flex items-center gap-1.5 text-sm text-danger hover:text-danger/80 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </button>
                    ) : (
                      <span />
                    )}
                    <button
                      onClick={salvar}
                      disabled={salvando}
                      className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-accent-text text-sm font-semibold rounded-lg px-4 py-2 transition-colors"
                    >
                      {salvando ? 'Salvando…' : 'Salvar'}
                    </button>
                  </div>
                </div>
              </div>

              {selecionadaId && (
                <>
                  {/* Esquemas — lista ou editor da Fase 3 embutido */}
                  <div className="bg-surface border border-border rounded-lg p-6">
                    {esquemaAbertoId == null ? (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <h2 className="font-display text-lg font-semibold text-text">Esquemas</h2>
                          <button
                            onClick={() => setEsquemaAbertoId('novo')}
                            className="flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Novo esquema
                          </button>
                        </div>
                        {carregandoEsquemas ? (
                          <p className="text-sm text-text-dim">Carregando…</p>
                        ) : esquemas.length === 0 ? (
                          <p className="text-sm text-text-dim">Nenhum esquema ainda — clique em "Novo esquema".</p>
                        ) : (
                          <SortableList
                            items={esquemas}
                            onReorder={(nova) => {
                              setEsquemas(nova)
                              tratamentosApi.reorder(nova.map((t, idx) => ({ id: t.id, ordem: idx }))).catch((e) => setErro(e.message))
                            }}
                            className="flex flex-col gap-2"
                            renderItem={(t) => (
                              <button
                                onClick={() => setEsquemaAbertoId(t.id)}
                                className="w-full text-left px-3 py-2.5 rounded-lg border border-border bg-surface-2 hover:border-text-dim transition-colors"
                              >
                                <span className="block text-sm font-medium text-text truncate">{tituloEsquema(t)}</span>
                                <span className="block text-xs text-text-dim">
                                  {LABEL_MODO_TRATAMENTO[t.modo]} · {LABEL_LINHA[t.linha]}
                                </span>
                              </button>
                            )}
                          />
                        )}
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEsquemaAbertoId(null)}
                          className="flex items-center gap-1 text-xs text-text-dim hover:text-text transition-colors mb-3"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          Voltar aos esquemas
                        </button>
                        <EsquemaEditor
                          key={esquemaAbertoId}
                          tratamento={esquemaAberto}
                          papel="principal"
                          patologiaId={selecionadaId}
                          ordemNova={esquemas.length}
                          medicamentos={medicamentos}
                          apresentacoes={apresentacoes}
                          onSalvo={aoSalvarEsquema}
                          onCriarMedicamento={criarMedicamentoRapido}
                          onCriarApresentacao={criarApresentacaoRapida}
                          onExcluirApresentacao={excluirApresentacao}
                          onExcluir={esquemaAberto ? () => excluirEsquema(esquemaAberto) : undefined}
                        />
                      </>
                    )}
                  </div>

                  {/* Complementos vinculados — só vincular/desvincular/reordenar, nunca editar
                      conteúdo (é N:N; editar aqui mudaria em todas as patologias que usam). */}
                  <div className="bg-surface border border-border rounded-lg p-6">
                    <ComplementoSeletor patologiaId={selecionadaId} medicamentos={medicamentos} />
                  </div>

                  {/* Revisão — só os esquemas desta patologia, contextual (a fila completa
                      continua em Painel → Revisão). */}
                  <div className="bg-surface border border-border rounded-lg p-6">
                    <h2 className="font-display text-lg font-semibold text-text mb-3">Revisão</h2>
                    {esquemasPendentes.length === 0 ? (
                      <p className="text-sm text-text-dim">Todos os esquemas desta patologia estão revisados dentro do prazo.</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {esquemasPendentes.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center justify-between gap-3 border border-border rounded-lg bg-surface-2 px-3 py-2.5"
                          >
                            <div className="min-w-0">
                              <span className="block text-sm text-text truncate">{tituloEsquema(t)}</span>
                              <span className="text-xs text-text-dim">{tempoDesdeRevisao(t.revisado_em)}</span>
                            </div>
                            <button
                              onClick={() => marcarEsquemaRevisado(t)}
                              disabled={marcandoRevisao === t.id}
                              className="flex items-center gap-1.5 text-xs font-medium bg-ok hover:bg-ok/90 disabled:opacity-50 text-white rounded-md px-3 py-1.5 transition-colors shrink-0"
                            >
                              <Check className="w-3.5 h-3.5" />
                              {marcandoRevisao === t.id ? 'Marcando…' : 'Marcar como revisado'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        }
      />

      <ConfirmDialog
        aberto={!!paraExcluir}
        titulo="Excluir patologia"
        mensagem={`Excluir "${paraExcluir?.nome}"? Isso apaga também os esquemas vinculados.`}
        onConfirmar={() => paraExcluir && excluir(paraExcluir)}
        onCancelar={() => setParaExcluir(null)}
      />
    </>
  )
}
