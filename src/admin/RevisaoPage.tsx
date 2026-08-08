import { useEffect, useMemo, useState } from 'react'
import { Check, ExternalLink, Settings2 } from 'lucide-react'
import { useRevisaoStore } from './revisaoStore'
import { useConfiguracoesStore } from '../core/configuracoes'
import { areasApi, patologiasApi } from './api'
import type { Area, Patologia } from './types'
import { LABEL_LINHA, LABEL_MODO_TRATAMENTO } from './types'
import { precisaRevisar, tempoDesdeRevisao, ehUrl } from '../core/revisao'

export function RevisaoPage() {
  const tratamentos = useRevisaoStore((s) => s.tratamentos)
  const carregando = useRevisaoStore((s) => s.carregando)
  const carregar = useRevisaoStore((s) => s.carregar)
  const marcarRevisado = useRevisaoStore((s) => s.marcarRevisado)

  const mesesAteRevisar = useConfiguracoesStore((s) => s.mesesAteRevisar)
  const setMesesAteRevisar = useConfiguracoesStore((s) => s.setMesesAteRevisar)

  const [areas, setAreas] = useState<Area[]>([])
  const [patologias, setPatologias] = useState<Patologia[]>([])
  const [marcando, setMarcando] = useState<number | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    carregar()
    areasApi.list().then(setAreas)
    patologiasApi.list().then(setPatologias)
  }, [carregar])

  const pendentes = useMemo(() => {
    return tratamentos
      .filter((t) => precisaRevisar({ precisaRevisao: t.precisa_revisao, revisadoEm: t.revisado_em }, mesesAteRevisar))
      .sort((a, b) => {
        // Nunca revisado vem primeiro (mais urgente), depois do mais antigo pro mais recente.
        if (!a.revisado_em && !b.revisado_em) return 0
        if (!a.revisado_em) return -1
        if (!b.revisado_em) return 1
        return a.revisado_em.localeCompare(b.revisado_em)
      })
  }, [tratamentos, mesesAteRevisar])

  function contexto(patologiaId: number) {
    const p = patologias.find((x) => x.id === patologiaId)
    const a = p ? areas.find((x) => x.id === p.area_id) : null
    return { patologia: p?.nome ?? '—', area: a?.nome ?? '—' }
  }

  async function marcar(id: number) {
    setMarcando(id)
    setErro(null)
    try {
      await marcarRevisado(id)
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setMarcando(null)
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full min-h-0">
      <div className="flex items-center justify-between gap-3 flex-wrap shrink-0">
        <div>
          <h2 className="font-display text-lg font-semibold text-text">Pendências de revisão</h2>
          <p className="text-xs text-text-dim mt-0.5">
            {pendentes.length} tratamento{pendentes.length !== 1 ? 's' : ''} pendente
            {pendentes.length !== 1 ? 's' : ''}, do mais antigo pro mais recente.
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs text-text-dim">
          <Settings2 className="w-3.5 h-3.5" />
          Revisar a cada
          <input
            type="number"
            min={1}
            value={mesesAteRevisar}
            onChange={(e) => setMesesAteRevisar(Number(e.target.value) || 1)}
            className="tabular w-14 bg-surface-2 border border-border rounded-lg px-2 py-1 text-sm text-text outline-none focus:border-accent"
          />
          meses
        </label>
      </div>

      {erro && (
        <p className="text-sm text-danger bg-danger-dim border border-danger/30 rounded-lg px-3 py-2 shrink-0">
          {erro}
        </p>
      )}

      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
        {carregando && tratamentos.length === 0 ? (
          <p className="text-sm text-text-dim px-1">Carregando…</p>
        ) : pendentes.length === 0 ? (
          <p className="text-sm text-text-dim px-1">Nada pendente — tudo revisado dentro do prazo.</p>
        ) : (
          pendentes.map((t) => {
            const { area, patologia } = contexto(t.patologia_id)
            return (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 border border-border rounded-xl bg-surface px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display text-[15px] font-medium text-text">
                      {area} · {patologia}
                    </span>
                    <span className="text-xs text-text-dim">
                      {t.titulo || `${LABEL_MODO_TRATAMENTO[t.modo]} · ${LABEL_LINHA[t.linha]}`}
                    </span>
                    {t.precisa_revisao && (
                      <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full border text-danger border-danger/40 bg-danger-dim">
                        marcado manualmente
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-text-dim">
                    <span className="tabular">{tempoDesdeRevisao(t.revisado_em)}</span>
                    {t.referencia && (
                      <>
                        <span>·</span>
                        {ehUrl(t.referencia) ? (
                          <a
                            href={t.referencia}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline flex items-center gap-0.5"
                          >
                            referência <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span>{t.referencia}</span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => marcar(t.id)}
                  disabled={marcando === t.id}
                  className="flex items-center gap-1.5 text-xs font-medium bg-ok hover:bg-ok/90 disabled:opacity-50 text-white rounded-md px-3 py-1.5 transition-colors shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  {marcando === t.id ? 'Marcando…' : 'Marcar como revisado'}
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
