import { useEffect, useState } from 'react'
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Stethoscope, Settings, Baby, Home, FileText } from 'lucide-react'
import { useAuth } from './core/auth/AuthProvider'
import { LoginPage } from './core/auth/LoginPage'
import { useSyncStore } from './core/sync'
import { SyncIndicator } from './core/components/SyncIndicator'
import { InstallPrompt } from './core/components/InstallPrompt'
import { PwaUpdatePrompt } from './core/components/PwaUpdatePrompt'
import { AtualizacaoDisponivelBanner } from './core/components/AtualizacaoDisponivelBanner'
import { ConsultaPage } from './consulta/ConsultaPage'
import { PediatriaPage } from './pediatria/PediatriaPage'
import { AnamnesePage } from './anamnese/AnamnesePage'
import { AdminLayout } from './admin/AdminLayout'
import { AreasPage } from './admin/AreasPage'
import { PatologiasPage } from './admin/PatologiasPage'
import { MedicamentosPage } from './admin/MedicamentosPage'
import { ComplementosPage } from './admin/ComplementosPage'
import { TratamentosPage } from './admin/TratamentosPage'
import { GeradoresPage } from './admin/GeradoresPage'
import { RevisaoPage } from './admin/RevisaoPage'
import { AdminHub } from './admin/AdminHub'
import { AvisoUsoProfissional } from './core/components/AvisoUsoProfissional'
import { Icon } from './admin/components/editorial/Icon'
import './admin/painel-editorial.css'

const navPillClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
    isActive ? 'bg-text text-bg' : 'text-text-dim hover:bg-surface-2 hover:text-text'
  }`

type TemaApp = 'light' | 'dark'
const CHAVE_TEMA_APP = 'prescreve-painel-tema'

function temaSalvo(): TemaApp {
  if (typeof window === 'undefined') return 'light'
  return window.localStorage.getItem(CHAVE_TEMA_APP) === 'dark' ? 'dark' : 'light'
}

function App() {
  const { session, loading, perfil, isEditor, signOut } = useAuth()
  const inicializarSync = useSyncStore((s) => s.inicializar)
  const location = useLocation()
  const [tema, setTema] = useState<TemaApp>(temaSalvo)

  useEffect(() => {
    if (session) inicializarSync()
  }, [session, inicializarSync])

  useEffect(() => {
    window.localStorage.setItem(CHAVE_TEMA_APP, tema)
  }, [tema])

  // Registra o service worker (e escuta o prompt de instalação) mesmo sem sessão — a
  // instalabilidade do PWA não pode depender de já estar logado. Reusa a mesma chave de
  // tema do Painel — agora é o app inteiro que usa o design system "Painel Editorial",
  // não só /painel/*, então claro/escuro é uma preferência única, global.
  if (loading) {
    return (
      <div className="tema-editorial" data-theme={tema}>
        <PwaUpdatePrompt />
        <div className="min-h-screen w-full flex items-center justify-center bg-bg">
          <p className="text-sm text-text-dim">Carregando…</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="tema-editorial" data-theme={tema}>
        <PwaUpdatePrompt />
        <LoginPage />
      </div>
    )
  }

  // Painel inclui todas as sub-telas de cadastro (/painel/*) — a pílula fica marcada
  // como ativa em qualquer uma delas, não só na raiz exata.
  const painelAtivo = location.pathname.startsWith('/painel')

  return (
    <div className="tema-editorial h-screen w-full bg-bg text-text flex flex-col" data-theme={tema}>
      <div className="shrink-0 px-4 sm:px-6 pt-4">
        <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 bg-surface border border-border rounded-full pl-5 pr-2.5 py-2.5 shadow-[var(--shadow-float,0_10px_30px_-14px_rgba(17,17,17,.15))]">
          {/* Três colunas de largura equilibrada (1fr/auto/1fr) — a nav fica no centro
              real do header, não só no meio do espaço que sobra entre logo e avatar. */}
          <div className="flex items-center min-w-0 justify-self-start">
            <NavLink
              to="/"
              className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight shrink-0"
            >
              <span className="w-2 h-2 rounded-full bg-cat-areas" aria-hidden="true" />
              Prescreve
            </NavLink>
          </div>

          <nav className="flex items-center gap-1 justify-self-center">
            <NavLink to="/" end className={navPillClass}>
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Página Inicial</span>
            </NavLink>
            <NavLink to="/consulta" className={navPillClass}>
              <Stethoscope className="w-4 h-4" />
              <span className="hidden sm:inline">Consulta</span>
            </NavLink>
            <NavLink to="/pediatria" className={navPillClass}>
              <Baby className="w-4 h-4" />
              <span className="hidden sm:inline">Pediatria</span>
            </NavLink>
            <NavLink to="/anamnese" className={navPillClass}>
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Anamnese</span>
            </NavLink>
            {isEditor && (
              <NavLink to="/painel" className={() => navPillClass({ isActive: painelAtivo })}>
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Painel</span>
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-2.5 text-sm text-text-dim min-w-0 justify-self-end">
            {!isEditor && (
              <span className="hidden md:inline text-warn text-xs bg-warn-dim border border-warn/30 rounded-full px-2.5 py-1 shrink-0">
                Modo leitura
              </span>
            )}
            <SyncIndicator />
            <InstallPrompt />
            <button
              type="button"
              onClick={() => setTema((t) => (t === 'dark' ? 'light' : 'dark'))}
              title={tema === 'dark' ? 'Tema claro' : 'Tema escuro'}
              aria-label="Alternar tema"
              className="shrink-0 w-9 h-9 rounded-full border border-border bg-surface text-text-dim hover:text-text hover:border-text-dim transition-colors flex items-center justify-center"
            >
              <Icon name={tema === 'dark' ? 'sun' : 'moon'} size={16} />
            </button>
            <button
              onClick={signOut}
              className="flex items-center justify-center w-9 h-9 rounded-full font-display font-semibold text-xs shrink-0 text-white"
              style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-text))' }}
              title={`${perfil?.nome || session.user.email} · ${perfil?.papel ?? '—'} — clique para sair`}
            >
              {(perfil?.nome || session.user.email || '?').slice(0, 2).toUpperCase()}
            </button>
          </div>
        </header>
      </div>

      <PwaUpdatePrompt />
      <AtualizacaoDisponivelBanner />

      <main className="flex-1 min-h-0">
        <Routes>
          <Route path="/" element={<AdminHub />} />
          <Route path="/consulta" element={<ConsultaPage />} />
          <Route path="/pediatria" element={<PediatriaPage />} />
          <Route path="/anamnese" element={<AnamnesePage />} />
          <Route path="/painel" element={<AdminLayout />}>
            <Route index element={<Navigate to="areas" replace />} />
            <Route path="areas" element={<AreasPage />} />
            <Route path="patologias" element={<PatologiasPage />} />
            <Route path="medicamentos" element={<MedicamentosPage />} />
            <Route path="complementos" element={<ComplementosPage />} />
            <Route path="tratamentos" element={<TratamentosPage />} />
            <Route path="geradores" element={<GeradoresPage />} />
            <Route path="revisao" element={<RevisaoPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <AvisoUsoProfissional />
    </div>
  )
}

export default App
