import { useEffect, useMemo, useState } from 'react'
import { Trash2, ExternalLink } from 'lucide-react'
import { materiaisComplementaresApi } from './api'
import type { MaterialComplementar, MaterialComplementarInput } from './types'
import { AdminPageShell } from './components/AdminPageShell'
import { ConfirmDialog } from './components/ConfirmDialog'
import { TextField, TextAreaField } from './components/Field'

const VAZIO: MaterialComplementarInput = { titulo: '', categoria: '', url: '', descricao: '', ordem: 0 }

/** Biblioteca de links pra material de apoio (orientação nutricional, controle
 *  pressórico, controle glicêmico etc.) — cadastro simples: título, categoria (texto
 *  livre, agrupa a listagem em /materiais) e a URL de origem. Sem upload, sem HTML — o
 *  Prescreve só guarda o link, quem abre e imprime é o médico na página de origem. */
export function MateriaisComplementaresPage() {
  const [materiais, setMateriais] = useState<MaterialComplementar[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [selecionadoId, setSelecionadoId] = useState<number | null>(null)
  const [form, setForm] = useState<MaterialComplementarInput>(VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [paraExcluir, setParaExcluir] = useState<MaterialComplementar | null>(null)

  async function recarregar() {
    setCarregando(true)
    try {
      setMateriais(await materiaisComplementaresApi.list())
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
      materiais.filter(
        (m) =>
          m.titulo.toLowerCase().includes(busca.toLowerCase()) ||
          m.categoria.toLowerCase().includes(busca.toLowerCase())
      ),
    [materiais, busca]
  )

  function novo() {
    setSelecionadoId(null)
    setForm({ ...VAZIO, ordem: materiais.length })
    setErro(null)
  }

  function selecionar(m: MaterialComplementar) {
    setSelecionadoId(m.id)
    setForm(m)
    setErro(null)
  }

  async function salvar() {
    if (!form.titulo.trim()) {
      setErro('Título é obrigatório.')
      return
    }
    if (!form.categoria.trim()) {
      setErro('Categoria é obrigatória — é o que agrupa a listagem pro usuário.')
      return
    }
    if (!form.url.trim()) {
      setErro('URL é obrigatória.')
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      if (selecionadoId) {
        const { titulo, categoria, url, descricao, ordem } = form
        const atualizado = await materiaisComplementaresApi.update(selecionadoId, {
          titulo,
          categoria,
          url,
          descricao,
          ordem,
        })
        setMateriais((prev) => prev.map((m) => (m.id === selecionadoId ? atualizado : m)))
        setForm(atualizado)
      } else {
        const criado = await materiaisComplementaresApi.insert(form)
        setMateriais((prev) => [...prev, criado])
        setSelecionadoId(criado.id)
        setForm(criado)
      }
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(m: MaterialComplementar) {
    try {
      await materiaisComplementaresApi.remove(m.id)
      setMateriais((prev) => prev.filter((x) => x.id !== m.id))
      if (selecionadoId === m.id) novo()
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setParaExcluir(null)
    }
  }

  return (
    <div className="h-full min-h-0">
      <AdminPageShell
        busca={busca}
        onBuscaChange={setBusca}
        buscaPlaceholder="Buscar material ou categoria…"
        onNovo={novo}
        labelNovo="Novo material"
        lista={
          carregando ? (
            <p className="text-sm text-text-dim px-1">Carregando…</p>
          ) : filtrados.length === 0 ? (
            <p className="text-sm text-text-dim px-1">Nenhum material cadastrado.</p>
          ) : (
            filtrados.map((m) => (
              <button
                key={m.id}
                onClick={() => selecionar(m)}
                className={`w-full text-left px-3 py-2.5 rounded-[var(--radius-item,11px)] border transition-colors ${
                  selecionadoId === m.id
                    ? 'bg-surface border-text shadow-[var(--shadow-selected)]'
                    : 'bg-surface border-transparent hover:border-border'
                }`}
              >
                <span className="block text-[14px] font-semibold text-text truncate">{m.titulo}</span>
                <span className="text-[11px] font-medium text-text-dim bg-surface-2 border border-border rounded-full px-1.5 py-0.5 inline-block mt-1">
                  {m.categoria}
                </span>
              </button>
            ))
          )
        }
        formulario={
          <div className="max-w-2xl flex flex-col gap-5">
            <h2 className="font-display text-[22px] tracking-[-.8px] text-text">
              {selecionadoId ? 'Editar material' : 'Novo material'}
            </h2>

            <div className="flex flex-col gap-4">
              <TextField
                label="Título"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Ex: Orientações para dieta hipossódica"
              />

              <TextField
                label="Categoria"
                hint="Texto livre — agrupa a listagem pro usuário (ex: Nutrição, Controle pressórico, Controle glicêmico)."
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                placeholder="Ex: Controle pressórico"
              />

              <TextField
                label="URL"
                hint="Link completo, com https:// — abre numa aba nova pro médico consultar/imprimir."
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://…"
              />

              <TextAreaField
                label="Descrição (opcional)"
                value={form.descricao ?? ''}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                rows={3}
                placeholder="Uma linha sobre o conteúdo — aparece na listagem antes de abrir."
              />

              {form.url.trim() && (
                <a
                  href={form.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 transition-colors w-fit"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir link pra conferir
                </a>
              )}

              {erro && (
                <p className="text-sm text-danger bg-danger-dim border border-danger/30 rounded-lg px-3 py-2">
                  {erro}
                </p>
              )}

              <div className="flex items-center justify-between mt-2 pt-4 border-t border-border">
                {selecionadoId ? (
                  <button
                    onClick={() => setParaExcluir(materiais.find((m) => m.id === selecionadoId) ?? null)}
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

      <ConfirmDialog
        aberto={!!paraExcluir}
        titulo="Excluir material"
        mensagem={`Excluir "${paraExcluir?.titulo}"? Ele some da listagem imediatamente.`}
        onConfirmar={() => paraExcluir && excluir(paraExcluir)}
        onCancelar={() => setParaExcluir(null)}
      />
    </div>
  )
}
