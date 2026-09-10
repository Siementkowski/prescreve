import { useEffect, useMemo, useState } from 'react'
import { Trash2, ShieldCheck } from 'lucide-react'
import { fluxogramasApi } from './api'
import type { Fluxograma, FluxogramaInput } from './types'
import { AdminPageShell } from './components/AdminPageShell'
import { ConfirmDialog } from './components/ConfirmDialog'
import { TextField, TextAreaField } from './components/Field'
import { HtmlSandbox, SNIPPET_ALTURA } from '../core/components/HtmlSandbox'
import { CopyButton } from '../consulta/components/CopyButton'

const VAZIO: FluxogramaInput = { titulo: '', categoria: '', descricao: '', html: '', ordem: 0 }

/** Biblioteca de fluxogramas clínicos — HTML colado inteiro (mesmo mecanismo dos
 *  Geradores, sandbox isolado), organizado por categoria (toggle list, mesmo padrão de
 *  Materiais). A categoria "Pediatria" é reaproveitada como as condutas por faixa etária
 *  dentro do módulo de Pediatria — não é um cadastro à parte. */
export function FluxogramasPage() {
  const [fluxogramas, setFluxogramas] = useState<Fluxograma[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [selecionadoId, setSelecionadoId] = useState<number | null>(null)
  const [form, setForm] = useState<FluxogramaInput>(VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [paraExcluir, setParaExcluir] = useState<Fluxograma | null>(null)
  const [adicionandoCategoria, setAdicionandoCategoria] = useState(false)
  const [novaCategoria, setNovaCategoria] = useState('')

  const categoriasDisponiveis = useMemo(
    () => [...new Set(fluxogramas.map((f) => f.categoria))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [fluxogramas]
  )

  async function recarregar() {
    setCarregando(true)
    try {
      setFluxogramas(await fluxogramasApi.list())
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
      fluxogramas.filter(
        (f) =>
          f.titulo.toLowerCase().includes(busca.toLowerCase()) ||
          f.categoria.toLowerCase().includes(busca.toLowerCase())
      ),
    [fluxogramas, busca]
  )

  function novo() {
    setSelecionadoId(null)
    setForm({ ...VAZIO, ordem: fluxogramas.length })
    setErro(null)
  }

  function selecionar(f: Fluxograma) {
    setSelecionadoId(f.id)
    setForm(f)
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
    if (!form.html.trim()) {
      setErro('Cole o HTML do fluxograma.')
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      if (selecionadoId) {
        const { titulo, categoria, descricao, html, ordem } = form
        const atualizado = await fluxogramasApi.update(selecionadoId, { titulo, categoria, descricao, html, ordem })
        setFluxogramas((prev) => prev.map((f) => (f.id === selecionadoId ? atualizado : f)))
        setForm(atualizado)
      } else {
        const criado = await fluxogramasApi.insert(form)
        setFluxogramas((prev) => [...prev, criado])
        setSelecionadoId(criado.id)
        setForm(criado)
      }
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(f: Fluxograma) {
    try {
      await fluxogramasApi.remove(f.id)
      setFluxogramas((prev) => prev.filter((x) => x.id !== f.id))
      if (selecionadoId === f.id) novo()
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
        buscaPlaceholder="Buscar fluxograma ou categoria…"
        onNovo={novo}
        labelNovo="Novo fluxograma"
        lista={
          carregando ? (
            <p className="text-sm text-text-dim px-1">Carregando…</p>
          ) : filtrados.length === 0 ? (
            <p className="text-sm text-text-dim px-1">Nenhum fluxograma cadastrado.</p>
          ) : (
            filtrados.map((f) => (
              <button
                key={f.id}
                onClick={() => selecionar(f)}
                className={`w-full text-left px-3 py-2.5 rounded-[var(--radius-item,11px)] border transition-colors ${
                  selecionadoId === f.id
                    ? 'bg-surface border-text shadow-[var(--shadow-selected)]'
                    : 'bg-surface border-transparent hover:border-border'
                }`}
              >
                <span className="block text-[14px] font-semibold text-text truncate">{f.titulo}</span>
                <span className="text-[11px] font-medium text-text-dim bg-surface-2 border border-border rounded-full px-1.5 py-0.5 inline-block mt-1">
                  {f.categoria}
                </span>
              </button>
            ))
          )
        }
        formulario={
          <div className="max-w-3xl flex flex-col gap-5">
            <h2 className="font-display text-[22px] tracking-[-.8px] text-text">
              {selecionadoId ? 'Editar fluxograma' : 'Novo fluxograma'}
            </h2>

            <div className="flex flex-col gap-4">
              <TextField
                label="Título"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Ex: Sepse — abordagem inicial"
              />

              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-text-dim uppercase tracking-[0.8px]">Categoria</span>
                <div className="flex flex-wrap gap-1.5">
                  {categoriasDisponiveis.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, categoria: c })
                        setAdicionandoCategoria(false)
                      }}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                        form.categoria === c
                          ? 'bg-accent-dim border-accent text-accent'
                          : 'bg-surface-2 border-border text-text-dim hover:text-text hover:border-text-dim'
                      }`}
                    >
                      {c}
                    </button>
                  ))}

                  {!adicionandoCategoria ? (
                    <button
                      type="button"
                      onClick={() => setAdicionandoCategoria(true)}
                      className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-dashed border-border text-text-dim hover:text-text hover:border-text-dim transition-colors"
                    >
                      + Nova categoria
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <input
                        autoFocus
                        value={novaCategoria}
                        onChange={(e) => setNovaCategoria(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key !== 'Enter') return
                          e.preventDefault()
                          if (!novaCategoria.trim()) return
                          setForm({ ...form, categoria: novaCategoria.trim() })
                          setNovaCategoria('')
                          setAdicionandoCategoria(false)
                        }}
                        placeholder="Nome da categoria"
                        className="bg-surface-2 border border-border rounded-lg px-2.5 py-1.5 text-xs text-text outline-none focus:border-text transition-colors"
                      />
                      <button
                        type="button"
                        disabled={!novaCategoria.trim()}
                        onClick={() => {
                          setForm({ ...form, categoria: novaCategoria.trim() })
                          setNovaCategoria('')
                          setAdicionandoCategoria(false)
                        }}
                        className="text-xs font-semibold text-accent hover:text-accent/80 disabled:opacity-40 transition-colors px-1"
                      >
                        Usar
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-text-dim/80">
                  Use "Pediatria" pra esse fluxograma também aparecer nas condutas do módulo de Pediatria.
                </p>
                {form.categoria && (
                  <span className="text-xs text-text-dim">
                    Selecionada: <strong className="text-text">{form.categoria}</strong>
                  </span>
                )}
              </div>

              <TextField
                label="Descrição (opcional)"
                value={form.descricao ?? ''}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Uma linha sobre o que esse fluxograma cobre"
              />

              <div className="rounded-md border border-border bg-surface-2 p-3 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-text-dim">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-ok" />
                  Executa isolado — sandbox sem acesso à sessão do app
                </div>
                <p className="text-xs text-text-dim leading-relaxed">
                  Cole o HTML/SVG do fluxograma inteiro. Pra uma imagem pronta (Canva, Figma etc.),
                  exporte como PNG e cole como <code>&lt;img src="data:image/png;base64,..."&gt;</code> —
                  não precisa de upload de arquivo.
                </p>
                <p className="text-xs text-text-dim leading-relaxed">
                  Opcional: cole este trecho no fim do HTML pra altura acompanhar sozinha o conteúdo:
                </p>
                <div className="relative">
                  <pre className="text-[11px] font-mono bg-bg border border-border rounded-md p-2.5 overflow-x-auto whitespace-pre-wrap">
                    {SNIPPET_ALTURA}
                  </pre>
                  <CopyButton texto={SNIPPET_ALTURA} label="Copiar" className="absolute top-1.5 right-1.5" />
                </div>
              </div>

              <TextAreaField
                label="HTML do fluxograma"
                hint="Arquivo inteiro — inclua <script> se precisar."
                value={form.html}
                onChange={(e) => setForm({ ...form, html: e.target.value })}
                rows={14}
                textareaClassName="font-mono text-xs"
              />

              {erro && (
                <p className="text-sm text-danger bg-danger-dim border border-danger/30 rounded-lg px-3 py-2">
                  {erro}
                </p>
              )}

              <div className="flex items-center justify-between mt-2 pt-4 border-t border-border">
                {selecionadoId ? (
                  <button
                    onClick={() => setParaExcluir(fluxogramas.find((f) => f.id === selecionadoId) ?? null)}
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

            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-medium text-text-dim uppercase tracking-wide">Preview</span>
              {form.html.trim() ? (
                <div className="border border-border rounded-lg overflow-hidden bg-white">
                  <HtmlSandbox html={form.html} alturaPadrao={420} />
                </div>
              ) : (
                <p className="text-xs text-text-dim border border-dashed border-border rounded-lg px-3 py-6 text-center">
                  Cole o HTML acima pra ver o preview aqui.
                </p>
              )}
            </div>
          </div>
        }
      />

      <ConfirmDialog
        aberto={!!paraExcluir}
        titulo="Excluir fluxograma"
        mensagem={`Excluir "${paraExcluir?.titulo}"? Ele some da listagem imediatamente.`}
        onConfirmar={() => paraExcluir && excluir(paraExcluir)}
        onCancelar={() => setParaExcluir(null)}
      />
    </div>
  )
}
