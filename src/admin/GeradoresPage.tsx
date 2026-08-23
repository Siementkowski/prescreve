import { useEffect, useMemo, useState } from 'react'
import { Trash2, ShieldCheck } from 'lucide-react'
import { geradoresApi } from './api'
import type { Gerador, GeradorInput } from './types'
import { AdminPageShell } from './components/AdminPageShell'
import { ConfirmDialog } from './components/ConfirmDialog'
import { TextField, TextAreaField, CheckboxField } from './components/Field'
import { HtmlSandbox, SNIPPET_ALTURA } from '../core/components/HtmlSandbox'
import { CopyButton } from '../consulta/components/CopyButton'

const VAZIO: GeradorInput = { nome: '', descricao: '', html: '', ativo: true, ordem: 0 }

function formatarData(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/** Biblioteca de geradores de anamnese — HTML+JS colado inteiro, sem recompilar o app.
 *  Roda sempre isolado em iframe sandbox (HtmlSandbox), aqui no preview e depois na
 *  Consulta — nunca dangerouslySetInnerHTML, nunca no DOM da aplicação. */
export function GeradoresPage() {
  const [geradores, setGeradores] = useState<Gerador[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [selecionadoId, setSelecionadoId] = useState<number | null>(null)
  const [form, setForm] = useState<GeradorInput>(VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [paraExcluir, setParaExcluir] = useState<Gerador | null>(null)

  async function recarregar() {
    setCarregando(true)
    try {
      setGeradores(await geradoresApi.list())
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
    () => geradores.filter((g) => g.nome.toLowerCase().includes(busca.toLowerCase())),
    [geradores, busca]
  )

  function novo() {
    setSelecionadoId(null)
    setForm({ ...VAZIO, ordem: geradores.length })
    setErro(null)
  }

  function selecionar(g: Gerador) {
    setSelecionadoId(g.id)
    setForm(g)
    setErro(null)
  }

  async function salvar() {
    if (!form.nome.trim()) {
      setErro('Nome é obrigatório.')
      return
    }
    if (!form.html.trim()) {
      setErro('Cole o HTML do gerador.')
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      if (selecionadoId) {
        // Só os campos editáveis — `form` vem de setForm(g) ao selecionar e carrega o id
        // (e o atualizado_em, mantido pelo trigger) junto; mandar isso no payload de
        // update quebra ou é simplesmente ignorado — melhor nem mandar.
        const { nome, descricao, html, ativo, ordem } = form
        const atualizado = await geradoresApi.update(selecionadoId, { nome, descricao, html, ativo, ordem })
        setGeradores((prev) => prev.map((g) => (g.id === selecionadoId ? atualizado : g)))
        setForm(atualizado)
      } else {
        const criado = await geradoresApi.insert(form)
        setGeradores((prev) => [...prev, criado])
        setSelecionadoId(criado.id)
        setForm(criado)
      }
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(g: Gerador) {
    try {
      await geradoresApi.remove(g.id)
      setGeradores((prev) => prev.filter((x) => x.id !== g.id))
      if (selecionadoId === g.id) novo()
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setParaExcluir(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 h-full min-h-0">
      <div className="shrink-0">
        <span className="ed-eyebrow">
          <span className="ed-eyebrow-dot" style={{ background: 'var(--tint-cyan-fg,#0083a0)' }} />
          Sistema / Geradores
        </span>
        <h1 className="font-display text-[34px] leading-[.98] tracking-[-1.5px] mt-3 mb-2 text-text">
          Anamnese pronta, sem sair da consulta.
        </h1>
        <p className="text-text-dim text-base leading-relaxed max-w-lg">
          HTML colado, executado isolado — nunca no DOM da aplicação.
        </p>
      </div>

      <div className="flex-1 min-h-0">
      <AdminPageShell
        busca={busca}
        onBuscaChange={setBusca}
        buscaPlaceholder="Buscar gerador…"
        onNovo={novo}
        labelNovo="Novo gerador"
        lista={
          carregando ? (
            <p className="text-sm text-text-dim px-1">Carregando…</p>
          ) : filtrados.length === 0 ? (
            <p className="text-sm text-text-dim px-1">Nenhum gerador cadastrado.</p>
          ) : (
            filtrados.map((g) => (
              <button
                key={g.id}
                onClick={() => selecionar(g)}
                className={`w-full text-left px-3 py-2.5 rounded-[var(--radius-item,11px)] border transition-colors ${
                  selecionadoId === g.id
                    ? 'bg-surface border-text shadow-[var(--shadow-selected)]'
                    : 'bg-surface border-transparent hover:border-border'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[14px] font-semibold text-text truncate">{g.nome}</span>
                  <span
                    className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full border shrink-0 ${
                      g.ativo ? 'text-ok border-ok/40 bg-ok/10' : 'text-text-dim border-border bg-surface-2'
                    }`}
                  >
                    {g.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                {g.descricao && <span className="block text-[11px] text-text-dim truncate mt-0.5">{g.descricao}</span>}
                <span className="block text-[11px] text-text-faint mt-1">Atualizado em {formatarData(g.atualizado_em)}</span>
              </button>
            ))
          )
        }
        formulario={
          <div className="max-w-3xl flex flex-col gap-5">
            <h2 className="font-display text-[22px] tracking-[-.8px] text-text">
              {selecionadoId ? 'Editar gerador' : 'Novo gerador'}
            </h2>

            <div className="flex flex-col gap-4">
              <TextField
                label="Nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Anamnese Ginecológica"
              />

              <TextField
                label="Descrição (opcional)"
                value={form.descricao ?? ''}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="O que esse gerador cobre"
              />

              <CheckboxField
                label="Ativo — aparece na Consulta"
                checked={form.ativo}
                onChange={(v) => setForm({ ...form, ativo: v })}
              />

              <div className="rounded-md border border-border bg-surface-2 p-3 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-text-dim">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-ok" />
                  Executa isolado — sandbox sem acesso à sessão do app
                </div>
                <p className="text-xs text-text-dim leading-relaxed">
                  O HTML colado abaixo roda dentro de um iframe sandbox (sem <code>allow-same-origin</code>),
                  numa origem opaca própria: o script funciona normalmente, mas não enxerga
                  localStorage, cookies, nem a sessão do Supabase.
                </p>
                <p className="text-xs text-text-dim leading-relaxed">
                  Opcional, mas recomendado: cole este trecho no fim do seu HTML pra altura
                  acompanhar sozinha o conteúdo (seções que abrem, campos que aparecem):
                </p>
                <div className="relative">
                  <pre className="text-[11px] font-mono bg-bg border border-border rounded-md p-2.5 overflow-x-auto whitespace-pre-wrap">
                    {SNIPPET_ALTURA}
                  </pre>
                  <CopyButton texto={SNIPPET_ALTURA} label="Copiar" className="absolute top-1.5 right-1.5" />
                </div>
                <p className="text-xs text-text-dim/80">
                  Sem esse trecho, o gerador preenche o espaço disponível na tela com scroll
                  interno — funciona, só não cresce/encolhe sozinho conforme o conteúdo muda.
                </p>
              </div>

              <TextAreaField
                label="HTML do gerador"
                hint="Arquivo inteiro — inclua <script> se precisar."
                value={form.html}
                onChange={(e) => setForm({ ...form, html: e.target.value })}
                rows={16}
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
                    onClick={() => setParaExcluir(geradores.find((g) => g.id === selecionadoId) ?? null)}
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

            {/* Preview isolado — é justamente onde se cola código ainda não conferido, então
                o mesmo sandbox do app final vale aqui também. */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-medium text-text-dim uppercase tracking-wide">Preview</span>
              {form.html.trim() ? (
                <div className="border border-border rounded-lg overflow-hidden bg-white">
                  <HtmlSandbox html={form.html} alturaPadrao={500} />
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
      </div>

      <ConfirmDialog
        aberto={!!paraExcluir}
        titulo="Excluir gerador"
        mensagem={`Excluir "${paraExcluir?.nome}"? Ele some da Consulta imediatamente.`}
        onConfirmar={() => paraExcluir && excluir(paraExcluir)}
        onCancelar={() => setParaExcluir(null)}
      />
    </div>
  )
}
