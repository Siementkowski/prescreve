import { useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import type { Apresentacao } from '../types'
import { formatarApresentacao } from '../../core/apresentacao'
import { TextField } from './Field'

function numOuNull(v: string): number | null {
  if (v.trim() === '') return null
  const n = Number(v.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

const NOVO_VAZIO = {
  forma: '',
  concentracao: null as number | null,
  unidade: '',
  por_volume: null as number | null,
  por_volume_unidade: '',
}

/** Payload de uma apresentação nova, sem os campos que quem chama já sabe preencher
 *  (medicamento_id, ordem) — mantém o mesmo dado do cadastro do medicamento, só entra
 *  por um atalho a mais. */
export type NovaApresentacaoDados = typeof NOVO_VAZIO

/** Seletor de apresentação do item da prescrição — igual em espírito ao MedicamentoPicker,
 *  mas com "+ Nova apresentação" abrindo um formulário inline (não só um nome) porque uma
 *  apresentação tem vários campos. Salva vinculada ao medicamento já selecionado no item —
 *  é a mesma tabela do cadastro do medicamento, sem fonte paralela. */
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
  const [novo, setNovo] = useState<NovaApresentacaoDados>(NOVO_VAZIO)

  const selecionada = apresentacoes.find((a) => a.id === valorId) ?? null

  function fechar() {
    setAberto(false)
    setCriando(false)
    setNovo(NOVO_VAZIO)
    setErro(null)
  }

  async function salvarNova() {
    if (!onCriar) return
    if (!novo.forma.trim()) {
      setErro('Forma é obrigatória.')
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
        <div className="absolute z-20 mt-1 w-72 bg-surface border border-border rounded-lg shadow-2xl shadow-black/40 overflow-hidden">
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
            <div className="p-3 flex flex-col gap-2.5">
              <div className="grid grid-cols-2 gap-2">
                <TextField
                  label="Forma"
                  value={novo.forma}
                  onChange={(e) => setNovo({ ...novo, forma: e.target.value })}
                  placeholder="comprimido"
                />
                <TextField
                  label="Concentração"
                  type="number"
                  step="any"
                  value={novo.concentracao ?? ''}
                  onChange={(e) => setNovo({ ...novo, concentracao: numOuNull(e.target.value) })}
                  placeholder="500"
                />
                <TextField
                  label="Unidade"
                  value={novo.unidade}
                  onChange={(e) => setNovo({ ...novo, unidade: e.target.value })}
                  placeholder="mg"
                />
                <TextField
                  label="Por volume"
                  hint="líquidos: 5=/5ml"
                  type="number"
                  step="any"
                  value={novo.por_volume ?? ''}
                  onChange={(e) => setNovo({ ...novo, por_volume: numOuNull(e.target.value) })}
                  placeholder="5"
                />
              </div>
              {novo.por_volume != null && (
                <TextField
                  label="Unidade do volume"
                  value={novo.por_volume_unidade}
                  onChange={(e) => setNovo({ ...novo, por_volume_unidade: e.target.value })}
                  placeholder="ml"
                />
              )}

              {erro && <p className="text-xs text-danger">{erro}</p>}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCriando(false)
                    setErro(null)
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
