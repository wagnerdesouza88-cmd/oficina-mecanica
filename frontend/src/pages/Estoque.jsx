import { useEffect, useState, useCallback } from 'react'
import {
  Package, Plus, Search, Edit2, Trash2, AlertTriangle,
  TrendingUp, TrendingDown, Sliders, Loader2, AlertCircle,
  ChevronDown, ChevronUp, X, ArrowUpRight, ArrowDownLeft,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'

const CATEGORIAS = ['PECA', 'LUBRIFICANTE', 'FILTRO', 'FLUIDO', 'PNEU', 'ELETRICO', 'OUTRO']
const UNIDADES = ['UN', 'L', 'KG', 'ML']

const CAT_LABEL = {
  PECA: 'Peça', LUBRIFICANTE: 'Lubrificante', FILTRO: 'Filtro',
  FLUIDO: 'Fluido', PNEU: 'Pneu', ELETRICO: 'Elétrico', OUTRO: 'Outro',
}
const CAT_COLOR = {
  PECA: 'bg-blue-100 text-blue-700', LUBRIFICANTE: 'bg-yellow-100 text-yellow-700',
  FILTRO: 'bg-purple-100 text-purple-700', FLUIDO: 'bg-cyan-100 text-cyan-700',
  PNEU: 'bg-gray-100 text-gray-700', ELETRICO: 'bg-green-100 text-green-700',
  OUTRO: 'bg-orange-100 text-orange-700',
}
const TIPO_MOV = {
  ENTRADA: { label: 'Entrada', icon: ArrowDownLeft, color: 'text-green-600 bg-green-50' },
  SAIDA:   { label: 'Saída',   icon: ArrowUpRight,  color: 'text-red-500 bg-red-50'     },
  AJUSTE:  { label: 'Ajuste',  icon: Sliders,        color: 'text-blue-600 bg-blue-50'   },
}

function brl(v) { return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }
function num(v, d = 2) { return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }) }

const EMPTY = { codigo: '', nome: '', categoria: 'PECA', marca: '', unidade: 'UN', precoCompra: '', precoVenda: '', quantidadeAtual: '', quantidadeMinima: '', fornecedor: '', ativo: true }

