import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  DollarSign, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle2, Clock, Plus, X, Loader2, Pencil, Trash2,
  CreditCard, Banknote, Receipt, FileText, Printer,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import api from '../services/api'

// ─── Constantes ───────────────────────────────────────────────────────────────

const FORMAS = {
  DINHEIRO: { label: 'Dinheiro',      color: 'bg-green-100 text-green-700'  },
  DEBITO:   { label: 'Débito',        color: 'bg-blue-100 text-blue-700'    },
  CREDITO:  { label: 'Crédito',       color: 'bg-purple-100 text-purple-700' },
  PIX:      { label: 'PIX',           color: 'bg-teal-100 text-teal-700'    },
  BOLETO:   { label: 'Boleto',        color: 'bg-orange-100 text-orange-700' },
}

const STATUS_PAG = {
  PENDENTE:  { label: 'Pendente',  color: 'bg-yellow-100 text-yellow-700' },
  PAGO:      { label: 'Pago',      color: 'bg-green-100 text-green-700'   },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-100 text-red-700'       },
}

const CAT_CONTA = {
  FORNECEDOR: 'Fornecedor',
  ALUGUEL:    'Aluguel',
  ENERGIA:    'Energia',
  AGUA:       'Água',
  INTERNET:   'Internet',
  SALARIO:    'Salário',
  IMPOSTO:    'Imposto',
  OUTRO:      'Outro',
}

