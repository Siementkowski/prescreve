import { AlertTriangle, Droplet, FlaskConical, Biohazard, Microscope, Droplets, Frown } from 'lucide-react'
import { Secao, Tabela } from './components/Secao'

/** Intercorrências comuns do pré-natal — conteúdo majoritariamente estático (mesmo
 *  espírito de Aleitamento.tsx na Pediatria): prosa + tabelas de interpretação, sem
 *  cálculo por trás. Fica direto no componente em vez de dados/*.ts porque a maior parte
 *  já é estruturada como tabela/condicional, não como lista homogênea de registros. */
export function Intercorrencias() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-4 pb-16">
        <Secao titulo="Anemia na gravidez" icone={Droplet}>
          <SubTitulo>Interpretação do hemograma</SubTitulo>
          <div className="flex flex-col gap-2.5">
            <Item titulo="Hb ≥ 11 g/dL">
              Considerado normal (hemodiluição fisiológica da gravidez). Suplementação de ferro elementar: 40 mg/dia.
            </Item>
            <Item titulo="Hb < 11 g/dL">
              Anemia diagnosticada. Investigar dieta inadequada e parasitoses; avaliação complementar com hematologista
              se necessário. Suplementação terapêutica: ferro elementar 120 a 240 mg/dia.
            </Item>
          </div>

          <SubTitulo className="mt-4">Definição técnica de anemia na gestação</SubTitulo>
          <ul className="list-disc pl-5 flex flex-col gap-1 text-sm text-text-dim">
            <li>1º e 3º trimestre: Hb &lt; 11 g/dL ou ferritina &lt; 30 ng/mL.</li>
            <li>2º trimestre: Hb &lt; 10,7 g/dL.</li>
          </ul>
        </Secao>

        <Secao titulo="Aloimunização Rh" icone={FlaskConical}>
          <div className="flex flex-col gap-3">
            <Item titulo="Rh positivo e Coombs indireto negativo">
              Não há risco de aloimunização Rh. Conduta: pré-natal de rotina.
            </Item>

            <div>
              <p className="text-sm font-semibold text-text mb-1.5">Rh negativo e Coombs indireto negativo</p>
              <p className="text-sm text-text-dim mb-2">Realizar tipagem sanguínea do pai biológico do feto.</p>
              <Tabela
                cabecalho={['Pai Rh negativo', 'Pai Rh positivo ou desconhecido']}
                linhas={[['Sem risco de aloimunização Rh. Pré-natal de rotina.', 'Risco de aloimunização Rh. Coombs indireto mensal + profilaxia com Imunoglobulina anti-D.']]}
              />
            </div>

            <Item titulo="Rh negativo e Coombs indireto positivo" alerta>
              Gestante já está aloimunizada contra o Rh. Conduta: pré-natal de alto risco.
            </Item>
          </div>

          <SubTitulo className="mt-4">Profilaxia (Imunoglobulina anti-D)</SubTitulo>
          <div className="flex flex-col gap-1.5 text-sm">
            <p><strong className="text-text font-semibold">Para quem:</strong> <span className="text-text-dim">gestantes Rh negativas com Coombs indireto negativo.</span></p>
            <p><strong className="text-text font-semibold">Como:</strong> <span className="text-text-dim">Imunoglobulina anti-D 300 µg IM.</span></p>
          </div>
          <p className="text-sm font-semibold text-text mt-2 mb-1">Quando administrar:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1 text-sm text-text-dim">
            <li>Com 28 semanas de gestação.</li>
            <li>Após sangramentos na gestação.</li>
            <li>Após procedimentos intrauterinos invasivos.</li>
            <li>Após trauma abdominal.</li>
            <li>Em até 72 horas após o parto (se o recém-nascido for Rh positivo).</li>
          </ul>
        </Secao>

        <Secao titulo="Sífilis" icone={Biohazard}>
          <div className="flex flex-col gap-2.5">
            <Item titulo="Diagnóstico">Teste positivo para sífilis (testes treponêmico e não treponêmico).</Item>
            <Item titulo="Conduta imediata" alerta>Não aguardar confirmação diagnóstica para iniciar tratamento.</Item>
            <Item titulo="Tratamento">
              Gestante: Penicilina Benzatina IM. Parceiro: Penicilina Benzatina IM — sempre tratar concomitantemente.
            </Item>
          </div>

          <SubTitulo className="mt-4">Dose conforme estágio clínico</SubTitulo>
          <Tabela
            cabecalho={['Sífilis recente (< 1 ano)', 'Sífilis tardia (> 1 ano) ou indeterminada']}
            linhas={[['2,4 milhões UI — dose única', '2,4 milhões UI, 1x/semana, por 3 semanas']]}
          />
        </Secao>

        <Secao titulo="Toxoplasmose" icone={Microscope}>
          <SubTitulo>Interpretação sorológica</SubTitulo>
          <Tabela
            cabecalho={['IgM', 'IgG', 'Interpretação', 'Conduta']}
            linhas={[
              ['Negativo', 'Negativo', 'Susceptível (risco de infecção)', 'Orientar medidas preventivas, repetir exames periodicamente'],
              ['Negativo', 'Positivo', 'Imune (infecção antiga)', 'Tranquilizar e acompanhar normalmente'],
              ['Positivo', 'Negativo', 'Infecção recente', 'Avaliação e tratamento imediato'],
              ['Positivo', 'Positivo', 'Avaliar teste de avidez (se IG < 16 semanas)', 'Avaliar tempo da infecção'],
            ]}
          />

          <SubTitulo className="mt-4">Teste de avidez IgG (se gestação &lt; 16 semanas)</SubTitulo>
          <div className="flex flex-col gap-2.5">
            <Item titulo="Baixa avidez" alerta>Indica infecção recente → tratamento imediato.</Item>
            <Item titulo="Alta avidez">Indica infecção antiga (&gt; 4 meses) → tranquilizar e acompanhar.</Item>
          </div>
        </Secao>

        <Secao titulo="Infecção urinária (ITU)" icone={Droplets}>
          <SubTitulo>Aspectos gerais</SubTitulo>
          <ul className="list-disc pl-5 flex flex-col gap-1 text-sm text-text-dim">
            <li>Comum na gestação devido a alterações fisiológicas.</li>
            <li>Pode levar a complicações maternas (pielonefrite, sepse) e fetais (prematuridade, infecções neonatais).</li>
            <li>Triagem com urina tipo I e urocultura é essencial, mesmo em gestantes assintomáticas.</li>
          </ul>

          <SubTitulo className="mt-4">Características, diagnóstico e conduta</SubTitulo>
          <Tabela
            cabecalho={['Características', 'Bacteriúria assintomática', 'Cistite', 'Pielonefrite']}
            linhas={[
              ['Clínica', 'Assintomática', 'Disúria, desconforto suprapúbico, polaciúria', 'Febre, queda do estado geral, dor lombar, disúria'],
              ['Diagnóstico', 'Urocultura com crescimento de mais de 100.000 UFC de mesmo microrganismo', 'Urocultura', 'Anamnese, exame físico e urocultura'],
              [
                'Conduta',
                'Toda bacteriúria assintomática deve ser tratada em gestante com antibioticoterapia (nitrofurantoína, cefalexina, fosfomicina)',
                'Antibioticoterapia ambulatorial',
                'Internação hospitalar, antibioticoterapia parenteral (Cefazolina 1g 8/8h, Ceftriaxone 1g 12/12h)',
              ],
            ]}
          />
          <p className="text-xs font-semibold text-text bg-surface-2 border border-border rounded-lg px-3 py-2 mt-2">
            Urocultura + antibiograma pré e pós-tratamento (em 7 dias).
          </p>

          <SubTitulo className="mt-4">Tratamento</SubTitulo>
          <p className="text-sm text-text-dim mb-1.5">
            Antibióticos seguros: Cefalexina, Amoxicilina, Amoxicilina-Clavulanato, Nitrofurantoína, Fosfomicina.
          </p>
          <span className="flex items-start gap-1.5 text-[12.5px] font-semibold text-warn bg-warn-dim border border-warn/30 rounded-full px-3 py-1.5 w-fit mb-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            Nitrofurantoína: contraindicada a partir de 26 semanas
          </span>
          <p className="text-sm text-text-dim">Duração: 3 a 7 dias (ideal ainda não definido).</p>

          <SubTitulo className="mt-4">Exames e diagnóstico</SubTitulo>
          <ul className="list-disc pl-5 flex flex-col gap-1 text-sm text-text-dim">
            <li>Urocultura é indispensável em qualquer sintoma urinário.</li>
            <li>EQU, nitrito e Gram de gota têm baixa acurácia — cuidado com contaminações.</li>
            <li>Resultados de urocultura demoram 2-3 dias — fluxos laboratoriais devem ser otimizados.</li>
          </ul>

          <SubTitulo className="mt-4">Prevenção de recorrência</SubTitulo>
          <p className="text-sm text-text-dim mb-1.5">Quimioprofilaxia indicada se houver:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1 text-sm text-text-dim">
            <li>História prévia de ITUs recorrentes antes da gestação.</li>
            <li>Um episódio de pielonefrite durante a gravidez.</li>
            <li>Duas ou mais ITUs baixas na gestação.</li>
            <li>Uma ITU baixa complicada por hematúria franca e/ou febre.</li>
            <li>Uma ITU baixa associada a fatores de risco importantes para recorrência: alterações anatômicas, bexiga neurogênica, refluxo vesicoureteral, imunossupressão.</li>
          </ul>
          <p className="text-xs font-semibold text-text bg-surface-2 border border-border rounded-lg px-3 py-2 mt-2">
            Profilaxia: Nitrofurantoína 50-100 mg/dia (só até 26 semanas) ou Cefalexina 250-500 mg/dia, até o parto (e
            até ~40 dias no puerpério).
          </p>

          <SubTitulo className="mt-4">Conduta frente a pielonefrite</SubTitulo>
          <ul className="list-disc pl-5 flex flex-col gap-1 text-sm text-text-dim">
            <li>Internação imediata, iniciar antibiótico venoso (Cefazolina 1g 8/8h ou Ceftriaxone 1g 12/12h).</li>
            <li>Avaliar sinais de sepse e iniciar protocolos específicos quando necessário.</li>
          </ul>
        </Secao>

        <Secao titulo="Hiperêmese gravídica" icone={Frown}>
          <SubTitulo>Diagnóstico clínico</SubTitulo>
          <ul className="list-disc pl-5 flex flex-col gap-1 text-sm text-text-dim mb-2.5">
            <li>Náuseas e vômitos persistentes → desidratação, distúrbio hidroeletrolítico, distúrbio ácido-básico, deficiência nutricional.</li>
            <li>Idade gestacional entre 10 e 16 semanas.</li>
          </ul>
          <Item titulo="Critério diagnóstico" alerta>
            Perda de peso igual ou superior a 5% do peso corpóreo pré-gravídico e/ou cetonúria.
          </Item>

          <SubTitulo className="mt-4">Tratamento</SubTitulo>
          <ul className="list-disc pl-5 flex flex-col gap-1 text-sm text-text-dim">
            <li>Internação hospitalar.</li>
            <li>Jejum durante 24 a 48 horas.</li>
            <li>Reposição hídrica vigorosa endovenosa (preferência pela solução glicofisiológica).</li>
            <li>Antiemético endovenoso — em alguns casos, associar uso de corticosteroide.</li>
            <li>Corrigir distúrbios hidroeletrolíticos.</li>
            <li>Em casos de difícil controle de sintomas, pode-se optar por início de nutrição parenteral.</li>
          </ul>
        </Secao>

        <p className="text-xs text-text-dim px-0.5">
          Conteúdo de referência — não substitui avaliação clínica individual.
        </p>
      </div>
    </div>
  )
}

function SubTitulo({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-[11px] font-bold text-text-dim uppercase tracking-wide mb-2 ${className}`}>{children}</p>
}

function Item({ titulo, alerta, children }: { titulo: string; alerta?: boolean; children: React.ReactNode }) {
  return (
    <div className={alerta ? 'border border-warn/30 bg-warn-dim rounded-lg px-3 py-2.5' : ''}>
      <p className={`text-sm font-semibold flex items-center gap-1.5 ${alerta ? 'text-warn' : 'text-text'}`}>
        {alerta && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
        {titulo}
      </p>
      <p className={`text-sm mt-0.5 ${alerta ? 'text-warn/90' : 'text-text-dim'}`}>{children}</p>
    </div>
  )
}
