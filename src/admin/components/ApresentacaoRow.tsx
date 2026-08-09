import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { Apresentacao } from '../types'
import { formatarApresentacao } from '../../core/apresentacao'
import { TextField } from './Field'

function numOuNull(v: string): number | null {
  if (v.trim() === '') return null
  const n = Number(v.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function saoIguais(a: Apresentacao, b: Apresentacao): boolean {
  return (
    a.forma === b.forma &&
    a.concentracao === b.concentracao &&
    a.unidade === b.unidade &&
    a.por_volume === b.por_volume &&
    a.por_volume_unidade === b.por_volume_unidade &&
    a.descricao === b.descricao
  )
}

/** Uma linha editável de apresentação, dentro da lista aninhada no cadastro do medicamento.
 *  Rótulo ("comprimido 500 mg") sempre derivado dos campos — nunca digitado à parte,
 *  a não ser que a descrição manual seja usada pra casos fora do padrão. */
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

  useEffect(() => setLocal(apresentacao), [apresentacao])

  const dirty = !saoIguais(local, apresentacao)
  const rotulo = formatarApresentacao(local)

  async function salvar() {
    if (!local.forma.trim()) {
      setErro('Forma é obrigatória.')
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      const { forma, concentracao, unidade, por_volume, por_volume_unidade, descricao } = local
      await onSalvar(apresentacao.id, { forma, concentracao, unidade, por_volume, por_volume_unidade, descricao })
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className={`bg-surface-2 border rounded-md p-3 flex flex-col gap-2.5 ${arrastando ? 'border-accent' : 'border-border'}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-text">{rotulo || 'Apresentação sem rótulo — preencha a forma'}</span>
        <button
          type="button"
          onClick={() => onExcluir(apresentacao.id)}
          className="shrink-0 text-text-dim hover:text-danger transition-colors p-1"
          title="Remover apresentação"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <TextField
          label="Forma"
          value={local.forma}
          onChange={(e) => setLocal({ ...local, forma: e.target.value })}
          placeholder="comprimido"
          className="sm:col-span-2"
        />
        <TextField
          label="Concentração"
          type="number"
          step="any"
          value={local.concentracao ?? ''}
          onChange={(e) => setLocal({ ...local, concentracao: numOuNull(e.target.value) })}
          placeholder="500"
        />
        <TextField
          label="Unidade"
          value={local.unidade ?? ''}
          onChange={(e) => setLocal({ ...local, unidade: e.target.value })}
          placeholder="mg"
        />
        <TextField
          label="Por volume"
          hint="Só pra líquidos: 5 = /5ml"
          type="number"
          step="any"
          value={local.por_volume ?? ''}
          onChange={(e) => setLocal({ ...local, por_volume: numOuNull(e.target.value) })}
          placeholder="5"
        />
      </div>
      {local.por_volume != null && (
        <TextField
          label="Unidade do volume"
          value={local.por_volume_unidade ?? ''}
          onChange={(e) => setLocal({ ...local, por_volume_unidade: e.target.value })}
          placeholder="ml"
          className="max-w-40"
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
            onClick={() => setLocal(apresentacao)}
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
