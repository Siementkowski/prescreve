import { useEffect, useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { areasApi } from './api'
import type { Area, AreaInput, ModoArea } from './types'
import { LABEL_MODO_AREA } from './types'
import { AdminPageShell } from './components/AdminPageShell'
import { SortableList } from './components/SortableList'
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
      setAreas(await areasApi.list())
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
        const atualizada = await areasApi.update(selecionadaId, form)
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

  async function reordenar(novaOrdem: Area[]) {
    setAreas(novaOrdem)
    const payload = novaOrdem.map((a, idx) => ({ id: a.id, ordem: idx }))
    try {
      await areasApi.reorder(payload)
    } catch (e) {
      setErro((e as Error).message)
      recarregar()
    }
  }

  return (
    <>
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
            <SortableList
              items={filtradas}
              onReorder={reordenar}
              renderItem={(area) => (
                <button
                  onClick={() => selecionar(area)}
                  className={`w-full flex items-center gap-2.5 text-left px-3 py-2 rounded-lg border transition-colors ${
                    selecionadaId === area.id
                      ? 'bg-accent-dim border-accent'
                      : 'bg-surface border-border hover:border-text-dim'
                  }`}
                >
                  <span
                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: (area.cor ?? '#2dd4e8') + '22', color: area.cor ?? '#2dd4e8' }}
                  >
                    <IconePorNome nome={area.icone} className="w-3.5 h-3.5" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-display text-[15px] text-text truncate">{area.nome}</span>
                    <span className="block text-xs text-text-dim">{LABEL_MODO_AREA[area.modo]}</span>
                  </span>
                </button>
              )}
            />
          )
        }
        formulario={
          <div className="bg-surface border border-border rounded-lg p-6 max-w-xl">
            <h2 className="font-display text-lg font-semibold text-text mb-4">
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
                <span className="text-xs font-medium text-text-dim">Ícone</span>
                <IconPicker valor={form.icone} onChange={(nome) => setForm({ ...form, icone: nome })} />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-text-dim">Cor</span>
                <ColorPicker valor={form.cor} onChange={(cor) => setForm({ ...form, cor })} />
              </div>

              {erro && (
                <p className="text-sm text-danger bg-danger-dim border border-danger/30 rounded-lg px-3 py-2">
                  {erro}
                </p>
              )}

              <div className="flex items-center justify-between mt-2">
                {selecionadaId ? (
                  <button
                    onClick={() => setParaExcluir(areas.find((a) => a.id === selecionadaId) ?? null)}
                    className="flex items-center gap-1.5 text-sm text-danger hover:text-danger/80 transition-colors"
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
                  className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-accent-text text-sm font-semibold rounded-lg px-4 py-2 transition-colors"
                >
                  {salvando ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        }
      />

      <ConfirmDialog
        aberto={!!paraExcluir}
        titulo="Excluir área"
        mensagem={`Excluir "${paraExcluir?.nome}"? Isso apaga também todas as patologias, tratamentos e itens vinculados a ela.`}
        onConfirmar={() => paraExcluir && excluir(paraExcluir)}
        onCancelar={() => setParaExcluir(null)}
      />
    </>
  )
}
