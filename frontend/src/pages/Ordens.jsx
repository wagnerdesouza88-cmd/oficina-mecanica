import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  ClipboardList, Plus, Search, X, Pencil, Trash2, Loader2,
  Car, ChevronDown, ChevronRight, User, DollarSign, Calendar,
  CalendarCheck, CalendarClock, Wrench, PlusCircle, Tag, Package,
  Printer, FileText, ShoppingCart, TrendingUp,
} from 'lucide-react'
import api from '../services/api'
import { useTheme } from '../context/ThemeContext'
import { imprimirOS, imprimirRecibo } from '../utils/print'

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  ABERTA:          { label: 'Aberta',        badge: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',       select: 'bg-blue-100 text-blue-700'     },
  EM_ANDAMENTO:    { label: 'Em andamento',  badge: 'bg-orange-100 text-orange-700 ring-1 ring-orange-200', select: 'bg-orange-100 text-orange-700'  },
  AGUARDANDO_PECA: { label: 'Aguard. peça',  badge: 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200', select: 'bg-yellow-100 text-yellow-700'  },
  CONCLUIDA:       { label: 'Concluída',     badge: 'bg-green-100 text-green-700 ring-1 ring-green-200',    select: 'bg-green-100 text-green-700'    },
  CANCELADA:       { label: 'Cancelada',     badge: 'bg-red-100 text-red-700 ring-1 ring-red-200',          select: 'bg-red-100 text-red-700'        },
}

const FILTROS = [
  { key: 'TODAS', label: 'Todas' },
  ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ key: k, label: v.label })),
]

