import { useEffect, useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { materiaisComplementaresApi } from '../admin/api'
import type { MaterialComplementar } from '../admin/types'
import { SearchInput } from '../admin/components/SearchInput'
import { corDaCategoria } from './cores'

/** Materiais complementares — aba do usuário, só leitura, igual em espírito à Patologias:
 *  quem cadastra é o editor (Painel → Materiais, /painel/materiais); aqui é só consultar e
 *  abrir. Um card por categoria (cabeçalho colorido, cor determinística por posição
 *  alfabética — ver cores.ts), itens em ordem alfabética dentro do card — mesmo layout do
 *  print de referência. Cada item é um link externo: o médico abre numa aba nova e imprime
 *  a página de origem, o Prescreve não guarda arquivo nenhum. */
export function MateriaisPage() {
  const [materiais, setMateriais] = useState<MaterialComplementar[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    materiaisComplementaresApi
      .list()
      .then(setMateriais)
      .catch((e) => setErro((e as Error).message))
      .finally(() => setCarregando(false))
  }, [])

  const todasCategorias = useMemo(() => materiais.map((m) => m.categoria), [materiais])

  const filtrados = useMemo(() => {
    const t = busca.trim().toLowerCase()
    if (!t) return materiais
    return materiais.filter(
      (m) =>
        m.titulo.toLowerCase().includes(t) ||
        m.categoria.toLowerCase().includes(t) ||
        (m.descricao ?? '').toLowerCase().includes(t)
    )
  }, [materiais, busca])

  const grupos = useMemo(() => {
    const mapa = new Map<string, MaterialComplementar[]>()
    for (const m of filtrados) {
      const lista = mapa.get(m.categoria) ?? []
      lista.push(m)
      mapa.set(m.categoria, lista)
    }
    return [...mapa.entries()]
      .map(([categoria, itens]) => ({
        categoria,
        itens: itens.sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR')),
      }))
      .sort((a, b) => a.categoria.localeCompare(b.categoria, 'pt-BR'))
  }, [filtrados])

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-6 pb-16">
        <div>
          <span className="ed-eyebrow">
            <span className="ed-eyebrow-dot" style={{ background: 'var(--mint)' }} />
            Conteúdo / Materiais
          </span>
          <h1 className="font-display text-[34px] leading-[.98] tracking-[-1.5px] mt-3 mb-2 text-text">
            Material de apoio pra passar ao paciente.
          </h1>
          <p className="text-text-dim text-base leading-relaxed max-w-lg">
            Orientações nutricionais, controle pressórico, controle glicêmico e outros links
            organizados por categoria — abra e imprima na consulta.
          </p>
        </div>

        <div className="max-w-md">
          <SearchInput value={busca} onChange={setBusca} placeholder="Buscar material ou categoria…" />
        </div>

        {erro && (
          <p className="text-sm text-danger bg-danger-dim border border-danger/30 rounded-lg px-3 py-2">{erro}</p>
        )}

        {carregando ? (
          <p className="text-sm text-text-dim">Carregando…</p>
        ) : grupos.length === 0 ? (
          <p className="text-sm text-text-dim">
            {materiais.length === 0
              ? 'Nenhum material cadastrado ainda — quem cadastra é o editor, em Painel → Materiais.'
              : 'Nada encontrado pra essa busca.'}
          </p>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {grupos.map((grupo) => {
              const cor = corDaCategoria(grupo.categoria, todasCategorias)
              return (
                <div
                  key={grupo.categoria}
                  className="mb-4 break-inside-avoid rounded-[var(--radius-card,14px)] border border-border overflow-hidden bg-surface shadow-[var(--shadow-float,0_4px_14px_rgba(17,17,17,.08))]"
                >
                  <div
                    className="px-4 py-3 font-display font-semibold text-[15px] tracking-[-.2px] text-white"
                    style={{ background: cor }}
                  >
                    {grupo.categoria}
                  </div>
                  <div className="p-2 flex flex-col gap-0.5">
                    {grupo.itens.map((m) => (
                      <a
                        key={m.id}
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={m.descricao ?? undefined}
                        className="group flex items-center justify-between gap-2 px-2.5 py-2 rounded-[var(--radius-item,11px)] border border-transparent text-text text-sm bg-surface hover:bg-surface-2 hover:border-text hover:-translate-y-0.5 hover:shadow-[var(--shadow-selected,3px_3px_0_var(--color-text))] transition-[transform,box-shadow,border-color,background-color] duration-150"
                      >
                        <span className="truncate">{m.titulo}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-text-dim opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
