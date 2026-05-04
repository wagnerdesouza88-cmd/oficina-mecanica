import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Save, Upload, Palette, Eye, Wrench, RotateCcw,
  ChevronRight, LayoutDashboard, Users, Car, ClipboardList,
  DollarSign, Package, Building2, MapPin, Phone, Settings,
  Plus, Search, X, Pencil, Trash2, Loader2, ToggleLeft, ToggleRight, Tag,
  UserCircle, Globe,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useTheme } from '../context/ThemeContext'
import { darkenHex } from '../context/ThemeContext'

// ─── Constantes de serviços ───────────────────────────────────────────────────

const CAT_ORDER = [
  'PREVENTIVA', 'FREIOS', 'SUSPENSAO_DIRECAO', 'MOTOR',
  'ELETRICA', 'CAMBIO_TRANSMISSAO', 'FUNILARIA_PINTURA',
]
const CAT_LABELS = {
  PREVENTIVA:         'Manutenção Preventiva',
  FREIOS:             'Freios',
  SUSPENSAO_DIRECAO:  'Suspensão e Direção',
  MOTOR:              'Motor',
  ELETRICA:           'Elétrica',
  CAMBIO_TRANSMISSAO: 'Câmbio e Transmissão',
  FUNILARIA_PINTURA:  'Funilaria e Pintura',
}
const CAT_COLORS = {
  PREVENTIVA:         'bg-green-100 text-green-700',
  FREIOS:             'bg-red-100 text-red-700',
  SUSPENSAO_DIRECAO:  'bg-blue-100 text-blue-700',
  MOTOR:              'bg-orange-100 text-orange-700',
  ELETRICA:           'bg-yellow-100 text-yellow-800',
  CAMBIO_TRANSMISSAO: 'bg-purple-100 text-purple-700',
  FUNILARIA_PINTURA:  'bg-pink-100 text-pink-700',
}

const PALETA_PRIMARIA = [
  '#1e3a5f', '#1a3a4a', '#1f2937', '#312e81', '#3b0764',
  '#064e3b', '#14532d', '#7f1d1d', '#78350f', '#1c1917',
]
const PALETA_SECUNDARIA = [
  '#f97316', '#ef4444', '#eab308', '#22c55e', '#3b82f6',
  '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#84cc16',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function brl(val) {
  return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
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

// ─── ColorPicker ──────────────────────────────────────────────────────────────

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
          className="w-28 px-3 py-2 text-sm border border-gray-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-offset-1 uppercase" />
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {paleta.map((c) => (
          <button key={c} type="button" onClick={() => { onChange(c); setHex(c) }}
            className="w-6 h-6 rounded-lg border-2 transition-transform hover:scale-110 flex-shrink-0"
            style={{ backgroundColor: c, borderColor: value === c ? '#111' : 'transparent' }}
            title={c} />
        ))}
      </div>
    </div>
  )
}

// ─── SidebarPreview ───────────────────────────────────────────────────────────

function SidebarPreview({ config }) {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: Users, label: 'Clientes' },
    { icon: Car, label: 'Veículos' },
    { icon: ClipboardList, label: 'Ordens de Serviço' },
    { icon: DollarSign, label: 'Financeiro' },
    { icon: Package, label: 'Estoque' },
  ]

  return (
    <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200" style={{ width: 200 }}>
      <div className="flex flex-col h-80" style={{ backgroundColor: config.corPrimaria }}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          {config.logoBase64 ? (
            <img src={config.logoBase64} alt="Logo" className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="rounded-lg p-1.5 flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <Wrench size={13} className="text-white" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white text-xs font-bold truncate leading-tight">AutoGest</p>
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10 }}>
              {config.nomeFantasia || config.nomeEmpresarial || 'Gestão Automotiva'}
            </p>
          </div>
        </div>
        {/* Nav items */}
        <div className="flex-1 px-2 py-2 space-y-0.5">
          {navItems.map(({ icon: Icon, label, active }) => (
            <div key={label} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs"
              style={active ? { backgroundColor: config.corSecundaria, color: '#fff' } : { color: 'rgba(255,255,255,0.65)' }}>
              <Icon size={12} />
              <span className="truncate font-medium">{label}</span>
              {active && <ChevronRight size={10} className="ml-auto text-white/60" />}
            </div>
          ))}
        </div>
        {/* Footer */}
        <div className="px-3 py-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <p className="text-center" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>v1.0.0 · AutoGest</p>
        </div>
      </div>
    </div>
  )
}

