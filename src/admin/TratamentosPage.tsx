import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, Plus, Trash2 } from 'lucide-react'
import { areasApi, patologiasApi, tratamentosApi, tratamentoItensApi, medicamentosApi, apresentacoesApi } from './api'
import type {
  Area,
  Patologia,
  Tratamento,
  TratamentoItem,
  Medicamento,
  MedicamentoInput,
  Apresentacao,
} from './types'
import { LABEL_MODO_TRATAMENTO, LABEL_LINHA } from './types'
import { SearchInput } from './components/SearchInput'
import { ConfirmDialog } from './components/ConfirmDialog'
import { EsquemaEditor } from './components/EsquemaEditor'
import type { NovaApresentacaoDados } from './components/ApresentacaoPicker'
import { SelectField } from './components/Field'

/** Editor de prescrição — cabeçalho e itens numa tela só (EsquemaEditor), com um único
 *  "Salvar esquema". A navegação (área → patologia → prescrição) e a lista da esquerda
 *  continuam aqui; a edição em si vive no editor compartilhado com Complementos. */
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
  const [paraExcluir, setParaExcluir] = useState<Tratamento | null>(null)

  // Itens de TODOS os tratamentos da patologia atual — só pra montar um resumo (nome do
  // medicamento) na lista da esquerda, que sem isso mostrava "Ambulatorial · 1ª linha"
  // repetido em cada card, sem dar pra distinguir um do outro.
  const [resumoItens, setResumoItens] = useState<Record<number, TratamentoItem[]>>({})

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
        // continua existindo e valendo pra Consulta, só não é mais o critério desta lista).
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
    setErro(null)
  }

  function selecionar(t: Tratamento) {
    setSelecionadoId(t.id)
    setErro(null)
  }

  function aoSalvarEsquema(tratamentoSalvo: Tratamento, itensSalvos: TratamentoItem[]) {
    setTratamentos((prev) => {
      const existe = prev.some((t) => t.id === tratamentoSalvo.id)
      return existe ? prev.map((t) => (t.id === tratamentoSalvo.id ? tratamentoSalvo : t)) : [...prev, tratamentoSalvo]
    })
    setResumoItens((prev) => ({ ...prev, [tratamentoSalvo.id]: itensSalvos }))
    setSelecionadoId(tratamentoSalvo.id)
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

  /** Cadastro rápido de medicamento direto do item (Fase 4) — o payload completo (com
   *  `incompleto: true`) já vem pronto do modal, aqui só persiste e atualiza a lista local. */
  async function criarMedicamentoRapido(input: MedicamentoInput): Promise<Medicamento> {
    const criado = await medicamentosApi.insert(input)
    setMedicamentos((prev) => [...prev, criado].sort((a, b) => a.nome.localeCompare(b.nome)))
    return criado
  }

  /** Cadastro rápido de apresentação direto do item — mesma tabela do cadastro do
   *  medicamento, só um atalho a mais pra não sair do editor da prescrição. */
  async function criarApresentacaoRapida(medicamentoId: number, dados: NovaApresentacaoDados): Promise<Apresentacao> {
    const ordem = apresentacoes.filter((a) => a.medicamento_id === medicamentoId).length
    const criada = await apresentacoesApi.insert({
      medicamento_id: medicamentoId,
      ...dados,
      forma: dados.forma.trim(),
      descricao: null,
      ordem,
    })
    setApresentacoes((prev) => [...prev, criada])
    return criada
  }

  /** Exclui direto do seletor do item — mesma exclusão de sempre (some do catálogo
   *  inteiro, não só desmarca aqui). Item que usava essa apresentação em outra prescrição
   *  fica sem ela selecionada, igual já acontecia ao excluir em Medicamentos. */
  async function excluirApresentacao(id: number) {
    await apresentacoesApi.remove(id)
    setApresentacoes((prev) => prev.filter((a) => a.id !== id))
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
    <div className="h-full min-h-0">
      <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-[315px_1fr] border border-border rounded-[var(--radius-panel,18px)] overflow-hidden bg-surface">
        <div className="flex flex-col gap-3 min-h-0 border-b lg:border-b-0 lg:border-r border-border bg-surface-2 p-5">
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
              className="shrink-0 flex items-center gap-1.5 bg-text hover:opacity-90 text-bg text-sm font-semibold rounded-[var(--radius-pill,999px)] px-4 py-2.5 transition-opacity"
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
                <div key={t.id} className="w-full flex items-center gap-1.5">
                  <button
                    onClick={() => selecionar(t)}
                    className={`flex-1 min-w-0 text-left px-3 py-2.5 rounded-[var(--radius-item,11px)] border transition-colors ${
                      selecionadoId === t.id
                        ? 'bg-surface border-text shadow-[var(--shadow-selected)]'
                        : 'bg-surface border-transparent hover:border-border'
                    }`}
                  >
                    <span className="block text-[14px] font-semibold text-text truncate">
                      {t.titulo || resumoTratamento(t) || `${LABEL_MODO_TRATAMENTO[t.modo]} · ${LABEL_LINHA[t.linha]}`}
                    </span>
                    <span className="block text-[11px] text-text-dim truncate mt-0.5">
                      {LABEL_MODO_TRATAMENTO[t.modo]} · {LABEL_LINHA[t.linha]}
                      {t.titulo && resumoTratamento(t) && ` · ${resumoTratamento(t)}`}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setParaExcluir(t)}
                    className="shrink-0 text-danger hover:opacity-80 transition-opacity p-2"
                    title="Excluir prescrição"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="min-h-0 overflow-y-auto flex flex-col gap-5 p-7">
          {/* Trilha de contexto — nunca perder onde você está na hierarquia */}
          <div className="flex items-center gap-1.5 text-xs text-text-dim">
            <span>{nomeArea}</span>
            <ChevronRight className="w-3 h-3" />
            <span>{nomePatologia}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-text font-medium">
              {tratamentoSelecionado
                ? tratamentoSelecionado.titulo ||
                  `${LABEL_MODO_TRATAMENTO[tratamentoSelecionado.modo]} · ${LABEL_LINHA[tratamentoSelecionado.linha]}`
                : 'Nova prescrição'}
            </span>
          </div>

          {erro && (
            <p className="text-sm text-danger bg-danger-dim border border-danger/30 rounded-lg px-3 py-2">{erro}</p>
          )}

          <EsquemaEditor
            key={selecionadoId ?? 'novo'}
            tratamento={tratamentoSelecionado}
            papel="principal"
            patologiaId={patologiaSelecionada}
            ordemNova={tratamentos.length}
            medicamentos={medicamentos}
            apresentacoes={apresentacoes}
            onSalvo={aoSalvarEsquema}
            onCriarMedicamento={criarMedicamentoRapido}
            onCriarApresentacao={criarApresentacaoRapida}
            onExcluirApresentacao={excluirApresentacao}
            onExcluir={tratamentoSelecionado ? () => setParaExcluir(tratamentoSelecionado) : undefined}
          />
        </div>
      </div>

      <ConfirmDialog
        aberto={!!paraExcluir}
        titulo="Excluir prescrição"
        mensagem={`Excluir "${paraExcluir ? tituloExibido(paraExcluir) : 'esta prescrição'}"? Isso apaga também todos os itens dela.`}
        onConfirmar={() => paraExcluir && excluirTratamento(paraExcluir)}
        onCancelar={() => setParaExcluir(null)}
      />
    </div>
  )
}
