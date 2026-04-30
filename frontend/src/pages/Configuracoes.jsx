import { useEffect, useRef, useState } from 'react'
import {
  Settings, Save, Upload, Palette, Eye, Wrench, RotateCcw,
  ChevronRight, LayoutDashboard, Users, Car, ClipboardList,
  DollarSign, Package, Building2, MapPin, Phone,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useTheme } from '../context/ThemeContext'
import { darkenHex } from '../context/ThemeContext'

const PALETA_PRIMARIA = [
  '#1e3a5f', '#1a3a4a', '#1f2937', '#312e81', '#3b0764',
  '#064e3b', '#14532d', '#7f1d1d', '#78350f', '#1c1917',
]
const PALETA_SECUNDARIA = [
  '#f97316', '#ef4444', '#eab308', '#22c55e', '#3b82f6',
  '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#84cc16',
]

function ColorPicker({ label, value, onChange, paleta }) {
  const [hex, setHex] = useState(value)

  useEffect(() => { setHex(value) }, [value])

  function handleHex(v) {
    setHex(v)
    if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v)
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <input type="color" value={value} onChange={(e) => { onChange(e.target.value); setHex(e.target.value) }}
          className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5 bg-white" />
        <input value={hex} onChange={(e) => handleHex(e.target.value)}
          placeholder="#000000" maxLength={7}
          className="w-28 px-3 py-2 text-sm border border-gray-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-offset-1 uppercase"
          style={{ '--tw-ring-color': value }} />
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {paleta.map((c) => (
          <button key={c} type="button" onClick={() => { onChange(c); setHex(c) }}
            className="w-6 h-6 rounded-lg border-2 transition-transform hover:scale-110 flex-shrink-0"
            style={{ backgroundColor: c, borderColor: value === c ? '#111' : 'transparent' }}
            title={c}
          />
        ))}
      </div>
    </div>
  )
}

function SidebarPreview({ config }) {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: Users, label: 'Clientes' },
    { icon: Car, label: 'Veículos' },
    { icon: ClipboardList, label: 'Ordens de Serviço' },
    { icon: DollarSign, label: 'Financeiro' },
    { icon: Package, label: 'Estoque' },
  ]
  const sidebarBg = `linear-gradient(175deg, ${config.corPrimaria} 0%, ${darkenHex(config.corPrimaria, 15)} 100%)`

  return (
    <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200" style={{ width: 200 }}>
      <div className="flex flex-col h-80" style={{ background: sidebarBg }}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          {config.logoBase64 ? (
            <img src={config.logoBase64} alt="Logo" className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="rounded-lg p-1.5 flex-shrink-0" style={{ backgroundColor: config.corSecundaria }}>
              <Wrench size={13} className="text-white" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white text-xs font-bold truncate leading-tight">{config.nomeOficina || 'Oficina'}</p>
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10 }}>{config.slogan || 'Pro'}</p>
          </div>
        </div>
        {/* Nav items */}
        <div className="flex-1 px-2 py-2 space-y-0.5">
          {navItems.map(({ icon: Icon, label, active }) => (
            <div key={label}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs"
              style={active ? { backgroundColor: config.corSecundaria, color: '#fff' } : { color: 'rgba(255,255,255,0.65)' }}>
              <Icon size={12} />
              <span className="truncate font-medium">{label}</span>
              {active && <ChevronRight size={10} className="ml-auto text-white/60" />}
            </div>
          ))}
        </div>
        {/* Footer */}
        <div className="px-3 py-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <p className="text-center" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>v1.0.0</p>
        </div>
      </div>
    </div>
  )
}

const EMPTY_FORM = {
  nomeOficina: '',
  slogan: '',
  nomeEmpresarial: '',
  nomeFantasia: '',
  cnpj: '',
  inscricaoEstadual: '',
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  cep: '',
  telefone: '',
  whatsapp: '',
  email: '',
  corPrimaria: '#1e3a5f',
  corSecundaria: '#f97316',
  logoBase64: null,
}

function maskCnpj(v) {
  return v.replace(/\D/g, '').slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

function maskCep(v) {
  return v.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2')
}

function maskPhone(v) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  return d.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
}

