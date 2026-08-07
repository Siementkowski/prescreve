import { useState, type FormEvent } from 'react'
import { useAuth } from './AuthProvider'

export function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [modo, setModo] = useState<'login' | 'cadastro'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setAviso(null)
    setEnviando(true)

    const resultado =
      modo === 'login' ? await signIn(email, password) : await signUp(email, password, nome)

    if (resultado.error) {
      setErro(resultado.error)
    } else if (modo === 'cadastro') {
      setAviso('Conta criada. Verifique seu e-mail para confirmar o acesso, se exigido, ou faça login.')
      setModo('login')
    }
    setEnviando(false)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm bg-surface border border-border rounded-xl p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-text tracking-tight">Prescreve</h1>
          <p className="text-sm text-text-dim mt-1">Consultor de prescrições médicas</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {modo === 'cadastro' && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="nome" className="text-xs font-medium text-text-dim">
                Nome
              </label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="bg-surface-2 border border-border rounded-md px-3 py-2 text-sm text-text outline-none focus:border-accent transition-colors"
                autoComplete="name"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-medium text-text-dim">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-surface-2 border border-border rounded-md px-3 py-2 text-sm text-text outline-none focus:border-accent transition-colors"
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-medium text-text-dim">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-surface-2 border border-border rounded-md px-3 py-2 text-sm text-text outline-none focus:border-accent transition-colors"
              autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {erro && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-md px-3 py-2">
              {erro}
            </p>
          )}
          {aviso && (
            <p className="text-sm text-ok bg-ok/10 border border-ok/30 rounded-md px-3 py-2">
              {aviso}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="mt-2 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white text-sm font-medium rounded-md px-3 py-2.5 transition-colors"
          >
            {enviando ? 'Aguarde…' : modo === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setModo(modo === 'login' ? 'cadastro' : 'login')
            setErro(null)
            setAviso(null)
          }}
          className="mt-5 w-full text-center text-xs text-text-dim hover:text-text transition-colors"
        >
          {modo === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
        </button>
      </div>
    </div>
  )
}
