import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Users, Plus, Search, Phone, Mail, X, Pencil, Trash2, Loader2, Calendar } from 'lucide-react'
import api from '../services/api'

// ── Máscaras ──────────────────────────────────────────────────────────────────

function maskTelefone(v) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function maskCPF(v) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

// ── Tempo de cliente ──────────────────────────────────────────────────────────

function tempoCliente(dateStr) {
  const desde = new Date(dateStr)
  const agora = new Date()
  const totalMeses =
    (agora.getFullYear() - desde.getFullYear()) * 12 +
    (agora.getMonth() - desde.getMonth())
  const dias = Math.floor((agora - desde) / 86_400_000)

  if (dias < 1) return 'hoje'
  if (dias < 30) return `${dias} ${dias === 1 ? 'dia' : 'dias'}`
  if (totalMeses < 12) return `${totalMeses} ${totalMeses === 1 ? 'mês' : 'meses'}`

  const anos = Math.floor(totalMeses / 12)
  const meses = totalMeses % 12
  const parteAnos = `${anos} ${anos === 1 ? 'ano' : 'anos'}`
  if (meses === 0) return parteAnos
  return `${parteAnos} e ${meses} ${meses === 1 ? 'mês' : 'meses'}`
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [deletando, setDeletando] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm()

  async function carregarClientes() {
    try {
      const { data } = await api.get('/clientes')
      setClientes(data)
    } catch {
      toast.error('Erro ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregarClientes() }, [])

  function abrirModalCriar() {
    setEditando(null)
    reset({ nome: '', telefone: '', email: '', cpf: '' })
    setModalAberto(true)
  }

  function abrirModalEditar(cliente) {
    setEditando(cliente)
    reset({
      nome: cliente.nome,
      telefone: maskTelefone(cliente.telefone),
      email: cliente.email ?? '',
      cpf: maskCPF(cliente.cpf ?? ''),
    })
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setEditando(null)
  }

  async function onSubmit(data) {
    try {
      if (editando) {
        await api.put(`/clientes/${editando.id}`, data)
        toast.success('Cliente atualizado!')
      } else {
        await api.post('/clientes', data)
        toast.success('Cliente cadastrado!')
      }
      fecharModal()
      carregarClientes()
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Erro ao salvar cliente')
    }
  }

  async function confirmarDelete(cliente) {
    if (!window.confirm(`Excluir o cliente "${cliente.nome}"?`)) return
    setDeletando(cliente.id)
    try {
      await api.delete(`/clientes/${cliente.id}`)
      toast.success('Cliente excluído')
      carregarClientes()
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Erro ao excluir cliente')
    } finally {
      setDeletando(null)
    }
  }

  const filtrados = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.telefone.includes(busca) ||
      (c.email ?? '').toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
          />
        </div>
        <button
          onClick={abrirModalCriar}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors"
        >
          <Plus size={16} />
          Novo Cliente
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Users size={18} className="text-[#1e3a5f]" />
          <h3 className="font-semibold text-gray-800">Todos os clientes</h3>
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {filtrados.length} registros
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Users size={48} className="mb-3 text-gray-200" />
            <p className="text-sm font-medium">
              {busca ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </p>
            {!busca && <p className="text-xs mt-1">Clique em "Novo Cliente" para começar</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3 text-left">Nome</th>
                  <th className="px-6 py-3 text-left">Telefone</th>
                  <th className="px-6 py-3 text-left">E-mail</th>
                  <th className="px-6 py-3 text-left">CPF</th>
                  <th className="px-6 py-3 text-left">Cliente desde</th>
                  <th className="px-6 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtrados.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1e3a5f] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {c.nome.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{c.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Phone size={13} className="text-gray-400" />
                        {maskTelefone(c.telefone)}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      {c.email ? (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Mail size={13} className="text-gray-400" />
                          {c.email}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {c.cpf ? maskCPF(c.cpf) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-6 py-3">
                      <p className="text-gray-700 text-xs">
                        {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        há {tempoCliente(c.createdAt)}
                      </p>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => abrirModalEditar(c)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-[#1e3a5f] transition-colors"
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => confirmarDelete(c)}
                          disabled={deletando === c.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          title="Excluir"
                        >
                          {deletando === c.id
                            ? <Loader2 size={15} className="animate-spin" />
                            : <Trash2 size={15} />}
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

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#1e3a5f]">
              <h2 className="text-white font-semibold text-base">
                {editando ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <button onClick={fecharModal} className="text-white/60 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
              {/* Cliente desde (somente edição) */}
              {editando && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-xl text-xs text-[#1e3a5f]">
                  <Calendar size={14} className="flex-shrink-0" />
                  <span>
                    <span className="font-medium">Cliente desde:</span>{' '}
                    {new Date(editando.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: 'long', year: 'numeric',
                    })}
                    {' '}
                    <span className="text-gray-500">(há {tempoCliente(editando.createdAt)})</span>
                  </span>
                </div>
              )}

              {/* Nome */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Nome <span className="text-orange-500">*</span>
                </label>
                <input
                  {...register('nome', { required: 'Nome é obrigatório' })}
                  placeholder="Nome completo"
                  className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] transition-colors ${
                    errors.nome ? 'border-red-400 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.nome && <p className="mt-1 text-xs text-red-500">{errors.nome.message}</p>}
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Telefone <span className="text-orange-500">*</span>
                </label>
                <input
                  {...register('telefone', {
                    required: 'Telefone é obrigatório',
                    validate: (v) =>
                      v.replace(/\D/g, '').length >= 10 || 'Telefone inválido',
                  })}
                  placeholder="(00) 00000-0000"
                  maxLength={16}
                  onChange={(e) => setValue('telefone', maskTelefone(e.target.value), { shouldValidate: true })}
                  className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] transition-colors ${
                    errors.telefone ? 'border-red-400 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.telefone && <p className="mt-1 text-xs text-red-500">{errors.telefone.message}</p>}
              </div>

              {/* Email + CPF */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">E-mail</label>
                  <input
                    {...register('email', {
                      validate: (v) =>
                        !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'E-mail inválido',
                    })}
                    placeholder="email@exemplo.com"
                    className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] transition-colors ${
                      errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">CPF</label>
                  <input
                    {...register('cpf', {
                      validate: (v) =>
                        !v || v.replace(/\D/g, '').length === 11 || 'CPF deve ter 11 dígitos',
                    })}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    onChange={(e) => setValue('cpf', maskCPF(e.target.value), { shouldValidate: true })}
                    className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] transition-colors ${
                      errors.cpf ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  {errors.cpf && <p className="mt-1 text-xs text-red-500">{errors.cpf.message}</p>}
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors disabled:opacity-60"
                >
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