// ─── Aba: Empresa ─────────────────────────────────────────────────────────────

function TabEmpresa({ form, setForm, saving, onSalvar }) {
  return (
    <div className="space-y-5 max-w-3xl">

      {/* Dados Empresariais */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-xl bg-primary-light">
            <Building2 size={16} className="text-primary" />
          </div>
          <h3 className="font-bold text-gray-800 font-heading tracking-tight">Dados Empresariais</h3>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Razão Social</label>
          <input value={form.nomeEmpresarial}
            onChange={(e) => setForm((f) => ({ ...f, nomeEmpresarial: e.target.value }))}
            placeholder="Ex: Mecânica João Silva LTDA"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Nome Fantasia <span className="text-gray-400 font-normal">(aparece na sidebar)</span>
          </label>
          <input value={form.nomeFantasia}
            onChange={(e) => setForm((f) => ({ ...f, nomeFantasia: e.target.value }))}
            placeholder="Ex: AutoGest Mecânica"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
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
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">CEP</label>
            <input value={form.cep}
              onChange={(e) => setForm((f) => ({ ...f, cep: maskCep(e.target.value) }))}
              placeholder="00000-000"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono" />
          </div>
          <div>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">E-mail</label>
            <input type="email" value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="contato@minhaoficina.com.br"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Site <span className="text-gray-400 font-normal">(opcional)</span></label>
            <input value={form.site || ''}
              onChange={(e) => setForm((f) => ({ ...f, site: e.target.value }))}
              placeholder="www.minhaoficina.com.br"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
      </div>

      <button type="button" onClick={onSalvar} disabled={saving}
        className="btn-secondary w-full justify-center py-3 text-base flex items-center gap-2"
        style={{ backgroundColor: 'var(--color-secondary)' }}>
        {saving
          ? <><span className="animate-spin rounded-full w-4 h-4 border-2 border-white/30 border-t-white" /> Salvando...</>
          : <><Save size={17} /> Salvar Dados da Empresa</>}
      </button>
    </div>
  )
}

// ─── Aba: Serviços ────────────────────────────────────────────────────────────

function TabServicos() {
  const [servicos, setServicos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [toggling, setToggling] = useState(null)
  const [deletando, setDeletando] = useState(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  async function carregarServicos() {
    try {
      const { data } = await api.get('/tipos-servico?todos=true')
      setServicos(data)
    } catch {
      toast.error('Erro ao carregar serviços')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregarServicos() }, [])

  const categoriasPresentes = [
    ...CAT_ORDER.filter((c) => servicos.some((s) => s.categoria === c)),
    ...servicos.map((s) => s.categoria).filter((c) => !CAT_ORDER.includes(c)).filter((c, i, arr) => arr.indexOf(c) === i),
  ]

  const filtrados = servicos.filter((s) => {
    const matchBusca = !busca || s.nome.toLowerCase().includes(busca.toLowerCase())
    const matchCat = filtroCategoria === 'TODAS' || s.categoria === filtroCategoria
    return matchBusca && matchCat
  })

  const contagem = servicos.reduce((acc, s) => { acc[s.categoria] = (acc[s.categoria] ?? 0) + 1; return acc }, {})

  function abrirModalCriar() {
    setEditando(null)
    reset({ nome: '', categoria: 'PREVENTIVA', precoSugerido: '', ativo: true })
    setModalAberto(true)
  }

  function abrirModalEditar(s) {
    setEditando(s)
    reset({ nome: s.nome, categoria: s.categoria, precoSugerido: Number(s.precoSugerido), ativo: s.ativo })
    setModalAberto(true)
  }

  async function onSubmit(data) {
    try {
      if (editando) {
        const { data: updated } = await api.put(`/tipos-servico/${editando.id}`, data)
        setServicos((prev) => prev.map((s) => s.id === editando.id ? updated : s))
        toast.success('Serviço atualizado!')
      } else {
        const { data: created } = await api.post('/tipos-servico', data)
        setServicos((prev) => [...prev, created])
        toast.success('Serviço criado!')
      }
      setModalAberto(false); setEditando(null)
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Erro ao salvar serviço')
    }
  }

  async function toggleAtivo(s) {
    setToggling(s.id)
    try {
      const { data } = await api.put(`/tipos-servico/${s.id}`, { ativo: !s.ativo })
      setServicos((prev) => prev.map((x) => x.id === s.id ? data : x))
      toast.success(data.ativo ? 'Serviço ativado!' : 'Serviço desativado!')
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Erro ao alterar status')
    } finally { setToggling(null) }
  }

  async function excluir(s) {
    if (!window.confirm(`Excluir o serviço "${s.nome}"?`)) return
    setDeletando(s.id)
    try {
      await api.delete(`/tipos-servico/${s.id}`)
      setServicos((prev) => prev.filter((x) => x.id !== s.id))
      toast.success('Serviço excluído!')
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Erro ao excluir serviço')
    } finally { setDeletando(null) }
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar serviço..." value={busca} onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <button onClick={abrirModalCriar}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors">
          <Plus size={16} /> Novo Serviço
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {[{ key: 'TODAS', label: 'Todas', count: servicos.length }, ...categoriasPresentes.map((c) => ({ key: c, label: CAT_LABELS[c] ?? c, count: contagem[c] ?? 0 }))].map(({ key, label, count }) => (
          <button key={key} onClick={() => setFiltroCategoria(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${filtroCategoria === key ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
            {label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs leading-none ${filtroCategoria === key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Wrench size={18} className="text-primary" />
          <h3 className="font-semibold text-gray-800">Catálogo de Serviços</h3>
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{filtrados.length} serviços</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 size={24} className="animate-spin" /><span className="text-sm">Carregando...</span>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Wrench size={48} className="mb-3 text-gray-200" />
            <p className="text-sm font-medium">{busca || filtroCategoria !== 'TODAS' ? 'Nenhum serviço encontrado' : 'Nenhum serviço cadastrado'}</p>
            {!busca && filtroCategoria === 'TODAS' && <p className="text-xs mt-1">Clique em "Novo Serviço" para começar</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">Nome</th>
                  <th className="px-4 py-3 text-left">Categoria</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Preço Sugerido</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtrados.map((s) => (
                  <tr key={s.id} className={`hover:bg-gray-50 transition-colors ${!s.ativo ? 'opacity-55' : ''}`}>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Tag size={13} className="text-orange-400 flex-shrink-0" />
                        <span className={`text-sm ${s.ativo ? 'text-gray-800' : 'text-gray-400 line-through'}`}>{s.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CAT_COLORS[s.categoria] ?? 'bg-gray-100 text-gray-600'}`}>
                        {CAT_LABELS[s.categoria] ?? s.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-gray-700 whitespace-nowrap">{brl(s.precoSugerido)}</td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <button onClick={() => toggleAtivo(s)} disabled={toggling === s.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors disabled:opacity-50">
                        {toggling === s.id ? <Loader2 size={14} className="animate-spin text-gray-400" />
                          : s.ativo ? <><ToggleRight size={16} className="text-green-500" /><span className="text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Ativo</span></>
                          : <><ToggleLeft size={16} className="text-gray-400" /><span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Inativo</span></>}
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => abrirModalEditar(s)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-primary transition-colors" title="Editar">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => excluir(s)} disabled={deletando === s.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50" title="Excluir">
                          {deletando === s.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setModalAberto(false); setEditando(null) }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: 'var(--color-primary)' }}>
              <h2 className="text-white font-semibold text-base">{editando ? 'Editar Serviço' : 'Novo Serviço'}</h2>
              <button onClick={() => { setModalAberto(false); setEditando(null) }} className="text-white/60 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nome <span className="text-orange-500">*</span></label>
                <input {...register('nome', { required: 'Nome é obrigatório', minLength: { value: 2, message: 'Nome muito curto' } })}
                  placeholder="Ex: Troca de óleo e filtro"
                  className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.nome ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                {errors.nome && <p className="mt-1 text-xs text-red-500">{errors.nome.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Categoria <span className="text-orange-500">*</span></label>
                <select {...register('categoria', { required: true })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                  {CAT_ORDER.map((c) => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Preço Sugerido (R$) <span className="text-orange-500">*</span></label>
                <input type="number" step="0.01" min="0"
                  {...register('precoSugerido', { required: 'Preço é obrigatório', min: 0, valueAsNumber: true })}
                  placeholder="0,00"
                  className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.precoSugerido ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                {errors.precoSugerido && <p className="mt-1 text-xs text-red-500">{errors.precoSugerido.message}</p>}
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" {...register('ativo')} className="accent-orange-500 w-4 h-4" />
                <span className="text-sm text-gray-700">Serviço ativo (visível nas ordens de serviço)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setModalAberto(false); setEditando(null) }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors disabled:opacity-60">
                  {isSubmitting && <Loader2 size={15} className="animate-spin" />}
                  {editando ? 'Salvar' : 'Criar Serviço'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Aba: Personalização ──────────────────────────────────────────────────────

function TabPersonalizacao({ form, setForm, saving, onSalvar, fileRef, handleLogoUpload, removerLogo, handleCor, resetarPadrao }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-5">

        {/* Logo */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-primary-light">
              <Settings size={16} className="text-primary" />
            </div>
            <h3 className="font-bold text-gray-800 font-heading tracking-tight">Logo da Empresa</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
              {form.logoBase64 ? <img src={form.logoBase64} alt="Logo" className="w-full h-full object-cover" /> : <Wrench size={24} className="text-gray-300" />}
            </div>
            <div className="space-y-2">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <Upload size={14} /> Fazer upload
              </button>
              {form.logoBase64 && (
                <button type="button" onClick={removerLogo} className="text-xs text-red-400 hover:text-red-600 transition-colors">Remover logo</button>
              )}
              <p className="text-xs text-gray-400">PNG, JPG ou SVG · Máx. 500 KB</p>
            </div>
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

          <ColorPicker label="Cor Primária (sidebar)" value={form.corPrimaria}
            onChange={(v) => handleCor('corPrimaria', v)} paleta={PALETA_PRIMARIA} />
          <ColorPicker label="Cor Secundária (destaques e botões)" value={form.corSecundaria}
            onChange={(v) => handleCor('corSecundaria', v)} paleta={PALETA_SECUNDARIA} />

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 flex items-start gap-2">
            <Eye size={13} className="flex-shrink-0 mt-0.5" />
            As mudanças de cor são aplicadas em tempo real no preview ao lado.
          </div>
        </div>

        <button type="button" onClick={onSalvar} disabled={saving}
          className="btn-secondary w-full justify-center py-3 text-base flex items-center gap-2"
          style={{ backgroundColor: 'var(--color-secondary)' }}>
          {saving
            ? <><span className="animate-spin rounded-full w-4 h-4 border-2 border-white/30 border-t-white" /> Salvando...</>
            : <><Save size={17} /> Salvar Personalização</>}
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
          <p className="text-xs text-gray-400 text-center mt-3">Pré-visualização com as cores e logo selecionadas</p>
        </div>
        <div className="card p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-600">Cores selecionadas</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl shadow-sm flex-shrink-0" style={{ backgroundColor: form.corPrimaria }} />
            <div><p className="text-xs font-semibold text-gray-700">Primária</p><p className="text-xs text-gray-400 font-mono uppercase">{form.corPrimaria}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl shadow-sm flex-shrink-0" style={{ backgroundColor: form.corSecundaria }} />
            <div><p className="text-xs font-semibold text-gray-700">Secundária</p><p className="text-xs text-gray-400 font-mono uppercase">{form.corSecundaria}</p></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Aba: Usuários ────────────────────────────────────────────────────────────

function TabUsuarios() {
  return (
    <div className="max-w-2xl space-y-5">
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-primary-light">
            <UserCircle size={16} className="text-primary" />
          </div>
          <h3 className="font-bold text-gray-800 font-heading tracking-tight">Usuários do Sistema</h3>
        </div>
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: 'var(--color-primary)' }}>A</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">Administrador</p>
            <p className="text-xs text-gray-400">admin@oficina.com</p>
          </div>
          <span className="text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full flex-shrink-0">Admin</span>
        </div>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 flex items-start gap-2">
          <UserCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>Gerenciamento avançado de usuários e permissões estará disponível em breve.</span>
        </div>
      </div>
    </div>
  )
}

// ─── Configuracoes (principal) ────────────────────────────────────────────────

const EMPTY_FORM = {
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
  site: '',
  corPrimaria: '#1e3a5f',
  corSecundaria: '#f97316',
  logoBase64: null,
}

const ABAS = [
  { key: 'empresa',        label: 'Cadastro da Empresa', icon: Building2 },
  { key: 'servicos',       label: 'Serviços',            icon: Wrench },
  { key: 'personalizacao', label: 'Personalização',      icon: Palette },
  { key: 'usuarios',       label: 'Usuários',            icon: UserCircle },
]

export default function Configuracoes() {
  const { config: globalConfig, updateConfig } = useTheme()
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [abaAtiva, setAbaAtiva] = useState('empresa')
  const fileRef = useRef(null)

  useEffect(() => {
    api.get('/configuracao')
      .then((r) => setForm({ ...EMPTY_FORM, ...r.data, logoBase64: r.data.logoBase64 ?? null }))
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

  function resetarPadrao() {
    const defaults = { corPrimaria: '#1e3a5f', corSecundaria: '#f97316' }
    setForm((f) => ({ ...f, ...defaults }))
    updateConfig(defaults)
  }

  async function salvar() {
    setSaving(true)
    try {
      const { data } = await api.put('/configuracao', form)
      updateConfig(data)
      toast.success('Configurações salvas!')
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Erro ao salvar')
    } finally { setSaving(false) }
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
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit flex-wrap">
        {ABAS.map(({ key, label, icon: Icon }) => (
          <button key={key} type="button" onClick={() => setAbaAtiva(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              abaAtiva === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Conteúdo da aba */}
      {abaAtiva === 'empresa' && (
        <TabEmpresa form={form} setForm={setForm} saving={saving} onSalvar={salvar} />
      )}
      {abaAtiva === 'servicos' && (
        <TabServicos />
      )}
      {abaAtiva === 'personalizacao' && (
        <TabPersonalizacao
          form={form} setForm={setForm} saving={saving} onSalvar={salvar}
          fileRef={fileRef} handleLogoUpload={handleLogoUpload}
          removerLogo={removerLogo} handleCor={handleCor} resetarPadrao={resetarPadrao}
        />
      )}
      {abaAtiva === 'usuarios' && (
        <TabUsuarios />
      )}
    </div>
  )
}
