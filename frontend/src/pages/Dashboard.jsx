import { useEffect, useState } from 'react'
import {
  ClipboardList, Users, CheckCircle, Clock, AlertCircle,
  Loader2, TrendingUp, TrendingDown, DollarSign, Package,
  AlertTriangle, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts'
import api from '../services/api'

const STATUS_CONFIG = {
  ABERTA:          { label: 'Aberta',        color: '#3b82f6' },
  EM_ANDAMENTO:    { label: 'Em andamento',  color: '#f97316' },
  AGUARDANDO_PECA: { label: 'Aguard. peça',  color: '#eab308' },
  CONCLUIDA:       { label: 'Concluída',     color: '#22c55e' },
  CANCELADA:       { label: 'Cancelada',     color: '#ef4444' },
}

const FORMA_COLORS = {
  DINHEIRO: '#22c55e', DEBITO: '#3b82f6', CREDITO: '#8b5cf6',
  PIX:      '#06b6d4', BOLETO: '#f97316',
}
const FORMA_LABEL = {
  DINHEIRO: 'Dinheiro', DEBITO: 'Débito', CREDITO: 'Crédito',
  PIX: 'Pix', BOLETO: 'Boleto',
}

function brl(v) { return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

function isHoje(dateStr) {
  const hoje = new Date()
  const d = new Date(dateStr)
  return d.getFullYear() === hoje.getFullYear() && d.getMonth() === hoje.getMonth() && d.getDate() === hoje.getDate()
}

function TooltipBRL({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {brl(p.value)}
        </p>
      ))}
    </div>
  )
}