export default function Configuracoes() {
  const { config: globalConfig, updateConfig } = useTheme()
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const fileRef = useRef(null)

  useEffect(() => {
    api.get('/configuracao')
      .then((r) => {
        setForm({ ...EMPTY_FORM, ...r.data, logoBase64: r.data.logoBase64 ?? null })
      })
      .catch(() => toast.error('Erro ao carregar configurações'))
      .finally(() => setLoading(false))
  }, [])

  function handleLogoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500 * 1024) return toast.error('Imagem muito grande (máx. 500 KB)')
    const reader = new FileReader()
    reader.onload = (ev) => {
      const b64 = ev.target.result
      setForm((f) => ({ ...f, logoBase64: b64 }))
      updateConfig({ logoBase64: b64 })
    }
    reader.readAsDataURL(file)
  }

  function removerLogo() {
    setForm((f) => ({ ...f, logoBase64: null }))
    updateConfig({ logoBase64: null })
  }

  function handleCor(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    updateConfig({ [field]: value })
  }

  async function salvar(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.put('/configuracao', form)
      updateConfig(data)
      toast.success('Configurações salvas!')
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Erro ao salvar')
    } finally {
      setSaving(false) }
  }

  function resetarPadrao() {
    const defaults = { corPrimaria: '#1e3a5f', corSecundaria: '#f97316' }
    setForm((f) => ({ ...f, ...defaults }))
    updateConfig(defaults)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-primary" />
        <span className="text-sm">Carregando...</span>
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-6">
      <form onSubmit={salvar}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Formulário */}
          <div className="lg:col-span-3 space-y-5">

            {/* Identidade */}
            <div className="card p-6 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-xl bg-primary-light">
                  <Settings size={16} className="text-primary" />
                </div>
                <h3 className="font-bold text-gray-800 font-heading tracking-tight">Identidade Visual</h3>
              </div>

              {/* Logo */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Logo da Empresa</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
                    {form.logoBase64
                      ? <img src={form.logoBase64} alt="Logo" className="w-full h-full object-cover" />
                      : <Wrench size={24} className="text-gray-300" />}
                  </div>
                  <div className="space-y-2">
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <Upload size={14} /> Fazer upload
                    </button>
                    {form.logoBase64 && (
                      <button type="button" onClick={removerLogo}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors">
                        Remover logo
                      </button>
                    )}
                    <p className="text-xs text-gray-400">PNG, JPG ou SVG · Máx. 500 KB</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nome da Oficina <span className="text-orange-400">*</span></label>
                <input value={form.nomeOficina}
                  onChange={(e) => { setForm((f) => ({ ...f, nomeOficina: e.target.value })); updateConfig({ nomeOficina: e.target.value }) }}
                  placeholder="Ex: AutoGest"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Slogan</label>
                <input value={form.slogan}
                  onChange={(e) => { setForm((f) => ({ ...f, slogan: e.target.value })); updateConfig({ slogan: e.target.value }) }}
                  placeholder="Ex: Qualidade e confiança"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            {/* Dados Empresariais */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-xl bg-primary-light">
                  <Building2 size={16} className="text-primary" />
                </div>
                <h3 className="font-bold text-gray-800 font-heading tracking-tight">Dados Empresariais</h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Razão Social</label>
                  <input value={form.nomeEmpresarial}
                    onChange={(e) => setForm((f) => ({ ...f, nomeEmpresarial: e.target.value }))}
                    placeholder="Ex: Oficina Mecânica João Silva LTDA"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nome Fantasia</label>
                  <input value={form.nomeFantasia}
                    onChange={(e) => setForm((f) => ({ ...f, nomeFantasia: e.target.value }))}
                    placeholder="Ex: AutoGest Mecânica"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">CNPJ</label>
                  <input value={form.cnpj}
                    onChange={(e) => setForm((f) => ({ ...f, cnpj: maskCnpj(e.target.value) }))}
                    placeholder="00.000.000/0000-00"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Inscrição Estadual</label>
                  <input value={form.inscricaoEstadual}
                    onChange={(e) => setForm((f) => ({ ...f, inscricaoEstadual: e.target.value }))}
                    placeholder="Ex: 123.456.789.000"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono" />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-xl bg-primary-light">
                  <MapPin size={16} className="text-primary" />
                </div>
                <h3 className="font-bold text-gray-800 font-heading tracking-tight">Endereço</h3>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Rua / Logradouro</label>
                  <input value={form.rua}
                    onChange={(e) => setForm((f) => ({ ...f, rua: e.target.value }))}
                    placeholder="Ex: Rua das Flores"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Número</label>
                  <input value={form.numero}
                    onChange={(e) => setForm((f) => ({ ...f, numero: e.target.value }))}
                    placeholder="123"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Complemento</label>
                  <input value={form.complemento}
                    onChange={(e) => setForm((f) => ({ ...f, complemento: e.target.value }))}
                    placeholder="Sala 2, Galpão B..."
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Bairro</label>
                  <input value={form.bairro}
                    onChange={(e) => setForm((f) => ({ ...f, bairro: e.target.value }))}
                    placeholder="Ex: Centro"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">CEP</label>
                  <input value={form.cep}
                    onChange={(e) => setForm((f) => ({ ...f, cep: maskCep(e.target.value) }))}
                    placeholder="00000-000"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono" />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Cidade</label>
                  <input value={form.cidade}
                    onChange={(e) => setForm((f) => ({ ...f, cidade: e.target.value }))}
                    placeholder="Ex: São Paulo"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Estado</label>
                  <select value={form.estado}
                    onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white">
                    <option value="">UF</option>
                    {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Contato */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-xl bg-primary-light">
                  <Phone size={16} className="text-primary" />
                </div>
                <h3 className="font-bold text-gray-800 font-heading tracking-tight">Contato</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Telefone</label>
                  <input value={form.telefone}
                    onChange={(e) => setForm((f) => ({ ...f, telefone: maskPhone(e.target.value) }))}
                    placeholder="(00) 0000-0000"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">WhatsApp</label>
                  <input value={form.whatsapp}
                    onChange={(e) => setForm((f) => ({ ...f, whatsapp: maskPhone(e.target.value) }))}
                    placeholder="(00) 00000-0000"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">E-mail</label>
                <input type="email" value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="contato@minhaoficina.com.br"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            {/* Cores */}
            <div className="card p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary-light">
                    <Palette size={16} className="text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-800 font-heading tracking-tight">Paleta de Cores</h3>
                </div>
                <button type="button" onClick={resetarPadrao}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100">
                  <RotateCcw size={12} /> Resetar padrão
                </button>
              </div>

              <ColorPicker
                label="Cor Primária (sidebar e elementos principais)"
                value={form.corPrimaria}
                onChange={(v) => handleCor('corPrimaria', v)}
                paleta={PALETA_PRIMARIA}
              />

              <ColorPicker
                label="Cor Secundária (botões de ação e destaque ativo)"
                value={form.corSecundaria}
                onChange={(v) => handleCor('corSecundaria', v)}
                paleta={PALETA_SECUNDARIA}
              />

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 flex items-start gap-2">
                <Eye size={13} className="flex-shrink-0 mt-0.5" />
                As mudanças são aplicadas em tempo real no preview ao lado.
              </div>
            </div>

            {/* Salvar */}
            <button type="submit" disabled={saving}
              className="btn-secondary w-full justify-center py-3 text-base"
              style={{ backgroundColor: 'var(--color-secondary)' }}>
              {saving
                ? <><span className="animate-spin rounded-full w-4 h-4 border-2 border-white/30 border-t-white" /> Salvando...</>
                : <><Save size={17} /> Salvar Configurações</>}
            </button>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-6 self-start">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Eye size={15} className="text-primary" />
                <h3 className="font-semibold text-gray-800 text-sm">Preview em Tempo Real</h3>
              </div>
              <div className="flex justify-center">
                <SidebarPreview config={form} />
              </div>
              <p className="text-xs text-gray-400 text-center mt-3">
                Pré-visualização da sidebar com as cores e logo selecionadas
              </p>
            </div>

            {/* Chips com as cores atuais */}
            <div className="card p-4 space-y-3">
              <p className="text-xs font-semibold text-gray-600">Cores selecionadas</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl shadow-sm flex-shrink-0" style={{ backgroundColor: form.corPrimaria }} />
                <div>
                  <p className="text-xs font-semibold text-gray-700">Primária</p>
                  <p className="text-xs text-gray-400 font-mono uppercase">{form.corPrimaria}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl shadow-sm flex-shrink-0" style={{ backgroundColor: form.corSecundaria }} />
                <div>
                  <p className="text-xs font-semibold text-gray-700">Secundária</p>
                  <p className="text-xs text-gray-400 font-mono uppercase">{form.corSecundaria}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
