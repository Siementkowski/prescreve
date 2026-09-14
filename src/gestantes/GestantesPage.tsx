import { CalculadoraGestacional } from './CalculadoraGestacional'

/** Casca do módulo de Gestantes — hoje só Pré-natal, mesmo papel do PediatriaPage.tsx:
 *  quando entrar Vacinação/Medicações seguras/Sinais de alarme/Condutas (fases futuras,
 *  fora de escopo por enquanto), vira sub-nav aqui sem precisar reestruturar nada. */
export function GestantesPage() {
  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="px-4 py-3 border-b border-border shrink-0">
        <h1 className="font-display text-lg font-semibold">Pré-natal</h1>
      </div>
      <div className="flex-1 min-h-0">
        <CalculadoraGestacional />
      </div>
    </div>
  )
}
