import { useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import type { Apresentacao } from '../types'
import { formatarApresentacao } from '../../core/apresentacao'
import { camposFaltando, type DadosCamposForma, type FormaFarmaceutica } from '../../core/formas'
import { FormaToggle } from './FormaToggle'
import { CamposFormaDinamicos } from './CamposFormaDinamicos'

const NOVO_VAZIO: DadosCamposForma & { forma: string } = {
  forma: '',
  concentracao: null,
  unidade: null,
  por_volume: null,
  por_volume_unidade: null,
  gotas_por_ml: null,
  volume_ampola: null,
  concentracao_percentual: null,
  peso_tubo: null,
}

/** Payload de uma apresentação nova, sem os campos que quem chama já sabe preencher
 *  (medicamento_id, ordem, descricao) — mantém o mesmo dado do cadastro do medicamento, só
 *  entra por um atalho a mais. */
export type NovaApresentacaoDados = typeof NOVO_VAZIO

/** Seletor de apresentação do item da prescrição — igual em espírito ao MedicamentoPicker,
 *  mas com "+ Nova apresentação" abrindo um formulário inline (não só um nome) porque uma
 *  apresentação tem vários campos. Mesmo formulário por forma do cadastro do medicamento
 *  (FormaToggle + CamposFormaDinamicos, guiado por core/formas.ts) — salva vinculada ao
 *  medicamento já selecionado no item, é a mesma tabela, sem fonte paralela. */
export function ApresentacaoPicker({
  apresentacoes,
  valorId,
  onSelecionar,
  onCriar,
}: {
  apresentacoes: Apresentacao[]
  valorId: number | null
  onSelecionar: (id: number | null) => void
  onCriar?: (dados: NovaApresentacaoDados) => Promise<Apresentacao>
}) {
  const [aberto, setAberto] = useState(false)
  const [criando, setCriando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [tentouSalvar, setTentouSalvar] = useState(false)
  const [novo, setNovo] = useState<NovaApresentacaoDados>(NOVO_VAZIO)

  const selecionada = apresentacoes.find((a) => a.id === valorId) ?? null
  const faltando = camposFaltando(novo.forma, novo)

  function fechar() {
    setAberto(false)
    setCriando(false)
    setNovo(NOVO_VAZIO)
    setErro(null)
    setTentouSalvar(false)
  }

  async function salvarNova() {
    if (!onCriar) return
    if (!novo.forma.trim()) {
      setErro('Escolha uma forma.')
      return
    }
    setTentouSalvar(true)
    if (faltando.length > 0) {
      setErro(`Falta preencher: ${faltando.map((c) => c.label).join(', ')}.`)
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      const criada = await onCriar(novo)
      onSelecionar(criada.id)
      fechar()
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="w-full flex items-center justify-between bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-accent transition-colors"
      >
        <span className={selecionada ? 'text-text' : 'text-text-dim'}>
          {selecionada ? formatarApresentacao(selecionada) : '— nenhuma —'}
        </span>
        <ChevronDown className="w-4 h-4 text-text-dim shrink-0" />
      </button>

      {aberto && (
        <div className="absolute z-20 mt-1 w-80 bg-surface border border-border rounded-lg shadow-2xl shadow-black/40 overflow-hidden">
          {!criando ? (
            <>
              <div className="max-h-52 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    onSelecionar(null)
                    fechar()
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm text-text-dim hover:bg-surface-2 transition-colors"
                >
                  — nenhuma —
                </button>
                {apresentacoes.length === 0 ? (
                  <p className="text-xs text-text-dim px-3 py-2">Nenhuma apresentação cadastrada ainda.</p>
                ) : (
                  apresentacoes.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        onSelecionar(a.id)
                        fechar()
                      }}
                      className="w-full text-left px-3 py-1.5 text-sm text-text hover:bg-surface-2 transition-colors"
                    >
                      {formatarApresentacao(a)}
                    </button>
                  ))
                )}
              </div>
              {onCriar && (
                <button
                  type="button"
                  onClick={() => setCriando(true)}
                  className="w-full flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 px-3 py-2 border-t border-border transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nova apresentação
                </button>
              )}
            </>
          ) : (
            <div className="p-3 flex flex-col gap-2.5 max-h-96 overflow-y-auto">
              <FormaToggle
                valor={novo.forma}
                onChange={(forma: FormaFarmaceutica) => setNovo({ ...novo, forma })}
              />

              {novo.forma.trim() && (
                <CamposFormaDinamicos
                  forma={novo.forma}
                  dados={novo}
                  onChange={(patch) => setNovo({ ...novo, ...patch })}
                  destacarFaltando={tentouSalvar}
                />
              )}

              {erro && <p className="text-xs text-danger">{erro}</p>}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCriando(false)
                    setErro(null)
                    setTentouSalvar(false)
                  }}
                  className="text-xs text-text-dim hover:text-text transition-colors px-2 py-1"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={salvarNova}
                  disabled={salvando}
                  className="text-xs bg-accent hover:bg-accent/90 disabled:opacity-50 text-accent-text rounded-lg px-3 py-1.5 transition-colors"
                >
                  {salvando ? 'Salvando…' : 'Salvar e usar'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
