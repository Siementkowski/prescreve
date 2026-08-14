import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { Medicamento, MedicamentoInput, Apresentacao } from '../types'
import { camposFaltando, type DadosCamposForma, type FormaFarmaceutica } from '../../core/formas'
import { FormaToggle } from './FormaToggle'
import { CamposFormaDinamicos } from './CamposFormaDinamicos'
import type { NovaApresentacaoDados } from './ApresentacaoPicker'
import { TextField } from './Field'

const CAMPOS_VAZIOS: DadosCamposForma = {
  concentracao: null,
  unidade: null,
  por_volume: null,
  por_volume_unidade: null,
  gotas_por_ml: null,
  volume_ampola: null,
  concentracao_percentual: null,
  peso_tubo: null,
}

/** Cadastro de medicamento sem sair da tela — abre por cima do editor de esquema (sem troca
 *  de rota, sem perder o rascunho). Campos mínimos: nome (princípio ativo), nome comercial,
 *  forma e concentração da 1ª apresentação (mesmo formulário por forma da Fase 2). Nasce
 *  com `incompleto = true` — gestação/lactação/pediatria/contraindicações não foram
 *  preenchidas aqui de propósito, isso é revisão clínica, não cabe num cadastro rápido. */
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
  const [campos, setCampos] = useState<DadosCamposForma>(CAMPOS_VAZIOS)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [tentouSalvar, setTentouSalvar] = useState(false)

  // O modal é montado uma vez e só alterna visibilidade (`aberto`), não remonta — sem isto
  // o `useState(nomeInicial)` acima só pegaria o valor da primeira vez que o item foi
  // renderizado, nunca a busca mais recente que a pessoa digitou antes de clicar "Cadastrar".
  useEffect(() => {
    if (aberto) setNome(nomeInicial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto])

  if (!aberto) return null

  const faltando = camposFaltando(forma, campos)

  function resetar() {
    setNome(nomeInicial)
    setNomeComercial('')
    setForma('')
    setCampos(CAMPOS_VAZIOS)
    setErro(null)
    setTentouSalvar(false)
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
    setTentouSalvar(true)
    if (faltando.length > 0) {
      setErro(`Falta preencher: ${faltando.map((c) => c.label).join(', ')}.`)
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
      const apresentacao = await onCriarApresentacao(medicamento.id, { forma: forma.trim(), ...campos })
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
      <div className="w-full max-w-md bg-surface border border-border rounded-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-text">Cadastrar medicamento</h3>
          <button type="button" onClick={fechar} className="text-text-dim hover:text-text transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-text-dim mb-4">
          Só o essencial pra usar agora — gestação, lactação, pediatria e contraindicações ficam pendentes
          e entram na fila de Revisão até alguém completar no catálogo.
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

          {forma.trim() && (
            <CamposFormaDinamicos forma={forma} dados={campos} onChange={(p) => setCampos({ ...campos, ...p })} destacarFaltando={tentouSalvar} />
          )}

          {erro && <p className="text-xs text-danger">{erro}</p>}

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={fechar} className="text-sm text-text-dim hover:text-text transition-colors px-3 py-1.5">
              Cancelar
            </button>
            <button
              type="button"
              onClick={salvar}
              disabled={salvando}
              className="text-sm bg-accent hover:bg-accent/90 disabled:opacity-50 text-accent-text rounded-lg px-4 py-2 transition-colors"
            >
              {salvando ? 'Cadastrando…' : 'Cadastrar e usar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