export default function Estoque() {
  const [tab, setTab] = useState('produtos')
  const [produtos, setProdutos] = useState([])
  const [movimentacoes, setMovimentacoes] = useState([])
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(false)
  const [busca, setBusca] = useState('')
  const [catFiltro, setCatFiltro] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [modalEntrada, setModalEntrada] = useState(null)
  const [modalAjuste, setModalAjuste] = useState(null)
  const [entradaQtd, setEntradaQtd] = useState('')
  const [entradaMotivo, setEntradaMotivo] = useState('')
  const [ajusteQtd, setAjusteQtd] = useState('')
  const [ajusteMotivo, setAjusteMotivo] = useState('')
  const [filtroMov, setFiltroMov] = useState({ tipo: '', dataInicio: '', dataFim: '' })
  const [showInativos, setShowInativos] = useState(false)

  const carregarProdutos = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get('/produtos', { params: { todos: showInativos ? 'true' : undefined } })
      setProdutos(r.data)
    } catch { toast.error('Erro ao carregar produtos') }
    finally { setLoading(false) }
  }, [showInativos])

  const carregarMovimentacoes = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filtroMov.tipo) params.tipo = filtroMov.tipo
      if (filtroMov.dataInicio) params.dataInicio = filtroMov.dataInicio
      if (filtroMov.dataFim) params.dataFim = filtroMov.dataFim
      const r = await api.get('/movimentacoes', { params })
      setMovimentacoes(r.data)
    } catch { toast.error('Erro ao carregar movimentações') }
    finally { setLoading(false) }
  }, [filtroMov])

  const carregarAlertas = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get('/produtos/alertas')
      setAlertas(r.data)
    } catch { toast.error('Erro ao carregar alertas') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (tab === 'produtos') carregarProdutos()
    if (tab === 'movimentacoes') carregarMovimentacoes()
    if (tab === 'alertas') carregarAlertas()
  }, [tab, carregarProdutos, carregarMovimentacoes, carregarAlertas])

  function abrirNovo() {
    setEditando(null)
    setForm(EMPTY)
    setModalOpen(true)
  }
  function abrirEditar(p) {
    setEditando(p)
    setForm({
      codigo: p.codigo, nome: p.nome, categoria: p.categoria,
      marca: p.marca || '', unidade: p.unidade,
      precoCompra: p.precoCompra, precoVenda: p.precoVenda,
      quantidadeAtual: p.quantidadeAtual, quantidadeMinima: p.quantidadeMinima,
      fornecedor: p.fornecedor || '', ativo: p.ativo,
    })
    setModalOpen(true)
  }

  async function salvar(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        precoCompra: Number(form.precoCompra),
        precoVenda: Number(form.precoVenda),
        quantidadeAtual: Number(form.quantidadeAtual || 0),
        quantidadeMinima: Number(form.quantidadeMinima || 0),
      }
      if (editando) {
        await api.put(`/produtos/${editando.id}`, payload)
        toast.success('Produto atualizado')
      } else {
        await api.post('/produtos', payload)
        toast.success('Produto criado')
      }
      setModalOpen(false)
      carregarProdutos()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar')
    } finally { setSaving(false) }
  }

  async function deletar(p) {
    if (!confirm(`Desativar "${p.nome}"?`)) return
    try {
      await api.delete(`/produtos/${p.id}`)
      toast.success('Produto desativado')
      carregarProdutos()
    } catch { toast.error('Erro ao desativar') }
  }

  async function confirmarEntrada() {
    if (!entradaQtd || Number(entradaQtd) <= 0) return toast.error('Quantidade inválida')
    setSaving(true)
    try {
      await api.post(`/produtos/${modalEntrada.id}/entrada`, {
        quantidade: Number(entradaQtd),
        motivo: entradaMotivo || undefined,
      })
      toast.success('Entrada registrada')
      setModalEntrada(null)
      setEntradaQtd('')
      setEntradaMotivo('')
      carregarProdutos()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao registrar entrada')
    } finally { setSaving(false) }
  }

  async function confirmarAjuste() {
    if (ajusteQtd === '') return toast.error('Informe a quantidade')
    setSaving(true)
    try {
      await api.post(`/produtos/${modalAjuste.id}/ajuste`, {
        quantidade: Number(ajusteQtd),
        motivo: ajusteMotivo || undefined,
      })
      toast.success('Ajuste aplicado')
      setModalAjuste(null)
      setAjusteQtd('')
      setAjusteMotivo('')
      carregarProdutos()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao ajustar')
    } finally { setSaving(false) }
  }

  const produtosFiltrados = produtos.filter((p) => {
    const ok = (!catFiltro || p.categoria === catFiltro)
    const b = busca.toLowerCase()
    return ok && (!b || p.nome.toLowerCase().includes(b) || p.codigo.toLowerCase().includes(b))
  })

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: 'produtos', label: 'Produtos' },
          { id: 'movimentacoes', label: 'Movimentações' },
          { id: 'alertas', label: 'Alertas de Estoque' },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-white text-[#1e3a5f] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
            {t.id === 'alertas' && alertas.length > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{alertas.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* === ABA PRODUTOS === */}
      {tab === 'produtos' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={busca} onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome ou código..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20" />
            </div>
            <select value={catFiltro} onChange={(e) => setCatFiltro(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
              <option value="">Todas as categorias</option>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={showInativos} onChange={(e) => setShowInativos(e.target.checked)} />
              Mostrar inativos
            </label>
            <button onClick={abrirNovo}
              className="bg-[#1e3a5f] text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-[#162d4a] transition-colors ml-auto">
              <Plus size={16} /> Novo Produto
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                <Loader2 size={22} className="animate-spin" /><span className="text-sm">Carregando...</span>
              </div>
            ) : produtosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Package size={40} className="mb-3 text-gray-200" />
                <p className="text-sm font-medium">Nenhum produto encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left whitespace-nowrap">Código</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">Produto</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap hidden md:table-cell">Categoria</th>
                    <th className="px-4 py-3 text-right whitespace-nowrap">Estoque</th>
                    <th className="px-4 py-3 text-right whitespace-nowrap hidden md:table-cell">Mín.</th>
                    <th className="px-4 py-3 text-right whitespace-nowrap hidden lg:table-cell">Pr. Compra</th>
                    <th className="px-4 py-3 text-right whitespace-nowrap">Pr. Venda</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap hidden md:table-cell">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {produtosFiltrados.map((p) => {
                    const critico = Number(p.quantidadeAtual) <= Number(p.quantidadeMinima)
                    const alerta = !critico && Number(p.quantidadeAtual) <= Number(p.quantidadeMinima) * 1.5
                    return (
                      <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${!p.ativo ? 'opacity-50' : ''}`}>
                        <td className="px-5 py-3">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-lg font-bold text-gray-500">{p.codigo}</span>
                        </td>
                        <td className="px-5 py-3">
                          <p className={`font-medium text-gray-800 ${!p.ativo ? 'line-through' : ''}`}>{p.nome}</p>
                          {p.marca && <p className="text-xs text-gray-400">{p.marca}</p>}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${CAT_COLOR[p.categoria]}`}>
                            {CAT_LABEL[p.categoria]}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className={`font-bold ${critico ? 'text-red-600' : alerta ? 'text-yellow-600' : 'text-gray-800'}`}>
                            {num(p.quantidadeAtual, 3)} {p.unidade}
                          </span>
                          {critico && <AlertTriangle size={13} className="inline ml-1 text-red-500" />}
                        </td>
                        <td className="px-5 py-3 text-right text-gray-400 text-xs">
                          {num(p.quantidadeMinima, 3)} {p.unidade}
                        </td>
                        <td className="px-5 py-3 text-right text-gray-600">{brl(p.precoCompra)}</td>
                        <td className="px-5 py-3 text-right font-semibold text-gray-800">{brl(p.precoVenda)}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${p.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {p.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setModalEntrada(p); setEntradaQtd(''); setEntradaMotivo('') }}
                              className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors" title="Registrar Entrada">
                              <TrendingUp size={15} />
                            </button>
                            <button onClick={() => { setModalAjuste(p); setAjusteQtd(String(Number(p.quantidadeAtual))); setAjusteMotivo('') }}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Ajustar Estoque">
                              <Sliders size={15} />
                            </button>
                            <button onClick={() => abrirEditar(p)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                              <Edit2 size={15} />
                            </button>
                            <button onClick={() => deletar(p)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                              <Trash2 size={15} />
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
        </div>
      )}

      {/* === ABA MOVIMENTAÇÕES === */}
      {tab === 'movimentacoes' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-end">
            <div>
              <p className="text-xs text-gray-500 mb-1">Tipo</p>
              <select value={filtroMov.tipo} onChange={(e) => setFiltroMov((f) => ({ ...f, tipo: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="">Todos</option>
                <option value="ENTRADA">Entrada</option>
                <option value="SAIDA">Saída</option>
                <option value="AJUSTE">Ajuste</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">De</p>
              <input type="date" value={filtroMov.dataInicio} onChange={(e) => setFiltroMov((f) => ({ ...f, dataInicio: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Até</p>
              <input type="date" value={filtroMov.dataFim} onChange={(e) => setFiltroMov((f) => ({ ...f, dataFim: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
            <button onClick={carregarMovimentacoes}
              className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#162d4a] transition-colors">
              Filtrar
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                <Loader2 size={22} className="animate-spin" /><span className="text-sm">Carregando...</span>
              </div>
            ) : movimentacoes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <AlertCircle size={40} className="mb-3 text-gray-200" />
                <p className="text-sm font-medium">Nenhuma movimentação encontrada</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-5 py-3 text-left">Data</th>
                    <th className="px-5 py-3 text-left">Produto</th>
                    <th className="px-5 py-3 text-left">Tipo</th>
                    <th className="px-5 py-3 text-right">Qtd.</th>
                    <th className="px-5 py-3 text-right">Anterior</th>
                    <th className="px-5 py-3 text-right">Atual</th>
                    <th className="px-5 py-3 text-left">Motivo / OS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {movimentacoes.map((m) => {
                    const cfg = TIPO_MOV[m.tipo]
                    const Icon = cfg.icon
                    return (
                      <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                          {new Date(m.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-gray-800">{m.produto.nome}</p>
                          <p className="text-xs text-gray-400 font-mono">{m.produto.codigo}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                            <Icon size={11} /> {cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-gray-800">
                          {num(m.quantidade, 3)} {m.produto.unidade}
                        </td>
                        <td className="px-5 py-3 text-right text-gray-400 text-xs">{num(m.quantidadeAnterior, 3)}</td>
                        <td className="px-5 py-3 text-right text-gray-600 font-medium">{num(m.quantidadeAtual, 3)}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">
                          {m.motivo || '—'}
                          {m.ordemServico && (
                            <span className="ml-1 font-mono text-[#1e3a5f] font-bold">
                              #{m.ordemServico.id.slice(-6).toUpperCase()}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* === ABA ALERTAS === */}
      {tab === 'alertas' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
              <Loader2 size={22} className="animate-spin" /><span className="text-sm">Carregando...</span>
            </div>
          ) : alertas.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-16 text-gray-400">
              <Package size={40} className="mb-3 text-green-200" />
              <p className="text-sm font-medium text-green-600">Estoque sem alertas — tudo OK!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {alertas
                  .filter((p) => Number(p.quantidadeAtual) <= Number(p.quantidadeMinima))
                  .map((p) => (
                    <div key={p.id} className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                      <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-red-800 truncate">{p.nome}</p>
                        <p className="text-xs text-red-500 font-mono">{p.codigo} · {CAT_LABEL[p.categoria]}</p>
                        <p className="text-sm text-red-700 mt-1">
                          Estoque: <strong>{num(p.quantidadeAtual, 3)} {p.unidade}</strong>
                          <span className="mx-1 text-red-300">·</span>
                          Mínimo: {num(p.quantidadeMinima, 3)} {p.unidade}
                        </p>
                      </div>
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">CRÍTICO</span>
                    </div>
                  ))}
                {alertas
                  .filter(
                    (p) =>
                      Number(p.quantidadeAtual) > Number(p.quantidadeMinima) &&
                      Number(p.quantidadeAtual) <= Number(p.quantidadeMinima) * 1.5
                  )
                  .map((p) => (
                    <div key={p.id} className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
                      <AlertTriangle size={18} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-yellow-800 truncate">{p.nome}</p>
                        <p className="text-xs text-yellow-600 font-mono">{p.codigo} · {CAT_LABEL[p.categoria]}</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Estoque: <strong>{num(p.quantidadeAtual, 3)} {p.unidade}</strong>
                          <span className="mx-1 text-yellow-300">·</span>
                          Mínimo: {num(p.quantidadeMinima, 3)} {p.unidade}
                        </p>
                      </div>
                      <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">ALERTA</span>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal Produto */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">{editando ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={salvar} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Código *</label>
                  <input value={form.codigo} onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))} required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Categoria *</label>
                  <select value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                    {CATEGORIAS.map((c) => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Nome *</label>
                <input value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Marca</label>
                  <input value={form.marca} onChange={(e) => setForm((f) => ({ ...f, marca: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Unidade *</label>
                  <select value={form.unidade} onChange={(e) => setForm((f) => ({ ...f, unidade: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                    {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Preço de Compra *</label>
                  <input type="number" step="0.01" min="0" value={form.precoCompra} onChange={(e) => setForm((f) => ({ ...f, precoCompra: e.target.value }))} required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Preço de Venda *</label>
                  <input type="number" step="0.01" min="0" value={form.precoVenda} onChange={(e) => setForm((f) => ({ ...f, precoVenda: e.target.value }))} required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">
                    {editando ? 'Estoque Atual' : 'Estoque Inicial'}
                  </label>
                  <input type="number" step="0.001" min="0" value={form.quantidadeAtual} onChange={(e) => setForm((f) => ({ ...f, quantidadeAtual: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Estoque Mínimo</label>
                  <input type="number" step="0.001" min="0" value={form.quantidadeMinima} onChange={(e) => setForm((f) => ({ ...f, quantidadeMinima: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Fornecedor</label>
                <input value={form.fornecedor} onChange={(e) => setForm((f) => ({ ...f, fornecedor: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
              </div>
              {editando && (
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={form.ativo} onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))} />
                  Produto ativo
                </label>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="bg-[#1e3a5f] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#162d4a] disabled:opacity-50">
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Entrada */}
      {modalEntrada && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Registrar Entrada</h3>
              <button onClick={() => setModalEntrada(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">Produto: <strong>{modalEntrada.nome}</strong></p>
              <p className="text-xs text-gray-400">Estoque atual: {num(modalEntrada.quantidadeAtual, 3)} {modalEntrada.unidade}</p>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Quantidade *</label>
                <input type="number" step="0.001" min="0.001" value={entradaQtd} onChange={(e) => setEntradaQtd(e.target.value)} autoFocus
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Motivo</label>
                <input value={entradaMotivo} onChange={(e) => setEntradaMotivo(e.target.value)} placeholder="Ex: Compra fornecedor"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setModalEntrada(null)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">
                  Cancelar
                </button>
                <button onClick={confirmarEntrada} disabled={saving}
                  className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
                  <TrendingUp size={15} /> Confirmar Entrada
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajuste */}
      {modalAjuste && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Ajuste de Estoque</h3>
              <button onClick={() => setModalAjuste(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">Produto: <strong>{modalAjuste.nome}</strong></p>
              <p className="text-xs text-gray-400">Estoque atual: {num(modalAjuste.quantidadeAtual, 3)} {modalAjuste.unidade}</p>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Nova Quantidade *</label>
                <input type="number" step="0.001" min="0" value={ajusteQtd} onChange={(e) => setAjusteQtd(e.target.value)} autoFocus
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Motivo</label>
                <input value={ajusteMotivo} onChange={(e) => setAjusteMotivo(e.target.value)} placeholder="Ex: Inventário físico"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setModalAjuste(null)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">
                  Cancelar
                </button>
                <button onClick={confirmarAjuste} disabled={saving}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                  <Sliders size={15} /> Aplicar Ajuste
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