const CAT_ORDER = ['PREVENTIVA','FREIOS','SUSPENSAO_DIRECAO','MOTOR','ELETRICA','CAMBIO_TRANSMISSAO','FUNILARIA_PINTURA']
const CAT_LABELS = {
  PREVENTIVA: 'Manutenção Preventiva', FREIOS: 'Freios',
  SUSPENSAO_DIRECAO: 'Suspensão e Direção', MOTOR: 'Motor',
  ELETRICA: 'Elétrica', CAMBIO_TRANSMISSAO: 'Câmbio e Transmissão',
  FUNILARIA_PINTURA: 'Funilaria e Pintura',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toInputDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function formatDate(dateStr) { return dateStr ? new Date(dateStr).toLocaleDateString('pt-BR') : null }
function todayInput() { return toInputDate(new Date()) }
function brl(val) { return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

// ─── StatusSelect ─────────────────────────────────────────────────────────────

function StatusSelect({ ordem, onUpdate }) {
  const [saving, setSaving] = useState(false)
  const cfg = STATUS_CONFIG[ordem.status]

  async function handleChange(e) {
    setSaving(true)
    const tid = toast.loading('Atualizando status...')
    try {
      const { data } = await api.patch(`/ordens/${ordem.id}/status`, { status: e.target.value })
      onUpdate(data)
      toast.success('Status atualizado!', { id: tid })
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Erro ao atualizar status', { id: tid })
    } finally { setSaving(false) }
  }

  return (
    <div className="relative inline-flex items-center">
      <select value={ordem.status} onChange={handleChange} disabled={saving}
        className={`text-xs font-medium pl-2.5 pr-6 py-1 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 transition-opacity ${cfg.select} ${saving ? 'opacity-50 cursor-wait' : 'hover:opacity-80'}`}>
        {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
      </select>
      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
        {saving ? <Loader2 size={10} className="animate-spin text-current" /> : <ChevronDown size={10} className="text-current opacity-60" />}
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
  const filtrados = veiculos.filter((v) => {
    const q = busca.toLowerCase()
    return v.placa.toLowerCase().includes(q) || v.marca.toLowerCase().includes(q) ||
      v.modelo.toLowerCase().includes(q) || v.cliente.nome.toLowerCase().includes(q)
  })

  useEffect(() => {
    function fechar(e) { if (ref.current && !ref.current.contains(e.target)) setAberto(false) }
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [])

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setAberto((a) => !a)}
        className={`flex items-center gap-2 w-full px-3 py-2 text-sm border rounded-xl cursor-pointer bg-white border-gray-200 ${aberto ? 'ring-2 ring-[#1e3a5f]/30 border-[#1e3a5f]' : ''}`}>
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
          <><span className="flex-1 text-gray-400">Selecione o veículo...</span><ChevronDown size={14} className="text-gray-400" /></>
        )}
      </div>
      {selecionado && (
        <div className="mt-1.5 flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg text-xs text-[#1e3a5f]">
          <User size={12} /><span className="font-medium">Proprietário:</span><span>{selecionado.cliente.nome}</span>
        </div>
      )}
      {aberto && (
        <div className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input autoFocus type="text" placeholder="Buscar por placa, modelo ou cliente..." value={busca}
              onChange={(e) => setBusca(e.target.value)} onClick={(e) => e.stopPropagation()}
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

// ─── CatalogoServicos ─────────────────────────────────────────────────────────

function CatalogoServicos({ tiposServico, itensSelecionados, onToggle }) {
  const [abertos, setAbertos] = useState({})
  const [busca, setBusca] = useState('')

  const porCategoria = CAT_ORDER.reduce((acc, cat) => {
    let items = tiposServico.filter((t) => t.categoria === cat)
    if (busca) items = items.filter((t) => t.nome.toLowerCase().includes(busca.toLowerCase()))
    if (items.length) acc[cat] = items
    return acc
  }, {})

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
        <Wrench size={13} className="text-[#1e3a5f]" />
        <span className="text-xs font-semibold text-gray-700">Catálogo de Serviços</span>
        <div className="ml-auto relative">
          <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={busca}
            onChange={(e) => { setBusca(e.target.value); if (e.target.value) setAbertos(CAT_ORDER.reduce((a,c) => ({...a,[c]:true}), {})) }}
            placeholder="Filtrar..." className="pl-6 pr-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none w-36" />
        </div>
      </div>
      <div className="max-h-56 overflow-y-auto divide-y divide-gray-100">
        {Object.keys(porCategoria).length === 0 && <p className="text-xs text-gray-400 text-center py-4">Nenhum serviço encontrado</p>}
        {CAT_ORDER.filter((c) => porCategoria[c]).map((cat) => {
          const items = porCategoria[cat]
          const selectedCount = items.filter((t) => itensSelecionados.some((i) => i.tipoServicoId === t.id)).length
          const isOpen = abertos[cat] ?? false
          return (
            <div key={cat}>
              <button type="button" onClick={() => setAbertos((p) => ({...p,[cat]:!p[cat]}))}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-left">
                <span className="text-gray-400">{isOpen ? <ChevronDown size={13}/> : <ChevronRight size={13}/>}</span>
                <span className="text-xs font-medium text-gray-700 flex-1">{CAT_LABELS[cat]}</span>
                {selectedCount > 0 && <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">{selectedCount}</span>}
                <span className="text-xs text-gray-400">{items.length} serviços</span>
              </button>
              {isOpen && (
                <div className="bg-gray-50/50 pb-1">
                  {items.map((tipo) => {
                    const sel = itensSelecionados.some((i) => i.tipoServicoId === tipo.id)
                    return (
                      <label key={tipo.id} className={`flex items-center gap-2.5 px-5 py-1.5 cursor-pointer hover:bg-white ${sel ? 'bg-orange-50/60' : ''}`}>
                        <input type="checkbox" checked={sel} onChange={() => onToggle(tipo)} className="accent-orange-500 w-3.5 h-3.5 flex-shrink-0" />
                        <span className={`flex-1 text-xs ${sel ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>{tipo.nome}</span>
                        <span className="text-xs text-gray-400 font-mono">{brl(tipo.precoSugerido)}</span>
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

// ─── PecaCustoInput — busca peça pelo preço de COMPRA (custo interno) ─────────

function PecaCustoInput({ produtos, onAdicionar }) {
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
    ? produtos.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase()) || p.codigo.toLowerCase().includes(busca.toLowerCase())).slice(0, 8)
    : []

  function selecionar(p) { setSelecionado(p); setBusca(p.nome); setAberto(false); setQtd('1') }

  function adicionar() {
    if (!selecionado) return
    const quantidade = parseInt(qtd, 10)
    if (!quantidade || quantidade <= 0) return toast.error('Quantidade inválida')
    onAdicionar({
      _id: `custo_${selecionado.id}_${Date.now()}`,
      produtoId: selecionado.id,
      nome: selecionado.nome,
      codigo: selecionado.codigo,
      unidade: selecionado.unidade,
      precoCompra: Number(selecionado.precoCompra),
      quantidade,
      subtotal: Number(selecionado.precoCompra) * quantidade,
    })
    setSelecionado(null); setBusca(''); setQtd('1')
  }

  return (
    <div ref={ref} className="flex gap-1.5 items-center">
      <div className="flex-1 relative">
        <Package size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={busca}
          onChange={(e) => { setBusca(e.target.value); setSelecionado(null); setAberto(true) }}
          onFocus={() => busca && setAberto(true)}
          placeholder="Adicionar peça (custo)..."
          className="w-full pl-6 pr-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/20 bg-white" />
        {aberto && filtrados.length > 0 && (
          <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
            {filtrados.map((p) => (
              <li key={p.id} onClick={() => selecionar(p)}
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs cursor-pointer hover:bg-gray-50">
                <span className="font-mono bg-gray-100 px-1 rounded text-gray-500 flex-shrink-0">{p.codigo}</span>
                <span className="flex-1 text-gray-800 truncate">{p.nome}</span>
                <span className="text-orange-600 font-semibold flex-shrink-0">{brl(p.precoCompra)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <input type="number" step="1" min="1" value={qtd} onChange={(e) => setQtd(e.target.value)}
        className="w-16 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none text-right bg-white" />
      <button type="button" onClick={adicionar} disabled={!selecionado}
        className="px-2.5 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-40 font-medium">
        +
      </button>
    </div>
  )
}

// ─── ServicoCard — card de serviço com peças internas ─────────────────────────

function ServicoCard({ item, produtos, onUpdate, onRemove }) {
  const custoPecas = item.pecas.reduce((a, p) => a + Number(p.subtotal), 0)
  const valorMaoDeObra = Math.max(0, Number(item.preco) - custoPecas)

  function handlePreco(e) {
    const preco = parseFloat(e.target.value) || 0
    onUpdate(item._id, { preco, valorMaoDeObra: Math.max(0, preco - custoPecas) })
  }

  function removerPeca(pecaId) {
    const newPecas = item.pecas.filter((p) => p._id !== pecaId)
    const newCusto = newPecas.reduce((a, p) => a + Number(p.subtotal), 0)
    onUpdate(item._id, { pecas: newPecas, custoPecas: newCusto, valorMaoDeObra: Math.max(0, item.preco - newCusto) })
  }

  function adicionarPeca(peca) {
    const newPecas = [...item.pecas, peca]
    const newCusto = newPecas.reduce((a, p) => a + Number(p.subtotal), 0)
    onUpdate(item._id, { pecas: newPecas, custoPecas: newCusto, valorMaoDeObra: Math.max(0, item.preco - newCusto) })
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header do serviço */}
      <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border-b border-orange-100">
        <Wrench size={12} className="text-orange-500 flex-shrink-0" />
        <span className="flex-1 text-xs font-semibold text-gray-800 truncate">{item.nome}</span>
        {item.tipoServicoId === null && (
          <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full flex-shrink-0">custom</span>
        )}
        <button type="button" onClick={() => onRemove(item._id)} className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0" title="Remover serviço">
          <X size={14} />
        </button>
      </div>

      <div className="p-3 space-y-2.5">
        {/* Valor cobrado ao cliente */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 flex-shrink-0 w-36">Cobrado do cliente (R$):</label>
          <div className="flex-1 relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">R$</span>
            <input type="number" step="0.01" min="0" value={item.preco} onChange={handlePreco}
              className="w-full pl-8 pr-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30 text-right font-semibold" />
          </div>
        </div>

        {/* Peças internas (custo) */}
        <div className="space-y-1.5">
          <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
            <Package size={10} className="text-gray-400" />
            Peças utilizadas — custo interno (não aparece na OS do cliente)
          </p>

          {item.pecas.length > 0 && (
            <div className="space-y-0.5">
              {item.pecas.map((peca) => (
                <div key={peca._id} className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg group/peca text-xs">
                  <span className="font-mono text-gray-400 flex-shrink-0">{peca.codigo}</span>
                  <span className="flex-1 text-gray-700 truncate">{peca.nome}</span>
                  <span className="text-gray-400 flex-shrink-0 whitespace-nowrap">
                    {Number(peca.quantidade)} {peca.unidade} × {brl(peca.precoCompra)} = <strong className="text-gray-700">{brl(peca.subtotal)}</strong>
                  </span>
                  <button type="button" onClick={() => removerPeca(peca._id)}
                    className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {produtos.length > 0 && <PecaCustoInput produtos={produtos} onAdicionar={adicionarPeca} />}
        </div>

        {/* Breakdown interno */}
        {(item.pecas.length > 0 || Number(item.preco) > 0) && (
          <div className="flex items-center gap-3 pt-1.5 border-t border-gray-100 text-xs flex-wrap">
            <span className="text-gray-400">Custo peças: <strong className="text-red-500">{brl(custoPecas)}</strong></span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-400">Mão de obra: <strong className="text-green-600">{brl(valorMaoDeObra)}</strong></span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-400">Cobrado: <strong className="text-[#1e3a5f]">{brl(item.preco)}</strong></span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ProdutoVendaInput — produto vendido ao cliente com markup ─────────────────

function ProdutoVendaInput({ produtos, onAdicionar }) {
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
    ? produtos.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase()) || p.codigo.toLowerCase().includes(busca.toLowerCase())).slice(0, 10)
    : []

  function selecionar(p) { setSelecionado(p); setBusca(p.nome); setAberto(false); setQtd('1') }

  function adicionar() {
    if (!selecionado) return
    const quantidade = parseInt(qtd, 10)
    if (!quantidade || quantidade <= 0) return toast.error('Quantidade inválida')
    onAdicionar({
      _id: `venda_${selecionado.id}_${Date.now()}`,
      produtoId: selecionado.id,
      nome: selecionado.nome,
      codigo: selecionado.codigo,
      unidade: selecionado.unidade,
      precoUnitario: Number(selecionado.precoVenda),
      precoCompra: Number(selecionado.precoCompra),
      quantidade,
      subtotal: Number(selecionado.precoVenda) * quantidade,
    })
    setSelecionado(null); setBusca(''); setQtd('1')
  }

  const margem = selecionado ? Number(selecionado.precoVenda) - Number(selecionado.precoCompra) : 0

  return (
    <div className="space-y-1.5">
      <div ref={ref} className="relative flex gap-2">
        <div className="flex-1 relative">
          <Package size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={busca}
            onChange={(e) => { setBusca(e.target.value); setSelecionado(null); setAberto(true) }}
            onFocus={() => busca && setAberto(true)}
            placeholder="Buscar produto para venda..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 bg-white" />
          {aberto && filtrados.length > 0 && (
            <ul className="absolute z-40 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-44 overflow-y-auto">
              {filtrados.map((p) => (
                <li key={p.id} onClick={() => selecionar(p)}
                  className="flex items-center gap-2 px-3 py-2 text-xs cursor-pointer hover:bg-gray-50">
                  <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 flex-shrink-0">{p.codigo}</span>
                  <span className="flex-1 text-gray-800 truncate">{p.nome}</span>
                  <div className="text-right flex-shrink-0">
                    <div className="text-green-600 font-semibold">{brl(p.precoVenda)}</div>
                    <div className="text-gray-400">custo {brl(p.precoCompra)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <input type="number" step="1" min="1" value={qtd} onChange={(e) => setQtd(e.target.value)}
          className="w-20 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none text-right bg-white" />
        <button type="button" onClick={adicionar} disabled={!selecionado}
          className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-40">
          Adicionar
        </button>
      </div>
      {selecionado && (
        <p className="text-xs text-green-700 flex items-center gap-2 flex-wrap">
          <strong>{selecionado.nome}</strong>
          <span>Venda: {brl(selecionado.precoVenda)}</span>
          <span>·</span>
          <span>Custo: {brl(selecionado.precoCompra)}</span>
          <span>·</span>
          <span className="font-semibold text-green-700">Margem: {brl(margem)}</span>
          <span>·</span>
          <span>Estoque: {Number(selecionado.quantidadeAtual).toLocaleString('pt-BR', { minimumFractionDigits: 0 })} {selecionado.unidade}</span>
          {Number(selecionado.quantidadeAtual) <= 0 && <span className="text-red-500 font-bold">SEM ESTOQUE</span>}
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

  // Serviços selecionados (cada um com pecas[] internas)
  const [itensSelecionados, setItensSelecionados] = useState([])
  // Produtos vendidos diretamente ao cliente (VENDA_DIRETA)
  const [pecasVenda, setPecasVenda] = useState([])
  // Serviço personalizado
  const [customAberto, setCustomAberto] = useState(false)
  const [customNome, setCustomNome] = useState('')
  const [customPreco, setCustomPreco] = useState('')
  // Desconto
  const [descTipo, setDescTipo] = useState('R$')
  const [descValor, setDescValor] = useState('')

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm()
  const statusWatch = watch('status')

  useEffect(() => { if (statusWatch === 'CONCLUIDA') setValue('dataEntrega', todayInput()) }, [statusWatch, setValue])

  // Recalcula total automaticamente
  useEffect(() => {
    const subtotalServicos = itensSelecionados.reduce((a, i) => a + Number(i.preco), 0)
    const subtotalProdutos = pecasVenda.reduce((a, p) => a + Number(p.subtotal), 0)
    const subtotal = subtotalServicos + subtotalProdutos
    const dv = Number(descValor) || 0
    const desconto = descTipo === 'R$' ? dv : (subtotal * dv / 100)
    setValue('total', Number(Math.max(0, subtotal - desconto).toFixed(2)))
  }, [itensSelecionados, pecasVenda, descTipo, descValor, setValue])

  async function carregarDados() {
    try {
      const [ro, rv, rt, rp] = await Promise.all([
        api.get('/ordens'), api.get('/veiculos'), api.get('/tipos-servico'), api.get('/produtos'),
      ])
      setOrdens(ro.data); setVeiculos(rv.data); setTiposServico(rt.data); setProdutos(rp.data)
    } catch { toast.error('Erro ao carregar dados') }
    finally { setLoading(false) }
  }
  useEffect(() => { carregarDados() }, [])

  function handleStatusUpdate(ordemAtualizada) {
    setOrdens((prev) => prev.map((o) => o.id === ordemAtualizada.id ? ordemAtualizada : o))
  }

  function updateItem(_id, changes) {
    setItensSelecionados((prev) => prev.map((i) => i._id === _id ? { ...i, ...changes } : i))
  }

  function toggleServico(tipo) {
    const jasel = itensSelecionados.some((i) => i.tipoServicoId === tipo.id)
    if (jasel) {
      setItensSelecionados((prev) => prev.filter((i) => i.tipoServicoId !== tipo.id))
    } else {
      setItensSelecionados((prev) => [...prev, {
        _id: tipo.id, tipoServicoId: tipo.id, nome: tipo.nome,
        preco: Number(tipo.precoSugerido), custoPecas: 0,
        valorMaoDeObra: Number(tipo.precoSugerido), pecas: [],
      }])
    }
  }

  function removerItem(_id) { setItensSelecionados((prev) => prev.filter((i) => i._id !== _id)) }

  function adicionarCustom() {
    if (!customNome.trim()) return toast.error('Informe o nome do serviço')
    const preco = parseFloat(customPreco) || 0
    setItensSelecionados((prev) => [...prev, {
      _id: `custom_${Date.now()}`, tipoServicoId: null, nome: customNome.trim(),
      preco, custoPecas: 0, valorMaoDeObra: preco, pecas: [],
    }])
    setCustomNome(''); setCustomPreco(''); setCustomAberto(false)
  }

  function resetFormState() {
    setVeiculoId(''); setItensSelecionados([]); setPecasVenda([])
    setCustomAberto(false); setCustomNome(''); setCustomPreco('')
    setDescTipo('R$'); setDescValor('')
  }

  function abrirModalCriar() {
    setEditando(null); resetFormState()
    reset({ veiculoId: '', descricao: '', status: 'ABERTA', total: '0.00', dataEntrada: todayInput(), previsaoEntrega: '', dataEntrega: '' })
    setModalAberto(true)
  }

  function abrirModalEditar(o) {
    setEditando(o)
    setVeiculoId(o.veiculoId)
    setItensSelecionados(
      (o.itens ?? []).map((i) => ({
        _id: i.id, tipoServicoId: i.tipoServicoId, nome: i.nome,
        preco: Number(i.preco), custoPecas: Number(i.custoPecas), valorMaoDeObra: Number(i.valorMaoDeObra),
        pecas: (i.pecas ?? []).map((p) => ({
          _id: p.id, produtoId: p.produtoId,
          nome: p.produto?.nome ?? '', codigo: p.produto?.codigo ?? '', unidade: p.produto?.unidade ?? '',
          precoCompra: Number(p.precoCompra), quantidade: Number(p.quantidade), subtotal: Number(p.subtotal),
        })),
      }))
    )
    setPecasVenda(
      (o.pecas ?? []).map((p) => ({
        _id: p.id, produtoId: p.produtoId,
        nome: p.produto?.nome ?? '', codigo: p.produto?.codigo ?? '', unidade: p.produto?.unidade ?? '',
        precoUnitario: Number(p.precoUnitario), precoCompra: Number(p.precoCompra),
        quantidade: Number(p.quantidade), subtotal: Number(p.subtotal),
      }))
    )
    setCustomAberto(false); setCustomNome(''); setCustomPreco(''); setDescTipo('R$'); setDescValor('')
    reset({
      veiculoId: o.veiculoId, descricao: o.descricao ?? '', status: o.status,
      total: Number(o.total).toFixed(2),
      dataEntrada: toInputDate(o.dataEntrada), previsaoEntrega: toInputDate(o.previsaoEntrega), dataEntrega: toInputDate(o.dataEntrega),
    })
    setModalAberto(true)
  }

  function fecharModal() { setModalAberto(false); setEditando(null); resetFormState() }

  async function onSubmit(data) {
    if (!data.veiculoId) { toast.error('Selecione um veículo'); return }
    const payload = {
      ...data,
      itens: itensSelecionados.map(({ tipoServicoId, nome, preco, custoPecas, valorMaoDeObra, pecas }) => ({
        tipoServicoId, nome, preco, custoPecas, valorMaoDeObra,
        pecas: pecas.map(({ produtoId, quantidade, precoCompra, subtotal }) => ({ produtoId, quantidade, precoCompra, subtotal })),
      })),
      pecas: pecasVenda.map(({ produtoId, quantidade, precoUnitario, precoCompra, subtotal }) => ({
        produtoId, quantidade, precoUnitario, precoCompra, subtotal,
      })),
    }
    try {
      if (editando) { await api.put(`/ordens/${editando.id}`, payload); toast.success('Ordem atualizada!') }
      else { await api.post('/ordens', payload); toast.success('Ordem criada!') }
      fecharModal(); carregarDados()
    } catch (err) { toast.error(err.response?.data?.error ?? 'Erro ao salvar ordem') }
  }

  async function excluir(o) {
    if (!window.confirm(`Excluir a OS #${o.id.slice(-6).toUpperCase()}?`)) return
    setDeletando(o.id)
    try {
      await api.delete(`/ordens/${o.id}`)
      toast.success('Ordem excluída')
      setOrdens((prev) => prev.filter((x) => x.id !== o.id))
    } catch (err) { toast.error(err.response?.data?.error ?? 'Erro ao excluir ordem') }
    finally { setDeletando(null) }
  }

  const contagem = ordens.reduce((acc, o) => { acc[o.status] = (acc[o.status] ?? 0) + 1; return acc }, {})
  const filtradas = ordens.filter((o) => {
    const matchStatus = filtroStatus === 'TODAS' || o.status === filtroStatus
    const servicos = (o.itens ?? []).map((i) => i.nome).join(' ')
    const matchBusca = !busca ||
      o.veiculo.placa.toLowerCase().includes(busca.toLowerCase()) ||
      o.veiculo.cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (o.descricao ?? '').toLowerCase().includes(busca.toLowerCase()) ||
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${ativo ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
              {label}
              <span className={`px-1.5 py-0.5 rounded-full text-xs leading-none ${ativo ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <ClipboardList size={18} className="text-[#1e3a5f]" />
          <h3 className="font-semibold text-gray-800">Ordens de Serviço</h3>
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{filtradas.length} registros</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 size={24} className="animate-spin" /><span className="text-sm">Carregando...</span>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ClipboardList size={48} className="mb-3 text-gray-200" />
            <p className="text-sm font-medium">{busca || filtroStatus !== 'TODAS' ? 'Nenhuma ordem encontrada' : 'Nenhuma ordem de serviço'}</p>
            {!busca && filtroStatus === 'TODAS' && <p className="text-xs mt-1">Clique em "Nova Ordem" para começar</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left whitespace-nowrap">OS</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Veículo</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Cliente</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap hidden md:table-cell">Serviços</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Total</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap hidden lg:table-cell">Datas</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtradas.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">#{o.id.slice(-6).toUpperCase()}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-[#1e3a5f] bg-blue-50 px-2 py-0.5 rounded text-xs tracking-wider">{o.veiculo.placa}</span>
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[100px]">{o.veiculo.marca} {o.veiculo.modelo}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap max-w-[130px]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#1e3a5f] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {o.veiculo.cliente.nome.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-gray-700 text-xs truncate">{o.veiculo.cliente.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[180px] hidden md:table-cell">
                      {(o.itens ?? []).length > 0 ? (
                        <div className="space-y-0.5">
                          {o.itens.slice(0, 2).map((i) => (
                            <div key={i.id} className="flex items-center gap-1">
                              <Tag size={9} className="text-orange-400 flex-shrink-0" />
                              <span className="text-xs text-gray-600 truncate">{i.nome}</span>
                            </div>
                          ))}
                          {o.itens.length > 2 && <span className="text-xs text-gray-400 pl-3.5">+{o.itens.length - 2} serviço{o.itens.length - 2 > 1 ? 's' : ''}</span>}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic truncate block max-w-[160px]">{o.descricao ?? '—'}</span>
                      )}
                      {(o.pecas ?? []).length > 0 && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <ShoppingCart size={9} className="text-green-500 flex-shrink-0" />
                          <span className="text-xs text-green-600 whitespace-nowrap">{o.pecas.length} produto{o.pecas.length > 1 ? 's' : ''} vendido{o.pecas.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusSelect ordem={o} onUpdate={handleStatusUpdate} /></td>
                    <td className="px-4 py-3 font-semibold text-gray-800 text-xs whitespace-nowrap">{brl(o.total)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-1 whitespace-nowrap">
                          <Calendar size={10} className="text-gray-400 flex-shrink-0" />
                          <span className="text-gray-400">Ent:</span><span className="text-gray-700">{formatDate(o.dataEntrada)}</span>
                        </div>
                        {o.previsaoEntrega && (
                          <div className="flex items-center gap-1 whitespace-nowrap">
                            <CalendarClock size={10} className="text-blue-400 flex-shrink-0" />
                            <span className="text-gray-400">Prev:</span><span className="text-blue-600">{formatDate(o.previsaoEntrega)}</span>
                          </div>
                        )}
                        {o.dataEntrega ? (
                          <div className="flex items-center gap-1 whitespace-nowrap">
                            <CalendarCheck size={10} className="text-green-500 flex-shrink-0" />
                            <span className="text-gray-400">Entregue:</span><span className="text-green-600 font-medium">{formatDate(o.dataEntrega)}</span>
                          </div>
                        ) : (!o.previsaoEntrega && (
                          <div className="flex items-center gap-1 text-gray-300 whitespace-nowrap">
                            <CalendarCheck size={10} /><span>Entrega: —</span>
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
              <button onClick={fecharModal} className="text-white/60 hover:text-white transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5 overflow-y-auto">

              {/* Veículo */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Veículo <span className="text-orange-500">*</span></label>
                <input type="hidden" {...register('veiculoId')} />
                <VeiculoCombobox veiculos={veiculos} value={veiculoId} onChange={(id) => { setVeiculoId(id); setValue('veiculoId', id) }} />
              </div>

              {/* ── TIPO 1: SERVIÇOS COM PEÇAS INTERNAS ── */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gray-100" />
                  <span className="text-xs font-bold text-orange-500 uppercase tracking-wide px-2">Tipo 1 — Serviços realizados</span>
                  <div className="h-px flex-1 bg-gray-100" />
                </div>

                {/* Catálogo */}
                {tiposServico.length > 0 && (
                  <CatalogoServicos tiposServico={tiposServico} itensSelecionados={itensSelecionados} onToggle={toggleServico} />
                )}

                {/* Serviço personalizado */}
                {!customAberto ? (
                  <button type="button" onClick={() => setCustomAberto(true)}
                    className="flex items-center gap-1.5 text-xs text-[#1e3a5f] hover:text-orange-500 transition-colors font-medium">
                    <PlusCircle size={13} /> Adicionar serviço personalizado
                  </button>
                ) : (
                  <div className="flex gap-2 items-end p-3 bg-orange-50 border border-orange-200 rounded-xl">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Nome do serviço</label>
                      <input type="text" value={customNome} onChange={(e) => setCustomNome(e.target.value)}
                        placeholder="Ex: Revisão personalizada..."
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none bg-white" />
                    </div>
                    <div className="w-28">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Valor (R$)</label>
                      <input type="number" step="0.01" min="0" value={customPreco} onChange={(e) => setCustomPreco(e.target.value)}
                        placeholder="0,00" className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none bg-white" />
                    </div>
                    <button type="button" onClick={adicionarCustom}
                      className="px-3 py-1.5 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium">Adicionar</button>
                    <button type="button" onClick={() => { setCustomAberto(false); setCustomNome(''); setCustomPreco('') }}
                      className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
                  </div>
                )}

                {/* Cards dos serviços selecionados */}
                {itensSelecionados.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                      <Wrench size={12} className="text-orange-400" /> {itensSelecionados.length} serviço{itensSelecionados.length > 1 ? 's' : ''} selecionado{itensSelecionados.length > 1 ? 's' : ''}
                    </p>
                    {itensSelecionados.map((item) => (
                      <ServicoCard key={item._id} item={item} produtos={produtos} onUpdate={updateItem} onRemove={removerItem} />
                    ))}
                  </div>
                )}
              </div>

              {/* ── TIPO 2: PRODUTOS PARA VENDA ── */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gray-100" />
                  <span className="text-xs font-bold text-green-600 uppercase tracking-wide px-2">Tipo 2 — Produtos vendidos ao cliente</span>
                  <div className="h-px flex-1 bg-gray-100" />
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-xl space-y-2">
                  <p className="text-xs text-green-700 flex items-center gap-1.5">
                    <ShoppingCart size={12} /> Produtos vendidos com markup — aparecem separados na OS impressa
                  </p>
                  {produtos.length > 0
                    ? <ProdutoVendaInput produtos={produtos} onAdicionar={(p) => setPecasVenda((prev) => [...prev, p])} />
                    : <p className="text-xs text-gray-400 text-center py-1">Nenhum produto cadastrado</p>}
                  {pecasVenda.length > 0 && (
                    <div className="space-y-1 pt-1">
                      {pecasVenda.map((peca) => (
                        <div key={peca._id} className="flex items-center gap-2 px-2 py-1.5 bg-white rounded-lg border border-green-100 group text-xs">
                          <ShoppingCart size={10} className="text-green-500 flex-shrink-0" />
                          <span className="font-mono text-gray-400 flex-shrink-0">{peca.codigo}</span>
                          <span className="flex-1 text-gray-700 truncate">{peca.nome}</span>
                          <span className="text-gray-400 flex-shrink-0 whitespace-nowrap">{peca.quantidade} {peca.unidade} × {brl(peca.precoUnitario)}</span>
                          <span className="font-semibold text-gray-700 flex-shrink-0">{brl(peca.subtotal)}</span>
                          <span className="text-green-600 font-medium flex-shrink-0">
                            <TrendingUp size={10} className="inline mr-0.5" />
                            {brl((peca.precoUnitario - peca.precoCompra) * peca.quantidade)}
                          </span>
                          <button type="button" onClick={() => setPecasVenda((prev) => prev.filter((p) => p._id !== peca._id))}
                            className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"><X size={12} /></button>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-1 border-t border-green-200">
                        <span className="text-xs text-gray-500">Subtotal produtos vendidos</span>
                        <span className="text-xs font-bold text-green-700">{brl(pecasVenda.reduce((a, p) => a + p.subtotal, 0))}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Observações <span className="text-gray-400 font-normal">(opcional)</span></label>
                <textarea {...register('descricao')} rows={2}
                  placeholder="Informações adicionais, reclamação do cliente, detalhes..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 resize-none" />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select {...register('status')}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white">
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>

              {/* Subtotal / Desconto / Total */}
              {(() => {
                const subtotalServicos = itensSelecionados.reduce((a, i) => a + Number(i.preco), 0)
                const subtotalProdutos = pecasVenda.reduce((a, p) => a + Number(p.subtotal), 0)
                const subtotal = subtotalServicos + subtotalProdutos
                const dv = Number(descValor) || 0
                const desconto = descTipo === 'R$' ? Math.min(dv, subtotal) : (subtotal * Math.min(dv, 100) / 100)
                const totalCalc = Math.max(0, subtotal - desconto)
                const temItens = itensSelecionados.length > 0 || pecasVenda.length > 0
                return (
                  <div className="space-y-2">
                    {temItens && (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2 text-sm">
                        {subtotalServicos > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Serviços realizados</span>
                            <span className="text-xs font-medium text-gray-700">{brl(subtotalServicos)}</span>
                          </div>
                        )}
                        {subtotalProdutos > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Produtos vendidos</span>
                            <span className="text-xs font-medium text-green-700">{brl(subtotalProdutos)}</span>
                          </div>
                        )}
                        {subtotalServicos > 0 && subtotalProdutos > 0 && (
                          <div className="flex justify-between items-center border-t border-gray-200 pt-1.5">
                            <span className="text-xs text-gray-500">Subtotal</span>
                            <span className="text-xs font-medium text-gray-700">{brl(subtotal)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 shrink-0">Desconto</span>
                          <div className="ml-auto flex items-center gap-1.5">
                            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
                              {['R$', '%'].map((t) => (
                                <button key={t} type="button" onClick={() => setDescTipo(t)}
                                  className={`px-2.5 py-0.5 transition-colors ${descTipo === t ? 'bg-[#1e3a5f] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>{t}</button>
                              ))}
                            </div>
                            <input type="number" min="0" max={descTipo === '%' ? 100 : undefined} step="0.01"
                              value={descValor} onChange={(e) => setDescValor(e.target.value)} placeholder="0"
                              className="w-20 px-2 py-0.5 text-xs border border-gray-200 rounded-lg text-right focus:outline-none bg-white" />
                            {desconto > 0 && <span className="text-xs text-red-500 font-medium">-{brl(desconto)}</span>}
                          </div>
                        </div>
                        <div className="pt-1.5 border-t border-gray-200 flex justify-between items-center">
                          <span className="text-xs font-semibold text-gray-700">Total final</span>
                          <span className="text-base font-bold text-[#1e3a5f]">{brl(totalCalc)}</span>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Valor total (R$){temItens && <span className="ml-1 text-gray-400 font-normal">— edite para ajuste manual</span>}
                      </label>
                      <div className="relative">
                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="number" step="0.01" min="0"
                          {...register('total', { min: { value: 0, message: 'Valor inválido' }, valueAsNumber: true })}
                          className={`w-full pl-8 pr-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 ${errors.total ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                      </div>
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
                  <input type="date" {...register('dataEntrada', { required: 'Obrigatória' })}
                    className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white ${errors.dataEntrada ? 'border-red-400' : 'border-gray-200'}`} />
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
                  {statusWatch === 'CONCLUIDA' && <span className="text-green-600 text-xs font-normal">(preenchida automaticamente)</span>}
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
