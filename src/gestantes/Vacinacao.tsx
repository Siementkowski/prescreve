import { ShieldAlert, ShieldCheck, Syringe, Info } from 'lucide-react'
import {
  VACINAS_CONTRAINDICADAS,
  VACINAS_INDICADAS,
  ESQUEMA_TETANO,
  VACINA_HPV_OBSERVACAO,
  NOTA_VACINAS_CONTRAINDICADAS,
} from './dados/vacinas'
import { useIGAtual } from './store'
import { formatarIG } from './idade'
import { Secao, Tabela } from './components/Secao'

/** Vacinação na gestação — conteúdo majoritariamente estático (mesmo espírito de
 *  Aleitamento na Pediatria). Só a semana atual (se já calculada em Pré-natal, via store
 *  compartilhada) contextualiza o aviso da dTpa/tétano, que tem janela ideal marcada. */
export function Vacinacao() {
  const ig = useIGAtual()

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-4 pb-16">
        <Secao titulo="Vacinas indicadas" icone={ShieldCheck} tom="ok">
          <div className="flex flex-col gap-2.5">
            {VACINAS_INDICADAS.map((v) => (
              <div key={v.nome} className="border border-border rounded-[var(--radius-item,11px)] px-3.5 py-2.5">
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
          <Tabela
            cabecalho={['Histórico vacinal', 'Conduta']}
            linhas={ESQUEMA_TETANO.map((l) => [l.historico, l.conduta])}
          />
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
          <p className="text-xs font-semibold text-warn bg-warn-dim border border-warn/30 rounded-[var(--radius-item,11px)] px-3 py-2">
            {NOTA_VACINAS_CONTRAINDICADAS}
          </p>
        </Secao>
      </div>
    </div>
  )
}
