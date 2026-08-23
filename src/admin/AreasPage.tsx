import { useEffect, useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { areasApi } from './api'
import type { Area, AreaInput, ModoArea } from './types'
import { LABEL_MODO_AREA } from './types'
import { AdminPageShell } from './components/AdminPageShell'
import { ConfirmDialog } from './components/ConfirmDialog'
import { IconPicker, IconePorNome } from './components/IconPicker'
import { ColorPicker } from './components/ColorPicker'
import { TextField, SelectField } from './components/Field'

const VAZIO: AreaInput = { nome: '', modo: 'ambulatorial', icone: null, cor: null, ordem: 0 }

export function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [selecionadaId, setSelecionadaId] = useState<number | null>(null)
  const [form, setForm] = useState<AreaInput>(VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [paraExcluir, setParaExcluir] = useState<Area | null>(null)

  async function recarregar() {
    setCarregando(true)
    try {
      // Ordem alfabética — mais fácil de achar a área numa lista grande do que a ordem
      // de arrasto. A ordem que rege a navegação da Consulta continua salva no banco
      // (campo `ordem`), só não dá mais pra arrastar aqui pra reorganizar ela.
      const lista = await areasApi.list()
      setAreas([...lista].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')))
      setErro(null)
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    recarregar()
  }, [])

  const filtradas = useMemo(
    () => areas.filter((a) => a.nome.toLowerCase().includes(busca.toLowerCase())),
    [areas, busca]
  )

  function novo() {
    setSelecionadaId(null)
    setForm({ ...VAZIO, ordem: areas.length })
    setErro(null)
  }

  function selecionar(area: Area) {
    setSelecionadaId(area.id)
    setForm(area)
    setErro(null)
  }

  async function salvar() {
    if (!form.nome.trim()) {
      setErro('Nome é obrigatório.')
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      if (selecionadaId) {
        // Só os campos editáveis — `form` vem de setForm(area) ao selecionar e carrega o
        // id junto; mandá-lo no payload de update quebra ("column id can only be updated
        // to DEFAULT").
        const { nome, modo, icone, cor, ordem } = form
        const atualizada = await areasApi.update(selecionadaId, { nome, modo, icone, cor, ordem })
        setAreas((prev) => prev.map((a) => (a.id === selecionadaId ? atualizada : a)))
      } else {
        const criada = await areasApi.insert(form)
        setAreas((prev) => [...prev, criada])
        setSelecionadaId(criada.id)
      }
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(area: Area) {
    try {
      await areasApi.remove(area.id)
      setAreas((prev) => prev.filter((a) => a.id !== area.id))
      if (selecionadaId === area.id) novo()
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setParaExcluir(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 h-full min-h-0">
      {/* PageHead — eyebrow + título editorial (frase, não rótulo) + descrição */}
      <div className="shrink-0">
        <span className="ed-eyebrow">
          <span className="ed-eyebrow-dot" style={{ background: 'var(--mint)' }} />
          Estrutura / Áreas
        </span>
        <h1 className="font-display text-[34px] leading-[.98] tracking-[-1.5px] mt-3 mb-2 text-text">
          Áreas clínicas.
        </h1>
        <p className="text-text-dim text-base leading-relaxed max-w-lg">
          Organize o conteúdo do Prescreve por contexto clínico.
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <AdminPageShell
          busca={busca}
          onBuscaChange={setBusca}
          buscaPlaceholder="Buscar área…"
          onNovo={novo}
          labelNovo="Nova área"
          lista={
            carregando ? (
              <p className="text-sm text-text-dim px-1">Carregando…</p>
            ) : filtradas.length === 0 ? (
              <p className="text-sm text-text-dim px-1">Nenhuma área encontrada.</p>
            ) : (
              filtradas.map((area) => (
                <button
                  key={area.id}
                  onClick={() => selecionar(area)}
                  className={`w-full flex items-center gap-2.5 text-left px-3 py-2.5 rounded-[var(--radius-item,11px)] border transition-colors ${
                    selecionadaId === area.id
                      ? 'bg-surface border-text shadow-[var(--shadow-selected)]'
                      : 'bg-surface border-transparent hover:border-border'
                  }`}
                >
                  <span
                    className="w-9 h-9 rounded-[var(--radius-nav,10px)] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: (area.cor ?? '#2dd4e8') + '22', color: area.cor ?? '#2dd4e8' }}
                  >
                    <IconePorNome nome={area.icone} className="w-4 h-4" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[14px] font-semibold text-text truncate">{area.nome}</span>
                    <span className="block text-[11px] text-text-dim mt-0.5">{LABEL_MODO_AREA[area.modo]}</span>
                  </span>
                </button>
              ))
            )
          }
          formulario={
            <div className="max-w-xl">
              <h2 className="font-display text-[22px] tracking-[-.8px] text-text mb-5">
                {selecionadaId ? 'Editar área' : 'Nova área'}
              </h2>

              <div className="flex flex-col gap-4">
                <TextField
                  label="Nome"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: Infectologia"
                />

                <SelectField
                  label="Modo"
                  value={form.modo}
                  onChange={(e) => setForm({ ...form, modo: e.target.value as ModoArea })}
                >
                  {Object.entries(LABEL_MODO_AREA).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </SelectField>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-text-dim uppercase tracking-[0.8px]">Ícone</span>
                  <IconPicker valor={form.icone} onChange={(nome) => setForm({ ...form, icone: nome })} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-text-dim uppercase tracking-[0.8px]">Cor</span>
                  <ColorPicker valor={form.cor} onChange={(cor) => setForm({ ...form, cor })} />
                </div>

                {erro && (
                  <p className="text-sm text-danger bg-danger-dim border border-danger/30 rounded-lg px-3 py-2">
                    {erro}
                  </p>
                )}

                <div className="flex items-center justify-between mt-2 pt-4 border-t border-border">
                  {selecionadaId ? (
                    <button
                      onClick={() => setParaExcluir(areas.find((a) => a.id === selecionadaId) ?? null)}
                      className="flex items-center gap-1.5 text-sm font-medium text-danger hover:opacity-80 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    onClick={salvar}
                    disabled={salvando}
                    className="bg-text hover:opacity-90 disabled:opacity-50 text-bg text-sm font-semibold rounded-[var(--radius-pill,999px)] px-5 py-3 transition-opacity"
                  >
                    {salvando ? 'Salvando…' : 'Salvar'}
                  </button>
                </div>
              </div>
            </div>
          }
        />
      </div>

      <ConfirmDialog
        aberto={!!paraExcluir}
        titulo="Excluir área"
        mensagem={`Excluir "${paraExcluir?.nome}"? Isso apaga também todas as patologias, tratamentos e itens vinculados a ela.`}
        onConfirmar={() => paraExcluir && excluir(paraExcluir)}
        onCancelar={() => setParaExcluir(null)}
      />
    </div>
  )
}
