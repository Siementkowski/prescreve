import { useEffect, useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { materiaisComplementaresApi } from '../admin/api'
import type { MaterialComplementar } from '../admin/types'
import { SearchInput } from '../admin/components/SearchInput'

/** Materiais complementares — aba do usuário, só leitura, igual em espírito à Patologias:
 *  quem cadastra é o editor (Painel → Materiais, /painel/materiais); aqui é só consultar e
 *  abrir. Cada item é um link externo (orientação nutricional, controle pressórico,
 *  controle glicêmico etc.) — o médico abre numa aba nova e imprime a página de origem;
 *  o Prescreve não guarda arquivo nenhum, só o link organizado por categoria. */
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
      .map(([categoria, itens]) => ({ categoria, itens: itens.sort((a, b) => a.ordem - b.ordem) }))
      .sort((a, b) => a.categoria.localeCompare(b.categoria, 'pt-BR'))
  }, [filtrados])

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-16">
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
          <div className="flex flex-col gap-8">
            {grupos.map((grupo) => (
              <div key={grupo.categoria}>
                <h2 className="font-display text-[20px] tracking-[-.6px] text-text mb-3">{grupo.categoria}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {grupo.itens.map((m) => (
                    <a
                      key={m.id}
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group border border-border hover:border-text bg-surface rounded-[var(--radius-card,14px)] p-4 flex flex-col gap-1.5 transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-area,3px_3px_0_var(--color-text))]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold text-text leading-snug">{m.titulo}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-text-dim opacity-50 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                      </div>
                      {m.descricao && (
                        <span className="text-xs text-text-dim leading-relaxed">{m.descricao}</span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
