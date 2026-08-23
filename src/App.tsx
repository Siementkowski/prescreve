import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Stethoscope, Baby, FileText, User } from 'lucide-react'
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
import { PatologiasPage as PatologiasAdminPage } from './admin/PatologiasPage'
import { PatologiasPage } from './patologias/PatologiasPage'
import { MedicamentosPage } from './admin/MedicamentosPage'
import { ComplementosPage } from './admin/ComplementosPage'
import { TratamentosPage } from './admin/TratamentosPage'
import { GeradoresPage } from './admin/GeradoresPage'
import { RevisaoPage } from './admin/RevisaoPage'
import { AdminHub } from './admin/AdminHub'
import { AvisoUsoProfissional } from './core/components/AvisoUsoProfissional'
import { Topbar } from './core/components/Topbar'
import { Sidebar, type ItemNav } from './core/components/Sidebar'
import './admin/painel-editorial.css'

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

  // Painel inclui todas as sub-telas de cadastro (/painel/*) — o item da sidebar fica
  // marcado como ativo em qualquer uma delas, não só na raiz exata. Medicamentos ganha
  // atalho próprio (como no kit), então fica de fora do "ativo" genérico do Painel.
  const medicamentosAtivo = location.pathname.startsWith('/painel/medicamentos')
  const painelAtivo = location.pathname.startsWith('/painel') && !medicamentosAtivo

  const navPrincipal: ItemNav[] = [
    { to: '/', label: 'Início', sprite: 'grid', end: true },
    { to: '/consulta', label: 'Consulta', lucide: Stethoscope },
    { to: '/pediatria', label: 'Pediatria', lucide: Baby },
    { to: '/anamnese', label: 'Anamnese', lucide: FileText },
    { to: '/patologias', label: 'Patologias', sprite: 'path' },
  ]
  const navPainel: ItemNav[] = isEditor
    ? [
        { to: '/painel/medicamentos', label: 'Medicamentos', sprite: 'pill', ativo: medicamentosAtivo },
        { to: '/painel', label: 'Painel', sprite: 'settings', ativo: painelAtivo },
      ]
    : []

  return (
    <div className="tema-editorial h-screen w-full bg-bg text-text flex flex-col" data-theme={tema}>
      <Topbar tema={tema} onAlternarTema={() => setTema((t) => (t === 'dark' ? 'light' : 'dark'))}>
        <button
          onClick={signOut}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-text text-bg shrink-0"
          title={`${perfil?.nome || session.user.email} · ${perfil?.papel ?? '—'} — clique para sair`}
        >
          <User className="w-[18px] h-[18px]" strokeWidth={2.25} />
        </button>
      </Topbar>

      <PwaUpdatePrompt />
      <AtualizacaoDisponivelBanner />

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <Sidebar
          principal={navPrincipal}
          painel={navPainel}
          rodape={
            <div className="flex flex-col gap-2">
              {!isEditor && (
                <span className="text-warn text-[11px] bg-warn-dim border border-warn/30 rounded-full px-2.5 py-1 text-center">
                  Modo leitura
                </span>
              )}
              <SyncIndicator />
              <InstallPrompt />
            </div>
          }
        />

        <main className="flex-1 min-w-0 min-h-0">
          <Routes>
            <Route path="/" element={<AdminHub />} />
            <Route path="/consulta" element={<ConsultaPage />} />
            <Route path="/pediatria" element={<PediatriaPage />} />
            <Route path="/anamnese" element={<AnamnesePage />} />
            <Route path="/patologias" element={<PatologiasPage />} />
            <Route path="/painel" element={<AdminLayout />}>
              <Route index element={<Navigate to="areas" replace />} />
              <Route path="areas" element={<AreasPage />} />
              <Route path="patologias" element={<PatologiasAdminPage />} />
              <Route path="medicamentos" element={<MedicamentosPage />} />
              <Route path="complementos" element={<ComplementosPage />} />
              <Route path="tratamentos" element={<TratamentosPage />} />
              <Route path="geradores" element={<GeradoresPage />} />
              <Route path="revisao" element={<RevisaoPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <AvisoUsoProfissional />
    </div>
  )
}

export default App
