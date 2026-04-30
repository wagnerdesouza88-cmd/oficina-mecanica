import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Car, ClipboardList, Wrench,
  DollarSign, Package, Settings, Bell, ChevronRight,
} from 'lucide-react'

function AutoGestLogo({ secondary }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
      {/* Speedometer arc */}
      <path d="M6 26 A13 13 0 0 1 30 26" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Tick marks */}
      <line x1="6" y1="26" x2="8.8" y2="22.6" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="18" y1="13" x2="18" y2="16" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="30" y1="26" x2="27.2" y2="22.6" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Needle */}
      <line x1="18" y1="24" x2="26" y2="15" stroke={secondary} strokeWidth="2" strokeLinecap="round"/>
      {/* Center dot */}
      <circle cx="18" cy="24" r="2.5" fill="white"/>
    </svg>
  )
}
import { useTheme } from '../context/ThemeContext'

const NAV_GROUPS = [
  {
    label: 'Principal',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: 'Cadastros',
    items: [
      { to: '/clientes', label: 'Clientes', icon: Users },
      { to: '/veiculos', label: 'Veículos', icon: Car },
      { to: '/servicos', label: 'Serviços', icon: Wrench },
      { to: '/estoque', label: 'Estoque', icon: Package },
    ],
  },
  {
    label: 'Operações',
    items: [
      { to: '/ordens', label: 'Ordens de Serviço', icon: ClipboardList },
      { to: '/financeiro', label: 'Financeiro', icon: DollarSign },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { to: '/configuracoes', label: 'Configurações', icon: Settings },
    ],
  },
]

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/clientes': 'Clientes',
  '/veiculos': 'Veículos',
  '/servicos': 'Serviços',
  '/estoque': 'Estoque',
  '/ordens': 'Ordens de Serviço',
  '/financeiro': 'Financeiro',
  '/configuracoes': 'Configurações',
}

export default function Layout() {
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] ?? 'Oficina'
  const { config } = useTheme()

  const sidebarStyle = {
    background: `linear-gradient(175deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)`,
  }

  const activeStyle = {
    backgroundColor: 'var(--color-secondary)',
    color: '#fff',
    boxShadow: '0 4px 12px -2px var(--color-secondary-light)',
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col shadow-2xl flex-shrink-0 relative overflow-hidden" style={sidebarStyle}>
        {/* Texture overlay */}
        <div className="sidebar-texture absolute inset-0 pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          {config.logoBase64 ? (
            <img src={config.logoBase64} alt="Logo" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="rounded-xl p-1.5 flex-shrink-0 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', width: 40, height: 40 }}>
              <AutoGestLogo secondary={config.corSecundaria || 'var(--color-secondary)'} />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-white font-heading font-bold text-base leading-tight tracking-tight truncate">
              {config.nomeOficina || 'AutoGest'}
            </h1>
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {config.slogan || 'Gestão Automotiva'}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="relative flex-1 px-3 py-4 overflow-y-auto space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                        isActive ? '' : 'hover:bg-white/10'
                      }`
                    }
                    style={({ isActive }) => isActive ? activeStyle : { color: 'rgba(255,255,255,0.7)' }}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={17} className={isActive ? 'text-white' : 'opacity-70 group-hover:opacity-100 transition-opacity'} />
                        <span className="flex-1">{label}</span>
                        {isActive && <ChevronRight size={13} className="text-white/70" />}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="relative px-4 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            v1.0.0 · Oficina Pro
          </p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200/80 px-6 py-3.5 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-gray-900 font-heading tracking-tight">{title}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Sistema de Gestão de Oficina</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Bell size={17} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-secondary)' }} />
            </button>
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">Administrador</p>
                <p className="text-xs text-gray-400">admin@oficina.com</p>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: 'var(--color-primary)' }}>
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
