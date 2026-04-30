import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  ClipboardList, Plus, Search, X, Pencil, Trash2, Loader2,
  Car, ChevronDown, ChevronRight, User, DollarSign, Calendar,
  CalendarCheck, CalendarClock, Wrench, PlusCircle, Tag, Package,
  Printer, FileText,
} from 'lucide-react'
import api from '../services/api'
import { useTheme } from '../context/ThemeContext'
import { imprimirOS, imprimirRecibo } from '../utils/print'

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  ABERTA:          { label: 'Aberta',        badge: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',     select: 'bg-blue-100 text-blue-700'     },
  EM_ANDAMENTO:    { label: 'Em andamento',  badge: 'bg-orange-100 text-orange-700 ring-1 ring-orange-200', select: 'bg-orange-100 text-orange-700'  },
  AGUARDANDO_PECA: { label: 'Aguard. peça',  badge: 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200', select: 'bg-yellow-100 text-yellow-700'  },
  CONCLUIDA:       { label: 'Concluída',     badge: 'bg-green-100 text-green-700 ring-1 ring-green-200',   select: 'bg-green-100 text-green-700'    },
  CANCELADA:       { label: 'Cancelada',     badge: 'bg-red-100 text-red-700 ring-1 ring-red-200',         select: 'bg-red-100 text-red-700'        },
}

const FILTROS = [
  { key: 'TODAS', label: 'Todas' },
  ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ key: k, label: v.label })),
]

const CAT_ORDER = [
  'PREVENTIVA',
  'FREIOS',
  'SUSPENSAO_DIRECAO',
  'MOTOR',
  'ELETRICA',
  'CAMBIO_TRANSMISSAO',
  'FUNILARIA_PINTURA',
]

const CAT_LABELS = {
  PREVENTIVA:        'Manutenção Preventiva',
  FREIOS:            'Freios',
  SUSPENSAO_DIRECAO: 'Suspensão e Direção',
  MOTOR:             'Motor',
  ELETRICA:          'Elétrica',
  CAMBIO_TRANSMISSAO:'Câmbio e Transmissão',
  FUNILARIA_PINTURA: 'Funilaria e Pintura',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toInputDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

function todayInput() {
  return toInputDate(new Date())
}

function brl(val) {
  return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ─── StatusSelect (inline na tabela) ─────────────────────────────────────────

function StatusSelect({ ordem, onUpdate }) {
  const [saving, setSaving] = useState(false)
  const cfg = STATUS_CONFIG[ordem.status]

  async function handleChange(e) {
    const novoStatus = e.target.value
    setSaving(true)
    const tid = toast.loading('Atualizando status...')
    try {
      const { data } = await api.patch(`/ordens/${ordem.id}/status`, { status: novoStatus })
      onUpdate(data)
      toast.success('Status atualizado!', { id: tid })
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Erro ao atualizar status', { id: tid })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative inline-flex items-center">
      <select
        value={ordem.status}
        onChange={handleChange}
        disabled={saving}
        className={`text-xs font-medium pl-2.5 pr-6 py-1 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 transition-opacity ${cfg.select} ${saving ? 'opacity-50 cursor-wait' : 'hover:opacity-80'}`}
      >
        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
          <option key={k} value={k}>{v.label}</option>
        ))}
      </select>
      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
        {saving
          ? <Loader2 size={10} className="animate-spin text-current" />
          : <ChevronDown size={10} className="text-current opacity-60" />}
      </span>
    </div>
  )
}

// ─── VeiculoCombobox ──────────────────────────────────────────────────────────