function TooltipCount({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [metricas, setMetricas] = useState({ abertas: 0, emAndamento: 0, concluidasHoje: 0, totalClientes: 0 })
  const [financeiro, setFinanceiro] = useState(null)
  const [estoqueResumo, setEstoqueResumo] = useState(null)
  const [recentes, setRecentes] = useState([])
  const [historico, setHistorico] = useState([])
  const [relatorio, setRelatorio] = useState(null)
  const [statusData, setStatusData] = useState([])

  useEffect(() => {
    async function carregar() {
      try {
        const [ro, rc, rf, re, rh, rr] = await Promise.all([
          api.get('/ordens'),
          api.get('/clientes'),
          api.get('/financeiro/resumo'),
          api.get('/estoque/resumo'),
          api.get('/financeiro/historico'),
          api.get('/financeiro/relatorios'),
        ])
        const ordens = ro.data
        setMetricas({
          abertas:        ordens.filter((o) => o.status === 'ABERTA').length,
          emAndamento:    ordens.filter((o) => o.status === 'EM_ANDAMENTO').length,
          concluidasHoje: ordens.filter((o) => o.status === 'CONCLUIDA' && isHoje(o.updatedAt)).length,
          totalClientes:  rc.data.length,
        })
        setFinanceiro(rf.data)
        setEstoqueResumo(re.data)
        setRecentes(ordens.slice(0, 6))
        setHistorico(rh.data)
        setRelatorio(rr.data)

        // OS por status para donut
        const contagem = {}
        for (const o of ordens) contagem[o.status] = (contagem[o.status] ?? 0) + 1
        setStatusData(
          Object.entries(contagem).map(([k, v]) => ({
            name: STATUS_CONFIG[k]?.label ?? k,
            value: v,
            color: STATUS_CONFIG[k]?.color ?? '#ccc',
          }))
        )
      } catch {
        toast.error('Erro ao carregar dashboard')
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [])

  const metricCards = [
    {
      label: 'Ordens Abertas', value: metricas.abertas, icon: ClipboardList,
      color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-100',
    },
    {
      label: 'Em Andamento', value: metricas.emAndamento, icon: Clock,
      color: 'text-orange-500', bg: 'bg-orange-50', ring: 'ring-orange-100',
    },
    {
      label: 'Concluídas Hoje', value: metricas.concluidasHoje, icon: CheckCircle,
      color: 'text-green-600', bg: 'bg-green-50', ring: 'ring-green-100',
    },
    {
      label: 'Total de Clientes', value: metricas.totalClientes, icon: Users,
      color: 'text-purple-600', bg: 'bg-purple-50', ring: 'ring-purple-100',
    },
  ]

  const topServicos = (relatorio?.topServicos ?? []).slice(0, 5).map((s) => ({
    name: s.nome.length > 22 ? s.nome.slice(0, 22) + '…' : s.nome,
    qtd: s._count.nome,
    valor: Number(s._sum.preco ?? 0),
  }))

  const formaData = (relatorio?.porForma ?? []).map((f) => ({
    name: FORMA_LABEL[f.formaPagamento] ?? f.formaPagamento,
    value: Number(f._sum.valor ?? 0),
    color: FORMA_COLORS[f.formaPagamento] ?? '#94a3b8',
  }))

  return (
    <div className="space-y-5">
      {/* Alerta estoque crítico */}
      {estoqueResumo && (estoqueResumo.criticos > 0 || estoqueResumo.emAlerta > 0) && (
        <Link to="/estoque"
          className="flex items-center gap-4 bg-red-50 border border-red-200 rounded-2xl p-4 hover:bg-red-100 transition-colors group">
          <div className="bg-red-100 text-red-500 rounded-xl p-3 flex-shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-800 text-sm">Produtos com estoque baixo</p>
            <p className="text-xs text-red-600 mt-0.5">
              {estoqueResumo.criticos > 0 && <strong>{estoqueResumo.criticos} crítico{estoqueResumo.criticos > 1 ? 's' : ''}</strong>}
              {estoqueResumo.criticos > 0 && estoqueResumo.emAlerta > 0 && ' · '}
              {estoqueResumo.emAlerta > 0 && `${estoqueResumo.emAlerta} em alerta`}
            </p>
          </div>
          <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0">
            Ver Estoque →
          </span>
        </Link>
      )}

      {/* Métricas operacionais */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {metricCards.map(({ label, value, icon: Icon, color, bg, ring }) => (
          <div key={label} className={`card p-5 flex items-center gap-4 ring-1 ${ring}`}>
            <div className={`${bg} ${color} rounded-xl p-3 flex-shrink-0`}>
              <Icon size={22} />
            </div>
            <div>
              {loading
                ? <div className="h-9 w-12 bg-gray-100 rounded-lg animate-pulse mb-1" />
                : <p className={`metric-value ${color}`}>{value}</p>}
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cards financeiros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 ring-1 ring-green-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Recebido no Mês</span>
            <div className="bg-green-50 text-green-600 rounded-xl p-2"><TrendingUp size={16} /></div>
          </div>
          {loading || !financeiro
            ? <div className="h-8 w-28 bg-gray-100 rounded animate-pulse" />
            : <p className="metric-value text-green-600">{brl(financeiro.recebidoMes)}</p>}
          {financeiro && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <ArrowUpRight size={11} className="text-green-500" />{brl(financeiro.emAbertoReceber)} em aberto
          </p>}
        </div>

        <div className="card p-5 ring-1 ring-red-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Pago no Mês</span>
            <div className="bg-red-50 text-red-500 rounded-xl p-2"><TrendingDown size={16} /></div>
          </div>
          {loading || !financeiro
            ? <div className="h-8 w-28 bg-gray-100 rounded animate-pulse" />
            : <p className="metric-value text-red-500">{brl(financeiro.pagoMes)}</p>}
          {financeiro && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <ArrowDownRight size={11} className="text-red-400" />{brl(financeiro.totalAPagar)} a vencer
          </p>}
        </div>

        <div className={`card p-5 ring-1 ${financeiro && financeiro.saldoMes >= 0 ? 'ring-blue-100' : 'ring-orange-100'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Saldo do Mês</span>
            <div className={`rounded-xl p-2 ${financeiro && financeiro.saldoMes >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-500'}`}>
              <DollarSign size={16} />
            </div>
          </div>
          {loading || !financeiro
            ? <div className="h-8 w-28 bg-gray-100 rounded animate-pulse" />
            : <p className={`metric-value ${financeiro.saldoMes >= 0 ? 'text-primary' : 'text-orange-500'}`}>
                {brl(financeiro.saldoMes)}
              </p>}
          <p className="text-xs text-gray-400 mt-1">Entradas − saídas do mês</p>
        </div>
      </div>

      {/* Gráficos linha 1: Faturamento 6 meses + OS por status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Line chart faturamento */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-800 font-heading text-base tracking-tight">Faturamento x Despesas</h3>
              <p className="text-xs text-gray-400">Últimos 6 meses</p>
            </div>
          </div>
          {loading || historico.length === 0
            ? <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
            : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={historico} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<TooltipBRL />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="receita" name="Receita" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="despesa" name="Despesa" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            )}
        </div>

        {/* Donut OS por status */}
        <div className="card p-5">
          <div className="mb-4">
            <h3 className="font-bold text-gray-800 font-heading text-base tracking-tight">OS por Status</h3>
            <p className="text-xs text-gray-400">Total acumulado</p>
          </div>
          {loading || statusData.length === 0
            ? <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
            : (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={42} outerRadius={62}
                      dataKey="value" paddingAngle={2}>
                      {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [v, 'Ordens']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1">
                  {statusData.map((s) => (
                    <div key={s.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="text-gray-600">{s.name}</span>
                      </div>
                      <span className="font-semibold text-gray-800">{s.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
        </div>
      </div>

      {/* Gráficos linha 2: Serviços + Forma de pagamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar horizontal top 5 serviços */}
        <div className="card p-5">
          <div className="mb-4">
            <h3 className="font-bold text-gray-800 font-heading text-base tracking-tight">Top 5 Serviços</h3>
            <p className="text-xs text-gray-400">Por quantidade realizada</p>
          </div>
          {loading || topServicos.length === 0
            ? <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
            : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={topServicos} layout="vertical" margin={{ top: 0, right: 30, left: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                  <Tooltip content={<TooltipCount />} />
                  <Bar dataKey="qtd" name="Qtd." fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
        </div>

        {/* Pie forma de pagamento */}
        <div className="card p-5">
          <div className="mb-4">
            <h3 className="font-bold text-gray-800 font-heading text-base tracking-tight">Receita por Forma de Pagamento</h3>
            <p className="text-xs text-gray-400">No ano atual</p>
          </div>
          {loading || formaData.length === 0
            ? <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
            : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={160}>
                  <PieChart>
                    <Pie data={formaData} cx="50%" cy="50%" outerRadius={65} dataKey="value" paddingAngle={2}>
                      {formaData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => brl(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {formaData.map((f) => (
                    <div key={f.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: f.color }} />
                        <span className="text-gray-600">{f.name}</span>
                      </div>
                      <span className="font-semibold text-gray-700">{brl(f.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Últimas OS — timeline */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <ClipboardList size={17} className="text-primary" />
            <h3 className="font-bold text-gray-800 font-heading tracking-tight">Últimas Ordens</h3>
          </div>
          <Link to="/ordens" className="text-xs font-semibold hover:text-secondary transition-colors text-primary">
            Ver todas →
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
            <Loader2 size={20} className="animate-spin" /><span className="text-sm">Carregando...</span>
          </div>
        ) : recentes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <AlertCircle size={36} className="mb-2 text-gray-200" />
            <p className="text-sm">Nenhuma ordem cadastrada</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentes.map((o) => {
              const cfg = STATUS_CONFIG[o.status]
              return (
                <div key={o.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/60 transition-colors">
                  <span className="font-mono text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg w-20 text-center">
                    #{o.id.slice(-6).toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {o.veiculo.marca} {o.veiculo.modelo}
                      <span className="font-mono text-xs text-primary ml-1.5">· {o.veiculo.placa}</span>
                    </p>
                    <p className="text-xs text-gray-400 truncate">{o.veiculo.cliente.nome}</p>
                  </div>
                  <span className="badge text-xs flex-shrink-0" style={{ backgroundColor: cfg.color + '20', color: cfg.color }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                    {cfg.label}
                  </span>
                  <span className="text-sm font-bold text-gray-800 flex-shrink-0">{brl(o.total)}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:block">
                    {new Date(o.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Atalhos rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Nova Ordem',   icon: ClipboardList, href: '/ordens',        style: { background: 'var(--color-primary)' }   },
          { label: 'Novo Cliente', icon: Users,         href: '/clientes',       style: { background: 'var(--color-secondary)' } },
          { label: 'Estoque',      icon: Package,       href: '/estoque',        style: { backgroundColor: '#0d9488' }           },
          { label: 'Financeiro',   icon: DollarSign,    href: '/financeiro',     style: { backgroundColor: '#374151' }           },
        ].map(({ label, icon: Icon, href, style }) => (
          <Link key={label} to={href}
            className="rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:opacity-90 hover:-translate-y-0.5 transition-all text-white"
            style={style}>
            <Icon size={18} />
            <span className="font-semibold text-sm">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
