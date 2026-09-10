import { useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import { usePediatriaStore } from './store'
import { idadeEmMeses, formatarIdade } from './idade'
import { MARCOS_DESENVOLVIMENTO, type Marco } from './dados/marcosDesenvolvimento'

const LABEL_DOMINIO: Record<Marco['dominio'], string> = {
  motor: 'Motor',
  linguagem: 'Linguagem',
  social: 'Social',
}

/** Checklist rápido de marcos esperados pra faixa etária atual da criança — pensado pra
 *  triagem em consulta, não avaliação formal de desenvolvimento (isso exige instrumento
 *  validado). Os checkboxes são só de leitura da tela (não salvam em lugar nenhum) — é
 *  uma conferência visual rápida, não um registro. */
export function MarcosDesenvolvimento() {
  const dataNascimento = usePediatriaStore((s) => s.dataNascimento)
  const setDataNascimento = usePediatriaStore((s) => s.setDataNascimento)
  const [marcados, setMarcados] = useState<Set<string>>(new Set())

  const idadeMeses = useMemo(() => (dataNascimento ? idadeEmMeses(dataNascimento) : null), [dataNascimento])

  const { faixaAtual, faixaProxima } = useMemo(() => {
    if (idadeMeses == null) return { faixaAtual: null, faixaProxima: null }
    const passadas = MARCOS_DESENVOLVIMENTO.filter((f) => f.idadeMeses <= idadeMeses)
    const futuras = MARCOS_DESENVOLVIMENTO.filter((f) => f.idadeMeses > idadeMeses)
    return {
      faixaAtual: passadas[passadas.length - 1] ?? null,
      faixaProxima: futuras[0] ?? null,
    }
  }, [idadeMeses])

  function alternar(chave: string) {
    setMarcados((prev) => {
      const novo = new Set(prev)
      if (novo.has(chave)) novo.delete(chave)
      else novo.add(chave)
      return novo
    })
  }

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
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {idadeMeses == null ? (
          <p className="text-sm text-text-dim px-1 py-4">Informe a data de nascimento pra ver os marcos esperados.</p>
        ) : !faixaAtual ? (
          <p className="text-sm text-text-dim px-1 py-4">
            Ainda não chegou na primeira faixa do checklist ({MARCOS_DESENVOLVIMENTO[0]?.rotulo}).
          </p>
        ) : (
          <div className="max-w-2xl mx-auto flex flex-col gap-4">
            <div className="flex items-start gap-2 text-xs text-text-dim bg-surface-2 border border-border rounded-lg px-3 py-2.5">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Referência pra triagem rápida — cada criança tem seu ritmo, ausência de um
                marco pede avaliação clínica, não é diagnóstico automático de atraso.
              </span>
            </div>

            <div className="border border-border rounded-xl bg-surface p-4 flex flex-col gap-3">
              <p className="font-display text-lg font-semibold text-text">
                Marcos esperados até {faixaAtual.rotulo}
              </p>
              <div className="flex flex-col gap-1.5">
                {faixaAtual.marcos.map((m, i) => {
                  const chave = `${faixaAtual.idadeMeses}-${i}`
                  const marcado = marcados.has(chave)
                  return (
                    <label
                      key={chave}
                      className="flex items-start gap-2.5 text-sm cursor-pointer px-2 py-1.5 rounded-lg hover:bg-surface-2 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={marcado}
                        onChange={() => alternar(chave)}
                        className="mt-0.5 w-4 h-4 accent-[var(--color-accent)] shrink-0"
                      />
                      <span className={marcado ? 'text-text' : 'text-text-dim'}>
                        <span className="text-[10px] font-bold uppercase tracking-wide text-text-faint mr-1.5">
                          {LABEL_DOMINIO[m.dominio]}
                        </span>
                        {m.descricao}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            {faixaProxima && (
              <div className="border border-dashed border-border rounded-xl p-4">
                <p className="text-xs text-text-dim uppercase tracking-wide font-medium mb-2">
                  Próxima faixa — {faixaProxima.rotulo}
                </p>
                <div className="flex flex-col gap-1">
                  {faixaProxima.marcos.map((m, i) => (
                    <p key={i} className="text-xs text-text-dim/80">
                      <span className="font-bold uppercase tracking-wide mr-1">{LABEL_DOMINIO[m.dominio]}</span>
                      {m.descricao}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
