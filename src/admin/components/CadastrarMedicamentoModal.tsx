import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { Medicamento, MedicamentoInput, Apresentacao } from '../types'
import type { FormaFarmaceutica } from '../../core/formas'
import { FormaToggle } from './FormaToggle'
import type { NovaApresentacaoDados } from './ApresentacaoPicker'
import { TextField } from './Field'

/** Cadastro de medicamento sem sair da tela — abre por cima do editor de esquema (sem troca
 *  de rota, sem perder o rascunho). Campos mínimos: nome (princípio ativo), nome comercial
 *  e forma da 1ª apresentação. Concentração NÃO é pedida aqui de propósito — pedir a força
 *  do comprimido no cadastro e a dose de novo no item da prescrição é repetir a mesma
 *  pergunta duas vezes; a dose fica só na prescrição (calculadora pediátrica que dependia
 *  da concentração aqui fica pendente, resolve depois). Nasce com `incompleto = true` —
 *  gestação/lactação/pediatria/contraindicações/concentração não foram preenchidas aqui de
 *  propósito, isso é revisão clínica, não cabe num cadastro rápido. */
export function CadastrarMedicamentoModal({
  aberto,
  nomeInicial,
  onFechar,
  onCriarMedicamento,
  onCriarApresentacao,
  onCriado,
}: {
  aberto: boolean
  nomeInicial: string
  onFechar: () => void
  onCriarMedicamento: (input: MedicamentoInput) => Promise<Medicamento>
  onCriarApresentacao: (medicamentoId: number, dados: NovaApresentacaoDados) => Promise<Apresentacao>
  onCriado: (medicamento: Medicamento, apresentacao: Apresentacao) => void
}) {
  const [nome, setNome] = useState(nomeInicial)
  const [nomeComercial, setNomeComercial] = useState('')
  const [forma, setForma] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // O modal é montado uma vez e só alterna visibilidade (`aberto`), não remonta — sem isto
  // o `useState(nomeInicial)` acima só pegaria o valor da primeira vez que o item foi
  // renderizado, nunca a busca mais recente que a pessoa digitou antes de clicar "Cadastrar".
  useEffect(() => {
    if (aberto) setNome(nomeInicial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto])

  if (!aberto) return null

  function resetar() {
    setNome(nomeInicial)
    setNomeComercial('')
    setForma('')
    setErro(null)
  }

  function fechar() {
    resetar()
    onFechar()
  }

  async function salvar() {
    if (!nome.trim()) {
      setErro('Princípio ativo é obrigatório.')
      return
    }
    if (!forma.trim()) {
      setErro('Escolha uma forma.')
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      const medicamento = await onCriarMedicamento({
        nome: nome.trim(),
        nome_comercial: nomeComercial.trim() || null,
        apresentacoes: null,
        gestacao_status: null,
        gestacao_obs: null,
        lactacao_status: null,
        contraindicacoes: null,
        ped_mg_kg_dia: null,
        ped_dose_max_dia: null,
        ped_concentracao: null,
        ped_volume_ref: null,
        ped_obs: null,
        incompleto: true,
      })
      const apresentacao = await onCriarApresentacao(medicamento.id, {
        forma: forma.trim(),
        concentracao: null,
        unidade: null,
        por_volume: null,
        por_volume_unidade: null,
        gotas_por_ml: null,
        volume_ampola: null,
        concentracao_percentual: null,
        peso_tubo: null,
      })
      onCriado(medicamento, apresentacao)
      resetar()
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-[var(--radius-card,14px)] p-6 shadow-[var(--shadow-popover,0_14px_32px_rgba(0,0,0,.2))] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display text-[18px] tracking-[-.4px] text-text">Cadastrar medicamento</h3>
          <button type="button" onClick={fechar} className="text-text-dim hover:text-text transition-colors p-1 rounded-full hover:bg-surface-2">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-text-dim mb-4">
          Só o essencial pra usar agora — concentração, gestação, lactação, pediatria e contraindicações ficam
          pendentes e entram na fila de Revisão até alguém completar no catálogo. A dose fica só na prescrição.
        </p>

        <div className="flex flex-col gap-3">
          <TextField
            label="Princípio ativo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Nitrofurantoína"
            autoFocus
          />
          <TextField
            label="Nome comercial (opcional)"
            value={nomeComercial}
            onChange={(e) => setNomeComercial(e.target.value)}
          />

          <FormaToggle valor={forma} onChange={(f: FormaFarmaceutica) => setForma(f)} />

          {erro && <p className="text-xs text-danger">{erro}</p>}

          <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-border">
            <button type="button" onClick={fechar} className="text-sm font-medium text-text-dim hover:text-text transition-colors px-3 py-2">
              Cancelar
            </button>
            <button
              type="button"
              onClick={salvar}
              disabled={salvando}
              className="text-sm font-semibold bg-text hover:opacity-90 disabled:opacity-50 text-bg rounded-[var(--radius-pill,999px)] px-5 py-2.5 transition-opacity"
            >
              {salvando ? 'Cadastrando…' : 'Cadastrar e usar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
