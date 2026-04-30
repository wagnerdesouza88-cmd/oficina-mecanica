import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import axios from 'axios'
import {
  Car, Plus, Search, X, Pencil, Trash2, Loader2,
  User, ChevronDown, AlertCircle,
} from 'lucide-react'
import api from '../services/api'

// ─── Constantes ───────────────────────────────────────────────────────────────

const MARCAS_PRIORITARIAS = [
  'Chevrolet', 'Fiat', 'Ford', 'Volkswagen', 'Toyota', 'Honda',
  'Hyundai', 'Renault', 'Jeep', 'Nissan', 'Mitsubishi', 'Peugeot',
  'Citroën', 'BMW', 'Mercedes-Benz', 'Audi', 'Kia', 'Suzuki',
  'Land Rover', 'Volvo',
]

const CORES = [
  { nome: 'Branco',   hex: '#f0f0f0' },
  { nome: 'Preto',    hex: '#1a1a1a' },
  { nome: 'Prata',    hex: '#C0C0C0' },
  { nome: 'Cinza',    hex: '#808080' },
  { nome: 'Vermelho', hex: '#DC2626' },
  { nome: 'Azul',     hex: '#2563EB' },
  { nome: 'Verde',    hex: '#16A34A' },
  { nome: 'Amarelo',  hex: '#EAB308' },
  { nome: 'Laranja',  hex: '#EA580C' },
  { nome: 'Marrom',   hex: '#92400E' },
  { nome: 'Bege',     hex: '#D4B896' },
  { nome: 'Dourado',  hex: '#B45309' },
  { nome: 'Vinho',    hex: '#7F1D1D' },
]

const PROXIMO_ANO = new Date().getFullYear() + 1
const ANOS = Array.from({ length: PROXIMO_ANO - 1950 + 1 }, (_, i) => PROXIMO_ANO - i)

const FIPE_BASE = 'https://parallelum.com.br/fipe/api/v1/carros'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function norm(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

function isPrioritaria(nome) {
  return MARCAS_PRIORITARIAS.some((p) => norm(p) === norm(nome))
}

function sortMarcas(lista) {
  return [...lista].sort((a, b) => {
    const ai = MARCAS_PRIORITARIAS.findIndex((p) => norm(p) === norm(a.nome))
    const bi = MARCAS_PRIORITARIAS.findIndex((p) => norm(p) === norm(b.nome))
    if (ai !== -1 && bi !== -1) return ai - bi
    if (ai !== -1) return -1
    if (bi !== -1) return 1
    return a.nome.localeCompare(b.nome, 'pt-BR')
  })
}

function maskPlaca(v) {
  const clean = v.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 7)
  if (clean.length <= 3) return clean
  return `${clean.slice(0, 3)}-${clean.slice(3)}`
}

function validarPlaca(v) {
  const clean = v.replace(/[^A-Z0-9]/gi, '').toUpperCase()
  return (
    /^[A-Z]{3}[0-9]{4}$/.test(clean) ||
    /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(clean) ||
    'Placa inválida (ex: ABC-1234 ou ABC-1D23)'
  )
}

// ─── ClienteCombobox ──────────────────────────────────────────────────────────

