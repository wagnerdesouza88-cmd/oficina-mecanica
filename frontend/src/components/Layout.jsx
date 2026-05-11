import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Car, ClipboardList,
  DollarSign, Package, Settings, Bell, Search, ChevronDown,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

function AutoGestLogo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
      <path d="M5 24 A12 12 0 0 1 27 24" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="5"  y1="24" x2="7.5"  y2="20" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="16" y1="12" x2="16"   y2="15" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="27" y1="24" x2="24.5" y2="20" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="16" y1="22" x2="23"   y2="13" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
      <circle cx="16" cy="22" r="2.4" fill="#fff"/>
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

  const nomeOficina = config.nomeFantasia || config.nomeEmpresarial || 'Minha Oficina'
  const inicialOficina = nomeOficina.charAt(0).toUpperCase()

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="sidebar__brand">
          <div className="sidebar__brand-mark">
            {config.logoBase64
              ? <img src={config.logoBase64} alt="Logo" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
              : <AutoGestLogo />
            }
          </div>
          <div className="sidebar__brand-text">
            <span className="sidebar__brand-name">AutoGest</span>
            <span className="sidebar__brand-sub">Gestão Automotiva</span>
          </div>
        </div>

        {/* Workspace selector */}
        <div className="sidebar__workspace">
          <div className="sidebar__workspace-avatar">{inicialOficina}</div>
          <div className="sidebar__workspace-info">
            <div className="sidebar__workspace-label">Espaço de trabalho</div>
            <div className="sidebar__workspace-name">{nomeOficina}</div>
          </div>
          <ChevronDown size={14} className="sidebar__workspace-chev" />
        </div>

        {/* Nav */}
        <nav className="sidebar__nav">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="sidebar__section">
              <div className="sidebar__section-label">{group.label}</div>
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    'sidebar__item' + (isActive ? ' is-active' : '')
                  }
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar__footer">
          <div className="sidebar__user-avatar">A</div>
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">Administrador</div>
            <div className="sidebar__user-mail">admin@oficina.com</div>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="main-col">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar__crumbs">
            <span>{nomeOficina}</span>
            <span className="topbar__sep">/</span>
            <span className="topbar__crumb-current">{title}</span>
          </div>

          <div className="topbar__search">
            <Search size={14} />
            <input placeholder="Buscar clientes, OS, veículos…" />
            <kbd>⌘K</kbd>
          </div>

          <button className="topbar__icon-btn">
            <Bell size={16} />
            <span className="dot" />
          </button>

          <button className="topbar__user">
            <div className="topbar__user-avatar">A</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="topbar__user-name">Administrador</span>
              <span className="topbar__user-role">Admin</span>
            </div>
            <ChevronDown size={13} style={{ color: 'var(--text-faint)', marginLeft: 2 }} />
          </button>
        </header>

        {/* Page content */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
