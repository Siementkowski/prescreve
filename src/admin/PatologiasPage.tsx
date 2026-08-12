import { useEffect, useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { areasApi, patologiasApi, medicamentosApi } from './api'
import type { Area, Patologia, PatologiaInput, Medicamento } from './types'
import { AdminPageShell } from './components/AdminPageShell'
import { SortableList } from './components/SortableList'
import { ConfirmDialog } from './components/ConfirmDialog'
import { ComplementoSeletor } from './components/ComplementoSeletor'
import { TextField, TextAreaField, SelectField } from './components/Field'

function vazio(areaId: number, ordem: number): PatologiaInput {
  return { area_id: areaId, nome: '', sinonimos: '', orientacoes: '', observacoes: '', ordem }
}

export function PatologiasPage() {
  const [areas, setAreas] = useState<Area[]>([])
  const [areaSelecionada, setAreaSelecionada] = useState<number | null>(null)
  const [patologias, setPatologias] = useState<Patologia[]>([])
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [selecionadaId, setSelecionadaId] = useState<number | null>(null)
  const [form, setForm] = useState<PatologiaInput | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [paraExcluir, setParaExcluir] = useState<Patologia | null>(null)

  useEffect(() => {
    areasApi.list().then((lista) => {
      const ordenada = [...lista].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
      setAreas(ordenada)
      if (ordenada.length > 0) setAreaSelecionada(ordenada[0].id)
    })
    medicamentosApi.list().then(setMedicamentos)
  }, [])

  useEffect(() => {
    if (areaSelecionada == null) return
    setCarregando(true)
    patologiasApi
      .listByArea(areaSelecionada)
      .then((lista) => {
        setPatologias(lista)
        setSelecionadaId(null)
        setForm(vazio(areaSelecionada, lista.length))
        setErro(null)
      })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [areaSelecionada])

  const filtradas = useMemo(
    () => patologias.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase())),
    [patologias, busca]
  )

  function novo() {
    if (areaSelecionada == null) return
    setSelecionadaId(null)
    setForm(vazio(areaSelecionada, patologias.length))
    setErro(null)
  }

  function selecionar(p: Patologia) {
    setSelecionadaId(p.id)
    setForm(p)
    setErro(null)
  }

  async function salvar() {
    if (!form) return
    if (!form.nome.trim()) {
      setErro('Nome é obrigatório.')
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      if (selecionadaId) {
        // Só os campos editáveis — `form` vem de setForm(p) ao selecionar e carrega o id
        // junto; mandá-lo no payload de update quebra ("column id can only be updated to
        // DEFAULT").
        const { area_id, nome, sinonimos, orientacoes, observacoes, ordem } = form
        const atualizada = await patologiasApi.update(selecionadaId, {
          area_id,
          nome,
          sinonimos,
          orientacoes,
          observacoes,
          ordem,
        })
        setPatologias((prev) => prev.map((p) => (p.id === selecionadaId ? atualizada : p)))
      } else {
        const criada = await patologiasApi.insert(form)
        setPatologias((prev) => [...prev, criada])
        setSelecionadaId(criada.id)
      }
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(p: Patologia) {
    try {
      await patologiasApi.remove(p.id)
      setPatologias((prev) => prev.filter((x) => x.id !== p.id))
      if (selecionadaId === p.id) novo()
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setParaExcluir(null)
    }
  }

  async function reordenar(novaOrdem: Patologia[]) {
    setPatologias(novaOrdem)
    const payload = novaOrdem.map((p, idx) => ({ id: p.id, ordem: idx }))
    try {
      await patologiasApi.reorder(payload)
    } catch (e) {
      setErro((e as Error).message)
    }
  }

  if (areas.length === 0) {
    return (
      <p className="text-sm text-text-dim">
        Cadastre uma área primeiro na aba "Áreas" — patologias precisam estar vinculadas a uma área.
      </p>
    )
  }

  return (
    <>
      <AdminPageShell
        busca={busca}
        onBuscaChange={setBusca}
        buscaPlaceholder="Buscar patologia…"
        onNovo={novo}
        labelNovo="Nova patologia"
        extraHeader={
          <SelectField
            label="Área"
            value={areaSelecionada ?? ''}
            onChange={(e) => setAreaSelecionada(Number(e.target.value))}
          >
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </SelectField>
        }
        lista={
          carregando ? (
            <p className="text-sm text-text-dim px-1">Carregando…</p>
          ) : filtradas.length === 0 ? (
            <p className="text-sm text-text-dim px-1">Nenhuma patologia nesta área.</p>
          ) : (
            <SortableList
              items={filtradas}
              onReorder={reordenar}
              renderItem={(p) => (
                <button
                  onClick={() => selecionar(p)}
                  className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                    selecionadaId === p.id
                      ? 'bg-accent-dim border-accent'
                      : 'bg-surface border-border hover:border-text-dim'
                  }`}
                >
                  <span className="block font-display text-[15px] text-text truncate">{p.nome}</span>
                  {p.sinonimos && (
                    <span className="block text-xs text-text-dim truncate">{p.sinonimos}</span>
                  )}
                </button>
              )}
            />
          )
        }
        formulario={
          form && (
            <div className="bg-surface border border-border rounded-lg p-6 max-w-2xl">
              <h2 className="font-display text-lg font-semibold text-text mb-4">
                {selecionadaId ? 'Editar patologia' : 'Nova patologia'}
              </h2>

              <div className="flex flex-col gap-4">
                <TextField
                  label="Nome"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: ITU não complicada"
                />

                <TextField
                  label="Sinônimos"
                  hint="Separados por vírgula — usados na busca da tela de consulta."
                  value={form.sinonimos ?? ''}
                  onChange={(e) => setForm({ ...form, sinonimos: e.target.value })}
                  placeholder="Ex: infecção urinária, cistite"
                />

                <TextAreaField
                  label="Orientações não medicamentosas"
                  hint="Markdown simples — dieta, hábitos, cuidados gerais."
                  value={form.orientacoes ?? ''}
                  onChange={(e) => setForm({ ...form, orientacoes: e.target.value })}
                  rows={5}
                />

                <TextAreaField
                  label="Observações"
                  value={form.observacoes ?? ''}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  rows={3}
                />

                <ComplementoSeletor patologiaId={selecionadaId} medicamentos={medicamentos} />

                {erro && (
                  <p className="text-sm text-danger bg-danger-dim border border-danger/30 rounded-lg px-3 py-2">
                    {erro}
                  </p>
                )}

                <div className="flex items-center justify-between mt-2">
                  {selecionadaId ? (
                    <button
                      onClick={() => setParaExcluir(patologias.find((p) => p.id === selecionadaId) ?? null)}
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
          )
        }
      />

      <ConfirmDialog
        aberto={!!paraExcluir}
        titulo="Excluir patologia"
        mensagem={`Excluir "${paraExcluir?.nome}"? Isso apaga também os tratamentos vinculados.`}
        onConfirmar={() => paraExcluir && excluir(paraExcluir)}
        onCancelar={() => setParaExcluir(null)}
      />
    </>
  )
}
