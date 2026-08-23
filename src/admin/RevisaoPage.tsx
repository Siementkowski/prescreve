import { useEffect, useMemo, useState } from 'react'
import { Check, ExternalLink, Settings2, FlaskConical } from 'lucide-react'
import { useRevisaoStore } from './revisaoStore'
import { useConfiguracoesStore } from '../core/configuracoes'
import { areasApi, patologiasApi, medicamentosApi } from './api'
import type { Area, Patologia, Medicamento } from './types'
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

  // Medicamentos nascidos do cadastro rápido (Fase 4) — gestação/lactação/pediatria/
  // contraindicações nunca foram revisadas, então entram na fila junto com as prescrições.
  const [medicamentosIncompletos, setMedicamentosIncompletos] = useState<Medicamento[]>([])
  const [marcandoMedicamento, setMarcandoMedicamento] = useState<number | null>(null)

  async function carregarMedicamentosIncompletos() {
    const lista = await medicamentosApi.list()
    setMedicamentosIncompletos(lista.filter((m) => m.incompleto))
  }

  useEffect(() => {
    carregar()
    areasApi.list().then(setAreas)
    patologiasApi.list().then(setPatologias)
    carregarMedicamentosIncompletos()
  }, [carregar])

  async function marcarMedicamentoCompleto(id: number) {
    setMarcandoMedicamento(id)
    setErro(null)
    try {
      await medicamentosApi.update(id, { incompleto: false })
      setMedicamentosIncompletos((prev) => prev.filter((m) => m.id !== id))
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setMarcandoMedicamento(null)
    }
  }

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

  function contexto(patologiaId: number | null) {
    // Complemento não tem patologia fixa — vive na biblioteca, então o "contexto" dele é
    // isso mesmo, não uma área/patologia específica.
    if (patologiaId == null) return { patologia: 'Complemento', area: 'Biblioteca' }
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
    <div className="flex flex-col gap-6 h-full min-h-0 overflow-y-auto pb-8">
      <div className="flex items-end justify-between gap-6 flex-wrap shrink-0">
        <div>
          <span className="ed-eyebrow">
            <span className="ed-eyebrow-dot" style={{ background: 'var(--on-soft-orange,#a54e12)' }} />
            Manutenção / Revisão
          </span>
          <h1 className="font-display text-[34px] leading-[.98] tracking-[-1.5px] mt-3 mb-1 text-text">
            O que precisa de outro olhar.
          </h1>
          <p className="text-text-dim text-sm">
            {pendentes.length} prescriç{pendentes.length !== 1 ? 'ões' : 'ão'} pendente
            {pendentes.length !== 1 ? 's' : ''}, do mais antigo pro mais recente.
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs text-text-dim shrink-0 mb-1">
          <Settings2 className="w-3.5 h-3.5" />
          Revisar a cada
          <input
            type="number"
            min={1}
            value={mesesAteRevisar}
            onChange={(e) => setMesesAteRevisar(Number(e.target.value) || 1)}
            className="tabular w-14 bg-surface border border-border rounded-[var(--radius-input,9px)] px-2 py-1.5 text-sm text-text outline-none focus:border-text"
          />
          meses
        </label>
      </div>

      {erro && (
        <p className="text-sm text-danger bg-danger-dim border border-danger/30 rounded-lg px-3 py-2 shrink-0">
          {erro}
        </p>
      )}

      {medicamentosIncompletos.length > 0 && (
        <div className="shrink-0 border border-warn/40 bg-warn/10 rounded-[var(--radius-card,14px)] p-4 flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5">
            <FlaskConical className="w-4 h-4 text-warn shrink-0" />
            <h3 className="text-sm font-semibold text-text">
              {medicamentosIncompletos.length} medicamento{medicamentosIncompletos.length !== 1 ? 's' : ''} do
              cadastro rápido, sem gestação/lactação/pediatria revisadas
            </h3>
          </div>
          <div className="flex flex-col gap-1.5">
            {medicamentosIncompletos.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 bg-surface border border-border rounded-lg px-3 py-2"
              >
                <span className="text-sm text-text">
                  {m.nome}
                  {m.nome_comercial && <span className="text-text-dim"> · {m.nome_comercial}</span>}
                </span>
                <button
                  onClick={() => marcarMedicamentoCompleto(m.id)}
                  disabled={marcandoMedicamento === m.id}
                  className="flex items-center gap-1.5 text-xs font-medium bg-ok hover:opacity-90 disabled:opacity-50 text-white rounded-[var(--radius-pill,999px)] px-4 py-2 transition-opacity shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  {marcandoMedicamento === m.id ? 'Marcando…' : 'Marcar como revisado'}
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-dim">
            Preencha gestação/lactação/pediatria/contraindicações em Medicamentos antes de marcar — o botão só
            tira da fila, não revisa sozinho.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
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
                className="flex items-center justify-between gap-3 border border-border rounded-[var(--radius-card,14px)] bg-surface px-4 py-3.5"
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
                  className="flex items-center gap-1.5 text-xs font-medium bg-ok hover:opacity-90 disabled:opacity-50 text-white rounded-[var(--radius-pill,999px)] px-4 py-2 transition-opacity shrink-0"
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
