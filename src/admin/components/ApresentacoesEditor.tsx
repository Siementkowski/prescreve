import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import type { Apresentacao } from '../types'
import { apresentacoesApi } from '../api'
import { SortableList } from './SortableList'
import { ApresentacaoRow } from './ApresentacaoRow'

/** Lista aninhada de apresentações dentro do cadastro do medicamento — CRUD completo
 *  (adicionar/editar/remover/reordenar) sem sair da tela. Só ativa depois que o
 *  medicamento tem id (precisa existir pra apresentacao_id referenciar). */
export function ApresentacoesEditor({ medicamentoId }: { medicamentoId: number | null }) {
  const [apresentacoes, setApresentacoes] = useState<Apresentacao[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (medicamentoId == null) {
      setApresentacoes([])
      return
    }
    setCarregando(true)
    apresentacoesApi
      .listByMedicamento(medicamentoId)
      .then(setApresentacoes)
      .catch((e) => setErro((e as Error).message))
      .finally(() => setCarregando(false))
  }, [medicamentoId])

  async function adicionar() {
    if (medicamentoId == null) return
    try {
      const criada = await apresentacoesApi.insert({
        medicamento_id: medicamentoId,
        forma: '',
        concentracao: null,
        unidade: null,
        por_volume: null,
        por_volume_unidade: null,
        descricao: null,
        ordem: apresentacoes.length,
      })
      setApresentacoes((prev) => [...prev, criada])
    } catch (e) {
      setErro((e as Error).message)
    }
  }

  async function salvar(id: number, dados: Partial<Apresentacao>) {
    const atualizada = await apresentacoesApi.update(id, dados)
    setApresentacoes((prev) => prev.map((a) => (a.id === id ? atualizada : a)))
  }

  async function excluir(id: number) {
    try {
      await apresentacoesApi.remove(id)
      setApresentacoes((prev) => prev.filter((a) => a.id !== id))
    } catch (e) {
      setErro((e as Error).message)
    }
  }

  async function reordenar(novaOrdem: Apresentacao[]) {
    setApresentacoes(novaOrdem)
    try {
      await apresentacoesApi.reorder(novaOrdem.map((a, idx) => ({ id: a.id, ordem: idx })))
    } catch (e) {
      setErro((e as Error).message)
    }
  }

  if (medicamentoId == null) {
    return (
      <p className="text-xs text-text-dim border border-dashed border-border rounded-md px-3 py-2.5">
        Salve o medicamento primeiro pra cadastrar apresentações.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-text-dim uppercase tracking-wide">Apresentações</span>
        <button
          type="button"
          onClick={adicionar}
          className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar
        </button>
      </div>

      {erro && <p className="text-xs text-danger">{erro}</p>}

      {carregando ? (
        <p className="text-xs text-text-dim">Carregando…</p>
      ) : apresentacoes.length === 0 ? (
        <p className="text-xs text-text-dim">
          Nenhuma apresentação cadastrada — sem elas, não dá pra escolher quantidade/forma na prescrição.
        </p>
      ) : (
        <SortableList
          items={apresentacoes}
          onReorder={reordenar}
          className="flex flex-col gap-2"
          renderItem={(a, arrastando) => (
            <ApresentacaoRow apresentacao={a} arrastando={arrastando} onSalvar={salvar} onExcluir={excluir} />
          )}
        />
      )}
    </div>
  )
}
