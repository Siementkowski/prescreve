import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useSyncStore } from '../core/sync'
import { SearchInput } from '../admin/components/SearchInput'
import { corDaCategoria } from '../materiais/cores'
import { FluxogramaViewer } from './FluxogramaViewer'

/** Fluxogramas — aba do usuário, só leitura, mesmo espírito de Materiais/Patologias: quem
 *  cadastra é o editor (Painel → Fluxogramas). Entrada em grid de cards por categoria
 *  (mesmo visual de Materiais); ao abrir uma categoria, mostra o FluxogramaViewer (abas +
 *  sandbox + tela cheia — mesmo componente reaproveitado nas condutas da Pediatria). Usa
 *  o cache offline-first (useSyncStore), não a API direta do admin. */
export function FluxogramasPage() {
  const carregandoInicial = useSyncStore((s) => s.carregandoInicial)
  const fluxogramasTodos = useSyncStore((s) => s.fluxogramas)

  const [searchParams, setSearchParams] = useSearchParams()
  const categoriaDaUrl = searchParams.get('categoria')
  const [busca, setBusca] = useState('')

  const todasCategorias = useMemo(() => fluxogramasTodos.map((f) => f.categoria), [fluxogramasTodos])

  const filtrados = useMemo(() => {
    const t = busca.trim().toLowerCase()
    if (!t) return fluxogramasTodos
    return fluxogramasTodos.filter(
      (f) => f.titulo.toLowerCase().includes(t) || f.categoria.toLowerCase().includes(t)
    )
  }, [fluxogramasTodos, busca])

  const grupos = useMemo(() => {
    const mapa = new Map<string, typeof fluxogramasTodos>()
    for (const f of filtrados) {
      const lista = mapa.get(f.categoria) ?? []
      lista.push(f)
      mapa.set(f.categoria, lista)
    }
    return [...mapa.entries()]
      .map(([categoria, itens]) => ({
        categoria,
        itens: [...itens].sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR')),
      }))
      .sort((a, b) => a.categoria.localeCompare(b.categoria, 'pt-BR'))
  }, [filtrados])

  const categoriaAberta = categoriaDaUrl && grupos.some((g) => g.categoria === categoriaDaUrl) ? categoriaDaUrl : null
  const grupoAberto = grupos.find((g) => g.categoria === categoriaAberta) ?? null

  function abrirCategoria(categoria: string) {
    setSearchParams({ categoria })
  }

  function voltar() {
    setSearchParams({})
  }

  if (carregandoInicial) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-text-dim">Carregando base…</p>
      </div>
    )
  }

  // Categoria aberta — mostra o viewer em tela cheia de conteúdo, sem o resto da grade.
  if (grupoAberto) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-4 h-full min-h-0 pb-10">
          <button
            onClick={voltar}
            className="flex items-center gap-1.5 text-sm font-medium text-text-dim hover:text-text transition-colors shrink-0 w-fit"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar pras categorias
          </button>
          <h1 className="font-display text-[26px] tracking-[-.8px] text-text shrink-0">{grupoAberto.categoria}</h1>
          <FluxogramaViewer fluxogramas={grupoAberto.itens} />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-6 pb-16">
        <div>
          <span className="ed-eyebrow">
            <span className="ed-eyebrow-dot" style={{ background: 'var(--red)' }} />
            Conteúdo / Fluxogramas
          </span>
          <h1 className="font-display text-[34px] leading-[.98] tracking-[-1.5px] mt-3 mb-2 text-text">
            Condutas clínicas em fluxograma.
          </h1>
          <p className="text-text-dim text-base leading-relaxed max-w-lg">
            Organizados por área — abra pra consultar durante o atendimento, com opção de tela cheia.
          </p>
        </div>

        <div className="max-w-md">
          <SearchInput value={busca} onChange={setBusca} placeholder="Buscar fluxograma ou categoria…" />
        </div>

        {grupos.length === 0 ? (
          <p className="text-sm text-text-dim">
            {fluxogramasTodos.length === 0
              ? 'Nenhum fluxograma cadastrado ainda — quem cadastra é o editor, em Painel → Fluxogramas.'
              : 'Nada encontrado pra essa busca.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {grupos.map((grupo) => {
              const cor = corDaCategoria(grupo.categoria, todasCategorias)
              return (
                <button
                  key={grupo.categoria}
                  onClick={() => abrirCategoria(grupo.categoria)}
                  className="text-left rounded-[var(--radius-card,14px)] border border-border overflow-hidden bg-surface shadow-[var(--shadow-float,0_4px_14px_rgba(17,17,17,.08))] hover:-translate-y-0.5 hover:shadow-[var(--shadow-area,3px_3px_0_var(--color-text))] transition-[transform,box-shadow] duration-150"
                >
                  <div
                    className="px-4 py-3 font-display font-semibold text-[15px] tracking-[-.2px] text-white"
                    style={{ background: cor }}
                  >
                    {grupo.categoria}
                  </div>
                  <div className="px-4 py-3 text-sm text-text-dim">
                    {grupo.itens.length} fluxograma{grupo.itens.length === 1 ? '' : 's'}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
