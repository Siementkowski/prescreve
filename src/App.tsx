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
      <header className="h-14 shrink-0 border-b border-border flex items-center justify-between px-4 sm:px-6 gap-3">
        <div className="flex items-center gap-5 min-w-0">
          <span className="font-display text-lg font-semibold tracking-tight shrink-0">Prescreve</span>
          <nav className="flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-accent-dim text-accent' : 'text-text-dim hover:text-text'
                }`
              }
            >
              <Stethoscope className="w-4 h-4" />
              <span className="hidden sm:inline">Consulta</span>
            </NavLink>
            <NavLink
              to="/pediatria"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-accent-dim text-accent' : 'text-text-dim hover:text-text'
                }`
              }
            >
              <Baby className="w-4 h-4" />
              <span className="hidden sm:inline">Pediatria</span>
            </NavLink>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-accent-dim text-accent' : 'text-text-dim hover:text-text'
                }`
              }
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-text-dim min-w-0">
          {!isEditor && (
            <span className="hidden md:inline text-warn text-xs bg-warn/10 border border-warn/30 rounded-full px-2.5 py-1 shrink-0">
              Modo leitura — seu perfil é "leitor"
            </span>
          )}
          <SyncIndicator />
          <InstallPrompt />
          <span className="hidden sm:inline truncate">
            {perfil?.nome || session.user.email} · {perfil?.papel ?? '—'}
          </span>
          <button onClick={signOut} className="text-text-dim hover:text-text transition-colors shrink-0">
            Sair
          </button>
        </div>
      </header>

      <PwaUpdatePrompt />
      <AtualizacaoDisponivelBanner />

      <main className="flex-1 min-h-0">
        <Routes>
          <Route path="/" element={<ConsultaPage />} />
          <Route path="/pediatria" element={<PediatriaPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="areas" replace />} />
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
