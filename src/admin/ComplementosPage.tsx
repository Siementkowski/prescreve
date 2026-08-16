import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Users } from 'lucide-react'
import { tratamentosApi, tratamentoItensApi, medicamentosApi, apresentacoesApi, patologiaComplementosApi } from './api'
import type { Tratamento, TratamentoItem, Medicamento, MedicamentoInput, Apresentacao } from './types'
import { SearchInput } from './components/SearchInput'
import { ConfirmDialog } from './components/ConfirmDialog'
import { EsquemaEditor } from './components/EsquemaEditor'
import type { NovaApresentacaoDados } from './components/ApresentacaoPicker'

/** Biblioteca de complementos — suporte sintomático (dipirona, escopolamina...) cadastrado
 *  uma vez e vinculado a várias patologias (em Patologias, seção "Complementos vinculados").
 *  Mesmo editor de esquema que Prescrições (EsquemaEditor), sem patologia/linha e com classe
 *  pra agrupar no seletor. Corrigir a dose aqui propaga pra todo lugar que usa esse
 *  complemento — por isso mostra em quantas patologias ele está antes de editar ou excluir. */
export function ComplementosPage() {
  const [complementos, setComplementos] = useState<Tratamento[]>([])
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])
  const [apresentacoes, setApresentacoes] = useState<Apresentacao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [busca, setBusca] = useState('')

  const [selecionadoId, setSelecionadoId] = useState<number | null>(null)
  const [usoAtual, setUsoAtual] = useState<{ patologia_id: number; nome: string }[]>([])
  const [carregandoUso, setCarregandoUso] = useState(false)
  const [paraExcluir, setParaExcluir] = useState<Tratamento | null>(null)
  const [usoParaExcluir, setUsoParaExcluir] = useState<{ patologia_id: number; nome: string }[]>([])

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
    setUsoAtual([])
    setErro(null)
  }

  async function selecionar(t: Tratamento) {
    setSelecionadoId(t.id)
    setErro(null)
    setCarregandoUso(true)
    try {
      setUsoAtual(await patologiaComplementosApi.listPatologiasUsando(t.id))
    } finally {
      setCarregandoUso(false)
    }
  }

  function aoSalvarEsquema(tratamentoSalvo: Tratamento, itensSalvos: TratamentoItem[]) {
    setComplementos((prev) => {
      const existe = prev.some((t) => t.id === tratamentoSalvo.id)
      return existe ? prev.map((t) => (t.id === tratamentoSalvo.id ? tratamentoSalvo : t)) : [...prev, tratamentoSalvo]
    })
    setResumoItens((prev) => ({ ...prev, [tratamentoSalvo.id]: itensSalvos }))
    setSelecionadoId(tratamentoSalvo.id)
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

  async function criarMedicamentoRapido(input: MedicamentoInput): Promise<Medicamento> {
    const criado = await medicamentosApi.insert(input)
    setMedicamentos((prev) => [...prev, criado].sort((a, b) => a.nome.localeCompare(b.nome)))
    return criado
  }

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

  async function excluirApresentacao(id: number) {
    await apresentacoesApi.remove(id)
    setApresentacoes((prev) => prev.filter((a) => a.id !== id))
  }

  const complementoSelecionado = complementos.find((c) => c.id === selecionadoId) ?? null

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
              {complementoSelecionado ? tituloExibido(complementoSelecionado) : 'Novo complemento'}
            </span>
          </div>

          {erro && (
            <p className="text-sm text-danger bg-danger-dim border border-danger/30 rounded-lg px-3 py-2">{erro}</p>
          )}

          <EsquemaEditor
            key={selecionadoId ?? 'novo'}
            tratamento={complementoSelecionado}
            papel="complemento"
            patologiaId={null}
            ordemNova={complementos.length}
            medicamentos={medicamentos}
            apresentacoes={apresentacoes}
            onSalvo={aoSalvarEsquema}
            onCriarMedicamento={criarMedicamentoRapido}
            onCriarApresentacao={criarApresentacaoRapida}
            onExcluirApresentacao={excluirApresentacao}
            onExcluir={complementoSelecionado ? () => pedirExclusao(complementoSelecionado) : undefined}
            extraTopo={
              selecionadoId && (
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
              )
            }
          />
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
