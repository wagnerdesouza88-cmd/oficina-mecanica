import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  Wrench, Plus, Search, X, Pencil, Trash2, Loader2,
  ToggleLeft, ToggleRight, Tag,
} from 'lucide-react'
import api from '../services/api'

// ─── Constantes ───────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function brl(val) {
  return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function catLabel(cat) {
  return CAT_LABELS[cat] ?? cat
}

function catColor(cat) {
  return CAT_COLORS[cat] ?? 'bg-gray-100 text-gray-600'
}

// ─── Servicos ─────────────────────────────────────────────────────────────────

export default function Servicos() {
  const [servicos, setServicos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [toggling, setToggling] = useState(null)
  const [deletando, setDeletando] = useState(null)

  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting },
  } = useForm()

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

  // Categorias presentes nos dados (na ordem definida + quaisquer extras)
  const categoriasPresentes = [
    ...CAT_ORDER.filter((c) => servicos.some((s) => s.categoria === c)),
    ...servicos
      .map((s) => s.categoria)
      .filter((c) => !CAT_ORDER.includes(c))
      .filter((c, i, arr) => arr.indexOf(c) === i),
  ]

  const filtrados = servicos.filter((s) => {
    const matchBusca = !busca || s.nome.toLowerCase().includes(busca.toLowerCase())
    const matchCat = filtroCategoria === 'TODAS' || s.categoria === filtroCategoria
    return matchBusca && matchCat
  })

  // Contagens por categoria
  const contagem = servicos.reduce((acc, s) => {
    acc[s.categoria] = (acc[s.categoria] ?? 0) + 1
    return acc
  }, {})

  function abrirModalCriar() {
    setEditando(null)
    reset({ nome: '', categoria: 'PREVENTIVA', precoSugerido: '', ativo: true })
    setModalAberto(true)
  }

  function abrirModalEditar(s) {
    setEditando(s)
    reset({
      nome:          s.nome,
      categoria:     s.categoria,
      precoSugerido: Number(s.precoSugerido),
      ativo:         s.ativo,
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
        const { data: updated } = await api.put(`/tipos-servico/${editando.id}`, data)
        setServicos((prev) => prev.map((s) => s.id === editando.id ? updated : s))
        toast.success('Serviço atualizado!')
      } else {
        const { data: created } = await api.post('/tipos-servico', data)
        setServicos((prev) => [...prev, created])
        toast.success('Serviço criado!')
      }
      fecharModal()
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
    } finally {
      setToggling(null)
    }
  }

  async function excluir(s) {
    if (!window.confirm(`Excluir o serviço "${s.nome}"? Esta ação não pode ser desfeita.`)) return
    setDeletando(s.id)
    try {
      await api.delete(`/tipos-servico/${s.id}`)
      setServicos((prev) => prev.filter((x) => x.id !== s.id))
      toast.success('Serviço excluído!')
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Erro ao excluir serviço')
    } finally {
      setDeletando(null)
    }
  }

  return (
    <div className="space-y-5">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar serviço..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
          />
        </div>
        <button
          onClick={abrirModalCriar}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors"
        >
          <Plus size={16} /> Novo Serviço
        </button>
      </div>

      {/* Filtros de categoria */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFiltroCategoria('TODAS')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
            filtroCategoria === 'TODAS'
              ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
          }`}
        >
          Todas
          <span className={`px-1.5 py-0.5 rounded-full text-xs leading-none ${filtroCategoria === 'TODAS' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
            {servicos.length}
          </span>
        </button>
        {categoriasPresentes.map((cat) => (
          <button
            key={cat}
            onClick={() => setFiltroCategoria(cat)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              filtroCategoria === cat
                ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            {catLabel(cat)}
            <span className={`px-1.5 py-0.5 rounded-full text-xs leading-none ${filtroCategoria === cat ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {contagem[cat] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Wrench size={18} className="text-[#1e3a5f]" />
          <h3 className="font-semibold text-gray-800">Catálogo de Serviços</h3>
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {filtrados.length} serviços
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Wrench size={48} className="mb-3 text-gray-200" />
            <p className="text-sm font-medium">
              {busca || filtroCategoria !== 'TODAS' ? 'Nenhum serviço encontrado' : 'Nenhum serviço cadastrado'}
            </p>
            {!busca && filtroCategoria === 'TODAS' && (
              <p className="text-xs mt-1">Clique em "Novo Serviço" para começar</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">Nome</th>
                  <th className="px-4 py-3 text-left">Categoria</th>
                  <th className="px-4 py-3 text-right">Preço Sugerido</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtrados.map((s) => (
                  <tr key={s.id} className={`hover:bg-gray-50 transition-colors ${!s.ativo ? 'opacity-55' : ''}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Tag size={13} className="text-orange-400 flex-shrink-0" />
                        <span className={`text-sm ${s.ativo ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                          {s.nome}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${catColor(s.categoria)}`}>
                        {catLabel(s.categoria)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-gray-700 text-sm">
                      {brl(s.precoSugerido)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleAtivo(s)}
                        disabled={toggling === s.id}
                        title={s.ativo ? 'Desativar serviço' : 'Ativar serviço'}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        {toggling === s.id ? (
                          <Loader2 size={14} className="animate-spin text-gray-400" />
                        ) : s.ativo ? (
                          <>
                            <ToggleRight size={16} className="text-green-500" />
                            <span className="text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Ativo</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={16} className="text-gray-400" />
                            <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Inativo</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => abrirModalEditar(s)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-[#1e3a5f] transition-colors"
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => excluir(s)}
                          disabled={deletando === s.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          title="Excluir"
                        >
                          {deletando === s.id
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

            <div className="flex items-center justify-between px-6 py-4 bg-[#1e3a5f]">
              <h2 className="text-white font-semibold text-base">
                {editando ? 'Editar Serviço' : 'Novo Serviço'}
              </h2>
              <button onClick={fecharModal} className="text-white/60 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">

              {/* Nome */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Nome <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('nome', { required: 'Nome é obrigatório', minLength: { value: 2, message: 'Nome muito curto' } })}
                  placeholder="Ex: Troca de óleo e filtro"
                  className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] transition-colors ${errors.nome ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                />
                {errors.nome && <p className="mt-1 text-xs text-red-500">{errors.nome.message}</p>}
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Categoria <span className="text-orange-500">*</span>
                </label>
                <select
                  {...register('categoria', { required: 'Categoria é obrigatória' })}
                  className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white transition-colors ${errors.categoria ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                >
                  {CAT_ORDER.map((cat) => (
                    <option key={cat} value={cat}>{catLabel(cat)}</option>
                  ))}
                </select>
                {errors.categoria && <p className="mt-1 text-xs text-red-500">{errors.categoria.message}</p>}
              </div>

              {/* Preço Sugerido */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Preço Sugerido (R$) <span className="text-orange-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('precoSugerido', {
                    required: 'Preço é obrigatório',
                    min: { value: 0, message: 'Preço inválido' },
                    valueAsNumber: true,
                  })}
                  placeholder="0,00"
                  className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 transition-colors ${errors.precoSugerido ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                />
                {errors.precoSugerido && <p className="mt-1 text-xs text-red-500">{errors.precoSugerido.message}</p>}
              </div>

              {/* Ativo */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('ativo')}
                  className="accent-orange-500 w-4 h-4"
                />
                <span className="text-sm text-gray-700">Serviço ativo (visível nas ordens de serviço)</span>
              </label>

              {/* Botões */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={fecharModal}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                  Cancelar
                </button>
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
