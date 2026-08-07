import { useEffect, useMemo, useState } from 'react'
import { Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { medicamentosApi } from './api'
import type { Medicamento, MedicamentoInput, StatusRisco } from './types'
import { LABEL_STATUS_RISCO } from './types'
import { SearchInput } from './components/SearchInput'
import { ConfirmDialog } from './components/ConfirmDialog'
import { StatusRiscoBadge } from './components/StatusRiscoBadge'
import { TextField, TextAreaField, SelectField } from './components/Field'
import { Plus } from 'lucide-react'

const VAZIO: MedicamentoInput = {
  nome: '',
  nome_comercial: '',
  apresentacoes: '',
  gestacao_status: null,
  gestacao_obs: '',
  lactacao_status: null,
  contraindicacoes: '',
  ped_mg_kg_dia: null,
  ped_dose_max_dia: null,
  ped_concentracao: null,
  ped_volume_ref: null,
  ped_obs: '',
}

const CORES_BORDA_GESTACAO: Record<StatusRisco, string> = {
  seguro: 'border-ok/50',
  cautela: 'border-warn/50',
  contraindicado: 'border-danger/50',
  sem_dados: 'border-border',
}

function numOuNull(v: string): number | null {
  if (v.trim() === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export function MedicamentosPage() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [selecionadoId, setSelecionadoId] = useState<number | null>(null)
  const [form, setForm] = useState<MedicamentoInput>(VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [paraExcluir, setParaExcluir] = useState<Medicamento | null>(null)
  const [pediatriaAberta, setPediatriaAberta] = useState(false)

  async function recarregar() {
    setCarregando(true)
    try {
      setMedicamentos(await medicamentosApi.list())
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

  const filtrados = useMemo(
    () =>
      medicamentos.filter(
        (m) =>
          m.nome.toLowerCase().includes(busca.toLowerCase()) ||
          (m.nome_comercial ?? '').toLowerCase().includes(busca.toLowerCase())
      ),
    [medicamentos, busca]
  )

  function novo() {
    setSelecionadoId(null)
    setForm(VAZIO)
    setPediatriaAberta(false)
    setErro(null)
  }

  function selecionar(m: Medicamento) {
    setSelecionadoId(m.id)
    setForm(m)
    setPediatriaAberta(!!(m.ped_mg_kg_dia || m.ped_dose_max_dia || m.ped_concentracao || m.ped_volume_ref || m.ped_obs))
    setErro(null)
  }

  async function salvar() {
    if (!form.nome.trim()) {
      setErro('Princípio ativo é obrigatório.')
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      if (selecionadoId) {
        const atualizado = await medicamentosApi.update(selecionadoId, form)
        setMedicamentos((prev) => prev.map((m) => (m.id === selecionadoId ? atualizado : m)))
      } else {
        const criado = await medicamentosApi.insert(form)
        setMedicamentos((prev) => [...prev, criado].sort((a, b) => a.nome.localeCompare(b.nome)))
        setSelecionadoId(criado.id)
      }
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(m: Medicamento) {
    try {
      await medicamentosApi.remove(m.id)
      setMedicamentos((prev) => prev.filter((x) => x.id !== m.id))
      if (selecionadoId === m.id) novo()
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setParaExcluir(null)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 h-full min-h-0">
        <div className="flex flex-col gap-3 min-h-0">
          <div className="flex gap-2">
            <div className="flex-1">
              <SearchInput value={busca} onChange={setBusca} placeholder="Buscar medicamento…" />
            </div>
            <button
              onClick={novo}
              className="shrink-0 flex items-center gap-1.5 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-md px-3 py-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Novo
            </button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
            {carregando ? (
              <p className="text-sm text-text-dim px-1">Carregando…</p>
            ) : filtrados.length === 0 ? (
              <p className="text-sm text-text-dim px-1">Nenhum medicamento encontrado.</p>
            ) : (
              filtrados.map((m) => (
                <button
                  key={m.id}
                  onClick={() => selecionar(m)}
                  className={`w-full text-left px-3 py-2 rounded-md border transition-colors ${
                    selecionadoId === m.id
                      ? 'bg-surface-2 border-accent'
                      : 'bg-surface border-border hover:border-text-dim'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-text truncate">{m.nome}</span>
                    <StatusRiscoBadge status={m.gestacao_status} />
                  </div>
                  {m.nome_comercial && (
                    <span className="block text-xs text-text-dim truncate">{m.nome_comercial}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="min-h-0 overflow-y-auto">
          <div className="bg-surface border border-border rounded-lg p-6 max-w-2xl">
            <h2 className="text-sm font-semibold text-text mb-4">
              {selecionadoId ? 'Editar medicamento' : 'Novo medicamento'}
            </h2>

            <div className="flex flex-col gap-4">
              <TextField
                label="Princípio ativo"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Nitrofurantoína"
              />
              <TextField
                label="Nome comercial"
                value={form.nome_comercial ?? ''}
                onChange={(e) => setForm({ ...form, nome_comercial: e.target.value })}
              />
              <TextField
                label="Apresentações"
                hint="Ex: cp 100mg, suspensão 25mg/5ml"
                value={form.apresentacoes ?? ''}
                onChange={(e) => setForm({ ...form, apresentacoes: e.target.value })}
              />
              <TextAreaField
                label="Contraindicações"
                value={form.contraindicacoes ?? ''}
                onChange={(e) => setForm({ ...form, contraindicacoes: e.target.value })}
                rows={2}
              />

              {/* Gestação — alimenta o alerta automático, fica em destaque */}
              <div
                className={`rounded-md border-2 p-3 flex flex-col gap-3 ${
                  CORES_BORDA_GESTACAO[form.gestacao_status ?? 'sem_dados']
                }`}
              >
                <p className="text-xs font-semibold text-text-dim uppercase tracking-wide">
                  Gestação — alimenta o alerta automático
                </p>
                <SelectField
                  label="Status na gestação"
                  value={form.gestacao_status ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, gestacao_status: (e.target.value || null) as StatusRisco | null })
                  }
                >
                  <option value="">— selecione —</option>
                  {Object.entries(LABEL_STATUS_RISCO).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </SelectField>
                <TextAreaField
                  label="Observação sobre gestação"
                  value={form.gestacao_obs ?? ''}
                  onChange={(e) => setForm({ ...form, gestacao_obs: e.target.value })}
                  rows={2}
                />
              </div>

              <SelectField
                label="Status na lactação"
                value={form.lactacao_status ?? ''}
                onChange={(e) =>
                  setForm({ ...form, lactacao_status: (e.target.value || null) as StatusRisco | null })
                }
              >
                <option value="">— selecione —</option>
                {Object.entries(LABEL_STATUS_RISCO).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </SelectField>

              {/* Pediatria — opcional */}
              <div className="border border-border rounded-md">
                <button
                  type="button"
                  onClick={() => setPediatriaAberta((v) => !v)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-text"
                >
                  <span className="font-medium">Dados pediátricos (opcional)</span>
                  {pediatriaAberta ? (
                    <ChevronDown className="w-4 h-4 text-text-dim" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-text-dim" />
                  )}
                </button>
                {pediatriaAberta && (
                  <div className="p-3 pt-0 flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <TextField
                        label="mg/kg/dia"
                        type="number"
                        step="any"
                        value={form.ped_mg_kg_dia ?? ''}
                        onChange={(e) => setForm({ ...form, ped_mg_kg_dia: numOuNull(e.target.value) })}
                      />
                      <TextField
                        label="Dose máx./dia (mg)"
                        type="number"
                        step="any"
                        value={form.ped_dose_max_dia ?? ''}
                        onChange={(e) => setForm({ ...form, ped_dose_max_dia: numOuNull(e.target.value) })}
                      />
                      <TextField
                        label="Concentração (mg/ml)"
                        type="number"
                        step="any"
                        value={form.ped_concentracao ?? ''}
                        onChange={(e) => setForm({ ...form, ped_concentracao: numOuNull(e.target.value) })}
                      />
                      <TextField
                        label="Volume de referência (ml)"
                        type="number"
                        step="any"
                        value={form.ped_volume_ref ?? ''}
                        onChange={(e) => setForm({ ...form, ped_volume_ref: numOuNull(e.target.value) })}
                      />
                    </div>
                    <TextAreaField
                      label="Observação pediátrica"
                      value={form.ped_obs ?? ''}
                      onChange={(e) => setForm({ ...form, ped_obs: e.target.value })}
                      rows={2}
                    />
                  </div>
                )}
              </div>

              {erro && (
                <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-md px-3 py-2">
                  {erro}
                </p>
              )}

              <div className="flex items-center justify-between mt-2">
                {selecionadoId ? (
                  <button
                    onClick={() => setParaExcluir(medicamentos.find((m) => m.id === selecionadoId) ?? null)}
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
                  className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
                >
                  {salvando ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        aberto={!!paraExcluir}
        titulo="Excluir medicamento"
        mensagem={`Excluir "${paraExcluir?.nome}"? Itens de tratamento que usam este medicamento ficam sem vínculo (nome_livre precisará ser preenchido).`}
        onConfirmar={() => paraExcluir && excluir(paraExcluir)}
        onCancelar={() => setParaExcluir(null)}
      />
    </>
  )
}