const CAT_CORES = {
  FORNECEDOR: 'bg-indigo-100 text-indigo-700',
  ALUGUEL:    'bg-orange-100 text-orange-700',
  ENERGIA:    'bg-yellow-100 text-yellow-800',
  AGUA:       'bg-blue-100 text-blue-700',
  INTERNET:   'bg-cyan-100 text-cyan-700',
  SALARIO:    'bg-purple-100 text-purple-700',
  IMPOSTO:    'bg-red-100 text-red-700',
  OUTRO:      'bg-gray-100 text-gray-600',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function brl(val) {
  return Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

function toInputDate(d) {
  if (!d) return ''
  const dt = new Date(d)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

function todayInput() { return toInputDate(new Date()) }

function diasParaVencer(vencimento) {
  const diff = new Date(vencimento) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// ─── Card de resumo ───────────────────────────────────────────────────────────

function ResumoCard({ label, value, sub, icon: Icon, colorClass, loading }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 ring-1 ${colorClass}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <Icon size={16} className="text-gray-400" />
      </div>
      {loading
        ? <div className="h-7 w-24 bg-gray-100 rounded animate-pulse" />
        : <p className="text-xl font-bold text-gray-800">{brl(value)}</p>}
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

// ─── ABA 1: Contas a Receber ──────────────────────────────────────────────────

function ContasReceber({ resumo, loadingResumo, onResumoUpdate }) {
  const [ordens, setOrdens] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOrdem, setModalOrdem] = useState(null)
  const [salvando, setSalvando] = useState(false)

  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm()
  const formaWatch = watch('formaPagamento')
  const valorWatch = watch('valor')
  const parcelasWatch = watch('parcelas', 1)

  useEffect(() => { carregarOrdens() }, [])

  async function carregarOrdens() {
    try {
      const { data } = await api.get('/ordens')
      setOrdens(data.filter((o) => o.status === 'CONCLUIDA'))
    } catch { toast.error('Erro ao carregar ordens') }
    finally { setLoading(false) }
  }

  function abrirModal(ordem) {
    setModalOrdem(ordem)
    const pag = ordem.pagamento
    reset({
      valor:          pag ? Number(pag.valor) : Number(ordem.total),
      formaPagamento: pag?.formaPagamento ?? 'PIX',
      parcelas:       pag?.parcelas ?? 1,
      status:         pag?.status ?? 'PAGO',
      dataPagamento:  pag?.dataPagamento ? toInputDate(pag.dataPagamento) : todayInput(),
      observacoes:    pag?.observacoes ?? '',
    })
  }

  async function onSubmit(data) {
    setSalvando(true)
    try {
      const payload = { ...data, ordemServicoId: modalOrdem.id }
      let updated
      if (modalOrdem.pagamento) {
        const { data: d } = await api.put(`/pagamentos/${modalOrdem.pagamento.id}`, payload)
        updated = d
        toast.success('Pagamento atualizado!')
      } else {
        const { data: d } = await api.post('/pagamentos', payload)
        updated = d
        toast.success('Pagamento registrado!')
      }
      setOrdens((prev) => prev.map((o) =>
        o.id === modalOrdem.id ? { ...o, pagamento: updated } : o
      ))
      setModalOrdem(null)
      onResumoUpdate()
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Erro ao salvar pagamento')
    } finally { setSalvando(false) }
  }

  const valorParcela = formaWatch === 'CREDITO' && parcelasWatch > 1
    ? (Number(valorWatch) || 0) / (Number(parcelasWatch) || 1)
    : null

  const ordensComPag  = ordens.filter((o) => o.pagamento?.status === 'PAGO')
  const ordensSemPag  = ordens.filter((o) => !o.pagamento || o.pagamento.status !== 'PAGO')

  return (
    <div className="space-y-4">
      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3">
        <ResumoCard label="Recebido no Mês"   value={resumo?.recebidoMes}   icon={TrendingUp}   colorClass="ring-green-100"  loading={loadingResumo} />
        <ResumoCard label="Em Aberto"         value={resumo?.emAbertoReceber} icon={Clock}       colorClass="ring-yellow-100" loading={loadingResumo} />
        <ResumoCard label="Total a Receber"   value={resumo?.emAbertoReceber + (resumo?.recebidoMes || 0)} icon={DollarSign} colorClass="ring-blue-100" loading={loadingResumo} />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
          <TrendingUp size={16} className="text-green-500" />
          <h3 className="font-semibold text-gray-800 text-sm">Ordens Concluídas</h3>
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{ordens.length}</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
            <Loader2 size={20} className="animate-spin" /><span className="text-sm">Carregando...</span>
          </div>
        ) : ordens.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-16">Nenhuma OS concluída</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">OS</th>
                  <th className="px-4 py-3 text-left">Cliente / Veículo</th>
                  <th className="px-4 py-3 text-right">Valor OS</th>
                  <th className="px-4 py-3 text-left">Forma</th>
                  <th className="px-4 py-3 text-left">Parcelas</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Data Pagto</th>
                  <th className="px-4 py-3 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ordens.map((o) => {
                  const pag = o.pagamento
                  const statusKey = pag?.status ?? 'PENDENTE'
                  const sc = STATUS_PAG[statusKey]
                  return (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                          #{o.id.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-gray-700">{o.veiculo.cliente.nome}</p>
                        <p className="text-xs text-gray-400 font-mono">{o.veiculo.placa} · {o.veiculo.marca}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800 text-xs">{brl(o.total)}</td>
                      <td className="px-4 py-3">
                        {pag ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${FORMAS[pag.formaPagamento]?.color ?? 'bg-gray-100 text-gray-600'}`}>
                            {FORMAS[pag.formaPagamento]?.label}
                          </span>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {pag?.parcelas > 1 ? `${pag.parcelas}x ${brl(pag.valorParcela)}` : (pag ? '1x' : '—')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.color}`}>{sc.label}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(pag?.dataPagamento)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => abrirModal(o)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                            pag
                              ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                              : 'bg-orange-500 hover:bg-orange-600 text-white'
                          }`}
                        >
                          {pag ? 'Editar' : 'Registrar'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de pagamento */}
      {modalOrdem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOrdem(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-[#1e3a5f]">
              <div>
                <h2 className="text-white font-semibold text-sm">
                  {modalOrdem.pagamento ? 'Editar Pagamento' : 'Registrar Pagamento'}
                </h2>
                <p className="text-[#7bafd4] text-xs">
                  OS #{modalOrdem.id.slice(-6).toUpperCase()} · {modalOrdem.veiculo.cliente.nome}
                </p>
              </div>
              <button onClick={() => setModalOrdem(null)} className="text-white/60 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Valor (R$) *</label>
                  <input type="number" step="0.01" min="0"
                    {...register('valor', { required: 'Obrigatório', min: 0, valueAsNumber: true })}
                    className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 ${errors.valor ? 'border-red-400' : 'border-gray-200'}`} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select {...register('status')}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white">
                    <option value="PAGO">Pago</option>
                    <option value="PENDENTE">Pendente</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Forma de Pagamento *</label>
                <select {...register('formaPagamento', { required: true })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white">
                  {Object.entries(FORMAS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              {formaWatch === 'CREDITO' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Parcelas</label>
                  <select {...register('parcelas', { valueAsNumber: true })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n}x{n > 1 ? ` de ${brl((Number(valorWatch) || 0) / n)}` : ''}</option>
                    ))}
                  </select>
                  {valorParcela && (
                    <p className="mt-1 text-xs text-gray-500">= {brl(valorParcela)} por parcela</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Data do Pagamento</label>
                <input type="date" {...register('dataPagamento')}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
                <input type="text" {...register('observacoes')} placeholder="Opcional..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30" />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModalOrdem(null)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={salvando}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors disabled:opacity-60">
                  {salvando && <Loader2 size={14} className="animate-spin" />}
                  {modalOrdem.pagamento ? 'Atualizar' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── ABA 2: Contas a Pagar ────────────────────────────────────────────────────

function ContasPagar({ resumo, loadingResumo, onResumoUpdate }) {
  const [contas, setContas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [marcando, setMarcando] = useState(null)
  const [deletando, setDeletando] = useState(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  useEffect(() => { carregarContas() }, [])

  async function carregarContas() {
    try {
      const { data } = await api.get('/contas-pagar')
      setContas(data)
    } catch { toast.error('Erro ao carregar contas') }
    finally { setLoading(false) }
  }

  function abrirModalCriar() {
    setEditando(null)
    reset({ descricao: '', categoria: 'OUTRO', valor: '', vencimento: '', observacoes: '' })
    setModalAberto(true)
  }

  function abrirModalEditar(c) {
    setEditando(c)
    reset({
      descricao:   c.descricao,
      categoria:   c.categoria,
      valor:       Number(c.valor),
      vencimento:  toInputDate(c.vencimento),
      observacoes: c.observacoes ?? '',
    })
    setModalAberto(true)
  }

  async function onSubmit(data) {
    try {
      if (editando) {
        const { data: u } = await api.put(`/contas-pagar/${editando.id}`, data)
        setContas((p) => p.map((c) => c.id === editando.id ? u : c))
        toast.success('Conta atualizada!')
      } else {
        const { data: n } = await api.post('/contas-pagar', data)
        setContas((p) => [...p, n].sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento)))
        toast.success('Conta criada!')
      }
      setModalAberto(false)
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Erro ao salvar conta')
    }
  }

  async function marcarPago(c) {
    setMarcando(c.id)
    try {
      const { data } = await api.put(`/contas-pagar/${c.id}`, {
        status: 'PAGO', dataPagamento: new Date().toISOString().slice(0, 10),
      })
      setContas((p) => p.map((x) => x.id === c.id ? data : x))
      toast.success('Marcada como paga!')
      onResumoUpdate()
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Erro')
    } finally { setMarcando(null) }
  }

  async function excluir(c) {
    if (!window.confirm(`Excluir "${c.descricao}"?`)) return
    setDeletando(c.id)
    try {
      await api.delete(`/contas-pagar/${c.id}`)
      setContas((p) => p.filter((x) => x.id !== c.id))
      toast.success('Conta excluída!')
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Erro')
    } finally { setDeletando(null) }
  }

  return (
    <div className="space-y-4">
      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3">
        <ResumoCard label="Pago no Mês"  value={resumo?.pagoMes}      icon={CheckCircle2}  colorClass="ring-green-100"  loading={loadingResumo} />
        <ResumoCard label="Em Aberto"    value={resumo?.emAbertoPagar} icon={AlertTriangle}  colorClass="ring-red-100"    loading={loadingResumo} />
        <ResumoCard label="Total a Pagar" value={resumo?.totalAPagar}  icon={TrendingDown}   colorClass="ring-orange-100" loading={loadingResumo} />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
          <TrendingDown size={16} className="text-red-500" />
          <h3 className="font-semibold text-gray-800 text-sm">Contas a Pagar</h3>
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full mr-2">{contas.length}</span>
          <button onClick={abrirModalCriar}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-xl text-xs font-medium transition-colors">
            <Plus size={13} /> Nova Conta
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
            <Loader2 size={20} className="animate-spin" /><span className="text-sm">Carregando...</span>
          </div>
        ) : contas.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-16">Nenhuma conta cadastrada</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Descrição</th>
                  <th className="px-4 py-3 text-left">Categoria</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 text-left">Vencimento</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {contas.map((c) => {
                  const dias = diasParaVencer(c.vencimento)
                  const vencendo = c.status === 'PENDENTE' && dias >= 0 && dias <= 3
                  const vencida = c.status === 'VENCIDO'
                  return (
                    <tr key={c.id} className={`hover:bg-gray-50 transition-colors ${vencida ? 'bg-red-50/30' : vencendo ? 'bg-yellow-50/30' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {vencida && <AlertTriangle size={13} className="text-red-400 flex-shrink-0" />}
                          {vencendo && <AlertTriangle size={13} className="text-yellow-500 flex-shrink-0" />}
                          <span className="text-sm text-gray-700">{c.descricao}</span>
                        </div>
                        {c.observacoes && <p className="text-xs text-gray-400 mt-0.5 pl-5">{c.observacoes}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_CORES[c.categoria]}`}>
                          {CAT_CONTA[c.categoria]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-sm text-gray-800">{brl(c.valor)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs ${vencida ? 'text-red-600 font-medium' : vencendo ? 'text-yellow-600 font-medium' : 'text-gray-500'}`}>
                          {fmtDate(c.vencimento)}
                          {vencida && ' (vencida)'}
                          {vencendo && ` (${dias}d)`}
                        </span>
                        {c.dataPagamento && (
                          <p className="text-xs text-green-600 mt-0.5">Pago: {fmtDate(c.dataPagamento)}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          c.status === 'PAGO' ? 'bg-green-100 text-green-700' :
                          c.status === 'VENCIDO' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>{c.status === 'PAGO' ? 'Pago' : c.status === 'VENCIDO' ? 'Vencida' : 'Pendente'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {c.status !== 'PAGO' && (
                            <button onClick={() => marcarPago(c)} disabled={marcando === c.id}
                              className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50" title="Marcar como pago">
                              {marcando === c.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                            </button>
                          )}
                          <button onClick={() => abrirModalEditar(c)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-[#1e3a5f] transition-colors" title="Editar">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => excluir(c)} disabled={deletando === c.id}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50" title="Excluir">
                            {deletando === c.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalAberto(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-[#1e3a5f]">
              <h2 className="text-white font-semibold text-sm">{editando ? 'Editar Conta' : 'Nova Conta a Pagar'}</h2>
              <button onClick={() => setModalAberto(false)} className="text-white/60 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Descrição *</label>
                <input type="text" {...register('descricao', { required: 'Obrigatório', minLength: 2 })}
                  placeholder="Ex: Aluguel do galpão"
                  className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 ${errors.descricao ? 'border-red-400' : 'border-gray-200'}`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Categoria *</label>
                  <select {...register('categoria')}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white">
                    {Object.entries(CAT_CONTA).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Valor (R$) *</label>
                  <input type="number" step="0.01" min="0"
                    {...register('valor', { required: 'Obrigatório', min: 0, valueAsNumber: true })}
                    className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 ${errors.valor ? 'border-red-400' : 'border-gray-200'}`} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Vencimento *</label>
                <input type="date" {...register('vencimento', { required: 'Obrigatório' })}
                  className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white ${errors.vencimento ? 'border-red-400' : 'border-gray-200'}`} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
                <input type="text" {...register('observacoes')} placeholder="Opcional..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModalAberto(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors disabled:opacity-60">
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  {editando ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── ABA 3: Fluxo de Caixa ───────────────────────────────────────────────────

function FluxoCaixa() {
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [ano, setAno] = useState(now.getFullYear())
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)

  const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/financeiro/fluxo-caixa?mes=${mes}&ano=${ano}`)
      setDados(data)
    } catch { toast.error('Erro ao carregar fluxo de caixa') }
    finally { setLoading(false) }
  }, [mes, ano])

  useEffect(() => { carregar() }, [carregar])

  function navMes(delta) {
    let m = mes + delta
    let a = ano
    if (m < 1) { m = 12; a-- }
    if (m > 12) { m = 1; a++ }
    setMes(m)
    setAno(a)
  }

  // Agrupa por semana do mês
  function agruparPorSemana(items, field = 'dataPagamento') {
    const s = [0, 0, 0, 0, 0]
    for (const item of items) {
      const dia = new Date(item[field]).getDate()
      const sem = Math.min(Math.ceil(dia / 7) - 1, 4)
      s[sem] += Number(item.valor)
    }
    return s
  }

  const entSem = dados ? agruparPorSemana(dados.entradas) : [0,0,0,0,0]
  const saiSem = dados ? agruparPorSemana(dados.saidas) : [0,0,0,0,0]
  const maxVal = Math.max(...entSem, ...saiSem, 1)

  const totalEnt = entSem.reduce((a, b) => a + b, 0)
  const totalSai = saiSem.reduce((a, b) => a + b, 0)
  const saldo = totalEnt - totalSai

  return (
    <div className="space-y-4">
      {/* Navegação de mês */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3">
        <button onClick={() => navMes(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronLeft size={18} className="text-gray-500" />
        </button>
        <h3 className="font-semibold text-gray-800">{MESES[mes - 1]} {ano}</h3>
        <button onClick={() => navMes(1)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronRight size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Cards de totais */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 ring-1 ring-green-100">
          <p className="text-xs text-gray-500 mb-1">Entradas</p>
          <p className="text-xl font-bold text-green-600">{brl(totalEnt)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 ring-1 ring-red-100">
          <p className="text-xs text-gray-500 mb-1">Saídas</p>
          <p className="text-xl font-bold text-red-500">{brl(totalSai)}</p>
        </div>
        <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 ring-1 ${saldo >= 0 ? 'ring-blue-100' : 'ring-orange-100'}`}>
          <p className="text-xs text-gray-500 mb-1">Saldo</p>
          <p className={`text-xl font-bold ${saldo >= 0 ? 'text-[#1e3a5f]' : 'text-orange-500'}`}>{brl(saldo)}</p>
        </div>
      </div>

      {/* Gráfico de barras por semana */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Entradas × Saídas por Semana</h4>
        {loading ? (
          <div className="flex items-center justify-center h-40 gap-2 text-gray-400">
            <Loader2 size={20} className="animate-spin" /><span className="text-sm">Carregando...</span>
          </div>
        ) : (
          <div className="flex items-end justify-around gap-4 h-48 px-4">
            {[0,1,2,3,4].map((s) => {
              const ent = entSem[s]
              const sai = saiSem[s]
              const hasData = ent > 0 || sai > 0
              return (
                <div key={s} className="flex flex-col items-center gap-1 flex-1">
                  <div className="flex items-end gap-1 w-full justify-center" style={{ height: '160px' }}>
                    <div className="relative group flex-1 max-w-[28px]">
                      <div
                        className="w-full bg-green-400 rounded-t-lg transition-all hover:bg-green-500"
                        style={{ height: `${hasData ? Math.max((ent / maxVal) * 160, ent > 0 ? 4 : 0) : 0}px` }}
                      />
                      {ent > 0 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          {brl(ent)}
                        </div>
                      )}
                    </div>
                    <div className="relative group flex-1 max-w-[28px]">
                      <div
                        className="w-full bg-red-400 rounded-t-lg transition-all hover:bg-red-500"
                        style={{ height: `${hasData ? Math.max((sai / maxVal) * 160, sai > 0 ? 4 : 0) : 0}px` }}
                      />
                      {sai > 0 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          {brl(sai)}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">Sem {s + 1}</span>
                </div>
              )
            })}
          </div>
        )}
        <div className="flex items-center gap-4 mt-3 justify-center">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-400 rounded-sm" /><span className="text-xs text-gray-500">Entradas</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-400 rounded-sm" /><span className="text-xs text-gray-500">Saídas</span></div>
        </div>
      </div>

      {/* Lançamentos do mês */}
      {dados && (dados.entradas.length > 0 || dados.saidas.length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <TrendingUp size={14} className="text-green-500" />
              <span className="text-sm font-semibold text-gray-700">Entradas</span>
            </div>
            <div className="max-h-52 overflow-y-auto divide-y divide-gray-50">
              {dados.entradas.length === 0
                ? <p className="text-xs text-gray-400 text-center py-4">Nenhuma entrada</p>
                : dados.entradas.map((e, i) => (
                  <div key={i} className="px-4 py-2 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-600">{FORMAS[e.formaPagamento]?.label ?? e.formaPagamento}</p>
                      <p className="text-xs text-gray-400">{fmtDate(e.dataPagamento)}</p>
                    </div>
                    <span className="text-xs font-semibold text-green-600">{brl(e.valor)}</span>
                  </div>
                ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <TrendingDown size={14} className="text-red-500" />
              <span className="text-sm font-semibold text-gray-700">Saídas</span>
            </div>
            <div className="max-h-52 overflow-y-auto divide-y divide-gray-50">
              {dados.saidas.length === 0
                ? <p className="text-xs text-gray-400 text-center py-4">Nenhuma saída</p>
                : dados.saidas.map((s, i) => (
                  <div key={i} className="px-4 py-2 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-600">{s.descricao}</p>
                      <p className="text-xs text-gray-400">{fmtDate(s.dataPagamento)}</p>
                    </div>
                    <span className="text-xs font-semibold text-red-500">{brl(s.valor)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── ABA 4: Relatórios ────────────────────────────────────────────────────────

function Relatorios() {
  const now = new Date()
  const [dataInicio, setDataInicio] = useState(`${now.getFullYear()}-01-01`)
  const [dataFim, setDataFim] = useState(toInputDate(now))
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(false)

  async function carregar() {
    setLoading(true)
    try {
      const { data } = await api.get(`/financeiro/relatorios?dataInicio=${dataInicio}&dataFim=${dataFim}`)
      setDados(data)
    } catch { toast.error('Erro ao gerar relatório') }
    finally { setLoading(false) }
  }

  useEffect(() => { carregar() }, [])

  function exportarPDF() {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html><head><title>Relatório Financeiro</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 30px; color: #1a1a1a; }
        h1 { color: #1e3a5f; font-size: 20px; margin-bottom: 4px; }
        h2 { color: #1e3a5f; font-size: 14px; margin: 20px 0 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
        p { font-size: 12px; color: #6b7280; margin: 2px 0; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #f3f4f6; text-align: left; padding: 6px 10px; }
        td { padding: 6px 10px; border-bottom: 1px solid #f3f4f6; }
        .total { font-weight: bold; font-size: 16px; color: #1e3a5f; }
      </style></head><body>
      <h1>Relatório Financeiro</h1>
      <p>Período: ${new Date(dataInicio).toLocaleDateString('pt-BR')} a ${new Date(dataFim).toLocaleDateString('pt-BR')}</p>
      <p class="total">Total Recebido: ${brl(dados?.periodo?.totalRecebido)}</p>
      <h2>Faturamento por Forma de Pagamento</h2>
      <table><tr><th>Forma</th><th>Quantidade</th><th>Total</th></tr>
      ${(dados?.porForma ?? []).map(f => `<tr><td>${FORMAS[f.formaPagamento]?.label ?? f.formaPagamento}</td><td>${f._count}</td><td>${brl(f._sum.valor)}</td></tr>`).join('')}
      </table>
      <h2>Top 10 Serviços</h2>
      <table><tr><th>Serviço</th><th>Realizações</th><th>Faturado</th></tr>
      ${(dados?.topServicos ?? []).map(s => `<tr><td>${s.nome}</td><td>${s._count.nome}</td><td>${brl(s._sum.preco)}</td></tr>`).join('')}
      </table>
      <h2>Marcas com Mais OS</h2>
      <table><tr><th>Marca</th><th>OS</th><th>Total Faturado</th><th>Ticket Médio</th></tr>
      ${(dados?.topMarcas ?? []).map(m => `<tr><td>${m.marca}</td><td>${m.count}</td><td>${brl(m.totalFaturado)}</td><td>${brl(m.ticketMedio)}</td></tr>`).join('')}
      </table>
      </body></html>`)
    win.document.close()
    win.print()
  }

  return (
    <div className="space-y-4">
      {/* Filtro de período */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Data Início</label>
          <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Data Fim</label>
          <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white" />
        </div>
        <button onClick={carregar} disabled={loading}
          className="px-4 py-2 text-sm font-medium bg-[#1e3a5f] hover:bg-[#16304f] text-white rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2">
          {loading && <Loader2 size={14} className="animate-spin" />}
          Gerar Relatório
        </button>
        {dados && (
          <button onClick={exportarPDF}
            className="ml-auto px-4 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-800 text-white rounded-xl transition-colors flex items-center gap-2">
            <Printer size={14} /> Exportar PDF
          </button>
        )}
      </div>

      {dados && (
        <>
          {/* Card total recebido */}
          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a5082] rounded-2xl p-5 text-white">
            <p className="text-sm text-white/70 mb-1">Total Recebido no Período</p>
            <p className="text-3xl font-bold">{brl(dados.periodo.totalRecebido)}</p>
            <p className="text-sm text-white/60 mt-1">{dados.periodo.quantidadePagamentos} pagamentos registrados</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Por forma de pagamento */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                <CreditCard size={15} className="text-[#1e3a5f]" />
                <h4 className="text-sm font-semibold text-gray-700">Por Forma de Pagamento</h4>
              </div>
              <div className="p-4 space-y-2">
                {dados.porForma.length === 0
                  ? <p className="text-xs text-gray-400 text-center py-4">Sem dados</p>
                  : dados.porForma.map((f) => {
                    const pct = dados.periodo.totalRecebido > 0
                      ? (Number(f._sum.valor) / dados.periodo.totalRecebido * 100).toFixed(1)
                      : 0
                    return (
                      <div key={f.formaPagamento}>
                        <div className="flex justify-between items-center mb-0.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${FORMAS[f.formaPagamento]?.color}`}>
                            {FORMAS[f.formaPagamento]?.label}
                          </span>
                          <span className="text-xs font-semibold text-gray-700">{brl(f._sum.valor)} <span className="text-gray-400">({pct}%)</span></span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Top marcas */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                <Receipt size={15} className="text-[#1e3a5f]" />
                <h4 className="text-sm font-semibold text-gray-700">Marcas com Mais OS</h4>
              </div>
              <div className="divide-y divide-gray-50">
                {dados.topMarcas.length === 0
                  ? <p className="text-xs text-gray-400 text-center py-4">Sem dados</p>
                  : dados.topMarcas.slice(0, 8).map((m) => (
                    <div key={m.marca} className="px-5 py-2.5 flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 flex-1">{m.marca}</span>
                      <span className="text-xs text-gray-400">{m.count} OS</span>
                      <span className="text-xs font-semibold text-gray-700">{brl(m.ticketMedio)}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Top serviços */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
              <FileText size={15} className="text-[#1e3a5f]" />
              <h4 className="text-sm font-semibold text-gray-700">Serviços Mais Realizados</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-5 py-3 text-left">#</th>
                    <th className="px-5 py-3 text-left">Serviço</th>
                    <th className="px-5 py-3 text-center">Realizações</th>
                    <th className="px-5 py-3 text-right">Total Faturado</th>
                    <th className="px-5 py-3 text-right">Preço Médio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dados.topServicos.length === 0
                    ? <tr><td colSpan={5} className="text-center text-sm text-gray-400 py-8">Sem dados para o período</td></tr>
                    : dados.topServicos.map((s, i) => (
                      <tr key={s.nome} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-2.5 text-xs font-bold text-gray-400">#{i + 1}</td>
                        <td className="px-5 py-2.5 text-sm text-gray-700">{s.nome}</td>
                        <td className="px-5 py-2.5 text-center">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            {s._count.nome}x
                          </span>
                        </td>
                        <td className="px-5 py-2.5 text-right font-semibold text-gray-800">{brl(s._sum.preco)}</td>
                        <td className="px-5 py-2.5 text-right text-gray-500">
                          {brl(Number(s._sum.preco) / s._count.nome)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Financeiro (principal) ───────────────────────────────────────────────────

const ABAS = [
  { key: 'receber',   label: 'Contas a Receber', icon: TrendingUp   },
  { key: 'pagar',     label: 'Contas a Pagar',   icon: TrendingDown },
  { key: 'fluxo',     label: 'Fluxo de Caixa',   icon: DollarSign   },
  { key: 'relatorios',label: 'Relatórios',        icon: FileText     },
]

export default function Financeiro() {
  const [aba, setAba] = useState('receber')
  const [resumo, setResumo] = useState(null)
  const [loadingResumo, setLoadingResumo] = useState(true)

  const carregarResumo = useCallback(async () => {
    try {
      const { data } = await api.get('/financeiro/resumo')
      setResumo(data)
    } catch { /* silently fail — shown in each tab */ }
    finally { setLoadingResumo(false) }
  }, [])

  useEffect(() => { carregarResumo() }, [carregarResumo])

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5">
        {ABAS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setAba(key)}
            className={`flex items-center gap-2 flex-1 justify-center px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              aba === key
                ? 'bg-[#1e3a5f] text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            <Icon size={15} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {aba === 'receber'    && <ContasReceber   resumo={resumo} loadingResumo={loadingResumo} onResumoUpdate={carregarResumo} />}
      {aba === 'pagar'      && <ContasPagar     resumo={resumo} loadingResumo={loadingResumo} onResumoUpdate={carregarResumo} />}
      {aba === 'fluxo'      && <FluxoCaixa />}
      {aba === 'relatorios' && <Relatorios />}
    </div>
  )
}
