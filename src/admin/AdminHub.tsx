import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FolderHeart, Pill, ListChecks, Baby, Search } from 'lucide-react'
import { areasApi, patologiasApi, medicamentosApi } from './api'
import type { Area, Patologia, Medicamento } from './types'
import { useAuth } from '../core/auth/AuthProvider'
import { IconePorNome } from './components/IconPicker'

/** Início — mesmo espírito da "Visão geral" do kit (overview-screen.jsx): cabeçalho com
 *  saudação + busca, grade de acesso rápido às áreas clínicas, atalhos de conteúdo e um
 *  destaque grande pra calculadora pediátrica. Revisão fica de fora daqui de propósito:
 *  é manutenção interna, não o que alguém vem procurar ao abrir a página inicial —
 *  continua a um clique pela faixa de seções do Painel. */
export function AdminHub() {
  const { perfil, isEditor } = useAuth()
  const navigate = useNavigate()
  const [areas, setAreas] = useState<Area[]>([])
  const [patologias, setPatologias] = useState<Patologia[]>([])
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])
  const [busca, setBusca] = useState('')

  useEffect(() => {
    areasApi.list().then(setAreas)
    patologiasApi.list().then(setPatologias)
    medicamentosApi.list().then(setMedicamentos)
  }, [])

  const primeiroNome = (perfil?.nome || 'você').split(' ')[0]

  const resultadosPatologias = useMemo(() => {
    const t = busca.trim().toLowerCase()
    if (!t) return []
    return patologias.filter((p) => p.nome.toLowerCase().includes(t)).slice(0, 5)
  }, [patologias, busca])

  const resultadosMedicamentos = useMemo(() => {
    const t = busca.trim().toLowerCase()
    if (!t) return []
    return medicamentos.filter((m) => m.nome.toLowerCase().includes(t)).slice(0, 5)
  }, [medicamentos, busca])

  const buscando = busca.trim().length > 0
  const semResultados = buscando && resultadosPatologias.length === 0 && resultadosMedicamentos.length === 0

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 sm:px-9 pt-11 pb-20">
        {/* cabeçalho — mesmo padrão do PageHead do kit: eyebrow, título grande, descrição,
            ações à direita */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8 mb-11">
          <div className="min-w-0">
            <span className="ed-pill inline-flex items-center gap-1.5 border border-[var(--line-strong)] bg-surface px-2.5 py-1.5 text-[11px] font-semibold">
              <span className="ed-eyebrow-dot bg-cat-areas" aria-hidden="true" />
              Prescreve
            </span>
            <h1 className="font-display text-[clamp(30px,4.2vw,48px)] leading-[0.98] tracking-[-.045em] mt-4 mb-3">
              Oi, {primeiroNome} — vamos cuidar da sua base?
            </h1>
            <p className="max-w-md text-text-dim text-[15px] leading-relaxed">
              Cadastre áreas, patologias e medicamentos, monte as prescrições — tudo por aqui, num só lugar.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/consulta"
              className="text-sm font-semibold border border-border hover:border-text-dim text-text rounded-[var(--radius-pill,999px)] px-4 py-2.5 transition-colors"
            >
              Ir para Consulta
            </Link>
            {isEditor && (
              <Link
                to="/painel/tratamentos"
                className="text-sm font-semibold bg-text hover:opacity-90 text-bg rounded-[var(--radius-pill,999px)] px-4 py-2.5 transition-opacity"
              >
                Nova prescrição →
              </Link>
            )}
          </div>
        </div>

        {/* busca rápida */}
        <div className="relative mb-1">
          <div className="flex items-center gap-2.5 bg-surface border border-border rounded-[var(--radius-control,12px)] px-3.5 py-3">
            <Search className="w-4 h-4 text-text-dim shrink-0" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar patologia ou medicamento…"
              className="flex-1 bg-transparent outline-none text-sm text-text placeholder:text-text-dim"
            />
          </div>

          {buscando && (
            <div className="absolute z-20 top-full mt-1.5 w-full bg-surface border border-border rounded-[var(--radius-card,14px)] shadow-[var(--shadow-popover,0_14px_32px_rgba(0,0,0,.2))] overflow-hidden">
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border">
                <span className="text-[10px] uppercase tracking-[1px] text-text-dim font-semibold">Resultados</span>
                <button
                  onClick={() => setBusca('')}
                  className="text-[10px] border border-border rounded-[var(--radius-xs,6px)] px-1.5 py-0.5 text-text-dim hover:text-text transition-colors"
                >
                  Esc
                </button>
              </div>
              {semResultados ? (
                <p className="text-sm text-text-dim px-4 py-5 text-center">Nada encontrado.</p>
              ) : (
                <>
                  {resultadosPatologias.map((p) => (
                    <button
                      key={`p-${p.id}`}
                      onClick={() => navigate('/painel/patologias')}
                      className="w-full grid grid-cols-[30px_1fr_auto] items-center gap-2.5 text-left px-3.5 py-2.5 border-b border-border last:border-b-0 hover:bg-surface-2 transition-colors"
                    >
                      <span className="w-[30px] h-[30px] rounded-[var(--radius-sm,8px)] flex items-center justify-center bg-[var(--tint-green-bg)] text-[var(--tint-green-fg)]">
                        <FolderHeart className="w-3.5 h-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] text-text truncate">{p.nome}</span>
                        <span className="block text-[11px] text-text-dim">Patologia</span>
                      </span>
                      <span className="text-text-dim opacity-45">↗</span>
                    </button>
                  ))}
                  {resultadosMedicamentos.map((m) => (
                    <button
                      key={`m-${m.id}`}
                      onClick={() => navigate('/painel/medicamentos')}
                      className="w-full grid grid-cols-[30px_1fr_auto] items-center gap-2.5 text-left px-3.5 py-2.5 border-b border-border last:border-b-0 hover:bg-surface-2 transition-colors"
                    >
                      <span className="w-[30px] h-[30px] rounded-[var(--radius-sm,8px)] flex items-center justify-center bg-[var(--tint-blue-bg)] text-[var(--tint-blue-fg)]">
                        <Pill className="w-3.5 h-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] text-text truncate">{m.nome}</span>
                        <span className="block text-[11px] text-text-dim">Medicamento</span>
                      </span>
                      <span className="text-text-dim opacity-45">↗</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* acesso rápido — áreas clínicas */}
        <div className="flex items-end justify-between gap-4 mt-14 mb-4.5">
          <div>
            <span className="ed-pill inline-flex items-center gap-1.5 border border-[var(--line-strong)] bg-surface px-2.5 py-1.5 text-[11px] font-semibold">
              <span className="ed-eyebrow-dot bg-accent" aria-hidden="true" />
              Acesso rápido
            </span>
            <h2 className="font-display text-[28px] tracking-[-1px] mt-3">Áreas clínicas</h2>
          </div>
          <span className="text-xs text-text-dim shrink-0 pb-1">
            {areas.length} área{areas.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {areas.map((a) => (
            <Link
              key={a.id}
              to={`/painel/patologias?area=${a.id}`}
              className="group border border-border hover:border-text bg-surface rounded-[var(--radius-card,14px)] min-h-[74px] p-3.5 grid grid-cols-[34px_1fr_auto] items-center gap-2.5 transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-area,3px_3px_0_var(--color-text))]"
            >
              <span
                className="w-9 h-9 rounded-[var(--radius-nav,10px)] flex items-center justify-center shrink-0"
                style={{ backgroundColor: (a.cor ?? '#2dd4e8') + '22', color: a.cor ?? '#2dd4e8' }}
              >
                <IconePorNome nome={a.icone} className="w-[18px] h-[18px]" />
              </span>
              <span className="min-w-0">
                <strong className="block text-sm font-semibold text-text truncate">{a.nome}</strong>
                <small className="block text-[11px] text-text-dim mt-0.5">Conteúdo clínico</small>
              </span>
              <span className="text-sm text-text-dim opacity-40 group-hover:opacity-70 transition-opacity">↗</span>
            </Link>
          ))}
          {areas.length === 0 && (
            <p className="col-span-full text-sm text-text-dim py-6 text-center">Nenhuma área cadastrada ainda.</p>
          )}
        </div>

        {/* atalhos de conteúdo */}
        <div className="flex items-end justify-between gap-4 mt-14 mb-4.5">
          <h2 className="font-display text-[24px] tracking-[-.8px]">Atalhos de conteúdo</h2>
          <span className="text-xs text-text-dim shrink-0 pb-1">sem excesso de informação</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <CompactAction
            to="/painel/medicamentos"
            glyph="+"
            titulo="Medicamentos"
            nota={`${medicamentos.length} cadastrado${medicamentos.length === 1 ? '' : 's'}`}
          />
          <CompactAction
            to="/painel/tratamentos"
            glyph="≡"
            titulo="Prescrições"
            nota="Montar e revisar receitas"
          />
          <CompactAction
            to="/painel/patologias"
            glyph="◇"
            titulo="Patologias"
            nota={`${patologias.length} cadastrada${patologias.length === 1 ? '' : 's'}`}
          />
        </div>

        {/* destaque — calculadora pediátrica */}
        <Link
          to="/pediatria"
          className="mt-11 flex items-center justify-between gap-6 rounded-[var(--radius-panel,18px)] px-8 py-7 bg-text text-bg overflow-hidden relative transition-opacity hover:opacity-95"
        >
          <span className="min-w-0">
            <span className="font-display text-xl sm:text-2xl font-semibold block max-w-xs">
              Calculadora de dose pediátrica
            </span>
            <span className="text-sm block mt-2 max-w-xs opacity-70">
              Fórmula transparente, com aviso de dose-teto — pronta pra usar na consulta.
            </span>
          </span>
          <span className="flex items-center gap-2 font-display font-semibold text-sm px-5 py-3 rounded-[var(--radius-pill,999px)] shrink-0 bg-bg text-text">
            <Baby className="w-4 h-4" />
            Abrir calculadora
          </span>
        </Link>

        {isEditor && (
          <Link
            to="/painel/areas"
            className="mt-2.5 flex items-center gap-3 rounded-[var(--radius-card,14px)] px-6 py-5 border border-border bg-surface hover:border-text transition-colors"
          >
            <span className="w-10 h-10 rounded-[var(--radius-nav,10px)] flex items-center justify-center bg-[var(--tint-slate-bg)] text-[var(--tint-slate-fg)] shrink-0">
              <ListChecks className="w-5 h-5" />
            </span>
            <span className="min-w-0">
              <span className="font-display text-[15px] font-semibold block">Gerenciar áreas</span>
              <span className="text-[13px] text-text-dim block mt-0.5">
                As grandes especialidades — o primeiro nível da base.
              </span>
            </span>
          </Link>
        )}
      </div>
    </div>
  )
}

function CompactAction({ to, glyph, titulo, nota }: { to: string; glyph: string; titulo: string; nota: string }) {
  return (
    <Link
      to={to}
      className="group border border-border hover:border-text bg-surface rounded-[var(--radius-card,14px)] p-3.5 grid grid-cols-[34px_1fr_auto] items-center gap-2.5 transition-transform duration-150 hover:-translate-y-0.5"
    >
      <span className="w-[34px] h-[34px] rounded-[var(--radius-input,9px)] bg-text text-bg flex items-center justify-center font-bold shrink-0">
        {glyph}
      </span>
      <span className="min-w-0">
        <strong className="block text-[13px] font-semibold text-text truncate">{titulo}</strong>
        <small className="block text-[11px] text-text-dim mt-0.5">{nota}</small>
      </span>
      <span className="text-base text-text-dim opacity-45 group-hover:opacity-75 transition-opacity">→</span>
    </Link>
  )
}
