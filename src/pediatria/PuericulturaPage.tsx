import {
  ArrowLeft,
  ArrowRight,
  MessageCircleQuestion,
  Syringe,
  ListChecks,
  ClipboardList,
  Utensils,
  Heart,
  Tv,
  ShieldAlert,
  Pill,
} from 'lucide-react'
import { usePediatriaStore } from './store'
import { FAIXAS_PUERICULTURA } from './dados/guiaPuericultura'
import { calcularFerro, calcularVitaminaD } from './dados/suplementacao'
import { CalendarioVacinal } from './CalendarioVacinal'
import { MarcosDesenvolvimento } from './MarcosDesenvolvimento'
import { Suplementacao } from './Suplementacao'
import { Aleitamento } from './Aleitamento'
import { ExamesPorIdade } from './ExamesPorIdade'

/** Puericultura — guia de consulta por faixa etária, mesmo espírito do Guia de Consulta
 *  do Gestantes (aqui a régua é a idade da criança, não a semana gestacional). As 5 telas
 *  antigas (Calendário vacinal, Marcos, Suplementação, Aleitamento, Exames) não somem —
 *  saem da barra de abas (evita aba-dentro-de-aba) e ficam acessíveis via "ver completo"
 *  dentro de cada bloco do guia, ainda como telas cheias e independentes. */
