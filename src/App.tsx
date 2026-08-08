import { useEffect } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { Stethoscope, Settings, Baby } from 'lucide-react'
import { useAuth } from './core/auth/AuthProvider'
import { LoginPage } from './core/auth/LoginPage'
import { useSyncStore } from './core/sync'
import { SyncIndicator } from './core/components/SyncIndicator'
import { InstallPrompt } from './core/components/InstallPrompt'
import { PwaUpdatePrompt } from './core/components/PwaUpdatePrompt'
import { AtualizacaoDisponivelBanner } from './core/components/AtualizacaoDisponivelBanner'
import { ConsultaPage } from './consulta/ConsultaPage'
import { PediatriaPage } from './pediatria/PediatriaPage'
import { AdminLayout } from './admin/AdminLayout'
import { AreasPage } from './admin/AreasPage'
import { PatologiasPage } from './admin/PatologiasPage'
import { MedicamentosPage } from './admin/MedicamentosPage'
import { TratamentosPage } from './admin/TratamentosPage'
import { RevisaoPage } from './admin/RevisaoPage'
import { AdminHub } from './admin/AdminHub'
import { AvisoUsoProfissional } from './core/components/AvisoUsoProfissional'

function App() {
  const { session, loading, perfil, isEditor, signOut } = useAuth()
  const inicializarSync = useSyncStore((s) => s.inicializar)

  useEffect(() => {
    if (session) inicializarSync()
  }, [session, inicializarSync])

  // Registra o service worker (e escuta o prompt de instalação) mesmo sem sessão — a
  // instalabilidade do PWA não pode depender de já estar logado.
  if (loading) {
    return (
      <>
        <PwaUpdatePrompt />
        <div className="min-h-screen w-full flex items-center justify-center bg-bg">
          <p className="text-sm text-text-dim">Carregando…</p>
        </div>
      </>
    )
  }

  if (!session) {
    return (
      <>
        <PwaUpdatePrompt />
        <LoginPage />
      </>
    )
  }

  return (
    <div className="h-screen w-full bg-bg text-text flex flex-col">
      <div className="shrink-0 px-4 sm:px-6 pt-4">
        <header className="flex items-center justify-between gap-3 bg-surface border border-border rounded-full pl-5 pr-2.5 py-2.5 shadow-[0_10px_30px_-14px_rgba(32,31,46,0.25)]">
          <div className="flex items-center gap-5 min-w-0">
            <span className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight shrink-0">
              <span className="w-2 h-2 rounded-full bg-cat-areas" aria-hidden="true" />
              Prescreve
            </span>
            <nav className="flex items-center gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    isActive ? 'bg-[#201F2E] text-white' : 'text-text-dim hover:bg-surface-2 hover:text-text'
                  }`
                }
              >
                <Stethoscope className="w-4 h-4" />
                <span className="hidden sm:inline">Consulta</span>
              </NavLink>
              <NavLink
                to="/pediatria"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    isActive ? 'bg-[#201F2E] text-white' : 'text-text-dim hover:bg-surface-2 hover:text-text'
                  }`
                }
              >
                <Baby className="w-4 h-4" />
                <span className="hidden sm:inline">Pediatria</span>
              </NavLink>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    isActive ? 'bg-[#201F2E] text-white' : 'text-text-dim hover:bg-surface-2 hover:text-text'
                  }`
                }
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Painel</span>
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-text-dim min-w-0">
            {!isEditor && (
              <span className="hidden md:inline text-warn text-xs bg-warn-dim border border-warn/30 rounded-full px-2.5 py-1 shrink-0">
                Modo leitura
              </span>
            )}
            <SyncIndicator />
            <InstallPrompt />
            <button
              onClick={signOut}
              className="flex items-center justify-center w-9 h-9 rounded-full font-display font-semibold text-xs shrink-0 text-white"
              style={{ background: 'linear-gradient(135deg, var(--color-cat-patologias-bg), var(--color-accent))' }}
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
          <Route path="/" element={<ConsultaPage />} />
          <Route path="/pediatria" element={<PediatriaPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHub />} />
            <Route path="areas" element={<AreasPage />} />
            <Route path="patologias" element={<PatologiasPage />} />
            <Route path="medicamentos" element={<MedicamentosPage />} />
            <Route path="tratamentos" element={<TratamentosPage />} />
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
