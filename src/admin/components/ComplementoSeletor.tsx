import { useEffect, useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { tratamentosApi, tratamentoItensApi, patologiaComplementosApi } from '../api'
import type { Tratamento, TratamentoItem, Medicamento } from '../types'
import { SortableList } from './SortableList'
import { SearchInput } from './SearchInput'

/** Seletor múltiplo de complementos pra uma patologia — agrupado por classe, com busca.
 *  Cada clique já persiste (vincular/desvincular), sem precisar de um botão "Salvar"
 *  separado: é o "dois cliques, sem redigitar" que evita recadastrar a dipirona em toda
 *  patologia. Arrastar na lista de vinculados reordena. */
export function ComplementoSeletor({
  patologiaId,
  medicamentos,
}: {
  patologiaId: number | null
  medicamentos: Medicamento[]
}) {
  const [complementos, setComplementos] = useState<Tratamento[]>([])
  const [itensPorComplemento, setItensPorComplemento] = useState<Record<number, TratamentoItem[]>>({})
  const [vinculados, setVinculados] = useState<Tratamento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    tratamentosApi.listComplementos().then(async (lista) => {
      setComplementos(lista)
      const itens = await tratamentoItensApi.listByTratamentos(lista.map((t) => t.id))
      const agrupados: Record<number, TratamentoItem[]> = {}
      for (const item of itens) {
        ;(agrupados[item.tratamento_id] ??= []).push(item)
      }
      setItensPorComplemento(agrupados)
    })
  }, [])

  useEffect(() => {
    if (patologiaId == null) {
      setVinculados([])
      return
    }
    setCarregando(true)
    patologiaComplementosApi
      .listByPatologia(patologiaId)
      .then((links) => {
        const porId = new Map(complementos.map((c) => [c.id, c]))
        // Só resolve depois que `complementos` já carregou — se ainda não carregou,
        // o efeito abaixo (que depende de `complementos`) reprocessa quando chegar.
        const resolvidos = links
          .map((l) => porId.get(l.tratamento_id))
          .filter((c): c is Tratamento => !!c)
        setVinculados(resolvidos)
      })
      .catch((e) => setErro((e as Error).message))
      .finally(() => setCarregando(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patologiaId, complementos])

  function resumo(t: Tratamento): string {
    const itens = (itensPorComplemento[t.id] ?? []).slice().sort((a, b) => a.ordem - b.ordem)
    if (itens.length === 0) return t.titulo || 'sem medicamento ainda'
    const nomes = itens.map((i) =>
      i.medicamento_id ? medicamentos.find((m) => m.id === i.medicamento_id)?.nome ?? '—' : i.nome_livre || '—'
    )
    return t.titulo || (nomes.length === 1 ? nomes[0] : `${nomes[0]} +${nomes.length - 1}`)
  }

  const idsVinculados = useMemo(() => new Set(vinculados.map((v) => v.id)), [vinculados])

  const disponiveis = useMemo(() => {
    const b = busca.trim().toLowerCase()
    return complementos
      .filter((c) => !idsVinculados.has(c.id))
      .filter((c) => !b || `${resumo(c)} ${c.classe ?? ''}`.toLowerCase().includes(b))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complementos, idsVinculados, busca, itensPorComplemento, medicamentos])

  const disponiveisPorClasse = useMemo(() => {
    const grupos = new Map<string, Tratamento[]>()
    for (const c of disponiveis) {
      const classe = c.classe?.trim() || 'Sem classe'
      if (!grupos.has(classe)) grupos.set(classe, [])
      grupos.get(classe)!.push(c)
    }
    return Array.from(grupos.entries()).sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
  }, [disponiveis])

  async function adicionar(t: Tratamento) {
    if (patologiaId == null) return
    setErro(null)
    const novaLista = [...vinculados, t]
    setVinculados(novaLista)
    try {
      await patologiaComplementosApi.vincular(patologiaId, t.id, vinculados.length)
    } catch (e) {
      setErro((e as Error).message)
      setVinculados(vinculados) // desfaz
    }
  }

  async function remover(t: Tratamento) {
    if (patologiaId == null) return
    setErro(null)
    const anterior = vinculados
    setVinculados(vinculados.filter((v) => v.id !== t.id))
    try {
      await patologiaComplementosApi.desvincular(patologiaId, t.id)
    } catch (e) {
      setErro((e as Error).message)
      setVinculados(anterior)
    }
  }

  async function reordenar(novaOrdem: Tratamento[]) {
    if (patologiaId == null) return
    setVinculados(novaOrdem)
    try {
      await patologiaComplementosApi.reordenar(
        patologiaId,
        novaOrdem.map((t) => t.id)
      )
    } catch (e) {
      setErro((e as Error).message)
    }
  }

  if (patologiaId == null) {
    return (
      <p className="text-xs text-text-dim border border-dashed border-border rounded-md px-3 py-2.5">
        Salve a patologia primeiro pra vincular complementos.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <span className="text-[11px] font-medium text-text-dim uppercase tracking-wide">
          Complementos vinculados
        </span>
        <p className="text-xs text-text-dim/80 mt-0.5">
          Suporte sintomático opcional — aparece na Consulta pra marcar zero, um ou vários.
        </p>
      </div>

      {erro && <p className="text-xs text-danger">{erro}</p>}

      {carregando ? (
        <p className="text-xs text-text-dim">Carregando…</p>
      ) : vinculados.length === 0 ? (
        <p className="text-xs text-text-dim">Nenhum complemento vinculado ainda.</p>
      ) : (
        <SortableList
          items={vinculados}
          onReorder={reordenar}
          className="flex flex-col gap-1.5"
          renderItem={(t) => (
            <div className="w-full flex items-center gap-2 bg-surface-2 border border-border rounded-md px-3 py-1.5">
              <span className="flex-1 min-w-0 text-sm text-text truncate">{resumo(t)}</span>
              {t.classe && <span className="text-[11px] text-text-dim shrink-0">{t.classe}</span>}
              <button
                type="button"
                onClick={() => remover(t)}
                className="shrink-0 text-text-dim hover:text-danger transition-colors p-1"
                title="Desvincular"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        />
      )}

      <div className="border-t border-border pt-3 flex flex-col gap-2">
        <SearchInput value={busca} onChange={setBusca} placeholder="Buscar complemento pra adicionar…" />
        <div className="max-h-56 overflow-y-auto flex flex-col gap-3 pr-1">
          {disponiveisPorClasse.length === 0 ? (
            <p className="text-xs text-text-dim">
              {complementos.length === 0
                ? 'Nenhum complemento cadastrado ainda — crie em Painel → Complementos.'
                : 'Nada encontrado.'}
            </p>
          ) : (
            disponiveisPorClasse.map(([classe, itens]) => (
              <div key={classe} className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-text-dim uppercase tracking-wide">{classe}</span>
                {itens.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => adicionar(c)}
                    className="w-full flex items-center gap-2 text-left px-2.5 py-1.5 rounded-md hover:bg-surface-2 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span className="text-sm text-text truncate">{resumo(c)}</span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