export function PuericulturaPage() {
  const faixaId = usePediatriaStore((s) => s.faixaPuericultura)
  const setFaixaId = usePediatriaStore((s) => s.setFaixaPuericultura)
  const telaReferencia = usePediatriaStore((s) => s.telaReferenciaPuericultura)
  const setTelaReferencia = usePediatriaStore((s) => s.setTelaReferenciaPuericultura)

  if (telaReferencia) {
    return (
      <div className="h-full flex flex-col min-h-0">
        <button
          onClick={() => setTelaReferencia(null)}
          className="flex items-center gap-1.5 text-sm font-medium text-text-dim hover:text-text transition-colors px-4 py-3 border-b border-border shrink-0 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar pra Puericultura
        </button>
        <div className="flex-1 min-h-0">
          {telaReferencia === 'calendario_vacinal' && <CalendarioVacinal />}
          {telaReferencia === 'marcos_desenvolvimento' && <MarcosDesenvolvimento />}
          {telaReferencia === 'suplementacao' && <Suplementacao />}
          {telaReferencia === 'aleitamento' && <Aleitamento />}
          {telaReferencia === 'exames' && <ExamesPorIdade />}
        </div>
      </div>
    )
  }

  const faixa = FAIXAS_PUERICULTURA.find((f) => f.id === faixaId) ?? null

  if (!faixa) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-5 pb-16">
          <div>
            <h1 className="font-display text-[22px] font-semibold text-text">Qual consulta você está realizando?</h1>
            <p className="text-sm text-text-dim mt-1">
              Cada faixa reúne o que avaliar, orientar e conferir nessa consulta específica.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FAIXAS_PUERICULTURA.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFaixaId(f.id)}
                className="text-left border border-border hover:border-text rounded-[var(--radius-card,14px)] bg-surface p-4 flex flex-col gap-2.5 transition-colors"
              >
                <span className="font-display text-[15px] font-semibold text-text leading-snug">{f.titulo}</span>
                <span className="text-xs text-text-dim leading-snug">{f.resumo}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const ferro = calcularFerro({ idadeMeses: faixa.idadeReferenciaMeses, prematuroOuBaixoPeso: false, fatorRiscoVitaminaD: false })
  const vitaminaD = calcularVitaminaD({ idadeMeses: faixa.idadeReferenciaMeses, prematuroOuBaixoPeso: false, fatorRiscoVitaminaD: false })

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-4 pb-16">
        <button
          onClick={() => setFaixaId(null)}
          className="flex items-center gap-1.5 text-sm font-medium text-text-dim hover:text-text transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar pras faixas
        </button>

        <div>
          <h1 className="font-display text-[24px] tracking-[-.5px] text-text">{faixa.titulo}</h1>
          <p className="text-sm text-text-dim mt-1">{faixa.resumo}</p>
        </div>

        <Bloco titulo="Queixas e intercorrências" icone={MessageCircleQuestion}>
          <ul className="flex flex-col gap-1.5">
            {faixa.queixas.map((q) => (
              <li key={q} className="text-sm text-text-dim leading-snug">
                • {q}
              </li>
            ))}
          </ul>
        </Bloco>

        <Bloco titulo="Vacinas dessa consulta" icone={Syringe} verCompleto={() => setTelaReferencia('calendario_vacinal')}>
          <ul className="flex flex-col gap-1.5">
            {faixa.vacinas.map((v) => (
              <li key={v} className="text-sm text-text leading-snug">
                • {v}
              </li>
            ))}
          </ul>
        </Bloco>

        <Bloco titulo="Marcos esperados" icone={ListChecks} verCompleto={() => setTelaReferencia('marcos_desenvolvimento')}>
          {faixa.marcos.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {faixa.marcos.map((m) => (
                <li key={m} className="text-sm text-text leading-snug">
                  • {m}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-dim">Checklist formal de marcos começa aos 2 meses.</p>
          )}
        </Bloco>

        <Bloco titulo="Suplementação" icone={Pill} verCompleto={() => setTelaReferencia('suplementacao')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-sm font-semibold text-text">{ferro.nome}</p>
              <p className="text-xs text-text-dim mt-0.5">{ferro.rotuloStatus} — {ferro.dose}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-text">{vitaminaD.nome}</p>
              <p className="text-xs text-text-dim mt-0.5">{vitaminaD.rotuloStatus} — {vitaminaD.dose}</p>
            </div>
          </div>
        </Bloco>

        <Bloco titulo="Alimentação" icone={Utensils}>
          {faixa.alimentacao.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {faixa.alimentacao.map((item) => (
                <li key={item} className="text-sm text-text-dim leading-snug">
                  • {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-dim">{faixa.alimentacaoAviso}</p>
          )}
        </Bloco>

        {faixa.aleitamento && (
          <Bloco titulo="Aleitamento" icone={Heart} verCompleto={() => setTelaReferencia('aleitamento')}>
            <p className="text-sm text-text-dim leading-relaxed">{faixa.aleitamento}</p>
          </Bloco>
        )}

        <Bloco titulo="Tempo de tela" icone={Tv}>
          <p className="text-sm text-text-dim leading-relaxed">{faixa.tela}</p>
        </Bloco>

        {faixa.exames.length > 0 && (
          <Bloco titulo="Exames" icone={ClipboardList} verCompleto={() => setTelaReferencia('exames')}>
            <ul className="flex flex-col gap-1.5">
              {faixa.exames.map((e) => (
                <li key={e} className="text-sm text-text-dim leading-snug">
                  • {e}
                </li>
              ))}
            </ul>
          </Bloco>
        )}

        <Bloco titulo="Segurança" icone={ShieldAlert}>
          <ul className="flex flex-col gap-1.5">
            {faixa.seguranca.map((s) => (
              <li key={s} className="text-sm text-text-dim leading-snug">
                • {s}
              </li>
            ))}
          </ul>
        </Bloco>

        <p className="text-xs text-text-dim px-0.5">
          Conteúdo de referência (Ministério da Saúde / SBP) — não substitui avaliação clínica individual. Alimentação e
          tempo de tela são rascunho inicial, em revisão.
        </p>
      </div>
    </div>
  )
}

function Bloco({
  titulo,
  icone: Icone,
  verCompleto,
  children,
}: {
  titulo: string
  icone: typeof Syringe
  verCompleto?: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border border-border rounded-[var(--radius-card,14px)] bg-surface p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold text-text">
          <Icone className="w-[17px] h-[17px] text-text-dim" />
          {titulo}
        </h2>
        {verCompleto && (
          <button onClick={verCompleto} className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline shrink-0">
            Ver completo <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
      {children}
    </div>
  )
}