function VeiculoCombobox({ veiculos, value, onChange }) {
  const [busca, setBusca] = useState('')
  const [aberto, setAberto] = useState(false)
  const ref = useRef(null)
  const selecionado = veiculos.find((v) => v.id === value)

  function norm(s) { return s.toLowerCase() }
  const filtrados = veiculos.filter(
    (v) =>
      norm(v.placa).includes(norm(busca)) ||
      norm(v.marca).includes(norm(busca)) ||
      norm(v.modelo).includes(norm(busca)) ||
      norm(v.cliente.nome).includes(norm(busca))
  )

  useEffect(() => {
    function fechar(e) { if (ref.current && !ref.current.contains(e.target)) setAberto(false) }
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [])

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setAberto((a) => !a)}
        className={`flex items-center gap-2 w-full px-3 py-2 text-sm border rounded-xl cursor-pointer bg-white border-gray-200 ${aberto ? 'ring-2 ring-[#1e3a5f]/30 border-[#1e3a5f]' : ''}`}
      >
        <Car size={14} className="text-gray-400 flex-shrink-0" />
        {selecionado ? (
          <>
            <span className="flex-1 text-gray-800">
              <span className="font-mono font-bold text-[#1e3a5f]">{selecionado.placa}</span>
              {' — '}{selecionado.marca} {selecionado.modelo}
            </span>
            <button type="button" onClick={(e) => { e.stopPropagation(); onChange('') }} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
          </>
        ) : (
          <>
            <span className="flex-1 text-gray-400">Selecione o veículo...</span>
            <ChevronDown size={14} className="text-gray-400" />
          </>
        )}
      </div>

      {selecionado && (
        <div className="mt-1.5 flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg text-xs text-[#1e3a5f]">
          <User size={12} />
          <span className="font-medium">Proprietário:</span>
          <span>{selecionado.cliente.nome}</span>
        </div>
      )}

      {aberto && (
        <div className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input autoFocus type="text" placeholder="Buscar por placa, modelo ou cliente..."
              value={busca} onChange={(e) => setBusca(e.target.value)} onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30" />
          </div>
          <ul className="max-h-52 overflow-y-auto">
            {filtrados.length === 0
              ? <li className="px-3 py-3 text-sm text-gray-400 text-center">Nenhum veículo encontrado</li>
              : filtrados.map((v) => (
                <li key={v.id} onClick={() => { onChange(v.id); setAberto(false); setBusca('') }}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-50 ${v.id === value ? 'bg-blue-50' : ''}`}>
                  <span className="font-mono font-bold text-[#1e3a5f] bg-blue-50 px-2 py-0.5 rounded text-xs">{v.placa}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 truncate">{v.marca} {v.modelo} <span className="text-gray-400">({v.ano})</span></p>
                    <p className="text-xs text-gray-400">{v.cliente.nome}</p>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── Catálogo de Serviços ─────────────────────────────────────────────────────

function CatalogoServicos({ tiposServico, itensSelecionados, onToggle }) {
  const [abertos, setAbertos] = useState({})
  const [busca, setBusca] = useState('')

  const porCategoria = CAT_ORDER.reduce((acc, cat) => {
    let items = tiposServico.filter((t) => t.categoria === cat)
    if (busca) {
      const q = busca.toLowerCase()
      items = items.filter((t) => t.nome.toLowerCase().includes(q))
    }
    if (items.length) acc[cat] = items
    return acc
  }, {})

  function toggle(cat) {
    setAbertos((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  function isSelected(tipoId) {
    return itensSelecionados.some((i) => i.tipoServicoId === tipoId)
  }

  const totalCats = Object.keys(porCategoria).length

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
        <Wrench size={13} className="text-[#1e3a5f]" />
        <span className="text-xs font-semibold text-gray-700">Catálogo de Serviços</span>
        <div className="ml-auto relative">
          <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value)
              if (e.target.value) setAbertos(CAT_ORDER.reduce((a, c) => ({ ...a, [c]: true }), {}))
            }}
            placeholder="Filtrar serviços..."
            className="pl-6 pr-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/40 w-40"
          />
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
        {totalCats === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">Nenhum serviço encontrado</p>
        )}
        {CAT_ORDER.filter((c) => porCategoria[c]).map((cat) => {
          const items = porCategoria[cat]
          const selectedCount = items.filter((t) => isSelected(t.id)).length
          const isOpen = abertos[cat] ?? false

          return (
            <div key={cat}>
              <button
                type="button"
                onClick={() => toggle(cat)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
              >
                <span className="text-gray-400">
                  {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </span>
                <span className="text-xs font-medium text-gray-700 flex-1">{CAT_LABELS[cat]}</span>
                {selectedCount > 0 && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">
                    {selectedCount}
                  </span>
                )}
                <span className="text-xs text-gray-400">{items.length} serviços</span>
              </button>

              {isOpen && (
                <div className="bg-gray-50/50 pb-1">
                  {items.map((tipo) => {
                    const sel = isSelected(tipo.id)
                    return (
                      <label
                        key={tipo.id}
                        className={`flex items-center gap-2.5 px-5 py-1.5 cursor-pointer hover:bg-white transition-colors ${sel ? 'bg-orange-50/60' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={sel}
                          onChange={() => onToggle(tipo)}
                          className="accent-orange-500 w-3.5 h-3.5 flex-shrink-0"
                        />
                        <span className={`flex-1 text-xs ${sel ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                          {tipo.nome}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          {brl(tipo.precoSugerido)}
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Ordens (principal) ───────────────────────────────────────────────────────

// ─── ProdutoBusca ─────────────────────────────────────────────────────────────

function ProdutoBuscaInput({ produtos, onAdicionar }) {
  const [busca, setBusca] = useState('')
  const [selecionado, setSelecionado] = useState(null)
  const [qtd, setQtd] = useState('1')
  const [aberto, setAberto] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function fechar(e) { if (ref.current && !ref.current.contains(e.target)) setAberto(false) }
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [])

  const filtrados = busca.length >= 1
    ? produtos.filter(
        (p) =>
          p.nome.toLowerCase().includes(busca.toLowerCase()) ||
          p.codigo.toLowerCase().includes(busca.toLowerCase())
      ).slice(0, 10)
    : []

  function selecionar(p) {
    setSelecionado(p)
    setBusca(p.nome)
    setAberto(false)
    setQtd('1')
  }

  function adicionar() {
    if (!selecionado) return
    const quantidade = parseFloat(qtd)
    if (!quantidade || quantidade <= 0) return toast.error('Quantidade inválida')
    onAdicionar({
      _id: `peca_${selecionado.id}_${Date.now()}`,
      produtoId: selecionado.id,
      nome: selecionado.nome,
      codigo: selecionado.codigo,
      unidade: selecionado.unidade,
      precoUnitario: Number(selecionado.precoVenda),
      quantidade,
      subtotal: Number(selecionado.precoVenda) * quantidade,
    })
    setSelecionado(null)
    setBusca('')
    setQtd('1')
  }

  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
      <div ref={ref} className="relative flex gap-2">
        <div className="flex-1 relative">
          <Package size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setSelecionado(null); setAberto(true) }}
            onFocus={() => busca && setAberto(true)}
            placeholder="Buscar peça por nome ou código..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white"
          />
          {aberto && filtrados.length > 0 && (
            <ul className="absolute z-40 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-44 overflow-y-auto">
              {filtrados.map((p) => (
                <li key={p.id} onClick={() => selecionar(p)}
                  className="flex items-center gap-2 px-3 py-2 text-xs cursor-pointer hover:bg-gray-50">
                  <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 flex-shrink-0">{p.codigo}</span>
                  <span className="flex-1 text-gray-800 truncate">{p.nome}</span>
                  <span className="text-gray-400 flex-shrink-0">{Number(p.precoVenda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / {p.unidade}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="w-24">
          <input
            type="number"
            step="0.001"
            min="0.001"
            value={qtd}
            onChange={(e) => setQtd(e.target.value)}
            placeholder="Qtd"
            className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none text-right bg-white"
          />
        </div>
        <button type="button" onClick={adicionar} disabled={!selecionado}
          className="px-3 py-1.5 text-xs bg-[#1e3a5f] hover:bg-[#162d4a] text-white rounded-lg transition-colors font-medium disabled:opacity-40">
          Adicionar
        </button>
      </div>
      {selecionado && (
        <p className="text-xs text-blue-700">
          <strong>{selecionado.nome}</strong> — Estoque: {Number(selecionado.quantidadeAtual).toLocaleString('pt-BR', { minimumFractionDigits: 3 })} {selecionado.unidade}
          {Number(selecionado.quantidadeAtual) <= 0 && <span className="ml-1 text-red-500 font-semibold">SEM ESTOQUE</span>}
        </p>
      )}
    </div>
  )
}

// ─── Ordens (principal) ───────────────────────────────────────────────────────

export default function Ordens() {
  const { config } = useTheme()
  const [ordens, setOrdens] = useState([])
  const [veiculos, setVeiculos] = useState([])
  const [tiposServico, setTiposServico] = useState([])
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('TODAS')
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [veiculoId, setVeiculoId] = useState('')
  const [deletando, setDeletando] = useState(null)

  // Itens da OS selecionados no formulário
  const [itensSelecionados, setItensSelecionados] = useState([])
  // Peças utilizadas
  const [pecasSelecionadas, setPecasSelecionadas] = useState([])
  // Serviço personalizado inline
  const [customAberto, setCustomAberto] = useState(false)
  const [customNome, setCustomNome] = useState('')
  const [customPreco, setCustomPreco] = useState('')
  // Desconto
  const [descTipo, setDescTipo] = useState('R$')
  const [descValor, setDescValor] = useState('')

  const {
    register, handleSubmit, reset, setValue, watch,
    formState: { errors, isSubmitting },
  } = useForm()

  const statusWatch = watch('status')

  // Auto-preenche dataEntrega ao concluir no formulário
  useEffect(() => {
    if (statusWatch === 'CONCLUIDA') {
      setValue('dataEntrega', todayInput())
    }
  }, [statusWatch, setValue])

  // Atualiza total automaticamente conforme serviços, peças e desconto
  useEffect(() => {
    const subtotalServicos = itensSelecionados.reduce((acc, i) => acc + Number(i.preco), 0)
    const subtotalPecas = pecasSelecionadas.reduce((acc, p) => acc + Number(p.subtotal), 0)
    const subtotal = subtotalServicos + subtotalPecas
    const dv = Number(descValor) || 0
    const desconto = descTipo === 'R$' ? dv : (subtotal * dv / 100)
    const total = Math.max(0, subtotal - desconto)
    setValue('total', Number(total.toFixed(2)))
  }, [itensSelecionados, pecasSelecionadas, descTipo, descValor, setValue])

  async function carregarDados() {
    try {
      const [ro, rv, rt, rp] = await Promise.all([
        api.get('/ordens'),
        api.get('/veiculos'),
        api.get('/tipos-servico'),
        api.get('/produtos'),
      ])
      setOrdens(ro.data)
      setVeiculos(rv.data)
      setTiposServico(rt.data)
      setProdutos(rp.data)
    } catch { toast.error('Erro ao carregar dados') }
    finally { setLoading(false) }
  }

  useEffect(() => { carregarDados() }, [])

  function handleStatusUpdate(ordemAtualizada) {
    setOrdens((prev) => prev.map((o) => o.id === ordemAtualizada.id ? ordemAtualizada : o))
  }

  function selecionarVeiculo(id) {
    setVeiculoId(id)
    setValue('veiculoId', id)
  }

  function toggleServico(tipo) {
    const jasel = itensSelecionados.some((i) => i.tipoServicoId === tipo.id)
    if (jasel) {
      setItensSelecionados((prev) => prev.filter((i) => i.tipoServicoId !== tipo.id))
    } else {
      setItensSelecionados((prev) => [
        ...prev,
        { _id: tipo.id, tipoServicoId: tipo.id, nome: tipo.nome, preco: Number(tipo.precoSugerido) },
      ])
    }
  }

  function removerItem(_id) {
    setItensSelecionados((prev) => prev.filter((i) => i._id !== _id))
  }

  function adicionarCustom() {
    if (!customNome.trim()) return toast.error('Informe o nome do serviço')
    const preco = parseFloat(customPreco) || 0
    setItensSelecionados((prev) => [
      ...prev,
      { _id: `custom_${Date.now()}`, tipoServicoId: null, nome: customNome.trim(), preco },
    ])
    setCustomNome('')
    setCustomPreco('')
    setCustomAberto(false)
  }

  function resetFormState() {
    setVeiculoId('')
    setItensSelecionados([])
    setPecasSelecionadas([])
    setCustomAberto(false)
    setCustomNome('')
    setCustomPreco('')
    setDescTipo('R$')
    setDescValor('')
  }

  function abrirModalCriar() {
    setEditando(null)
    resetFormState()
    reset({ veiculoId: '', descricao: '', status: 'ABERTA', total: '0.00', dataEntrada: todayInput(), previsaoEntrega: '', dataEntrega: '' })
    setModalAberto(true)
  }

  function abrirModalEditar(o) {
    setEditando(o)
    setVeiculoId(o.veiculoId)
    setItensSelecionados(
      (o.itens ?? []).map((i) => ({
        _id: i.id,
        tipoServicoId: i.tipoServicoId,
        nome: i.nome,
        preco: Number(i.preco),
      }))
    )
    setPecasSelecionadas(
      (o.pecas ?? []).map((p) => ({
        _id: p.id,
        produtoId: p.produtoId,
        nome: p.produto?.nome ?? '',
        codigo: p.produto?.codigo ?? '',
        unidade: p.produto?.unidade ?? '',
        precoUnitario: Number(p.precoUnitario),
        quantidade: Number(p.quantidade),
        subtotal: Number(p.subtotal),
      }))
    )
    setCustomAberto(false)
    setCustomNome('')
    setCustomPreco('')
    reset({
      veiculoId:       o.veiculoId,
      descricao:       o.descricao ?? '',
      status:          o.status,
      total:           Number(o.total).toFixed(2),
      dataEntrada:     toInputDate(o.dataEntrada),
      previsaoEntrega: toInputDate(o.previsaoEntrega),
      dataEntrega:     toInputDate(o.dataEntrega),
    })
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setEditando(null)
    resetFormState()
  }

  async function onSubmit(data) {
    if (!data.veiculoId) { toast.error('Selecione um veículo'); return }
    const payload = {
      ...data,
      itens: itensSelecionados.map(({ tipoServicoId, nome, preco }) => ({ tipoServicoId, nome, preco })),
      pecas: pecasSelecionadas.map(({ produtoId, quantidade, precoUnitario, subtotal }) => ({
        produtoId, quantidade, precoUnitario, subtotal,
      })),
    }
    try {
      if (editando) {
        await api.put(`/ordens/${editando.id}`, payload)
        toast.success('Ordem atualizada!')
      } else {
        await api.post('/ordens', payload)
        toast.success('Ordem criada!')
      }
      fecharModal()
      carregarDados()
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Erro ao salvar ordem')
    }
  }

  async function excluir(o) {
    if (!window.confirm(`Excluir a OS #${o.id.slice(-6).toUpperCase()}?`)) return
    setDeletando(o.id)
    try {
      await api.delete(`/ordens/${o.id}`)
      toast.success('Ordem excluída')
      setOrdens((prev) => prev.filter((x) => x.id !== o.id))
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Erro ao excluir ordem')
    } finally { setDeletando(null) }
  }

  const contagem = ordens.reduce((acc, o) => { acc[o.status] = (acc[o.status] ?? 0) + 1; return acc }, {})

  const filtradas = ordens.filter((o) => {
    const matchStatus = filtroStatus === 'TODAS' || o.status === filtroStatus
    const servicos = (o.itens ?? []).map((i) => i.nome).join(' ')
    const desc = o.descricao ?? ''
    const matchBusca = !busca ||
      o.veiculo.placa.toLowerCase().includes(busca.toLowerCase()) ||
      o.veiculo.cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      desc.toLowerCase().includes(busca.toLowerCase()) ||
      servicos.toLowerCase().includes(busca.toLowerCase()) ||
      o.id.slice(-6).toLowerCase().includes(busca.toLowerCase())
    return matchStatus && matchBusca
  })

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar por OS, veículo, serviço ou cliente..." value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]" />
        </div>
        <button onClick={abrirModalCriar}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors">
          <Plus size={16} /> Nova Ordem
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {FILTROS.map(({ key, label }) => {
          const count = key === 'TODAS' ? ordens.length : (contagem[key] ?? 0)
          const ativo = filtroStatus === key
          return (
            <button key={key} onClick={() => setFiltroStatus(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                ativo ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}>
              {label}
              <span className={`px-1.5 py-0.5 rounded-full text-xs leading-none ${ativo ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <ClipboardList size={18} className="text-[#1e3a5f]" />
          <h3 className="font-semibold text-gray-800">Ordens de Serviço</h3>
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {filtradas.length} registros
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 size={24} className="animate-spin" /><span className="text-sm">Carregando...</span>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ClipboardList size={48} className="mb-3 text-gray-200" />
            <p className="text-sm font-medium">
              {busca || filtroStatus !== 'TODAS' ? 'Nenhuma ordem encontrada' : 'Nenhuma ordem de serviço'}
            </p>
            {!busca && filtroStatus === 'TODAS' && (
              <p className="text-xs mt-1">Clique em "Nova Ordem" para começar</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">OS</th>
                  <th className="px-4 py-3 text-left">Veículo</th>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-left">Serviços</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Datas</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtradas.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                        #{o.id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-[#1e3a5f] bg-blue-50 px-2 py-0.5 rounded text-xs tracking-wider">
                        {o.veiculo.placa}
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">{o.veiculo.marca} {o.veiculo.modelo}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#1e3a5f] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {o.veiculo.cliente.nome.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-gray-700 text-xs">{o.veiculo.cliente.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
                      {(o.itens ?? []).length > 0 ? (
                        <div className="space-y-0.5">
                          {o.itens.slice(0, 2).map((i) => (
                            <div key={i.id} className="flex items-center gap-1">
                              <Tag size={9} className="text-orange-400 flex-shrink-0" />
                              <span className="text-xs text-gray-600 truncate">{i.nome}</span>
                            </div>
                          ))}
                          {o.itens.length > 2 && (
                            <span className="text-xs text-gray-400 pl-3.5">
                              +{o.itens.length - 2} serviço{o.itens.length - 2 > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">{o.descricao ?? '—'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusSelect ordem={o} onUpdate={handleStatusUpdate} />
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800 text-xs whitespace-nowrap">
                      {brl(o.total)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Calendar size={10} className="text-gray-400 flex-shrink-0" />
                          <span className="text-gray-400">Ent:</span>
                          <span className="text-gray-700">{formatDate(o.dataEntrada)}</span>
                        </div>
                        {o.previsaoEntrega && (
                          <div className="flex items-center gap-1">
                            <CalendarClock size={10} className="text-blue-400 flex-shrink-0" />
                            <span className="text-gray-400">Prev:</span>
                            <span className="text-blue-600">{formatDate(o.previsaoEntrega)}</span>
                          </div>
                        )}
                        {o.dataEntrega ? (
                          <div className="flex items-center gap-1">
                            <CalendarCheck size={10} className="text-green-500 flex-shrink-0" />
                            <span className="text-gray-400">Entregue:</span>
                            <span className="text-green-600 font-medium">{formatDate(o.dataEntrega)}</span>
                          </div>
                        ) : (!o.previsaoEntrega && (
                          <div className="flex items-center gap-1 text-gray-300">
                            <CalendarCheck size={10} />
                            <span>Entrega: —</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => imprimirOS(o, config)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" title="Imprimir OS">
                          <Printer size={15} />
                        </button>
                        {o.pagamento?.status === 'PAGO' && (
                          <button onClick={() => imprimirRecibo(o, config)}
                            className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors" title="Emitir Recibo">
                            <FileText size={15} />
                          </button>
                        )}
                        <button onClick={() => abrirModalEditar(o)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-[#1e3a5f] transition-colors" title="Editar">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => excluir(o)} disabled={deletando === o.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50" title="Excluir">
                          {deletando === o.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={fecharModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[93vh] flex flex-col">

            <div className="flex items-center justify-between px-6 py-4 bg-[#1e3a5f] flex-shrink-0">
              <h2 className="text-white font-semibold text-base">
                {editando ? `Editar OS #${editando.id.slice(-6).toUpperCase()}` : 'Nova Ordem de Serviço'}
              </h2>
              <button onClick={fecharModal} className="text-white/60 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4 overflow-y-auto">

              {/* Veículo */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Veículo <span className="text-orange-500">*</span>
                </label>
                <input type="hidden" {...register('veiculoId')} />
                <VeiculoCombobox veiculos={veiculos} value={veiculoId} onChange={selecionarVeiculo} />
              </div>

              {/* Catálogo de serviços */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Serviços <span className="text-gray-400 font-normal">(selecione um ou mais)</span>
                </label>
                {tiposServico.length > 0 ? (
                  <CatalogoServicos
                    tiposServico={tiposServico}
                    itensSelecionados={itensSelecionados}
                    onToggle={toggleServico}
                  />
                ) : (
                  <div className="text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl py-3 text-center">
                    Carregando catálogo...
                  </div>
                )}
              </div>

              {/* Serviço personalizado */}
              <div>
                {!customAberto ? (
                  <button
                    type="button"
                    onClick={() => setCustomAberto(true)}
                    className="flex items-center gap-1.5 text-xs text-[#1e3a5f] hover:text-orange-500 transition-colors font-medium"
                  >
                    <PlusCircle size={13} /> Adicionar serviço personalizado
                  </button>
                ) : (
                  <div className="flex gap-2 items-end p-3 bg-orange-50 border border-orange-200 rounded-xl">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Nome do serviço</label>
                      <input
                        type="text"
                        value={customNome}
                        onChange={(e) => setCustomNome(e.target.value)}
                        placeholder="Ex: Revisão personalizada..."
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white"
                      />
                    </div>
                    <div className="w-28">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Valor (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={customPreco}
                        onChange={(e) => setCustomPreco(e.target.value)}
                        placeholder="0,00"
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={adicionarCustom}
                      className="px-3 py-1.5 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
                    >
                      Adicionar
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCustomAberto(false); setCustomNome(''); setCustomPreco('') }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Resumo dos serviços selecionados */}
              {itensSelecionados.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                    <ClipboardList size={12} /> Serviços selecionados ({itensSelecionados.length})
                  </p>
                  {itensSelecionados.map((item) => (
                    <div key={item._id} className="flex items-center gap-2 group">
                      <Tag size={10} className="text-orange-400 flex-shrink-0" />
                      <span className="flex-1 text-xs text-gray-700 truncate">{item.nome}</span>
                      {item.tipoServicoId === null && (
                        <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">custom</span>
                      )}
                      <span className="text-xs font-mono text-gray-500">{brl(item.preco)}</span>
                      <button
                        type="button"
                        onClick={() => removerItem(item._id)}
                        className="text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <div className="pt-1.5 mt-1.5 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-medium">Total dos serviços</span>
                    <span className="text-sm font-bold text-[#1e3a5f]">
                      {brl(itensSelecionados.reduce((a, i) => a + Number(i.preco), 0))}
                    </span>
                  </div>
                </div>
              )}

              {/* Peças utilizadas */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                  <Package size={13} className="text-[#1e3a5f]" /> Peças Utilizadas
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                {produtos.length > 0 ? (
                  <ProdutoBuscaInput
                    produtos={produtos}
                    onAdicionar={(peca) => setPecasSelecionadas((prev) => [...prev, peca])}
                  />
                ) : (
                  <div className="text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl py-3 text-center">
                    Nenhum produto cadastrado no estoque
                  </div>
                )}
                {pecasSelecionadas.length > 0 && (
                  <div className="mt-2 bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1.5">
                    <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                      <Package size={12} /> Peças selecionadas ({pecasSelecionadas.length})
                    </p>
                    {pecasSelecionadas.map((peca) => (
                      <div key={peca._id} className="flex items-center gap-2 group">
                        <Package size={10} className="text-blue-400 flex-shrink-0" />
                        <span className="font-mono text-xs text-gray-400">{peca.codigo}</span>
                        <span className="flex-1 text-xs text-gray-700 truncate">{peca.nome}</span>
                        <span className="text-xs text-gray-400">{peca.quantidade} {peca.unidade}</span>
                        <span className="text-xs text-gray-400">×</span>
                        <span className="text-xs font-mono text-gray-500">{brl(peca.precoUnitario)}</span>
                        <span className="text-xs font-semibold text-gray-700">{brl(peca.subtotal)}</span>
                        <button type="button"
                          onClick={() => setPecasSelecionadas((prev) => prev.filter((p) => p._id !== peca._id))}
                          className="text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <div className="pt-1.5 mt-1 border-t border-gray-200 flex justify-between">
                      <span className="text-xs text-gray-500">Total em peças</span>
                      <span className="text-xs font-bold text-[#1e3a5f]">
                        {brl(pecasSelecionadas.reduce((a, p) => a + p.subtotal, 0))}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Observações <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  {...register('descricao')}
                  rows={2}
                  placeholder="Informações adicionais, reclamação do cliente, detalhes do serviço..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] resize-none transition-colors"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select {...register('status')}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white">
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              {/* Subtotal / Desconto / Total */}
              {(() => {
                const subtotalServicos = itensSelecionados.reduce((a, i) => a + Number(i.preco), 0)
                const subtotalPecas = pecasSelecionadas.reduce((a, p) => a + Number(p.subtotal), 0)
                const subtotal = subtotalServicos + subtotalPecas
                const dv = Number(descValor) || 0
                const desconto = descTipo === 'R$'
                  ? Math.min(dv, subtotal)
                  : (subtotal * Math.min(dv, 100) / 100)
                const totalCalc = Math.max(0, subtotal - desconto)
                const temItens = itensSelecionados.length > 0 || pecasSelecionadas.length > 0
                return (
                  <div className="space-y-2">
                    {temItens && (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2 text-sm">
                        {/* Subtotal serviços */}
                        {itensSelecionados.length > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Mão de obra</span>
                            <span className="text-xs font-medium text-gray-700">{brl(subtotalServicos)}</span>
                          </div>
                        )}
                        {/* Subtotal peças */}
                        {pecasSelecionadas.length > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Peças</span>
                            <span className="text-xs font-medium text-gray-700">{brl(subtotalPecas)}</span>
                          </div>
                        )}
                        {/* Subtotal geral */}
                        {itensSelecionados.length > 0 && pecasSelecionadas.length > 0 && (
                          <div className="flex justify-between items-center border-t border-gray-200 pt-1.5">
                            <span className="text-xs text-gray-500">Subtotal</span>
                            <span className="text-xs font-medium text-gray-700">{brl(subtotal)}</span>
                          </div>
                        )}
                        {/* Desconto */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 shrink-0">Desconto</span>
                          <div className="ml-auto flex items-center gap-1.5">
                            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
                              <button
                                type="button"
                                onClick={() => setDescTipo('R$')}
                                className={`px-2.5 py-0.5 transition-colors ${descTipo === 'R$' ? 'bg-[#1e3a5f] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                              >
                                R$
                              </button>
                              <button
                                type="button"
                                onClick={() => setDescTipo('%')}
                                className={`px-2.5 py-0.5 transition-colors ${descTipo === '%' ? 'bg-[#1e3a5f] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                              >
                                %
                              </button>
                            </div>
                            <input
                              type="number"
                              min="0"
                              max={descTipo === '%' ? 100 : undefined}
                              step="0.01"
                              value={descValor}
                              onChange={(e) => setDescValor(e.target.value)}
                              placeholder="0"
                              className="w-20 px-2 py-0.5 text-xs border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/40 bg-white"
                            />
                            {desconto > 0 && (
                              <span className="text-xs text-red-500 font-medium whitespace-nowrap">
                                -{brl(desconto)}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Total calculado */}
                        <div className="pt-1.5 border-t border-gray-200 flex justify-between items-center">
                          <span className="text-xs font-semibold text-gray-700">Total final</span>
                          <span className="text-base font-bold text-[#1e3a5f]">{brl(totalCalc)}</span>
                        </div>
                      </div>
                    )}

                    {/* Campo total editável */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Valor total (R$)
                        {temItens && (
                          <span className="ml-1 text-gray-400 font-normal">— edite para ajuste manual</span>
                        )}
                      </label>
                      <div className="relative">
                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="number" step="0.01" min="0"
                          {...register('total', { min: { value: 0, message: 'Valor inválido' }, valueAsNumber: true })}
                          placeholder="0,00"
                          className={`w-full pl-8 pr-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 transition-colors ${errors.total ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                        />
                      </div>
                      {errors.total && <p className="mt-1 text-xs text-red-500">{errors.total.message}</p>}
                    </div>
                  </div>
                )
              })()}

              {/* Datas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1">
                    <Calendar size={12} className="text-gray-400" /> Data de Entrada <span className="text-orange-500">*</span>
                  </label>
                  <input type="date"
                    {...register('dataEntrada', { required: 'Data de entrada é obrigatória' })}
                    className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white transition-colors ${errors.dataEntrada ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                  {errors.dataEntrada && <p className="mt-1 text-xs text-red-500">{errors.dataEntrada.message}</p>}
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1">
                    <CalendarClock size={12} className="text-blue-400" /> Previsão de Entrega
                  </label>
                  <input type="date" {...register('previsaoEntrega')}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white" />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1">
                  <CalendarCheck size={12} className="text-green-500" /> Data de Entrega
                  {statusWatch === 'CONCLUIDA' && (
                    <span className="text-green-600 text-xs font-normal">(preenchida automaticamente ao concluir)</span>
                  )}
                </label>
                <input type="date" {...register('dataEntrega')}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white" />
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
                  {editando ? 'Salvar alterações' : 'Criar ordem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
