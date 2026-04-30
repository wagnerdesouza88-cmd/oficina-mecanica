import { z } from 'zod'
import prisma from '../lib/prisma.js'

const produtoSchema = z.object({
  codigo: z.string().min(1),
  nome: z.string().min(1),
  categoria: z.enum(['PECA', 'LUBRIFICANTE', 'FILTRO', 'FLUIDO', 'PNEU', 'ELETRICO', 'OUTRO']),
  marca: z.string().optional(),
  unidade: z.enum(['UN', 'L', 'KG', 'ML']),
  precoCompra: z.number().min(0),
  precoVenda: z.number().min(0),
  quantidadeAtual: z.number().min(0).default(0),
  quantidadeMinima: z.number().min(0).default(0),
  fornecedor: z.string().optional(),
  ativo: z.boolean().default(true),
})

export async function listar(req, res) {
  try {
    const { todos, categoria, busca } = req.query
    const where = {}
    if (todos !== 'true') where.ativo = true
    if (categoria) where.categoria = categoria
    if (busca) where.OR = [
      { nome: { contains: busca, mode: 'insensitive' } },
      { codigo: { contains: busca, mode: 'insensitive' } },
    ]
    const produtos = await prisma.produto.findMany({ where, orderBy: { nome: 'asc' } })
    res.json(produtos)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

export async function alertas(req, res) {
  try {
    const produtos = await prisma.produto.findMany({
      where: {
        ativo: true,
        quantidadeAtual: { lte: prisma.produto.fields.quantidadeMinima },
      },
    })
    // manual filter since Prisma doesn't support column comparison in where
    const todos = await prisma.produto.findMany({ where: { ativo: true } })
    const alertas = todos.filter(
      (p) => Number(p.quantidadeAtual) <= Number(p.quantidadeMinima) * 1.5
    )
    res.json(alertas)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

export async function buscarPorId(req, res) {
  try {
    const produto = await prisma.produto.findUnique({ where: { id: req.params.id } })
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado' })
    res.json(produto)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

export async function criar(req, res) {
  try {
    const data = produtoSchema.parse(req.body)
    const produto = await prisma.$transaction(async (tx) => {
      const p = await tx.produto.create({ data })
      if (Number(data.quantidadeAtual) > 0) {
        await tx.movimentacaoEstoque.create({
          data: {
            produtoId: p.id,
            tipo: 'ENTRADA',
            quantidade: data.quantidadeAtual,
            quantidadeAnterior: 0,
            quantidadeAtual: data.quantidadeAtual,
            motivo: 'Estoque inicial',
          },
        })
      }
      return p
    })
    res.status(201).json(produto)
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: e.errors })
    if (e.code === 'P2002') return res.status(409).json({ error: 'Código já cadastrado' })
    res.status(500).json({ error: e.message })
  }
}

export async function atualizar(req, res) {
  try {
    const data = produtoSchema.partial().parse(req.body)
    const produto = await prisma.produto.update({ where: { id: req.params.id }, data })
    res.json(produto)
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: e.errors })
    if (e.code === 'P2025') return res.status(404).json({ error: 'Produto não encontrado' })
    res.status(500).json({ error: e.message })
  }
}

export async function deletar(req, res) {
  try {
    await prisma.produto.update({
      where: { id: req.params.id },
      data: { ativo: false },
    })
    res.status(204).end()
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Produto não encontrado' })
    res.status(500).json({ error: e.message })
  }
}

export async function registrarEntrada(req, res) {
  try {
    const { quantidade, motivo } = z.object({
      quantidade: z.number().positive(),
      motivo: z.string().optional(),
    }).parse(req.body)

    const produto = await prisma.$transaction(async (tx) => {
      const atual = await tx.produto.findUnique({ where: { id: req.params.id } })
      if (!atual) throw new Error('Produto não encontrado')
      const novaQtd = Number(atual.quantidadeAtual) + quantidade
      const p = await tx.produto.update({
        where: { id: req.params.id },
        data: { quantidadeAtual: novaQtd },
      })
      await tx.movimentacaoEstoque.create({
        data: {
          produtoId: p.id,
          tipo: 'ENTRADA',
          quantidade,
          quantidadeAnterior: Number(atual.quantidadeAtual),
          quantidadeAtual: novaQtd,
          motivo: motivo || 'Entrada manual',
        },
      })
      return p
    })
    res.json(produto)
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: e.errors })
    res.status(500).json({ error: e.message })
  }
}

export async function registrarAjuste(req, res) {
  try {
    const { quantidade, motivo } = z.object({
      quantidade: z.number(),
      motivo: z.string().optional(),
    }).parse(req.body)

    const produto = await prisma.$transaction(async (tx) => {
      const atual = await tx.produto.findUnique({ where: { id: req.params.id } })
      if (!atual) throw new Error('Produto não encontrado')
      const novaQtd = quantidade
      const p = await tx.produto.update({
        where: { id: req.params.id },
        data: { quantidadeAtual: novaQtd },
      })
      await tx.movimentacaoEstoque.create({
        data: {
          produtoId: p.id,
          tipo: 'AJUSTE',
          quantidade: Math.abs(novaQtd - Number(atual.quantidadeAtual)),
          quantidadeAnterior: Number(atual.quantidadeAtual),
          quantidadeAtual: novaQtd,
          motivo: motivo || 'Ajuste manual',
        },
      })
      return p
    })
    res.json(produto)
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: e.errors })
    res.status(500).json({ error: e.message })
  }
}