function ClienteCombobox({ clientes, value, onChange }) {
  const [busca, setBusca] = useState('')
  const [aberto, setAberto] = useState(false)
  const ref = useRef(null)
  const selecionado = clientes.find((c) => c.id === value)
  const filtrados = clientes.filter((c) => norm(c.nome).includes(norm(busca)))

  useEffect(() => {
    function fechar(e) { if (ref.current && !ref.current.contains(e.target)) setAberto(false) }
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [])

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setAberto((a) => !a)}
        className={`flex items-center gap-2 w-full px-3 py-2 text-sm border rounded-xl cursor-pointer bg-white transition-colors border-gray-200 ${aberto ? 'ring-2 ring-[#1e3a5f]/30 border-[#1e3a5f]' : ''}`}
      >
        <User size={14} className="text-gray-400 flex-shrink-0" />
        {selecionado ? (
          <>
            <span className="flex-1 text-gray-800">{selecionado.nome}</span>
            <button type="button" onClick={(e) => { e.stopPropagation(); onChange('') }} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
          </>
        ) : (
          <>
            <span className="flex-1 text-gray-400">Selecione o cliente...</span>
            <ChevronDown size={14} className="text-gray-400" />
          </>
        )}
      </div>
      {aberto && (
        <div className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input autoFocus type="text" placeholder="Buscar cliente..." value={busca}
              onChange={(e) => setBusca(e.target.value)} onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30" />
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {filtrados.length === 0
              ? <li className="px-3 py-3 text-sm text-gray-400 text-center">Nenhum cliente encontrado</li>
              : filtrados.map((c) => (
                <li key={c.id} onClick={() => { onChange(c.id); setAberto(false); setBusca('') }}
                  className={`flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-50 ${c.id === value ? 'bg-blue-50 text-[#1e3a5f] font-medium' : 'text-gray-700'}`}>
                  <div className="w-6 h-6 rounded-full bg-[#1e3a5f] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {c.nome.charAt(0).toUpperCase()}
                  </div>
                  {c.nome}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── MarcaCombobox ────────────────────────────────────────────────────────────

function MarcaCombobox({ marcas, loading, value, onChange }) {
  const [busca, setBusca] = useState('')
  const [aberto, setAberto] = useState(false)
  const ref = useRef(null)

  const selecionada = marcas.find((m) => m.codigo === value?.codigo)

  const filtradas = sortMarcas(
    marcas.filter((m) => norm(m.nome).includes(norm(busca)))
  )
  const prioritarias = filtradas.filter((m) => isPrioritaria(m.nome))
  const outras = filtradas.filter((m) => !isPrioritaria(m.nome))

  useEffect(() => {
    function fechar(e) { if (ref.current && !ref.current.contains(e.target)) setAberto(false) }
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [])

  function selecionar(m) {
    onChange(m)
    setBusca('')
    setAberto(false)
  }

  function limpar(e) {
    e.stopPropagation()
    onChange(null)
    setBusca('')
  }

  const itemClass = (m) =>
    `px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${
      m.codigo === value?.codigo ? 'bg-blue-50 text-[#1e3a5f] font-medium' : 'text-gray-700'
    }`

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setAberto((a) => !a)}
        className={`flex items-center gap-2 w-full px-3 py-2 text-sm border rounded-xl cursor-pointer bg-white transition-colors border-gray-200 ${aberto ? 'ring-2 ring-[#1e3a5f]/30 border-[#1e3a5f]' : ''}`}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin text-gray-400 flex-shrink-0" />
        ) : (
          <Car size={14} className="text-gray-400 flex-shrink-0" />
        )}
        {selecionada ? (
          <>
            <span className="flex-1 text-gray-800 font-medium">{selecionada.nome}</span>
            <button type="button" onClick={limpar} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
          </>
        ) : (
          <>
            <span className="flex-1 text-gray-400">{loading ? 'Carregando marcas...' : 'Selecione a marca...'}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </>
        )}
      </div>

      {aberto && !loading && (
        <div className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input autoFocus type="text" placeholder="Buscar marca..." value={busca}
              onChange={(e) => setBusca(e.target.value)} onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30" />
          </div>
          <ul className="max-h-56 overflow-y-auto">
            {filtradas.length === 0 ? (
              <li className="px-3 py-3 text-sm text-gray-400 text-center">Nenhuma marca encontrada</li>
            ) : (
              <>
                {prioritarias.length > 0 && (
                  <>
                    {!busca && (
                      <li className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50">
                        Principais
                      </li>
                    )}
                    {prioritarias.map((m) => (
                      <li key={m.codigo} onClick={() => selecionar(m)} className={itemClass(m)}>{m.nome}</li>
                    ))}
                  </>
                )}
                {outras.length > 0 && (
                  <>
                    {prioritarias.length > 0 && !busca && (
                      <li className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50 border-t border-gray-100">
                        Outras
                      </li>
                    )}
                    {outras.map((m) => (
                      <li key={m.codigo} onClick={() => selecionar(m)} className={itemClass(m)}>{m.nome}</li>
                    ))}
                  </>
                )}
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── ModeloCombobox ───────────────────────────────────────────────────────────

function ModeloCombobox({ modelos, loading, value, onChange, disabled }) {
  const [busca, setBusca] = useState('')
  const [aberto, setAberto] = useState(false)
  const ref = useRef(null)

  const filtrados = modelos.filter((m) => norm(m.nome).includes(norm(busca)))

  useEffect(() => {
    function fechar(e) { if (ref.current && !ref.current.contains(e.target)) setAberto(false) }
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [])

  // Reset busca when value is cleared externally
  useEffect(() => { if (!value) setBusca('') }, [value])

  function selecionar(m) {
    onChange(m.nome)
    setBusca('')
    setAberto(false)
  }

  const placeholder = disabled
    ? 'Selecione a marca primeiro'
    : loading
    ? 'Buscando modelos...'
    : modelos.length === 0
    ? 'Nenhum modelo disponível'
    : 'Selecione o modelo...'

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => !disabled && !loading && modelos.length > 0 && setAberto((a) => !a)}
        className={`flex items-center gap-2 w-full px-3 py-2 text-sm border rounded-xl bg-white transition-colors border-gray-200 ${
          disabled || loading || modelos.length === 0
            ? 'opacity-60 cursor-not-allowed'
            : 'cursor-pointer ' + (aberto ? 'ring-2 ring-[#1e3a5f]/30 border-[#1e3a5f]' : 'hover:border-gray-300')
        }`}
      >
        {loading
          ? <Loader2 size={14} className="animate-spin text-gray-400 flex-shrink-0" />
          : <Car size={14} className="text-gray-400 flex-shrink-0" />
        }
        {value ? (
          <>
            <span className="flex-1 text-gray-800 truncate">{value}</span>
            {!disabled && !loading && (
              <button type="button" onClick={(e) => { e.stopPropagation(); onChange('') }} className="text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </>
        ) : (
          <>
            <span className="flex-1 text-gray-400">{placeholder}</span>
            {!disabled && !loading && modelos.length > 0 && <ChevronDown size={14} className="text-gray-400" />}
          </>
        )}
      </div>

      {aberto && (
        <div className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input autoFocus type="text" placeholder={`Buscar entre ${modelos.length} modelos...`}
              value={busca} onChange={(e) => setBusca(e.target.value)} onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30" />
          </div>
          <ul className="max-h-56 overflow-y-auto">
            {filtrados.length === 0
              ? <li className="px-3 py-3 text-sm text-gray-400 text-center">Nenhum modelo encontrado</li>
              : filtrados.map((m) => (
                <li key={m.codigo} onClick={() => selecionar(m)}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${value === m.nome ? 'bg-blue-50 text-[#1e3a5f] font-medium' : 'text-gray-700'}`}>
                  {m.nome}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── Veiculos (principal) ─────────────────────────────────────────────────────

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [deletando, setDeletando] = useState(null)

  // FIPE
  const [marcasFIPE, setMarcasFIPE] = useState([])
  const [loadingMarcas, setLoadingMarcas] = useState(true)
  const [modelosFIPE, setModelosFIPE] = useState([])
  const [loadingModelos, setLoadingModelos] = useState(false)

  // Seleções dos comboboxes
  const [clienteId, setClienteId] = useState('')
  const [marcaSelecionada, setMarcaSelecionada] = useState(null)

  const {
    register, handleSubmit, reset, setValue, watch,
    formState: { errors, isSubmitting },
  } = useForm()

  const modeloWatch = watch('modelo')

  // Carrega dados da tela + FIPE em paralelo
  useEffect(() => {
    async function carregar() {
      try {
        const [rv, rc] = await Promise.all([api.get('/veiculos'), api.get('/clientes')])
        setVeiculos(rv.data)
        setClientes(rc.data)
      } catch { toast.error('Erro ao carregar dados') }
      finally { setLoading(false) }
    }
    async function carregarMarcas() {
      try {
        const { data } = await axios.get(`${FIPE_BASE}/marcas`)
        setMarcasFIPE(sortMarcas(data))
      } catch { toast.error('Erro ao carregar marcas da FIPE') }
      finally { setLoadingMarcas(false) }
    }
    carregar()
    carregarMarcas()
  }, [])

  async function buscarModelos(codigoMarca, modeloPendente = '') {
    setLoadingModelos(true)
    setModelosFIPE([])
    try {
      const { data } = await axios.get(`${FIPE_BASE}/marcas/${codigoMarca}/modelos`)
      setModelosFIPE(data.modelos ?? [])
      if (modeloPendente) {
        const match = data.modelos?.find((m) => norm(m.nome) === norm(modeloPendente))
        setValue('modelo', match ? match.nome : modeloPendente)
      }
    } catch { toast.error('Erro ao buscar modelos') }
    finally { setLoadingModelos(false) }
  }

  function handleMarcaChange(marca) {
    setMarcaSelecionada(marca)
    setValue('marca', marca ? marca.nome : '')
    setValue('modelo', '')
    setModelosFIPE([])
    if (marca) buscarModelos(marca.codigo)
  }

  function selecionarCliente(id) {
    setClienteId(id)
    setValue('clienteId', id)
  }

  async function abrirModalCriar() {
    setEditando(null)
    setClienteId('')
    setMarcaSelecionada(null)
    setModelosFIPE([])
    reset({ placa: '', marca: '', modelo: '', ano: PROXIMO_ANO - 1, cor: '', clienteId: '' })
    setModalAberto(true)
  }

  async function abrirModalEditar(v) {
    setEditando(v)
    setClienteId(v.clienteId)
    setMarcaSelecionada(null)
    setModelosFIPE([])
    reset({
      placa: maskPlaca(v.placa),
      marca: v.marca,
      modelo: v.modelo,
      ano: v.ano,
      cor: v.cor,
      clienteId: v.clienteId,
    })
    setModalAberto(true)

    // Tenta recuperar a marca FIPE pelo nome
    const marcaFIPE = marcasFIPE.find((m) => norm(m.nome) === norm(v.marca))
    if (marcaFIPE) {
      setMarcaSelecionada(marcaFIPE)
      buscarModelos(marcaFIPE.codigo, v.modelo)
    }
  }

  function fecharModal() {
    setModalAberto(false)
    setEditando(null)
    setClienteId('')
    setMarcaSelecionada(null)
    setModelosFIPE([])
  }

  async function onSubmit(data) {
    if (!data.clienteId) { toast.error('Selecione um cliente'); return }
    if (!data.marca)    { toast.error('Selecione uma marca'); return }
    if (!data.modelo)   { toast.error('Selecione um modelo'); return }
    try {
      if (editando) {
        await api.put(`/veiculos/${editando.id}`, data)
        toast.success('Veículo atualizado!')
      } else {
        await api.post('/veiculos', data)
        toast.success('Veículo cadastrado!')
      }
      fecharModal()
      const [rv, rc] = await Promise.all([api.get('/veiculos'), api.get('/clientes')])
      setVeiculos(rv.data)
      setClientes(rc.data)
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Erro ao salvar veículo')
    }
  }

  async function excluir(v) {
    if (!window.confirm(`Excluir o veículo "${v.placa} — ${v.marca} ${v.modelo}"?`)) return
    setDeletando(v.id)
    try {
      await api.delete(`/veiculos/${v.id}`)
      toast.success('Veículo excluído')
      setVeiculos((prev) => prev.filter((x) => x.id !== v.id))
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Erro ao excluir veículo')
    } finally { setDeletando(null) }
  }

  const filtrados = veiculos.filter(
    (v) =>
      v.placa.toLowerCase().includes(busca.toLowerCase()) ||
      v.marca.toLowerCase().includes(busca.toLowerCase()) ||
      v.modelo.toLowerCase().includes(busca.toLowerCase()) ||
      v.cliente.nome.toLowerCase().includes(busca.toLowerCase())
  )

  const corAtual = CORES.find((c) => c.nome === watch('cor'))

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar por placa, modelo ou cliente..." value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]" />
        </div>
        <button onClick={abrirModalCriar}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors">
          <Plus size={16} /> Novo Veículo
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Car size={18} className="text-[#1e3a5f]" />
          <h3 className="font-semibold text-gray-800">Todos os veículos</h3>
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {filtrados.length} registros
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 size={24} className="animate-spin" /><span className="text-sm">Carregando...</span>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Car size={48} className="mb-3 text-gray-200" />
            <p className="text-sm font-medium">{busca ? 'Nenhum veículo encontrado' : 'Nenhum veículo cadastrado'}</p>
            {!busca && <p className="text-xs mt-1">Clique em "Novo Veículo" para começar</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3 text-left">Placa</th>
                  <th className="px-6 py-3 text-left">Marca / Modelo</th>
                  <th className="px-6 py-3 text-left">Ano</th>
                  <th className="px-6 py-3 text-left">Cor</th>
                  <th className="px-6 py-3 text-left">Proprietário</th>
                  <th className="px-6 py-3 text-left">Cadastro</th>
                  <th className="px-6 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtrados.map((v) => {
                  const cor = CORES.find((c) => c.nome === v.cor)
                  return (
                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3">
                        <span className="font-mono font-bold text-[#1e3a5f] bg-blue-50 px-2.5 py-1 rounded-lg text-xs tracking-widest">
                          {maskPlaca(v.placa)}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-medium text-gray-800">
                        {v.marca} <span className="text-gray-500 font-normal">{v.modelo}</span>
                      </td>
                      <td className="px-6 py-3 text-gray-600">{v.ano}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 rounded-full border border-gray-300 flex-shrink-0"
                            style={{ backgroundColor: cor?.hex ?? '#ccc' }} />
                          <span className="text-gray-600">{v.cor}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#1e3a5f] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {v.cliente.nome.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-gray-600">{v.cliente.nome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-gray-400 text-xs">
                        {new Date(v.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => abrirModalEditar(v)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-[#1e3a5f] transition-colors" title="Editar">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => excluir(v)} disabled={deletando === v.id}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50" title="Excluir">
                            {deletando === v.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={fecharModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[92vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#1e3a5f] flex-shrink-0">
              <h2 className="text-white font-semibold text-base">
                {editando ? 'Editar Veículo' : 'Novo Veículo'}
              </h2>
              <button onClick={fecharModal} className="text-white/60 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4 overflow-y-auto">

              {/* Cliente */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Cliente <span className="text-orange-500">*</span>
                </label>
                <input type="hidden" {...register('clienteId')} />
                <ClienteCombobox clientes={clientes} value={clienteId} onChange={selecionarCliente} />
              </div>

              {/* Placa + Ano */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Placa <span className="text-orange-500">*</span>
                  </label>
                  <input
                    {...register('placa', { required: 'Placa é obrigatória', validate: validarPlaca })}
                    placeholder="ABC-1234"
                    maxLength={8}
                    onChange={(e) => setValue('placa', maskPlaca(e.target.value), { shouldValidate: true })}
                    className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] font-mono tracking-widest uppercase transition-colors ${
                      errors.placa ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  {errors.placa && <p className="mt-1 text-xs text-red-500">{errors.placa.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Ano <span className="text-orange-500">*</span>
                  </label>
                  <select
                    {...register('ano', { required: 'Ano é obrigatório', valueAsNumber: true })}
                    className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] bg-white transition-colors ${
                      errors.ano ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Selecione...</option>
                    {ANOS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                  {errors.ano && <p className="mt-1 text-xs text-red-500">{errors.ano.message}</p>}
                </div>
              </div>

              {/* Marca */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Marca <span className="text-orange-500">*</span>
                </label>
                <input type="hidden" {...register('marca', { required: 'Marca é obrigatória' })} />
                <MarcaCombobox
                  marcas={marcasFIPE}
                  loading={loadingMarcas}
                  value={marcaSelecionada}
                  onChange={handleMarcaChange}
                />
                {errors.marca && <p className="mt-1 text-xs text-red-500">{errors.marca.message}</p>}
              </div>

              {/* Modelo */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Modelo <span className="text-orange-500">*</span>
                </label>
                <input type="hidden" {...register('modelo', { required: 'Modelo é obrigatório' })} />
                <ModeloCombobox
                  modelos={modelosFIPE}
                  loading={loadingModelos}
                  value={modeloWatch}
                  onChange={(v) => setValue('modelo', v, { shouldValidate: true })}
                  disabled={!marcaSelecionada}
                />
                {errors.modelo && <p className="mt-1 text-xs text-red-500">{errors.modelo.message}</p>}
              </div>

              {/* Cor */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Cor <span className="text-orange-500">*</span>
                </label>
                <div className="relative">
                  {corAtual && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-gray-300 pointer-events-none z-10"
                      style={{ backgroundColor: corAtual.hex }} />
                  )}
                  <select
                    {...register('cor', { required: 'Cor é obrigatória' })}
                    className={`w-full py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] bg-white transition-colors appearance-none ${
                      corAtual ? 'pl-9 pr-8' : 'px-3'
                    } ${errors.cor ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  >
                    <option value="">Selecione a cor...</option>
                    {CORES.map((c) => <option key={c.nome} value={c.nome}>{c.nome}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {errors.cor && <p className="mt-1 text-xs text-red-500">{errors.cor.message}</p>}
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={fecharModal}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors disabled:opacity-60">
                  {isSubmitting && <Loader2 size={15} className="animate-spin" />}
                  {editando ? 'Salvar alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
