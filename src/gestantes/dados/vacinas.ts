// Vacinação na gestação — conteúdo fornecido pelo usuário.

/** Vacinas de vírus atenuado — contraindicadas na gestação (risco teórico ao feto). */
export const VACINAS_CONTRAINDICADAS: string[] = ['Sarampo', 'Caxumba', 'Rubéola', 'Poliomielite', 'Varicela']

export interface VacinaIndicada {
  nome: string
  observacao?: string
}

export const VACINAS_INDICADAS: VacinaIndicada[] = [
  { nome: 'DTPa', observacao: 'Preferida pela proteção contra coqueluche' },
  { nome: 'COVID-19' },
  { nome: 'Hepatite B' },
  { nome: 'Influenza' },
]

/** Esquema vacinal antitetânico — regras pra decidir iniciar vs. reforçar. */
export const ESQUEMA_TETANO: string[] = [
  'Se nunca vacinou → iniciar esquema',
  'Se última dose há ≥ 3 anos → reforço',
  'Aplicação ideal: próximo das 20 semanas',
]
