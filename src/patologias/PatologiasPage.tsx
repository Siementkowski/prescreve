import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useSyncStore } from '../core/sync'
import type { Area, ModoTratamento } from '../admin/types'
import { SearchInput } from '../admin/components/SearchInput'
import { TratamentoCard } from '../consulta/TratamentoCard'
import { CopyButton } from '../consulta/components/CopyButton'
import { principaisVisiveis } from '../consulta/filtros'

/** Patologias — aba do USUÁRIO, só leitura. Nada aqui registra ou edita conteúdo: quem
 *  cadastra é o editor, em Painel → Patologias (rota separada, /painel/patologias). Essa
 *  tela é só pra consultar — orientações, sinônimos e os esquemas já publicados — no mesmo
 *  espírito de pathologies-screen.jsx do kit (workspace com lista à esquerda e detalhe à
 *  direita), mas sem nenhuma das ações de edição do mockup (sem Salvar, sem Nova
 *  patologia). Usa o mesmo cache offline-first do Consulta/Pediatria (useSyncStore), não a
 *  API direta do admin. */
export function PatologiasPage() {
  const carregandoInicial = useSyncStore((s) => s.carregandoInicial)
  const areas = useSyncStore((s) => s.areas)
  const patologias = useSyncStore((s) => s.patologias)
  const tratamentos = useSyncStore((s) => s.tratamentos)
  const itens = useSyncStore((s) => s.itens)
  const medicamentos = useSyncStore((s) => s.medicamentos)
  const apresentacoes = useSyncStore((s) => s.apresentacoes)

  const [searchParams, setSearchParams] = useSearchParams()
  const areaDaUrl = Number(searchParams.get('area')) || null
  const [areaSelecionada, setAreaSelecionada] = useState<number | null>(areaDaUrl)
  const [busca, setBusca] = useState('')
  const [selecionadaId, setSelecionadaId] = useState<number | null>(null)
  const [modo, setModo] = useState<ModoTratamento>('ambulatorial')

  const areasOrdenadas = useMemo(
    () => [...areas].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [areas]
  )

  // Cai na primeira área assim que a base carrega, a menos que já tenha vindo uma pela URL.
  useEffect(() => {
    if (areaSelecionada != null) return
    if (areasOrdenadas.length > 0) setAreaSelecionada(areasOrdenadas[0].id)
  }, [areasOrdenadas, areaSelecionada])

  const patologiasDaArea = useMemo(
    () =>
      patologias
        .filter((p) => p.area_id === areaSelecionada)
        .sort((a, b) => a.ordem - b.ordem),
    [patologias, areaSelecionada]
  )

  const filtradas = useMemo(() => {
    const t = busca.trim().toLowerCase()
    if (!t) return patologiasDaArea
    return patologiasDaArea.filter(
      (p) => p.nome.toLowerCase().includes(t) || (p.sinonimos ?? '').toLowerCase().includes(t)
    )
  }, [patologiasDaArea, busca])

  // Mantém uma patologia sempre selecionada quando a lista filtrada muda (troca de área ou
  // busca) — sem isso a tela ficaria "selecionada" numa patologia que já não aparece mais.
  useEffect(() => {
    if (filtradas.length === 0) {
      setSelecionadaId(null)
      return
    }
    if (!filtradas.some((p) => p.id === selecionadaId)) setSelecionadaId(filtradas[0].id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtradas])

  const patologia = patologias.find((p) => p.id === selecionadaId) ?? null
  const area = areas.find((a) => a.id === areaSelecionada) ?? null

  const esquemas = useMemo(() => {
    if (patologia == null) return []
    return principaisVisiveis(tratamentos, patologia.id, modo).sort((a, b) => a.ordem - b.ordem)
  }, [tratamentos, patologia, modo])

  function selecionarArea(id: number) {
    setAreaSelecionada(id)
    setSearchParams({ area: String(id) }, { replace: true })
  }

  if (carregandoInicial) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-text-dim">Carregando base…</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* barra de contexto — só o modo (não é uma escolha de prescrição aqui, é filtro de
          leitura), no mesmo lugar fixo que a Consulta usa pro seu ModoToggle. Antes ficava
          solto no meio do painel de detalhe, encostado no título "Esquemas". */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
        <ModoSwitch value={modo} onChange={setModo} />
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        {/* painel esquerdo — área, busca e lista (só leitura) */}
        <div className="flex flex-col gap-3 min-h-0 border-b lg:border-b-0 lg:border-r border-border bg-surface-2 p-5 lg:w-[320px] xl:w-[360px] shrink-0">
          <AreaDropdown areas={areasOrdenadas} value={areaSelecionada} onChange={selecionarArea} />
          <SearchInput value={busca} onChange={setBusca} placeholder="Buscar patologia…" />
          <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
            {filtradas.length === 0 ? (
              <p className="text-sm text-text-dim px-1">Nenhuma patologia nesta área.</p>
            ) : (
              filtradas.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelecionadaId(p.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-[var(--radius-item,11px)] border transition-colors ${
                    selecionadaId === p.id
                      ? 'bg-surface border-text shadow-[var(--shadow-selected)]'
                      : 'bg-surface border-transparent hover:border-border'
                  }`}
                >
                  <span className="block text-[14px] font-semibold text-text truncate">{p.nome}</span>
                  {p.sinonimos && (
                    <span className="block text-[11px] text-text-dim truncate mt-0.5">{p.sinonimos}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* painel direito — detalhe, sem nenhuma ação de edição */}
        <div className="flex-1 min-h-0 overflow-y-auto p-7 xl:p-10">
          {!patologia ? (
            <p className="text-sm text-text-dim">Selecione uma patologia.</p>
          ) : (
            <div className="flex flex-col gap-6 max-w-4xl">
              <div>
                <h2 className="font-display text-[28px] tracking-[-.8px] text-text">{patologia.nome}</h2>
                <p className="text-sm text-text-dim mt-1">{area?.nome}</p>
                {patologia.sinonimos && (
                  <p className="text-xs text-text-dim mt-1">Também conhecida como: {patologia.sinonimos}</p>
                )}
              </div>

              {(patologia.orientacoes || patologia.observacoes) && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {patologia.orientacoes && (
                    <div className="border border-border rounded-[var(--radius-card,14px)] bg-surface p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-text">Orientações não medicamentosas</h3>
                        <CopyButton texto={patologia.orientacoes} label="Copiar" />
                      </div>
                      <p className="text-sm text-text-dim whitespace-pre-wrap leading-relaxed">
                        {patologia.orientacoes}
                      </p>
                    </div>
                  )}
                  {patologia.observacoes && (
                    <div className="border border-dashed border-border rounded-[var(--radius-card,14px)] p-4 flex flex-col gap-2">
                      <h3 className="text-sm font-semibold text-text">Observações</h3>
                      <p className="text-sm text-text-dim whitespace-pre-wrap leading-relaxed">
                        {patologia.observacoes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <h3 className="font-display text-[20px] tracking-[-.6px] text-text mt-2">Esquemas</h3>

              {esquemas.length === 0 ? (
                <p className="text-sm text-text-dim">Nenhum esquema publicado pra esse modo ainda.</p>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {esquemas.map((t) => (
                    <TratamentoCard
                      key={t.id}
                      tratamento={t}
                      itens={itens}
                      medicamentos={medicamentos}
                      apresentacoes={apresentacoes}
                      gestante={false}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** Alternância ambulatorial/hospitalar local à tela — mesmo padrão visual do ModeSwitch do
 *  kit (pill com fundo, opção ativa em bg-text). Não usa o store da Consulta de propósito:
 *  aqui é só filtro de leitura, não uma escolha que vira parte de uma prescrição. */
function ModoSwitch({ value, onChange }: { value: ModoTratamento; onChange: (m: ModoTratamento) => void }) {
  const opcoes: { valor: ModoTratamento; label: string }[] = [
    { valor: 'ambulatorial', label: 'Ambulatorial' },
    { valor: 'hospitalar', label: 'Hospitalar' },
  ]
  return (
    <div className="flex items-center gap-0.5 bg-surface-2 border border-border rounded-[var(--radius-control,12px)] p-1 shrink-0">
      {opcoes.map((o) => (
        <button
          key={o.valor}
          type="button"
          onClick={() => onChange(o.valor)}
          className={`text-xs font-bold rounded-[var(--radius-input,9px)] px-3 py-1.5 transition-colors ${
            value === o.valor ? 'bg-text text-bg' : 'text-text-dim hover:text-text'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Dropdown próprio pra "Área" — o <select> nativo decide sozinho (pelo navegador) se abre
 *  pra cima ou pra baixo conforme o espaço na tela, e numa sidebar que já nasce perto do
 *  topo isso vira o menu abrindo pra cima sem aviso. Com um painel nosso, sempre abre a
 *  partir da borda inferior do botão (top-full), igual ao breadcrumb da Consulta. */
function AreaDropdown({
  areas,
  value,
  onChange,
}: {
  areas: Area[]
  value: number | null
  onChange: (id: number) => void
}) {
  const [aberto, setAberto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!aberto) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [aberto])

  const area = areas.find((a) => a.id === value) ?? null

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className={`flex items-center justify-between gap-2 w-full rounded-[var(--radius-input,9px)] border px-3.5 py-3 text-sm font-medium transition-colors ${
          aberto ? 'border-text bg-surface' : 'border-border bg-surface text-text hover:border-text-dim'
        }`}
      >
        <span className="truncate">{area ? area.nome : 'Selecione a área'}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-text-dim shrink-0 transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </button>

      {aberto && (
        <div className="absolute z-20 top-full mt-1.5 left-0 right-0 max-h-72 overflow-y-auto bg-surface border border-border rounded-xl shadow-lg py-1.5">
          {areas.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => {
                onChange(a.id)
                setAberto(false)
              }}
              className={`w-full text-left px-3.5 py-2 text-sm transition-colors ${
                value === a.id ? 'bg-accent-dim text-accent font-medium' : 'hover:bg-surface-2 text-text'
              }`}
            >
              {a.nome}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
