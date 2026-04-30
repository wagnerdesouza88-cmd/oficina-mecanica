import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const ThemeContext = createContext(null)

const DEFAULTS = {
  nomeOficina: 'AutoGest',
  slogan: 'Gestão Automotiva',
  nomeEmpresarial: '',
  nomeFantasia: '',
  cnpj: '',
  inscricaoEstadual: '',
  rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '',
  telefone: '', whatsapp: '', email: '',
  corPrimaria: '#1e3a5f',
  corSecundaria: '#f97316',
  logoBase64: null,
}

function applyTheme({ corPrimaria, corSecundaria }) {
  const root = document.documentElement
  if (corPrimaria) {
    root.style.setProperty('--color-primary', corPrimaria)
    root.style.setProperty('--color-primary-dark', darkenHex(corPrimaria, 15))
    root.style.setProperty('--color-primary-light', hexToRgba(corPrimaria, 0.08))
  }
  if (corSecundaria) {
    root.style.setProperty('--color-secondary', corSecundaria)
    root.style.setProperty('--color-secondary-dark', darkenHex(corSecundaria, 12))
    root.style.setProperty('--color-secondary-light', hexToRgba(corSecundaria, 0.1))
  }
}

function darkenHex(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, (num >> 16) - amount)
  const g = Math.max(0, ((num >> 8) & 0xff) - amount)
  const b = Math.max(0, (num & 0xff) - amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function hexToRgba(hex, alpha) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function ThemeProvider({ children }) {
  const [config, setConfig] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/configuracao')
      .then((r) => {
        const c = { ...DEFAULTS, ...r.data }
        setConfig(c)
        applyTheme(c)
      })
      .catch(() => applyTheme(DEFAULTS))
      .finally(() => setLoading(false))
  }, [])

  function updateConfig(newConfig) {
    const merged = { ...config, ...newConfig }
    setConfig(merged)
    applyTheme(merged)
  }

  return (
    <ThemeContext.Provider value={{ config, updateConfig, loading, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}

export { applyTheme, darkenHex, hexToRgba }
