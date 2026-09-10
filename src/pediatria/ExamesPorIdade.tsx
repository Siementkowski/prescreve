import { useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import { usePediatriaStore } from './store'
import { idadeEmMeses, formatarIdade } from './idade'
import { EXAMES_POR_IDADE } from './dados/examesPorIdade'
import { CopyButton } from '../consulta/components/CopyButton'

/** Exames recomendados pra idade — cruza data de nascimento com a lista de rastreios com
 *  protocolo etário definido (ver dados/examesPorIdade.ts). Checklist seleciona o que vai
 *  pedir, botão copia a lista pronta pra colar no pedido/prontuário. Não substitui
 *  julgamento clínico — os itens sem cronograma nacional único (EAS, parasitológico)
 *  aparecem com o aviso explícito, não como recomendação universal. */
export function ExamesPorIdade() {
  const dataNascimento = usePediatriaStore((s) => s.dataNascimento)
  const setDataNascimento = usePediatriaStore((s) => s.setDataNascimento)
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())

  const idadeMeses = useMemo(() => (dataNascimento ? idadeEmMeses(dataNascimento) : null), [dataNascimento])

  const aplicaveis = useMemo(() => {
    if (idadeMeses == null) return []
    return EXAMES_POR_IDADE.filter((e) => e.idadeMeses <= idadeMeses)
  }, [idadeMeses])

  const grupos = useMemo(() => {
    const mapa = new Map<string, typeof aplicaveis>()
    for (const e of aplicaveis) {
      const lista = mapa.get(e.categoria) ?? []
      lista.push(e)
      mapa.set(e.categoria, lista)
    }
    return [...mapa.entries()]
  }, [aplicaveis])

  function alternar(nome: string) {
    setSelecionados((prev) => {
      const novo = new Set(prev)
      if (novo.has(nome)) novo.delete(nome)
      else novo.add(nome)
      return novo
    })
  }

  const textoCopiar = useMemo(
    () =>
      aplicaveis
        .filter((e) => selecionados.has(e.nome))
        .map((e) => `- ${e.nome}`)
        .join('\n'),
    [aplicaveis, selecionados]
  )

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0 flex-wrap">
        <label className="text-sm text-text-dim font-medium shrink-0">Data de nascimento</label>
        <input
          type="date"
          value={dataNascimento ?? ''}
          onChange={(e) => setDataNascimento(e.target.value || null)}
          max={new Date().toISOString().slice(0, 10)}
          className="bg-surface-2 border-2 border-accent/40 focus:border-accent rounded-lg px-3 py-1.5 text-sm font-semibold text-text outline-none transition-colors"
        />
        {idadeMeses != null && <span className="text-sm text-text-dim">{formatarIdade(idadeMeses)} de idade</span>}
        {selecionados.size > 0 && (
          <CopyButton texto={textoCopiar} label={`Copiar ${selecionados.size} selecionado${selecionados.size === 1 ? '' : 's'}`} variant="solid" className="ml-auto" />
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {idadeMeses == null ? (
          <p className="text-sm text-text-dim px-1 py-4">Informe a data de nascimento pra ver os exames recomendados.</p>
        ) : grupos.length === 0 ? (
          <p className="text-sm text-text-dim px-1 py-4">Nenhum exame com indicação pra essa idade ainda.</p>
        ) : (
          <div className="max-w-3xl mx-auto flex flex-col gap-5">
            <div className="flex items-start gap-2 text-xs text-text-dim bg-surface-2 border border-border rounded-lg px-3 py-2.5">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Lista de referência por idade — não substitui avaliação clínica individual.
                Itens marcados "sem protocolo etário único" não são rastreio universal, só
                comumente pedidos em check-up.
              </span>
            </div>

            {grupos.map(([categoria, exames]) => (
              <div key={categoria}>
                <h2 className="font-display text-lg font-semibold text-text mb-2">{categoria}</h2>
                <div className="flex flex-col gap-2">
                  {exames.map((e) => (
                    <label
                      key={e.nome}
                      className="flex items-start gap-2.5 border border-border rounded-xl bg-surface p-3.5 cursor-pointer hover:border-text-dim transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selecionados.has(e.nome)}
                        onChange={() => alternar(e.nome)}
                        className="mt-0.5 w-4 h-4 accent-[var(--color-accent)] shrink-0"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-text">{e.nome}</span>
                        <span className="block text-xs text-text-dim mt-0.5">{e.periodicidade}</span>
                        <span className="block text-xs text-text-dim mt-1">{e.justificativa}</span>
                        {e.restricao && (
                          <span className="block text-xs text-warn mt-1 bg-warn-dim border border-warn/30 rounded px-2 py-1">
                            {e.restricao}
                          </span>
                        )}
                      </span>
                    </label>
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
