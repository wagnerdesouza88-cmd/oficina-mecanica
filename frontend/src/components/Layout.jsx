import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Car, ClipboardList,
  DollarSign, Package, Settings, Bell, ChevronRight,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

function AutoGestLogo({ secondary }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
      <path d="M6 26 A13 13 0 0 1 30 26" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="6" y1="26" x2="8.8" y2="22.6" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="18" y1="13" x2="18" y2="16" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="30" y1="26" x2="27.2" y2="22.6" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="18" y1="24" x2="26" y2="15" stroke={secondary} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="18" cy="24" r="2.5" fill="white"/>
    </svg>
  )
}

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
    ],
  },
  {
    label: 'Operações',
    items: [
      { to: '/ordens', label: 'Ordens de Serviço', icon: ClipboardList },
      { to: '/financeiro', label: 'Financeiro', icon: DollarSign },
      { to: '/estoque', label: 'Estoque', icon: Package },
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
  '/estoque': 'Estoque',
  '/ordens': 'Ordens de Serviço',
  '/financeiro': 'Financeiro',
  '/configuracoes': 'Configurações',
}

export default function Layout() {
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] ?? 'AutoGest'
  const { config } = useTheme()

  const activeStyle = {
    backgroundColor: 'var(--color-secondary)',
    color: '#fff',
    boxShadow: '0 4px 12px -2px var(--color-secondary-light)',
  }

  const nomeOficina = config.nomeFantasia || config.nomeEmpresarial || 'Gestão Automotiva'

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className="w-64 flex flex-col flex-shrink-0"
        style={{ backgroundColor: 'var(--color-primary)', boxShadow: '2px 0 12px rgba(0,0,0,0.2)' }}
      >
        {/* Logo / Identidade */}
        <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {config.logoBase64 ? (
            <img src={config.logoBase64} alt="Logo" className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', width: 36, height: 36, padding: 6 }}>
              <AutoGestLogo secondary={config.corSecundaria || 'var(--color-secondary)'} />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-white font-bold text-[15px] leading-tight tracking-tight">
              AutoGest
            </h1>
            <p className="text-[11px] truncate mt-0.5 font-medium uppercase tracking-wider"
              style={{ color: 'rgba(255,255,255,0.35)' }}>
              {nomeOficina}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3 overflow-y-auto space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-[0.08em]"
                style={{ color: 'rgba(255,255,255,0.28)' }}>
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] font-medium transition-all duration-150 group ${
                        isActive ? '' : 'hover:bg-white/[0.06]'
                      }`
                    }
                    style={({ isActive }) => isActive ? activeStyle : { color: 'rgba(255,255,255,0.65)' }}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={16} className={isActive ? 'text-white' : 'opacity-70 group-hover:opacity-100 transition-opacity'} />
                        <span className="flex-1">{label}</span>
                        {isActive && <ChevronRight size={12} className="text-white/60" />}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <p className="text-center text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            v1.0.0 · AutoGest
          </p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200/60 px-6 py-3 flex items-center justify-between flex-shrink-0"
          style={{ boxShadow: '0 1px 3px rgba(10,31,68,0.06)' }}>
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900 leading-tight tracking-tight">{title}</h2>
            <p className="text-[11.5px] text-gray-400 mt-0.5">Sistema de Gestão de Oficina</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
              <Bell size={16} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-secondary)' }} />
            </button>
            <div className="flex items-center gap-2.5 pl-3 ml-1 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-[13px] font-semibold text-gray-800 leading-tight">Administrador</p>
                <p className="text-[11px] text-gray-400 leading-tight mt-0.5">admin@oficina.com</p>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-bold"
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
