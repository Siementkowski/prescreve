import { useMemo } from 'react'
import { ShieldAlert, ShieldCheck, Syringe, Info } from 'lucide-react'
import {
  VACINAS_CONTRAINDICADAS,
  VACINAS_INDICADAS,
  ESQUEMA_TETANO,
  VACINA_HPV_OBSERVACAO,
  NOTA_VACINAS_CONTRAINDICADAS,
} from './dados/vacinas'
import { useGestantesStore, calcularIGDoContexto } from './store'
import { formatarIG } from './idade'

/** Vacinação na gestação — conteúdo majoritariamente estático (mesmo espírito de
 *  Aleitamento na Pediatria). Só a semana atual (se já calculada em Pré-natal, via store
 *  compartilhada) contextualiza o aviso da dTpa/tétano, que tem janela ideal marcada. */
export function Vacinacao() {
  const metodo = useGestantesStore((s) => s.metodo)
  const dum = useGestantesStore((s) => s.dum)
  const dataExameUSG = useGestantesStore((s) => s.dataExameUSG)
  const igUsgSemanas = useGestantesStore((s) => s.igUsgSemanas)
  const igUsgDias = useGestantesStore((s) => s.igUsgDias)
  const ig = useMemo(
    () => calcularIGDoContexto({ metodo, dum, dataExameUSG, igUsgSemanas, igUsgDias }),
    [metodo, dum, dataExameUSG, igUsgSemanas, igUsgDias]
  )

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-4 pb-16">
        <Secao titulo="Vacinas indicadas" icone={ShieldCheck} tom="ok">
          <div className="flex flex-col gap-2.5">
            {VACINAS_INDICADAS.map((v) => (
              <div key={v.nome} className="border border-border rounded-lg px-3.5 py-2.5">
                <strong className="block text-sm font-semibold text-text">{v.nome}</strong>
                {v.observacao && <span className="block text-xs text-text-dim mt-0.5">{v.observacao}</span>}
                {v.esquema && v.esquema.length > 0 && (
                  <ul className="flex flex-col gap-0.5 mt-1.5">
                    {v.esquema.map((item) => (
                      <li key={item} className="text-xs text-text-dim leading-snug">
                        • {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Secao>

        <Secao titulo="Esquema para tétano (dTpa)" icone={Syringe}>
          {ig && (
            <p className="text-xs text-text-dim mb-2.5 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Idade gestacional atual: {formatarIG(ig)} (calculada em Pré-natal)
              {ig.semanas === 20 ? ' — na semana ideal de aplicação da dTpa.' : ''}
            </p>
          )}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-surface-2">
                  <th className="text-left font-semibold text-text px-3 py-2 border-b border-border">Histórico vacinal</th>
                  <th className="text-left font-semibold text-text px-3 py-2 border-b border-border">Conduta</th>
                </tr>
              </thead>
              <tbody>
                {ESQUEMA_TETANO.map((linha, i) => (
                  <tr key={linha.historico} className={i % 2 === 1 ? 'bg-surface-2/40' : ''}>
                    <td className="text-text px-3 py-2.5 align-top border-b border-border last:border-b-0 font-medium">{linha.historico}</td>
                    <td className="text-text-dim px-3 py-2.5 align-top border-b border-border last:border-b-0">{linha.conduta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Secao>

        <Secao titulo="Vacinas contraindicadas" icone={ShieldAlert} tom="danger">
          <div className="flex flex-wrap gap-2 mb-3">
            {VACINAS_CONTRAINDICADAS.map((v) => (
              <span
                key={v}
                className="text-[13px] font-semibold text-danger bg-danger-dim border border-danger/30 rounded-full px-3 py-1.5"
              >
                {v}
              </span>
            ))}
          </div>
          <p className="text-sm text-text-dim mb-2">{VACINA_HPV_OBSERVACAO}</p>
          <p className="text-xs font-semibold text-warn bg-warn-dim border border-warn/30 rounded-lg px-3 py-2">
            {NOTA_VACINAS_CONTRAINDICADAS}
          </p>
        </Secao>
      </div>
    </div>
  )
}

function Secao({
  titulo,
  icone: Icone,
  tom,
  children,
}: {
  titulo: string
  icone: typeof ShieldAlert
  tom?: 'danger' | 'ok'
  children: React.ReactNode
}) {
  const corIcone = tom === 'danger' ? 'text-danger' : tom === 'ok' ? 'text-ok' : 'text-text-dim'
  return (
    <div className="border border-border rounded-xl bg-surface p-4">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-text mb-3">
        <Icone className={`w-[18px] h-[18px] ${corIcone}`} />
        {titulo}
      </h2>
      {children}
    </div>
  )
}
