import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { Apresentacao } from '../types'
import { formatarApresentacao } from '../../core/apresentacao'
import { camposFaltando, type DadosCamposForma, type FormaFarmaceutica } from '../../core/formas'
import { FormaToggle } from './FormaToggle'
import { CamposFormaDinamicos } from './CamposFormaDinamicos'
import { TextField } from './Field'

function saoIguais(a: Apresentacao, b: Apresentacao): boolean {
  return (
    a.forma === b.forma &&
    a.concentracao === b.concentracao &&
    a.unidade === b.unidade &&
    a.por_volume === b.por_volume &&
    a.por_volume_unidade === b.por_volume_unidade &&
    a.gotas_por_ml === b.gotas_por_ml &&
    a.volume_ampola === b.volume_ampola &&
    a.concentracao_percentual === b.concentracao_percentual &&
    a.peso_tubo === b.peso_tubo &&
    a.descricao === b.descricao
  )
}

/** Uma linha editável de apresentação, dentro da lista aninhada no cadastro do medicamento.
 *  Forma escolhida em toggles, campos gerados a partir do descritor (core/formas.ts) e
 *  rótulo ("Comprimido 500 mg") sempre derivado — nunca digitado à parte, a não ser que a
 *  descrição manual seja usada pra casos fora do padrão. */
export function ApresentacaoRow({
  apresentacao,
  arrastando,
  onSalvar,
  onExcluir,
}: {
  apresentacao: Apresentacao
  arrastando: boolean
  onSalvar: (id: number, dados: Partial<Apresentacao>) => Promise<void>
  onExcluir: (id: number) => void
}) {
  const [local, setLocal] = useState<Apresentacao>(apresentacao)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [tentouSalvar, setTentouSalvar] = useState(false)

  useEffect(() => setLocal(apresentacao), [apresentacao])

  const dirty = !saoIguais(local, apresentacao)
  const rotulo = formatarApresentacao(local)
  const faltando = camposFaltando(local.forma, local)

  function atualizarCampos(patch: Partial<DadosCamposForma>) {
    setLocal({ ...local, ...patch })
  }

  async function salvar() {
    if (!local.forma.trim()) {
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
      const {
        forma,
        concentracao,
        unidade,
        por_volume,
        por_volume_unidade,
        gotas_por_ml,
        volume_ampola,
        concentracao_percentual,
        peso_tubo,
        descricao,
      } = local
      await onSalvar(apresentacao.id, {
        forma,
        concentracao,
        unidade,
        por_volume,
        por_volume_unidade,
        gotas_por_ml,
        volume_ampola,
        concentracao_percentual,
        peso_tubo,
        descricao,
      })
      setTentouSalvar(false)
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className={`bg-surface-2 border rounded-md p-3 flex flex-col gap-2.5 ${arrastando ? 'border-accent' : 'border-border'}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-text">{rotulo || 'Apresentação sem rótulo — escolha a forma'}</span>
        <button
          type="button"
          onClick={() => onExcluir(apresentacao.id)}
          className="shrink-0 text-text-dim hover:text-danger transition-colors p-1"
          title="Remover apresentação"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <FormaToggle valor={local.forma} onChange={(forma: FormaFarmaceutica) => setLocal({ ...local, forma })} />

      {local.forma.trim() && (
        <CamposFormaDinamicos
          forma={local.forma}
          dados={local}
          onChange={atualizarCampos}
          destacarFaltando={tentouSalvar}
        />
      )}

      <TextField
        label="Descrição manual (opcional)"
        hint="Sobrescreve o rótulo automático — use só quando forma+concentração não bastam."
        value={local.descricao ?? ''}
        onChange={(e) => setLocal({ ...local, descricao: e.target.value })}
      />

      {erro && <p className="text-xs text-danger">{erro}</p>}

      {dirty && (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setLocal(apresentacao)
              setErro(null)
              setTentouSalvar(false)
            }}
            className="text-xs text-text-dim hover:text-text transition-colors px-2 py-1"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={salvar}
            disabled={salvando}
            className="text-xs bg-accent hover:bg-accent/90 disabled:opacity-50 text-accent-text rounded-lg px-3 py-1.5 transition-colors"
          >
            {salvando ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      )}
    </div>
  )
}
